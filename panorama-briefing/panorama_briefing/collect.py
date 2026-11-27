"""Stufe 1: Feeds einsammeln (keine KI)."""
from __future__ import annotations

import asyncio
import html
import json
import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import feedparser
import httpx

from .config import FETCH_TIMEOUT, WINDOW_HOURS, host_blocked
from .feeds import FEEDS

log = logging.getLogger(__name__)
UTC = timezone.utc
DWD_URL_PUBLIC = "https://www.dwd.de/DE/wetter/warnungen/warnapp/warnapp_node.html"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PanoramaBriefing/1.0)", "Accept": "*/*"}


@dataclass
class Item:
    id: str
    quelle: str
    zeit: datetime | None
    titel: str
    teaser: str
    url: str
    auch_in: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {**self.__dict__, "zeit": self.zeit.isoformat() if self.zeit else None}

    @classmethod
    def from_dict(cls, d: dict) -> "Item":
        d = dict(d)
        d["zeit"] = datetime.fromisoformat(d["zeit"]) if d.get("zeit") else None
        return cls(**d)


@dataclass
class Collected:
    run_start: datetime
    items: list[Item]
    dwd: list[Item]
    protocol: list[dict]

    def to_json(self) -> str:
        return json.dumps(
            {
                "run_start": self.run_start.isoformat(),
                "items": [i.to_dict() for i in self.items],
                "dwd": [i.to_dict() for i in self.dwd],
                "protocol": self.protocol,
            },
            ensure_ascii=False,
            indent=1,
        )

    @classmethod
    def from_json(cls, text: str) -> "Collected":
        d = json.loads(text)
        return cls(
            datetime.fromisoformat(d["run_start"]),
            [Item.from_dict(i) for i in d["items"]],
            [Item.from_dict(i) for i in d["dwd"]],
            d["protocol"],
        )


def clean_text(s: str | None, limit: int | None = None) -> str:
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = re.sub(r"\s+", " ", html.unescape(s)).strip()
    if limit and len(s) > limit:
        s = s[: limit - 1].rstrip() + "…"
    return s


def normalize_url(url: str) -> str:
    p = urlparse(url.strip())
    q = [(k, v) for k, v in parse_qsl(p.query) if not k.lower().startswith("utm_") and k.lower() not in {"wt_mc", "cmp", "ocid"}]
    host = (p.hostname or "").lower().removeprefix("www.")
    path = p.path.rstrip("/") or "/"
    return urlunparse(("https", host, path, "", urlencode(q), ""))


def parse_feed(name: str, content: bytes) -> list[dict]:
    fp = feedparser.parse(content)
    if not fp.entries:
        raise ValueError("kein gültiger Feed / keine Einträge")
    out = []
    for e in fp.entries:
        url, title = (e.get("link") or "").strip(), clean_text(e.get("title"))
        if not url or not title or host_blocked(url):
            continue
        ts = None
        for key in ("published_parsed", "updated_parsed"):
            if e.get(key):
                ts = datetime(*e[key][:6], tzinfo=UTC)
                break
        out.append({"url": url, "titel": title, "zeit": ts, "teaser": clean_text(e.get("summary") or e.get("description"), 300)})
    return out


def parse_dwd(text: str, now: datetime) -> list[Item]:
    """JSONP-Wrapper entfernen; Warnungen ab Stufe 2 nach Typ/Stufe gruppieren, Regionen nach Bundesland."""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("DWD: kein JSON gefunden")
    data = json.loads(m.group(0))
    now_ms, horizon_ms = now.timestamp() * 1000, (now + timedelta(hours=18)).timestamp() * 1000
    groups: dict[tuple, dict[str, set]] = {}
    for warns in (data.get("warnings") or {}).values():
        for w in warns:
            level = int(w.get("level") or 0)
            if level < 2 or (w.get("end") or now_ms) < now_ms or (w.get("start") or 0) > horizon_ms:
                continue
            key = (-level, w.get("event") or "Unbekannt")
            groups.setdefault(key, {}).setdefault(w.get("state") or "?", set()).add(w.get("regionName") or "?")
    items = []
    for i, ((neg, event), states) in enumerate(sorted(groups.items()), 1):
        regions = "; ".join(f"{s}: {', '.join(sorted(r))}" for s, r in sorted(states.items()))
        n = sum(len(r) for r in states.values())
        items.append(
            Item(f"W{i:02d}", "DWD", None, f"Warnstufe {-neg}: {event} ({n} Regionen)", clean_text(regions, 700), DWD_URL_PUBLIC)
        )
    return items


async def _fetch(client: httpx.AsyncClient, sem: asyncio.Semaphore, name: str, url: str):
    async with sem:
        try:
            r = await asyncio.wait_for(client.get(url), FETCH_TIMEOUT + 5)
            chain = [str(h.url) for h in r.history] + [str(r.url)]
            if any(host_blocked(u) for u in chain):
                return name, None, "Fehler: Weiterleitung auf gesperrte Domain"
            r.raise_for_status()
            return name, r.content, None
        except httpx.HTTPStatusError as e:
            return name, None, f"Fehler: HTTP {e.response.status_code}"
        except (httpx.TimeoutException, asyncio.TimeoutError):
            return name, None, f"Fehler: Timeout ({FETCH_TIMEOUT:.0f} s)"
        except Exception as e:  # noqa: BLE001
            return name, None, f"Fehler: {type(e).__name__}: {e}"[:200]


async def collect(now: datetime) -> Collected:
    start = now - timedelta(hours=WINDOW_HOURS)
    sem = asyncio.Semaphore(12)
    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=FETCH_TIMEOUT) as client:
        results = await asyncio.gather(*[_fetch(client, sem, n, u) for n, u, _ in FEEDS])

    protocol, raw, dwd = [], [], []
    for (name, url, kind), (_, content, err) in zip(FEEDS, results):
        row = {"quelle": name, "url": url, "status": "OK", "grund": "", "eintraege": 0, "im_fenster": 0}
        if err is None:
            try:
                if kind == "dwd":
                    dwd = parse_dwd(content.decode("utf-8", "replace"), now)
                    row["eintraege"] = row["im_fenster"] = len(dwd)
                else:
                    entries = parse_feed(name, content)
                    row["eintraege"] = len(entries)
                    for e in entries:
                        if e["zeit"] is None or e["zeit"] >= start:
                            raw.append({**e, "quelle": name})
                            row["im_fenster"] += 1
            except Exception as ex:  # noqa: BLE001
                err = f"Fehler: Parsing: {ex}"[:200]
        if err:
            row["status"], row["grund"] = "Fehler", err.removeprefix("Fehler: ")
        protocol.append(row)
        log.info("%-22s %s %s (%d/%d)", name, row["status"], row["grund"], row["im_fenster"], row["eintraege"])
    return Collected(now, build_items(raw), dwd, protocol)


def build_items(raw: list[dict]) -> list[Item]:
    """Dubletten (gleiche URL) bündeln, Einzelbelege als auch_in behalten, IDs vergeben."""
    merged: dict[str, Item] = {}
    for e in raw:
        key = normalize_url(e["url"])
        if key in merged:
            it = merged[key]
            if e["quelle"] != it.quelle and e["quelle"] not in it.auch_in:
                it.auch_in.append(e["quelle"])
            if it.zeit is None and e["zeit"]:
                it.zeit = e["zeit"]
            continue
        merged[key] = Item("", e["quelle"], e["zeit"], e["titel"], e["teaser"], e["url"])
    items = sorted(merged.values(), key=lambda i: (i.zeit is None, -(i.zeit.timestamp() if i.zeit else 0)))
    for n, it in enumerate(items, 1):
        it.id = f"M{n:03d}"
    return items
