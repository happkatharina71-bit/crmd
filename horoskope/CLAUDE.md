# Horoskop-Setup

Ziel: hochwertige, klischeefreie Horoskope für ein großes, diverses Publikum in Deutschland
auf Basis exakt berechneter Planetenstände (westlich-tropische Astrologie, Sonnenzeichen).

## Grundprinzip: Rechnen und Schreiben sind getrennt
1. **Ephemeriden** (`src/ephemeris.py`): Python + Skyfield + NASA-JPL-Daten. Claude berechnet oder schätzt NIE selbst Planetenstände.
2. **Wissensbasis** (`wissensbasis/`): Planeten, Lebensbereiche, Verbindungen, Mondphasen, Sternzeichen-Porträts, Stilregeln.
3. **Filter** (`src/briefing.py`): wählt die 1–3 wichtigsten Faktoren je Zeichen und Tag, wertet bereits genutzte Themen ab, rotiert Einstieg/Schluss.
4. **Text** (Claude): schreibt ausschließlich auf Grundlage des Briefings.
5. **Prüfung**: `src/pruefe.py` (automatisch) + Agent `horoskop-pruefer` (Fakten, Klischees, Diversität) + Agent `horoskop-lektorat` (Sprache).

## Regeln
- Nur Fakten aus dem Briefing verwenden. Nichts erfinden.
- Grundhaltung: Staunen statt Behaupten; herzlich, ermutigend, nie drohend (Details in `stil.yaml`).
- Keine Beispieltexte als Vorlage einbinden – sie werden erfahrungsgemäß in Dramaturgie und Wortwahl kopiert. Stil wird nur über Regeln beschrieben.
- Leitregel: Echte Sprache, echte Inhalte – wie zu einer Freundin, klar und genau, mit echtem Lebensbezug.
- Feedback-Beispiele sind Illustration, keine Schablone: nie wörtlich als Regel oder Formulierung übernehmen.
- Stilregeln in `wissensbasis/stil.yaml` sind verbindlich.
- Kein Fachlatein im Text (übersetzen: Quadrat → Reibung, Trigon → Rückenwind usw.).
- Keine Annahmen über Geschlecht, Beziehungsform, Familie, Körper, Beruf, Einkommen.
- Geld ist ein normales Thema; keine Anlage-/Kaufempfehlungen, keine Gesundheitsratschläge, keine Heilsversprechen.

## Befehle
- `/tageshoroskop <Zeichen> <JJJJ-MM-TT>` – siehe `.claude/skills/tageshoroskop/SKILL.md`
- Tests: `python3 tests/test_ephemeris.py`
