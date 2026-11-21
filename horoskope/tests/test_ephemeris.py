"""Abgleich mit veröffentlichten Referenzwerten (Zeitpunkte von Tagundnachtgleichen/Sonnenwenden 2026,
Quelle: astronomische Jahrbücher / timeanddate.com). Toleranz: ±0,01° Sonnenlänge (≈15 Minuten)."""
import sys, os
from datetime import datetime
from zoneinfo import ZoneInfo
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from ephemeris import laenge, winkel

UTC = ZoneInfo("UTC")
REFERENZ = [  # (Zeitpunkt UTC, erwartete Sonnenlänge)
    (datetime(2026, 3, 20, 14, 46, tzinfo=UTC), 0),     # Frühlingsanfang
    (datetime(2026, 6, 21, 8, 24, tzinfo=UTC), 90),     # Sommeranfang
    (datetime(2026, 9, 23, 0, 5, tzinfo=UTC), 180),     # Herbstanfang
    (datetime(2026, 12, 21, 20, 50, tzinfo=UTC), 270),  # Winteranfang
]

def test_sonnenstand():
    for t, soll in REFERENZ:
        assert winkel(laenge("Sonne", t), soll) < 0.01, (t, laenge("Sonne", t))

def test_sonnenfinsternis_12_08_2026():
    # Totale Sonnenfinsternis: Sonne und Mond in Konjunktion um ca. 17:36 UTC
    t = datetime(2026, 8, 12, 17, 36, tzinfo=UTC)
    assert winkel(laenge("Sonne", t), laenge("Mond", t)) < 0.3

if __name__ == "__main__":
    test_sonnenstand(); test_sonnenfinsternis_12_08_2026(); print("Ephemeriden-Tests bestanden.")
