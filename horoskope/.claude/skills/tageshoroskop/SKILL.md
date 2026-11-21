---
name: tageshoroskop
description: Erstellt ein Tageshoroskop für ein Sternzeichen und Datum auf Basis berechneter Ephemeriden. Aufruf /tageshoroskop <Zeichen> <JJJJ-MM-TT>.
---
# Tageshoroskop erstellen

1. Briefing erzeugen: `python3 src/briefing.py <Zeichen> <Datum>` (im Ordner `horoskope/`).
2. Lesen: das Briefing, `wissensbasis/zeichen/<zeichen>.md`, `wissensbasis/stil.yaml` und die unter `letzte_texte` gelisteten Texte (damit du dich NICHT wiederholst).
3. Text schreiben nach `ausgabe/tag/<zeichen>_<Datum>.md`:
   - Zeile 1: `# <Zeichen>, <Wochentag, TT. Monat JJJJ>`
   - Zeile 3: Überschrift (fett, max. 6 Wörter, kein Floskel-Titel)
   - 90–160 Wörter Fließtext, du-Form
   - Einstieg und Schluss genau nach den Typen `einstieg` / `schluss` im Briefing
   - Hauptfaktor 1 trägt den Text; Faktor 2–3 und Mond nur, wenn sie zum roten Faden passen
   - Astronomie in Alltagssprache übersetzen; das Zeichen-Porträt nur als Hintergrund nutzen, nicht nacherzählen
   - Beispiele aus den Lebensbereichen variieren, Personen offen benennen
4. Automatisch prüfen: `python3 src/pruefe.py <text> <briefing>`. Bei FEHLER überarbeiten, bis bestanden.
5. Inhaltlich prüfen lassen mit dem Agenten `horoskop-pruefer`. Gefundene Probleme beheben.
6. Speichern im Verlauf: `python3 src/pruefe.py <text> <briefing> --speichern`.
