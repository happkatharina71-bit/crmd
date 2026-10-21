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

Geplante Aufgabe „web.de Topteaser-Erhebung“: 7, 10, 13, 17, 21 Uhr (Europe/Berlin), 21.–26.10.2026.
Jeder Lauf startet eine neue Sitzung, die diese Schritte ausführt und danach das Online-Dashboard
(https://claude.ai/artifact/JucmPLm9m8k9AAaCB3RbFz) mit den neuen CSV-Dateien neu veröffentlicht.

## Status

- `capture.mjs` am 21.10.2026 gegen web.de getestet: Consent wird bestätigt, die 5 Topteaser (Aufmacher + 4 Listenteaser) werden korrekt erfasst.
- Benötigte Domains in der Netzwerk-Freigabe: `web.de`, `*.web.de`, `*.uicdn.com`.
- Dashboard: noch offen.
