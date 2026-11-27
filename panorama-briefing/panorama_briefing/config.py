from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
BERLIN = ZoneInfo("Europe/Berlin")

# Eigene Portale der Redaktion: nie als Quelle verwenden.
BLOCKED_DOMAINS = ("web.de", "gmx.net", "gmx.de", "gmx.at", "gmx.ch")

WINDOW_HOURS = 20
FETCH_TIMEOUT = 15.0
MIN_MELDUNGEN = 15
MAX_MELDUNGEN = 25
HARD_MIN_MELDUNGEN = 10  # nach dem Entfernen nicht verifizierbarer Quellen
MAX_SEARCHES = 8

# USD pro 1 Mio. Token (input, output, cache_read). Cache-Write (5 Min.) = 1.25x Input.
# Bei Modell- oder Preisänderung hier anpassen.
PRICES = {
    "haiku": (0.10, 0.50, 0.01),
    "sonnet": (2.0, 10.0, 0.10),
    "opus": (4.0, 20.0, 0.20),
}
EDITOR_EFFORT = "high"
WEB_SEARCH_USD = 10.0 / 1000

WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]


def host_blocked(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower().rstrip(".")
    return any(host == d or host.endswith("." + d) for d in BLOCKED_DOMAINS)


def datum_de(dt: datetime) -> str:
    dt = dt.astimezone(BERLIN)
    return f"{WEEKDAYS[dt.weekday()]}, {dt:%d.%m.%Y}"


def split_list(value: str) -> list[str]:
    return [p.strip() for p in re.split(r"[,;\n]+", value or "") if p.strip()]


@dataclass
class Config:
    anthropic_key: str = ""
    triage_model: str = "claude-haiku-5-5"
    editor_model: str = "claude-opus-5-5"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    mail_from: str = ""
    mail_to: list[str] = field(default_factory=list)
    alert_mail: str = ""

    @classmethod
    def from_env(cls) -> "Config":
        e = os.environ.get
        return cls(
            anthropic_key=e("ANTHROPIC_API_KEY", ""),
            triage_model=e("TRIAGE_MODEL") or cls.triage_model,
            editor_model=e("EDITOR_MODEL") or cls.editor_model,
            smtp_host=e("SMTP_HOST", ""),
            smtp_port=int(e("SMTP_PORT") or 587),
            smtp_user=e("SMTP_USER", ""),
            smtp_password=e("SMTP_PASSWORD", ""),
            mail_from=e("MAIL_FROM", ""),
            mail_to=split_list(e("MAIL_TO", "")),
            alert_mail=e("ALERT_MAIL", ""),
        )
