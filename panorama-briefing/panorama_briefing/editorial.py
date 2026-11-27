"""Stufe 3: Redaktion (Opus, ein Aufruf inkl. Websuche; max. ein Reparaturlauf)."""
from __future__ import annotations

import json
import logging
import re

import jsonschema

from .collect import Collected
from .config import BERLIN, EDITOR_EFFORT, MAX_MELDUNGEN, MAX_SEARCHES, MIN_MELDUNGEN, ROOT, Config, datum_de
from .llm import LLM, parse_json
from .triage import hhmm

log = logging.getLogger(__name__)
SCHEMA_PATH = ROOT / "schema" / "briefing.schema.json"


def load_schema() -> dict:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def api_schema() -> dict:
    s = load_schema()
    s.pop("$schema", None)
    return s


def build_input(col: Collected, clusters: list[dict]) -> str:
    by_id = {i.id: i for i in col.items}
    now = col.run_start.astimezone(BERLIN)
    out = [f"Heute ist {datum_de(col.run_start)}, Stand {now:%H:%M} Uhr (Europe/Berlin).", "", "## DWD-Warnlage (ab Stufe 2)"]
    out += [f"{w.id} | {w.titel} | {w.teaser}" for w in col.dwd] or ["Keine Warnungen ab Stufe 2 bzw. DWD nicht abrufbar."]
    out += ["", "## Cluster"]
    for n, c in enumerate(clusters, 1):
        out.append(f"\n### C{n:02d}: {c['thema']}")
        for i in (by_id[x] for x in c["ids"]):
            also = f" (auch: {', '.join(i.auch_in)})" if i.auch_in else ""
            out.append(f"{i.id} | {i.quelle}{also} | {hhmm(i.zeit)} | {i.titel} | {i.teaser}")
    return "\n".join(out)


def validate(data: dict, known_ids: set[str]) -> list[str]:
    """Struktur- und Konsistenzfehler; leer = in Ordnung."""
    errs = [f"{'/'.join(map(str, e.absolute_path))}: {e.message}" for e in jsonschema.Draft202012Validator(load_schema()).iter_errors(data)]
    if errs:
        return errs[:15]
    refs = [m["ref"] for m in data["deutschland"] + data["international"]]
    n = len(refs)
    if len(set(refs)) != n:
        errs.append("ref-Werte sind nicht eindeutig")
    if not MIN_MELDUNGEN <= n <= MAX_MELDUNGEN:
        errs.append(f"Meldungszahl {n}, erwartet {MIN_MELDUNGEN}–{MAX_MELDUNGEN}")
    if len(data["top_5"]) != 5 or any(t["meldung_ref"] not in refs for t in data["top_5"]):
        errs.append("top_5 muss genau 5 existierende refs enthalten")
    for m in data["deutschland"] + data["international"]:
        bad = [s for s in m["source_ids"] if s not in known_ids]
        if bad:
            errs.append(f"{m['ref']}: unbekannte source_ids {bad}")
        if not m["source_ids"] and not m["neue_urls"]:
            errs.append(f"{m['ref']}: ohne Beleg")
    for t in data["termine_heute"]:
        if [s for s in t["source_ids"] if s not in known_ids]:
            errs.append(f"Termin '{t['thema']}': unbekannte source_ids")
    return errs


def redaktion(cfg: Config, llm: LLM, col: Collected, clusters: list[dict]) -> tuple[dict, dict]:
    """Gibt (briefing_json, gesehene_such_urls) zurück."""
    system = (ROOT / "prompts" / "redaktion.md").read_text(encoding="utf-8")
    known = {i.id for i in col.items} | {w.id for w in col.dwd}
    tools = [{"type": "web_search_20260209", "name": "web_search", "max_uses": MAX_SEARCHES}]
    messages = [{"role": "user", "content": build_input(col, clusters)}]

    text, seen = llm.run("redaktion", cfg.editor_model, system, messages, 48000, schema=api_schema(), tools=tools,
                          effort=EDITOR_EFFORT)
    errs = _check(text, known)
    if errs:
        log.warning("Redaktions-Output fehlerhaft, ein Reparaturlauf: %s", errs)
        messages += [
            {"role": "assistant", "content": text or "{}"},
            {"role": "user", "content": "Der JSON-Output hat Fehler:\n- " + "\n- ".join(errs) + "\nKorrigiere und gib das vollständige JSON erneut aus. Keine neue Websuche nötig."},
        ]
        text, seen2 = llm.run("redaktion-repair", cfg.editor_model, system, messages, 48000, schema=api_schema(),
                               effort=EDITOR_EFFORT)
        seen.update(seen2)
        errs = _check(text, known)
        if errs:
            raise RuntimeError("Redaktions-Output ungültig: " + "; ".join(errs))
    data = parse_json(text)
    data["datum"] = datum_de(col.run_start)
    return data, seen


def _check(text: str, known: set[str]) -> list[str]:
    try:
        return validate(parse_json(text), known)
    except (ValueError, json.JSONDecodeError) as e:
        return [f"kein gültiges JSON: {e}"]
