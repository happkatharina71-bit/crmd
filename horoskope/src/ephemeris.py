"""Berechnet Planetenstände (westlich-tropisch, geozentrisch) mit Skyfield + NASA-JPL DE421.
Keine KI beteiligt: alle astronomischen Werte kommen aus dieser Datei."""
import os
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo
import skyfield_data
from skyfield.api import Loader
from skyfield.framelib import ecliptic_frame
from skyfield import almanac

TZ = ZoneInfo("Europe/Berlin")
_DATA = os.path.join(os.path.dirname(skyfield_data.__file__), "data")
_load = Loader(_DATA)
TS = _load.timescale(builtin=True)
EPH = _load("de421.bsp")  # gültig 1900–2050
EARTH = EPH["earth"]

ZEICHEN = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau",
           "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"]
KOERPER = {
    "Sonne": "sun", "Mond": "moon", "Merkur": "mercury", "Venus": "venus",
    "Mars": "mars", "Jupiter": "jupiter barycenter", "Saturn": "saturn barycenter",
    "Uranus": "uranus barycenter", "Neptun": "neptune barycenter", "Pluto": "pluto barycenter",
}
ASPEKTE = {  # Winkel, Orbis (Grad)
    "Konjunktion": (0, 8), "Sextil": (60, 4), "Quadrat": (90, 6),
    "Trigon": (120, 6), "Opposition": (180, 8),
}
SCHNELL = ["Mond", "Merkur", "Venus", "Sonne", "Mars"]


def _t(dt):
    return TS.from_datetime(dt.astimezone(ZoneInfo("UTC")))


def laenge(name, dt):
    """Ekliptikale Länge (tropisch, Äquinoktium des Datums) in Grad."""
    pos = EARTH.at(_t(dt)).observe(EPH[KOERPER[name]]).apparent()
    _, lon, _ = pos.frame_latlon(ecliptic_frame)
    return lon.degrees % 360


def zeichen(lon):
    return ZEICHEN[int(lon // 30)]


def stand(name, dt):
    lon = laenge(name, dt)
    v = (laenge(name, dt + timedelta(hours=12)) - laenge(name, dt - timedelta(hours=12)) + 540) % 360 - 180
    lon = float(lon); v = float(v)
    return {"planet": name, "laenge": round(lon, 3), "zeichen": zeichen(lon),
            "grad_im_zeichen": round(lon % 30, 2), "tempo_grad_pro_tag": round(v, 4),
            "ruecklaeufig": bool(v < 0)}


def winkel(a, b):
    d = abs(a - b) % 360
    return 360 - d if d > 180 else d


def tagesdaten(tag: date):
    mittag = datetime(tag.year, tag.month, tag.day, 12, tzinfo=TZ)
    start = datetime(tag.year, tag.month, tag.day, 0, tzinfo=TZ)
    ende = start + timedelta(days=1)
    staende = {n: stand(n, mittag) for n in KOERPER}

    # Zeichenwechsel und Richtungswechsel im Tagesverlauf
    ereignisse = []
    for n in KOERPER:
        z0, z1 = zeichen(laenge(n, start)), zeichen(laenge(n, ende))
        if z0 != z1:
            a, b = start, ende  # Uhrzeit des Wechsels per Intervallhalbierung
            for _ in range(20):
                m = a + (b - a) / 2
                a, b = (m, b) if zeichen(laenge(n, m)) == z0 else (a, m)
            ereignisse.append({"typ": "Zeichenwechsel", "planet": n, "von": z0, "nach": z1,
                               "uhrzeit": b.strftime("%H:%M")})
        if n not in ("Sonne", "Mond"):
            r0, r1 = stand(n, start)["ruecklaeufig"], stand(n, ende)["ruecklaeufig"]
            if r0 != r1:
                ereignisse.append({"typ": "Station", "planet": n,
                                   "art": "wird rückläufig" if r1 else "wird wieder direktläufig"})

    # Aspekte zwischen den Planeten (Mittag), mit "zunehmend/abnehmend"
    aspekte = []
    namen = list(KOERPER)
    spaeter = {n: laenge(n, mittag + timedelta(hours=6)) for n in namen}
    for i, a in enumerate(namen):
        for b in namen[i + 1:]:
            w = winkel(staende[a]["laenge"], staende[b]["laenge"])
            for asp, (soll, orbis) in ASPEKTE.items():
                if a == "Mond" or b == "Mond":
                    orbis = min(orbis, 5)
                abw = abs(w - soll)
                if abw <= orbis:
                    abw2 = abs(winkel(spaeter[a], spaeter[b]) - soll)
                    aspekte.append({"a": a, "b": b, "aspekt": asp, "orbis": round(abw, 2),
                                    "zunehmend": bool(abw2 < abw)})

    # Mondphase
    phase = almanac.moon_phase(EPH, _t(mittag)).degrees
    namen_phase = ["Neumond", "zunehmende Sichel", "erstes Viertel", "zunehmender Mond",
                   "Vollmond", "abnehmender Mond", "letztes Viertel", "abnehmende Sichel"]
    phase_name = namen_phase[int(((phase + 22.5) % 360) // 45)]
    haupt = {0: "Neumond", 90: "erstes Viertel", 180: "Vollmond", 270: "letztes Viertel"}
    for w, n in haupt.items():  # Hauptphase nur, wenn sie innerhalb von ±6° (≈ ½ Tag) liegt
        d = (phase - w + 540) % 360 - 180
        if phase_name == n and abs(d) > 6:
            phase_name = namen_phase[(list(haupt).index(w) * 2 + (1 if d > 0 else -1)) % 8]
        if 6 < abs(d) <= 25 and n in ("Neumond", "Vollmond"):
            phase_name += f" (kurz {'nach' if d > 0 else 'vor'} {n})"
    t0, t1 = _t(start), _t(ende)
    zeiten, typen = almanac.find_discrete(t0, t1, almanac.moon_phases(EPH))
    exakte_phase = [{"phase": ["Neumond", "erstes Viertel", "Vollmond", "letztes Viertel"][y],
                     "uhrzeit": t.utc_datetime().astimezone(TZ).strftime("%H:%M")}
                    for t, y in zip(zeiten, typen)]

    return {"datum": tag.isoformat(), "referenzzeit": "12:00 Europe/Berlin",
            "staende": staende, "ereignisse": ereignisse, "aspekte": aspekte,
            "mondphase": {"name": phase_name, "winkel": round(float(phase), 1), "exakt_heute": exakte_phase}}
