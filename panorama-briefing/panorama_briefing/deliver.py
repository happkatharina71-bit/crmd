"""Stufe 4: Prüfung, Auflösung der IDs, Rendering, Versand."""
from __future__ import annotations

import logging
import smtplib
import ssl
from concurrent.futures import ThreadPoolExecutor
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from urllib.parse import urlparse

import httpx
from jinja2 import Environment, FileSystemLoader

from .collect import HEADERS, Collected, normalize_url
from .config import BERLIN, FETCH_TIMEOUT, HARD_MIN_MELDUNGEN, MAX_MELDUNGEN, MIN_MELDUNGEN, ROOT, Config, datum_de, host_blocked

log = logging.getLogger(__name__)
RUBRIKEN = ["Polizei/Blaulicht", "Unglücke", "Wetter", "Tiere", "Kurioses", "Lotto", "Menschen"]


def _check_url(url: str) -> tuple[bool, str]:
    """(behalten?, Hinweis). Sperrseiten (401/403/429) gelten als nicht automatisch prüfbar, nicht als Fehler."""
    try:
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=FETCH_TIMEOUT) as c:
            r = c.get(url)
        if any(host_blocked(str(u)) for u in [*(h.url for h in r.history), r.url]):
            return False, "Weiterleitung auf gesperrte Domain"
        if r.status_code in (401, 403, 429) or r.status_code < 400:
            return True, "" if r.status_code < 400 else "nicht automatisch prüfbar"
        return False, f"HTTP {r.status_code}"
    except Exception as e:  # noqa: BLE001
        return True, f"nicht prüfbar ({type(e).__name__})"


def resolve(data: dict, col: Collected, seen_urls: dict, verify: bool = True) -> tuple[dict, list[str]]:
    """IDs → URLs/Zeiten, Websuche-URLs prüfen, Blockliste anwenden. Gibt (view, hinweise) zurück."""
    warnings: list[str] = []
    by_id = {i.id: i for i in [*col.items, *col.dwd]}
    seen_norm = {normalize_url(u) for u in seen_urls}

    new_urls = {n["url"] for m in data["deutschland"] + data["international"] for n in m["neue_urls"]}
    status: dict[str, tuple[bool, str]] = {}
    if verify and new_urls:
        with ThreadPoolExecutor(8) as ex:
            status = dict(zip(new_urls, ex.map(_check_url, new_urls)))

    def src_item(sid: str):
        i = by_id[sid]
        if host_blocked(i.url):
            return None
        zeit = i.zeit.astimezone(BERLIN).strftime("%d.%m. %H:%M") if i.zeit else "ohne Zeitstempel"
        extra = f" (auch: {', '.join(i.auch_in)})" if i.auch_in else ""
        return {"quelle": i.quelle + extra, "url": i.url, "zeit": zeit, "titel": i.titel, "note": ""}

    def build(m: dict) -> dict | None:
        srcs = [s for s in map(src_item, m["source_ids"]) if s]
        for n in m["neue_urls"]:
            url = n["url"]
            if not url.startswith("http") or host_blocked(url):
                warnings.append(f"{m['ref']}: URL entfernt (gesperrte/ungültige Domain): {url}")
            elif normalize_url(url) not in seen_norm:
                warnings.append(f"{m['ref']}: URL entfernt (nicht in Suchergebnissen): {url}")
            elif status.get(url, (True, ""))[0] is False:
                warnings.append(f"{m['ref']}: URL entfernt ({status[url][1]}): {url}")
            else:
                srcs.append({"quelle": (urlparse(url).hostname or "").removeprefix("www."), "url": url,
                             "zeit": n["zeit"], "titel": "", "note": status.get(url, (True, ""))[1]})
        if not srcs:
            warnings.append(f"{m['ref']} entfernt: kein verifizierbarer Beleg ({m['schlagzeile']})")
            return None
        return {**m, "quellen": srcs, "sterne": "★" * m["bewertung"]}

    de = [x for x in map(build, data["deutschland"]) if x]
    intl = [x for x in map(build, data["international"]) if x]
    by_ref = {m["ref"]: m for m in de + intl}
    n = len(by_ref)
    if n < HARD_MIN_MELDUNGEN or n > MAX_MELDUNGEN:
        raise RuntimeError(f"Nach Prüfung nur {n} Meldungen (erwartet {MIN_MELDUNGEN}–{MAX_MELDUNGEN}): {warnings}")
    if n < MIN_MELDUNGEN:
        warnings.append(f"Nur {n} statt mindestens {MIN_MELDUNGEN} Meldungen nach Quellenprüfung.")

    top5 = [{"warum": t["warum_es_zieht"], "m": by_ref[t["meldung_ref"]]} for t in data["top_5"] if t["meldung_ref"] in by_ref]

    def group(ms):
        ms = sorted(ms, key=lambda m: -m["bewertung"])
        return [(r, [m for m in ms if m["rubrik"] == r]) for r in RUBRIKEN if any(m["rubrik"] == r for m in ms)]

    termine = [{**t, "quellen": [s for s in (src_item(x) for x in t["source_ids"]) if s]} for t in data["termine_heute"]]
    view = {
        "datum": datum_de(col.run_start),
        "top5": top5,
        "deutschland": group(de),
        "international": group(intl),
        "termine": termine,
        "nicht_aufgenommen": data["nicht_aufgenommen"],
        "protocol": col.protocol,
        "warnings": warnings,
        "n_meldungen": n,
        "n_items": len(col.items),
        "stand": col.run_start.astimezone(BERLIN).strftime("%d.%m.%Y %H:%M"),
    }
    return view, warnings


def render(view: dict) -> tuple[str, str, str]:
    env = Environment(
        loader=FileSystemLoader(ROOT / "templates"),
        autoescape=lambda n: bool(n) and n.endswith(".html.j2"),
        trim_blocks=True, lstrip_blocks=True,
    )
    subject = f"Panorama-Briefing – {view['datum']}"
    return subject, env.get_template("mail.html.j2").render(v=view, subject=subject), env.get_template("mail.txt.j2").render(v=view)


def _smtp_send(cfg: Config, msg: EmailMessage) -> None:
    if not (cfg.smtp_host and cfg.mail_from):
        raise RuntimeError("SMTP_HOST/MAIL_FROM nicht konfiguriert")
    if cfg.smtp_port == 465:
        s = smtplib.SMTP_SSL(cfg.smtp_host, 465, timeout=60, context=ssl.create_default_context())
    else:
        s = smtplib.SMTP(cfg.smtp_host, cfg.smtp_port, timeout=60)
        s.starttls(context=ssl.create_default_context())
    with s:
        if cfg.smtp_user:
            s.login(cfg.smtp_user, cfg.smtp_password)
        s.send_message(msg)


def _base(cfg: Config, subject: str, to: list[str]) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, cfg.mail_from, ", ".join(to)
    msg["Date"], msg["Message-ID"] = formatdate(localtime=True), make_msgid()
    return msg


def send_briefing(cfg: Config, subject: str, html: str, text: str) -> None:
    if not cfg.mail_to:
        raise RuntimeError("MAIL_TO ist leer")
    msg = _base(cfg, subject, cfg.mail_to)
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    _smtp_send(cfg, msg)


def send_alert(cfg: Config, subject: str, body: str) -> None:
    if not cfg.alert_mail:
        log.error("ALERT_MAIL nicht gesetzt – Fehler-Mail nicht versendet")
        return
    msg = _base(cfg, subject, [cfg.alert_mail])
    msg.set_content(body)
    _smtp_send(cfg, msg)
