"""Filter- und Bewertungsschicht: wählt aus den Tagesdaten die wichtigsten Faktoren
für ein Sternzeichen aus und erstellt ein Briefing für die Texterstellung.
Aufruf: python3 src/briefing.py Skorpion 2026-11-22"""
import json, sys, os, yaml
from datetime import date
from datetime import datetime
from ephemeris import tagesdaten, ZEICHEN, SCHNELL, laenge, zeichen as zeichen_von, TZ

BASIS = os.path.join(os.path.dirname(__file__), "..")
WB = os.path.join(BASIS, "wissensbasis")
AUS = os.path.join(BASIS, "ausgabe")
VERLAUF = os.path.join(AUS, "verlauf.json")

lade = lambda f: yaml.safe_load(open(os.path.join(WB, f), encoding="utf-8"))
PLANETEN, HAEUSER, ASPEKTE, PHASEN, STIL = (lade(f) for f in
    ["planeten.yaml", "haeuser.yaml", "aspekte.yaml", "mondphasen.yaml", "stil.yaml"])
WICHTIGE_BEREICHE = {1: 1.0, 7: 0.6, 10: 0.6, 4: 0.4}


def bereich(zeichen_planet, zeichen_leser):
    return (ZEICHEN.index(zeichen_planet) - ZEICHEN.index(zeichen_leser)) % 12 + 1


def verlauf(zeichen, fmt="tag", vor=None):
    if not os.path.exists(VERLAUF):
        return []
    return [v for v in json.load(open(VERLAUF, encoding="utf-8"))
            if v["zeichen"] == zeichen and v["format"] == fmt and (vor is None or v["datum"] < vor)]


def faktoren(daten, zeichen):
    st, out = daten["staende"], []
    b = lambda p: bereich(st[p]["zeichen"], zeichen)

    for e in daten["ereignisse"]:
        p = e["planet"]
        if p == "Mond":
            continue  # Mond wird separat behandelt
        if e["typ"] == "Zeichenwechsel":
            h = bereich(e["nach"], zeichen)
            out.append({"key": f"ingress-{p}-{e['nach']}", "score": PLANETEN[p]["gewicht"] * 2 + WICHTIGE_BEREICHE.get(h, 0),
                        "fakt": f"{p} wechselt heute um {e['uhrzeit']} Uhr von {e['von']} nach {e['nach']}",
                        "bereich": h, "planeten": [p]})
        else:
            out.append({"key": f"station-{p}", "score": PLANETEN[p]["gewicht"] * 2,
                        "fakt": f"{p} {e['art']} (in {st[p]['zeichen']})", "bereich": b(p), "planeten": [p]})

    for a in daten["aspekte"]:
        p, q = a["a"], a["b"]
        if p not in SCHNELL and q not in SCHNELL:
            continue  # langsame Generationsaspekte prägen keinen einzelnen Tag
        if "Mond" in (p, q):
            continue
        nähe = max(0.0, 1 - a["orbis"] / 3)  # nur enge Aspekte (< 3°) zählen nennenswert
        if nähe == 0:
            continue
        hp, hq = b(p), b(q)
        s = (PLANETEN[p]["gewicht"] + PLANETEN[q]["gewicht"]) / 2 * nähe * 2
        s += 0.5 if a["zunehmend"] else 0
        s += max(WICHTIGE_BEREICHE.get(hp, 0), WICHTIGE_BEREICHE.get(hq, 0))
        out.append({"key": f"aspekt-{p}-{q}-{a['aspekt']}", "score": round(s, 2),
                    "fakt": f"{p} ({st[p]['zeichen']}) und {q} ({st[q]['zeichen']}): {a['aspekt']}, "
                            f"Abstand {a['orbis']}°, {'wird enger' if a['zunehmend'] else 'löst sich'}",
                    "qualitaet": ASPEKTE[a["aspekt"]]["qualitaet"], "bereiche": [hp, hq], "planeten": [p, q]})

    for p, s in st.items():
        if p != "Mond" and s["zeichen"] == zeichen:
            out.append({"key": f"imzeichen-{p}", "score": round(PLANETEN[p]["gewicht"] * 0.8 + 1, 2),
                        "fakt": f"{p} steht in {zeichen}" + (" (rückläufig)" if s["ruecklaeufig"] else ""),
                        "bereich": 1, "planeten": [p]})

    for ph in daten["mondphase"]["exakt_heute"]:
        if ph["phase"] in ("Neumond", "Vollmond"):
            hh, mm = map(int, ph["uhrzeit"].split(":"))
            tg = date.fromisoformat(daten["datum"])
            mz = zeichen_von(laenge("Mond", datetime(tg.year, tg.month, tg.day, hh, mm, tzinfo=TZ)))
            out.append({"key": f"{ph['phase']}-{daten['datum']}", "score": 7,
                        "fakt": f"{ph['phase']} um {ph['uhrzeit']} Uhr, Mond in {mz}",
                        "qualitaet": "fordernd" if ph["phase"] == "Vollmond" else "verbindend",
                        "bereich": bereich(mz, zeichen), "planeten": ["Mond", "Sonne"]})

    # Neuheit: Faktoren, die gestern/vorgestern schon Thema waren, abwerten
    letzte = [k for v in verlauf(zeichen, vor=daten["datum"])[-2:] for k in v["faktoren"]]
    for f in out:
        if f["key"] in letzte:
            f["score"] = round(f["score"] * 0.5, 2)
            f["schon_verwendet"] = True
    return sorted(out, key=lambda f: -f["score"])


def mondfaktor(daten, zeichen):
    st = daten["staende"]
    m = st["Mond"]
    wechsel = [e for e in daten["ereignisse"] if e["planet"] == "Mond"]
    asp = [a for a in daten["aspekte"] if "Mond" in (a["a"], a["b"]) and a["orbis"] <= 3]
    return {"mondzeichen": m["zeichen"], "bereich": bereich(m["zeichen"], zeichen),
            "wechsel_heute": wechsel[0] if wechsel else None,
            "mondaspekte": [f"Mond und {a['b'] if a['a']=='Mond' else a['a']}: {a['aspekt']} ({ASPEKTE[a['aspekt']]['qualitaet']})" for a in asp],
            "phase": daten["mondphase"]["name"], "phase_bedeutung": PHASEN[daten["mondphase"]["name"].split(" (")[0]]}


def waehle(liste, benutzt, tag):
    frei = [x for x in liste if x not in benutzt] or liste
    return frei[tag.toordinal() % len(frei)]


def andocken(f, portrait):
    """Ordnet einem Faktor die passenden Andockpunkte des Zeichen-Porträts zu."""
    bs = set(f.get("bereiche", [f.get("bereich")]))
    treffer = []
    for a in portrait["andockpunkte"]:
        pw = 3 if len(f["planeten"]) == 1 else 1  # Einzelplanet: Planet prägt das Thema stärker
        s = 2 * len(bs & set(a["bereiche"])) + pw * len(set(f["planeten"]) & set(a["planeten"]))
        if s:
            treffer.append((s, a))
    return [a for _, a in sorted(treffer, key=lambda x: -x[0])[:2]]


def briefing(zeichen, tag):
    d = tagesdaten(tag)
    portrait = lade(f"zeichen/{zeichen.lower()}.yaml")
    fs = faktoren(d, zeichen)[:3]
    for f in fs:
        f["andockpunkte"] = andocken(f, portrait)
    alt = verlauf(zeichen, vor=tag.isoformat())[-3:]
    grundton = sum(f["score"] * (1 if f.get("qualitaet") == "harmonisch" else -1 if f.get("qualitaet") == "fordernd" else 0) for f in fs)
    bereiche = sorted({h for f in fs for h in f.get("bereiche", [f.get("bereich")])})
    planeten = sorted({p for f in fs for p in f["planeten"]} | {"Mond"})
    return {
        "zeichen": zeichen, "datum": tag.isoformat(), "format": "tag",
        "hauptfaktoren": fs,
        "mond": mondfaktor(d, zeichen),
        "grundton": "eher leicht" if grundton > 1 else "eher fordernd" if grundton < -1 else "gemischt",
        "lebensbereiche": {h: HAEUSER[h] for h in bereiche},
        "mondbereich": HAEUSER[mondfaktor(d, zeichen)["bereich"]],
        "planetendeutung": {p: PLANETEN[p] for p in planeten},
        "erlaubte_planeten": planeten,
        "einstieg": waehle(STIL["einstiege"], [v["einstieg"] for v in alt], tag),
        "schluss": waehle(STIL["schluesse"], [v["schluss"] for v in alt], tag),
        "letzte_texte": [v["datei"] for v in alt],
        "motive_zuletzt": sorted({m for v in verlauf(zeichen, vor=tag.isoformat())[-7:] for m in v.get("motive", [])}),
        "grundzug": portrait["grundzug"], "nicht_verwenden": portrait["nicht_verwenden"],
    }


if __name__ == "__main__":
    z, t = sys.argv[1], date.fromisoformat(sys.argv[2])
    b = briefing(z, t)
    os.makedirs(os.path.join(AUS, "briefings"), exist_ok=True)
    pfad = os.path.join(AUS, "briefings", f"{z.lower()}_{t.isoformat()}.json")
    json.dump(b, open(pfad, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(json.dumps(b, ensure_ascii=False, indent=2))
