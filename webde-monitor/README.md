# web.de-Topteaser-Monitor (Prototyp)

Erfasst 5× täglich die ersten 5 Teaser der **mobilen** web.de-Startseite und codiert die abgebildeten
Personen nach [CODEBUCH.md](CODEBUCH.md).

## Ablauf einer Erhebung

1. `npm install` (einmalig)
2. `node capture.mjs` → `data/runs/<run_id>/` mit `capture.json`, `seite.png`, `teaser-1..5.png`
3. Prüfen mit `seite.png`, ob die richtigen 5 Teaser erfasst wurden (Heuristik; bei Fehlgriff `TEASER_SELECTOR` setzen)
4. Bilder + Headlines nach Codebuch auswerten → `data/runs/<run_id>/analysis.json`
5. `node record.mjs data/runs/<run_id>/analysis.json` → prüft die Werte und hängt an
   `data/teasers.csv` (1 Zeile je Teaser) und `data/persons.csv` (1 Zeile je Person) an
6. Commit + Push

## Prompt für die geplante Aufgabe

> Im Repo crmd, Ordner webde-monitor: Führe eine Erhebung laut README.md aus (Schritte 1–6).
> Werte jedes Teaserbild (teaser-N.png, bei Unklarheit seite.png) streng nach CODEBUCH.md aus.
> Im Zweifel `nicht_erkennbar`/`unklar`, Hautfarbe nie aus Namen ableiten. Falls capture.mjs
> weniger als 5 Teaser findet oder seite.png zeigt, dass falsche Elemente erfasst wurden: nichts
> eintragen, sondern den Fehler in data/runs/<run_id>/FEHLER.md notieren und committen.

Geplante Zeiten (Vorschlag): 7, 10, 13, 17, 21 Uhr (Europe/Berlin).

## Status

- `capture.mjs` ist nur gegen eine Testseite geprüft – web.de ist im Netzwerk der Cloud-Umgebung noch gesperrt.
- Dashboard: noch offen.
