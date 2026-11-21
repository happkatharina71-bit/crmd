---
name: tageshoroskop
description: Erstellt ein Tageshoroskop für ein Sternzeichen und Datum auf Basis berechneter Ephemeriden. Aufruf /tageshoroskop <Zeichen> <JJJJ-MM-TT>.
---
# Tageshoroskop erstellen

1. Briefing erzeugen: `python3 src/briefing.py <Zeichen> <Datum>` (im Ordner `horoskope/`).
2. Lesen: das Briefing, `wissensbasis/zeichen/<zeichen>.md`, `wissensbasis/stil.yaml` und die unter `letzte_texte` gelisteten Texte (damit du dich NICHT wiederholst).
3. Text schreiben nach `ausgabe/tag/<zeichen>_<Datum>.md`, Format (Orientierung: Nachrichtenportal):
   - Zeile 1: `# <Zeichen>, <Wochentag, TT. Monat JJJJ>`
   - Teaser: eine kursive Zeile, ca. 20 Wörter, macht neugierig, ohne Floskel
   - 3 Abschnitte, je `### <thematische Zwischenüberschrift>` (max. 5 Wörter) und ca. 60–70 Wörter;
     je Abschnitt ein Hauptfaktor aus dem Briefing (Mond einflechten, wo er passt)
   - `### Tipp des Tages`: 2 Sätze, ca. 30 Wörter, konkret und machbar, Typ = `schluss` aus dem Briefing
   - Einstieg des ersten Abschnitts nach Typ `einstieg` im Briefing
   - Immer duzen, direkte Ansprache; nie „der Skorpion“/„Skorpione“ in dritter Person
   - Astronomie in Alltagssprache übersetzen; das Porträt nur als Hintergrund nutzen
   - Beispiele aus den Lebensbereichen variieren, Personen offen benennen
4. Automatisch prüfen: `python3 src/pruefe.py <text> <briefing>`. Bei FEHLER überarbeiten, bis bestanden.
5. Inhaltlich prüfen lassen mit dem Agenten `horoskop-pruefer`. Gefundene Probleme beheben.
6. Speichern im Verlauf: `python3 src/pruefe.py <text> <briefing> --speichern`.
