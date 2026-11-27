"""CLI: Gate → Stufe 1–4 → Archiv/Kostenlog."""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

from .collect import Collected, collect
from .config import BERLIN, Config, datum_de
from .deliver import render, resolve, send_alert, send_briefing
from .editorial import redaktion
from .llm import LLM, CostTracker
from .triage import triage

log = logging.getLogger("panorama_briefing")


def in_window(now: datetime) -> bool:
    """Mo–Fr, 05:00–05:50 Uhr Europe/Berlin."""
    b = now.astimezone(BERLIN)
    return b.weekday() < 5 and (b.hour, b.minute) >= (5, 0) and (b.hour, b.minute) <= (5, 50)


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


def run(args, cfg: Config, now: datetime, out: Path, tracker: CostTracker) -> dict:
    test = args.dry_run or bool(args.fixture)
    if args.fixture:
        col = Collected.from_json((Path(args.fixture) / "collected.json").read_text(encoding="utf-8"))
        log.info("Fixture geladen: %d Meldungen (Stand %s)", len(col.items), col.run_start)
    else:
        col = asyncio.run(collect(now))
    write(out / "collected.json", col.to_json())
    failed = [p["quelle"] for p in col.protocol if p["status"] != "OK"]
    if len(failed) > len(col.protocol) // 2:
        raise RuntimeError(f"Mehr als die Hälfte der Quellen ausgefallen: {failed}")

    if not cfg.anthropic_key:
        raise RuntimeError("ANTHROPIC_API_KEY fehlt")
    llm = LLM(cfg.anthropic_key, tracker)
    clusters = triage(cfg, llm, col)
    write(out / "triage.json", json.dumps(clusters, ensure_ascii=False, indent=1))
    data, seen = redaktion(cfg, llm, col, clusters)
    write(out / "briefing.json", json.dumps(data, ensure_ascii=False, indent=1))

    view, warnings = resolve(data, col, seen)
    subject, html, text = render(view)
    write(out / "briefing.html", html)
    write(out / "briefing.txt", text)
    if test:
        log.info("Testmodus: kein Versand. HTML: %s", out / "briefing.html")
    else:
        send_briefing(cfg, subject, html, text)
        log.info("Briefing versendet an %d Empfänger", len(cfg.mail_to))
    return {"meldungen": view["n_meldungen"], "hinweise": warnings, "gesendet": not test}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="panorama_briefing")
    ap.add_argument("--dry-run", action="store_true", help="kein Versand, Ergebnis lokal speichern")
    ap.add_argument("--fixture", metavar="ORDNER", help="gespeicherten Feed-Stand (Ordner mit collected.json) statt Live-Abruf")
    ap.add_argument("--force", action="store_true", help="Zeit-/Wochentags-Gate und Tagesmarker ignorieren")
    ap.add_argument("--archive-dir", default="archive")
    ap.add_argument("--state-dir", default=".state")
    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", stream=sys.stdout)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    cfg = Config.from_env()
    now = datetime.now(timezone.utc)
    test = args.dry_run or bool(args.fixture)
    day = now.astimezone(BERLIN).strftime("%Y-%m-%d")
    marker = Path(args.state_dir) / f"done-{day}"

    if not (test or args.force):
        if not in_window(now):
            log.info("Außerhalb Mo–Fr 05:00–05:50 Europe/Berlin (%s) – Ende.", now.astimezone(BERLIN))
            return 0
        if marker.exists():
            log.info("Briefing für %s bereits versendet – Ende.", day)
            return 0

    out = Path(args.archive_dir) / (day if not test else f"{day}-test-{now.astimezone(BERLIN):%H%M%S}")
    out.mkdir(parents=True, exist_ok=True)
    tracker, t0 = CostTracker(), time.monotonic()
    result: dict = {}
    try:
        result = run(args, cfg, now, out, tracker)
        status, err = "ok", None
    except Exception as e:  # noqa: BLE001
        log.error("Lauf fehlgeschlagen: %s", e)
        status, err = "fehler", f"{type(e).__name__}: {e}"
        tb = traceback.format_exc()

    cost = tracker.summary()
    report = {
        "datum": datum_de(now), "start_utc": now.isoformat(), "laufzeit_s": round(time.monotonic() - t0, 1),
        "status": status, "fehler": err, "modus": "test" if test else "produktiv", **result, "kosten": cost,
    }
    write(out / "run.json", json.dumps(report, ensure_ascii=False, indent=1))
    for r in cost["models"]:
        log.info("TOKENS %-16s %-22s in=%d out=%d cache_read=%d cache_write=%d  $%.4f",
                 r["stage"], r["model"], r["input"], r["output"], r["cache_read"], r["cache_write"], r["usd"])
    log.info("KOSTEN gesamt $%.4f (Websuchen: %d = $%.4f) · Laufzeit %.0f s",
             cost["total_usd"], cost["web_searches"], cost["web_search_usd"], report["laufzeit_s"])

    if status == "ok":
        if not test:
            marker.parent.mkdir(parents=True, exist_ok=True)
            marker.write_text(now.isoformat())
        return 0
    if not test:
        try:
            send_alert(cfg, f"[FEHLER] Panorama-Briefing {datum_de(now)}", f"Das Briefing konnte nicht erstellt/versendet werden.\n\nGrund: {err}\n\n{tb}\nKosten bis zum Abbruch: ${cost['total_usd']}")
        except Exception as e:  # noqa: BLE001
            log.error("Fehler-Mail ebenfalls fehlgeschlagen: %s", e)
    return 1
