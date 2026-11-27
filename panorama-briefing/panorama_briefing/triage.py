"""Stufe 2: Grobsortierung und Clusterbildung (kleines Modell)."""
from __future__ import annotations

import json
import logging

from .collect import Collected
from .config import BERLIN, ROOT, Config
from .llm import LLM, parse_json

log = logging.getLogger(__name__)


def hhmm(dt) -> str:
    return dt.astimezone(BERLIN).strftime("%H:%M") if dt else "ohne Zeit"


def triage(cfg: Config, llm: LLM, col: Collected) -> list[dict]:
    """Gibt [{"thema": str, "ids": [str]}] zurück (nur gültige IDs)."""
    system = (ROOT / "prompts" / "triage.md").read_text(encoding="utf-8")
    schema = json.loads((ROOT / "schema" / "triage.schema.json").read_text(encoding="utf-8"))
    lines = [
        f"{i.id} | {i.quelle} | {hhmm(i.zeit)} | {i.titel} | {i.teaser[:160]}" for i in col.items
    ]
    if not lines:
        raise RuntimeError("Keine Meldungen im Zeitfenster – Abruf prüfen")
    text, _ = llm.run(
        "triage", cfg.triage_model, system,
        [{"role": "user", "content": "Meldungen:\n" + "\n".join(lines)}],
        max_tokens=16000, schema=schema,
    )
    known = {i.id for i in col.items}
    used: set[str] = set()
    clusters = []
    for c in parse_json(text).get("cluster", []):
        ids = [x for x in c.get("ids", []) if x in known and x not in used]
        used.update(ids)
        if ids:
            clusters.append({"thema": str(c.get("thema", "")).strip(), "ids": ids})
    if not clusters:
        raise RuntimeError("Triage lieferte keine gültigen Cluster")
    log.info("Triage: %d von %d Meldungen in %d Clustern", len(used), len(known), len(clusters))
    return clusters
