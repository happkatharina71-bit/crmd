"""Automatische Qualitätsprüfung eines Horoskoptexts gegen Briefing und Stilregeln.
Aufruf: python3 src/pruefe.py <text.md> <briefing.json> [--speichern]
--speichern trägt den Text bei bestandener Prüfung in den Verlauf ein (Wiederholungsschutz)."""
import json, re, sys, os, yaml
from briefing import STIL, VERLAUF, AUS, verlauf
from ephemeris import KOERPER

FACHLATEIN = ["Quadrat", "Trigon", "Sextil", "Opposition", "Konjunktion", "Transit", "Orbis",
              "Aspekt", "Haus", "Häuser", "Ingress", "Aszendent", "Ekliptik"]
ANNAHMEN = [r"\b(dein|deine|deinen|deinem|deiner) (Mann|Frau|Ehemann|Ehefrau|Freund|Freundin|Chef|Chefin|Kinder?)\b",
            r"\b(deinem|deinen|dein) Partner\b(?!\*)", r"\bals (Mann|Frau)\b"]
LAENGE = (200, 290)  # Wörter für Tageshoroskop (Teaser + 3 Abschnitte à ~65 + Tipp ~30)


def trigramme(t):
    w = re.findall(r"\w+", t.lower())
    return {tuple(w[i:i + 3]) for i in range(len(w) - 2)}


def motive(text):
    t = text.split("### Tipp des Tages")[-1].lower()
    return [m for m, r in STIL["motive"].items() if re.search(r, t)]


def pruefe(text, b):
    fehler, hinweise = [], []
    tl = text.lower()
    for f in STIL["verbotene_floskeln"]:
        if f.lower() in tl:
            fehler.append(f"Verbotene Floskel: '{f}'")
    for f in FACHLATEIN:
        muster = r"\b(Haus|Häuser[n]?)\b" if f in ("Haus", "Häuser") else rf"\b{f}\w*"  # "zu Hause" ist erlaubt
        if re.search(muster, text):
            fehler.append(f"Fachbegriff: '{f}'")
    for r in ANNAHMEN:
        for m in re.finditer(r, text):
            fehler.append(f"Annahme über Lebensform: '{m.group(0)}'")
    genannt = [p for p in KOERPER if re.search(rf"\b{p}\b", text)]
    for p in genannt:
        if p not in b["erlaubte_planeten"]:
            fehler.append(f"Planet nicht im Briefing: {p}")
    weitere = [p for p in genannt if p not in ("Sonne", "Mond")]
    if len(weitere) > 2:
        fehler.append(f"Zu viele Planeten genannt ({', '.join(weitere)}) – höchstens 2 außer Sonne/Mond")
    for w in STIL["negativ"]:
        if re.search(rf"\b{w}", tl):
            fehler.append(f"Negative/drohende Sprache: '{w}'")
    tipp = text.split("### Tipp des Tages")[-1].lower()
    for m in motive(text):
        if m in b.get("motive_zuletzt", []) and re.search(STIL["motive"][m], tipp):
            fehler.append(f"Tipp-Motiv '{m}' kam in den letzten Texten schon vor")
    koerper = "\n".join(z for z in text.splitlines() if not z.startswith("#"))
    if re.search(r"\b(der|die|den|dem|des) Skorpions?\b|\bSkorpione\b", koerper, re.I):
        fehler.append("Dritte Person ('der Skorpion'/'Skorpione') – bitte direkt duzen")
    if len(re.findall(r"^### ", text, re.M)) != 4 or "### Tipp des Tages" not in text:
        fehler.append("Struktur: 3 Abschnitte mit ### Zwischenüberschrift + '### Tipp des Tages' erwartet")
    n = len(re.findall(r"\w+", re.sub(r"^#.*$", "", text, flags=re.M)))
    if not LAENGE[0] <= n <= LAENGE[1]:
        fehler.append(f"Länge {n} Wörter (Soll {LAENGE[0]}–{LAENGE[1]})")
    tri = trigramme(text)
    for v in verlauf(b["zeichen"], b["format"], vor=b["datum"])[-7:]:
        alt = open(os.path.join(AUS, v["datei"]), encoding="utf-8").read()
        ueberlapp = len(tri & trigramme(alt)) / max(1, len(tri))
        if ueberlapp > 0.08:
            fehler.append(f"Zu ähnlich zu {v['datei']} ({ueberlapp:.0%} gleiche Wortfolgen)")
        a1 = re.findall(r"\w+", re.sub(r"^#.*$", "", alt, flags=re.M).strip())[:3]
        a2 = re.findall(r"\w+", re.sub(r"^#.*$", "", text, flags=re.M).strip())[:3]
        for muster in re.findall(r"(?:^|[.!?:–]\s+)((?:\w+\s+){2}\w+)", alt):
            if len(muster) > 12 and re.search(rf"(?:^|[.!?:–]\s+){re.escape(muster)}\b", text):
                fehler.append(f"Gleicher Satzanfang wie in {v['datei']}: '{muster}'")
        if a1 and a1 == a2:
            fehler.append(f"Gleicher Textanfang wie {v['datei']}")
    return fehler, n


if __name__ == "__main__":
    tp, bp = sys.argv[1], sys.argv[2]
    text, b = open(tp, encoding="utf-8").read(), json.load(open(bp, encoding="utf-8"))
    fehler, n = pruefe(text, b)
    print(f"Wörter: {n}")
    print("\n".join("FEHLER: " + f for f in fehler) if fehler else "Alle automatischen Prüfungen bestanden.")
    if not fehler and "--speichern" in sys.argv:
        v = json.load(open(VERLAUF, encoding="utf-8")) if os.path.exists(VERLAUF) else []
        v = [x for x in v if not (x["zeichen"] == b["zeichen"] and x["datum"] == b["datum"] and x["format"] == b["format"])]
        v.append({"zeichen": b["zeichen"], "datum": b["datum"], "format": b["format"],
                  "faktoren": [f["key"] for f in b["hauptfaktoren"]], "einstieg": b["einstieg"],
                  "schluss": b["schluss"], "motive": motive(text), "datei": os.path.relpath(tp, AUS)})
        json.dump(sorted(v, key=lambda x: x["datum"]), open(VERLAUF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print("Im Verlauf gespeichert.")
    sys.exit(1 if fehler else 0)
