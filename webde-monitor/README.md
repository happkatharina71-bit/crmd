# web.de-Topteaser-Monitor (Prototyp)

Erfasst 5× täglich die ersten 5 Teaser der **mobilen** web.de-Startseite und codiert die abgebildeten
Personen nach [CODEBUCH.md](CODEBUCH.md).

## Ablauf einer Erhebung

1. `npm install` (einmalig)
2. `node capture.mjs` → `data/runs/<run_id>/` mit `capture.json`, `bild-1..5.webp` (Bilder, 950 px),
   `teaser-1..5.png` und `seite.png` (Screenshots, nur lokal zur Kontrolle, nicht im Repo)
3. Prüfen mit `seite.png`, ob die richtigen 5 Teaser erfasst wurden (Heuristik; bei Fehlgriff `TEASER_SELECTOR` setzen)
4. Bilder + Headlines nach Codebuch auswerten → `data/runs/<run_id>/analysis.json`
5. `node record.mjs data/runs/<run_id>/analysis.json` → prüft die Werte und hängt an
   `data/teasers.csv` (1 Zeile je Teaser) und `data/persons.csv` (1 Zeile je Person) an
6. Commit + Push

## Automatische Erhebung

Geplante Aufgabe „web.de Topteaser-Erhebung“: 7, 10, 13, 17, 21 Uhr (Europe/Berlin), 21.10.–20.11.2026 (eine einmalige Aufgabe schaltet sie am 20.11. nach der 21-Uhr-Erhebung ab).
Seit 21.10. mittags laufen alle Erhebungen in derselben Sitzung (eine eigene Sitzung pro Lauf konnte nicht pushen). Jeder Lauf führt diese Schritte aus und veröffentlicht danach das Online-Dashboard
(https://claude.ai/artifact/JucmPLm9m8k9AAaCB3RbFz) mit den neuen CSV-Dateien neu.

## Status

- `capture.mjs` am 21.10.2026 gegen web.de getestet: Consent wird bestätigt, die 5 Topteaser (Aufmacher + 4 Listenteaser) werden korrekt erfasst.
- Benötigte Domains in der Netzwerk-Freigabe: `web.de`, `*.web.de`, `*.uicdn.com`.
- Dashboard: noch offen.

## Geplante Nachcodierung nach Abschluss (erst nach ausdrücklichem Go)

Nach dem 20.11.2026 sollen alle Teaser anhand der gespeicherten Texte (capture.json, CSV) und Bilder nachträglich ergänzt werden. Ziel: faktenbasiert zeigen, wo bei Themensetzung und Bebilderung Spielraum für eine ausgewogenere Verteilung von Geschlechtern und Altersgruppen bestand.

Geplante zusätzliche Felder je Teaser:
1. **Themensetzung:** aktuell/unvermeidbar (z. B. Regierung, Krieg, Krawalle, große Sportereignisse) vs. redaktionell gesetzt (z. B. Gesundheit, Ratgeber, Promis, Kurioses).
2. **Bildbindung:** zwingend (Person ist das Thema) / naheliegend / frei (Symbolbild).
3. **Vom Text vorgegebene Protagonist*innen** (falls vorhanden): wer, Geschlecht, Alter.

Auswertung: Kreuzung dieser Felder mit den vorhandenen Bild-Codierungen; die inhaltliche Analyse übernimmt die Projektverantwortliche.

**Vorgehen:** Nach Abschluss der Erhebung NICHT selbstständig starten. Erst aktiv nachfragen, ob die Nachcodierung beginnen soll, und auf ein ausdrückliches Go warten.
