# Codebuch: Personendarstellung in den web.de-Topteasern

Analyse-Einheit 1 = **Teaser** (immer 5 pro Erhebung). Analyse-Einheit 2 = **Person im Teaserbild**.
Alle Merkmale sind **wahrgenommene** Merkmale. Im Zweifel `nicht_erkennbar` / `unklar` – lieber eine
ehrliche Lücke als eine geratene Zuordnung.

## Teaser-Ebene (jeder Teaser, auch ohne Personen)

| Feld | Werte | Regel |
|---|---|---|
| `bild_typ` | personen, landschaft_ort, objekt, tier, grafik_text, sonstiges | `personen`, sobald mind. eine Person erkennbar im Bild ist |
| `personen_anzahl` | Zahl | alle sichtbaren Personen (bei Menge: Schätzung) |
| `menschenmenge` | ja, nein | `ja` ab mehr als 5 Personen |
| `thema` | politik, wirtschaft, krieg_konflikt, kriminalitaet_unglueck, gesellschaft, promi_unterhaltung, sport, wissenschaft_gesundheit, ratgeber_verbraucher, sonstiges | nach Headline + Teasertext |
| `notiz` | Freitext | Besonderheiten, z.B. Archivbild, Symbolbild |

## Personen-Ebene (nur bei `bild_typ = personen`)

Codiert werden **höchstens 5 Personen pro Bild**: die im Vordergrund / am größten dargestellten.
Personen im Hintergrund einer Menge werden nur über `personen_anzahl` gezählt.

| Feld | Werte | Regel |
|---|---|---|
| `name` | Name oder leer | nur wenn aus Headline/Teasertext/Bildunterschrift eindeutig |
| `geschlecht` | weiblich, maennlich, divers, nicht_erkennbar | bei bekannten Personen: deren öffentliche Selbstbezeichnung |
| `alter` | jung (unter 30, inkl. Kinder), mittel (30–59), alt (60+), nicht_erkennbar | bei bekannten Personen: tatsächliches Alter |
| `hautfarbe` | weiss, poc, nicht_erkennbar | rein visuelle Wahrnehmung; **nie** aus dem Namen ableiten |
| `globaler_sueden` | ja, nein, unklar | Bezug der Person zum globalen Süden (Herkunft, Ort des Geschehens) laut Headline/Text/Bild-Kontext; unabhängig von `hautfarbe` |
| `bildrolle` | hauptperson, nebenperson | |
| `in_headline` | namentlich, indirekt, nein | `indirekt` = als Gruppe/Funktion gemeint ("Kanzler", "Rentnerin") |
| `headline_aktiv` | aktiv, passiv, nicht_thematisiert | aktiv = Person handelt/spricht/entscheidet; passiv = ihr widerfährt etwas, wird bewertet/beschrieben |
| `status` | reich_maechtig, arm_benachteiligt, neutral, unklar | laut Headline/Kontext, nicht nach Kleidung allein |
| `agenda` | ja, nein, unklar | ja = vertritt erkennbar eine Position, ein Ziel, eine Forderung |
| `rolle` | politik, wirtschaft, expertise, promi_unterhaltung, sport, taeter_beschuldigt, opfer_betroffen, alltag_buerger, sonstige | Hauptrolle im Teaser |
| `sicherheit` | hoch, mittel, niedrig | Gesamtsicherheit der Codierung dieser Person |
| `begruendung` | Freitext, 1 Satz | woran die Zuordnung festgemacht wurde |

## Auswertungslogik (für das Dashboard)

1. **Bildanteil**: Anteil Teaser mit Personen vs. ohne Personen.
2. **Personen-Verteilung**: über alle codierten Personen (Geschlecht, Alter, Hautfarbe, globaler Süden).
3. **Hauptpersonen-Verteilung**: nur `bildrolle = hauptperson` – verhindert, dass Gruppenbilder das Ergebnis dominieren.
4. **Framing**: Kreuzungen, z.B. Geschlecht × headline_aktiv, Hautfarbe × rolle, Alter × status.
5. `nicht_erkennbar` wird immer mit ausgewiesen, nie stillschweigend herausgerechnet.

## Format der Datei `analysis.json`

```json
{
  "run_id": "2026-10-21-05-00",
  "erfasst_am": "2026-10-21T05:00:12.000Z",
  "teaser": [
    {
      "position": 1, "headline": "...", "url": "...",
      "bild_typ": "personen", "personen_anzahl": 2, "menschenmenge": "nein",
      "thema": "politik", "notiz": "",
      "personen": [
        { "name": "...", "geschlecht": "weiblich", "alter": "mittel", "hautfarbe": "weiss",
          "globaler_sueden": "nein", "bildrolle": "hauptperson", "in_headline": "namentlich",
          "headline_aktiv": "aktiv", "status": "reich_maechtig", "agenda": "ja",
          "rolle": "politik", "sicherheit": "hoch", "begruendung": "..." }
      ]
    }
  ]
}
```
