"""Anthropic-Aufrufe mit Retry/Backoff und Kostenerfassung."""
from __future__ import annotations

import json
import logging
import random
import time
from dataclasses import dataclass, field

import anthropic

from .config import PRICES, WEB_SEARCH_USD

log = logging.getLogger(__name__)


class SchemaRejected(Exception):
    pass


def price_for(model: str) -> tuple[float, float, float]:
    for key, p in PRICES.items():
        if key in model:
            return p
    return PRICES["opus"]


@dataclass
class CostTracker:
    rows: dict = field(default_factory=dict)  # (stage, model) -> dict
    searches: int = 0

    def add(self, stage: str, model: str, usage) -> None:
        r = self.rows.setdefault(
            (stage, model), {"stage": stage, "model": model, "calls": 0, "input": 0, "output": 0, "cache_read": 0, "cache_write": 0}
        )
        r["calls"] += 1
        r["input"] += getattr(usage, "input_tokens", 0) or 0
        r["output"] += getattr(usage, "output_tokens", 0) or 0
        r["cache_read"] += getattr(usage, "cache_read_input_tokens", 0) or 0
        r["cache_write"] += getattr(usage, "cache_creation_input_tokens", 0) or 0
        st = getattr(usage, "server_tool_use", None)
        self.searches += getattr(st, "web_search_requests", 0) or 0 if st else 0

    def summary(self) -> dict:
        rows, total = [], 0.0
        for r in self.rows.values():
            pin, pout, pcache = price_for(r["model"])
            usd = (r["input"] * pin + r["output"] * pout + r["cache_read"] * pcache + r["cache_write"] * pin * 1.25) / 1e6
            rows.append({**r, "usd": round(usd, 4)})
            total += usd
        search_usd = self.searches * WEB_SEARCH_USD
        return {"models": rows, "web_searches": self.searches, "web_search_usd": round(search_usd, 4), "total_usd": round(total + search_usd, 4)}


class LLM:
    def __init__(self, api_key: str, tracker: CostTracker):
        self.client = anthropic.Anthropic(api_key=api_key, max_retries=0, timeout=600)
        self.tracker = tracker

    def _send(self, params: dict, schema: dict | None, effort: str | None = None):
        kwargs = dict(params)
        output_config = {}
        if effort:
            output_config["effort"] = effort
        if schema:
            output_config["format"] = {"type": "json_schema", "schema": schema}
        if output_config:
            kwargs["extra_body"] = {"output_config": output_config}
        for attempt in range(6):
            try:
                with self.client.messages.stream(**kwargs) as s:
                    return s.get_final_message()
            except anthropic.APIStatusError as e:
                if e.status_code == 400 and schema:
                    raise SchemaRejected(str(e)) from e
                if e.status_code not in (408, 409, 429, 529) and e.status_code < 500:
                    raise
                err = e
            except anthropic.APIConnectionError as e:
                err = e
            wait = min(90, 2 ** (attempt + 1)) + random.random()
            log.warning("API-Fehler (%s), Retry %d in %.0f s", err, attempt + 1, wait)
            time.sleep(wait)
        raise RuntimeError(f"Anthropic-API nach Retries nicht erreichbar: {err}")

    def run(self, stage: str, model: str, system: str, messages: list, max_tokens: int,
            schema: dict | None = None, tools: list | None = None, max_continuations: int = 4,
            effort: str | None = None):
        """Gibt (text, gesehene_urls) zurück. Behandelt pause_turn (Server-Tools) und Schema-Fallback."""
        params = {
            "model": model,
            "max_tokens": max_tokens,
            "system": [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            "messages": list(messages),
        }
        if tools:
            params["tools"] = tools
        seen: dict[str, dict] = {}
        for _ in range(max_continuations + 1):
            try:
                resp = self._send(params, schema, effort)
            except SchemaRejected as e:
                log.warning("Structured Outputs abgelehnt (%s) – Fallback auf Prompt-JSON", str(e)[:200])
                schema = None
                resp = self._send(params, None, effort)
            self.tracker.add(stage, model, resp.usage)
            for b in resp.content:
                if b.type == "web_search_tool_result" and isinstance(b.content, list):
                    for r in b.content:
                        seen[r.url] = {"title": getattr(r, "title", ""), "page_age": getattr(r, "page_age", None)}
            if resp.stop_reason == "pause_turn":
                params["messages"] = params["messages"] + [{"role": "assistant", "content": resp.content}]
                continue
            if resp.stop_reason in ("max_tokens", "refusal"):
                raise RuntimeError(f"{stage}: Abbruch durch Modell (stop_reason={resp.stop_reason})")
            text = "".join(b.text for b in resp.content if b.type == "text")
            return text, seen
        raise RuntimeError(f"{stage}: zu viele pause_turn-Fortsetzungen")


def parse_json(text: str) -> dict:
    a, b = text.find("{"), text.rfind("}")
    if a < 0 or b < a:
        raise ValueError("Antwort enthält kein JSON")
    return json.loads(text[a : b + 1])
