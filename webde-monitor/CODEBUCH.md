# Codebuch: Personendarstellung in den web.de-Topteasern

Analyse-Einheit 1 = **Teaser** (immer 5 pro Erhebung). Analyse-Einheit 2 = **Person im Teaserbild**.
**Grundlage ist ausschließlich, was Lesende auf der Startseite sehen: Bild, Dachzeile, Headline.**
Keine Artikeltexte, Bildunterschriften, Dateinamen oder Vorwissen über abgebildete Personen.
Alle Merkmale sind **wahrgenommene** Merkmale. Im Zweifel `nicht_erkennbar` / `unklar` – lieber eine
ehrliche Lücke als eine geratene Zuordnung. **Ausnahme Alter:** Bei sichtbarem Gesicht wird immer geschätzt (siehe unten).

## Teaser-Ebene (jeder Teaser, auch ohne Personen)

| Feld | Werte | Regel |
|---|---|---|
| `bild_typ` | personen, landschaft_ort, objekt, tier, grafik_text, sonstiges | `personen`, sobald mind. eine Person erkennbar im Bild ist |
| `personen_anzahl` | Zahl | alle sichtbaren Personen (bei Menge: Schätzung) |
| `menschenmenge` | ja, nein | `ja` ab mehr als 5 Personen |
| `notiz` | Freitext | Besonderheiten, z.B. Archivbild, Symbolbild |

## Personen-Ebene (nur bei `bild_typ = personen`)

Codiert werden **höchstens 5 Personen pro Bild**: die im Vordergrund / am größten dargestellten.
Personen im Hintergrund einer Menge werden nur über `personen_anzahl` gezählt.

| Feld | Werte | Regel |
|---|---|---|
| `name` | Name oder leer | nur wenn aus Dachzeile/Headline eindeutig ist, dass diese Person gemeint ist |
| `geschlecht` | weiblich, maennlich, nicht_erkennbar | nach Bildeindruck; keine Kategorie divers, da nur per Selbstauskunft feststellbar |
| `alter` | jung (unter 30, inkl. Kinder), mittel (30–59), alt (60+), nicht_erkennbar | Bei sichtbarem Gesicht **immer schätzen**, Unsicherheit über `sicherheit` markieren. `nicht_erkennbar` nur, wenn das Gesicht nicht zu sehen ist (verdeckt, abgewandt, zu klein). |
| `hautfarbe` | weiss, poc, nicht_erkennbar | rein visuelle Wahrnehmung; **nie** aus dem Namen ableiten |
| `bildrolle` | hauptperson, nebenperson | |
| `in_headline` | namentlich, indirekt, nein | `indirekt` = als Gruppe/Funktion gemeint ("Kanzler", "Rentnerin") |
| `headline_aktiv` | aktiv, passiv, nicht_thematisiert | aktiv = Person handelt/spricht/entscheidet; passiv = ihr widerfährt etwas, wird bewertet/beschrieben |
| `status` | reich_maechtig, arm_benachteiligt, neutral, unklar | laut Dachzeile/Headline/Bild, nicht nach Kleidung allein |
| `agenda` | ja, nein, unklar | ja = vertritt erkennbar eine Position, ein Ziel, eine Forderung |
| `sicherheit` | hoch, mittel, niedrig | Gesamtsicherheit der Codierung dieser Person |
| `begruendung` | Freitext, 1 Satz | woran die Zuordnung festgemacht wurde |

## Auswertungslogik (für das Dashboard)

Grundeinheit ist der **Teaser**, nicht die Person.

1. **Bildanteil**: Anteil Teaser mit Personen vs. ohne Personen.
2. **„x von 5“**: Wie viele Teaser pro Erhebung zeigen mindestens eine Person mit dem Merkmal (z.B. mindestens eine Frau).
3. **Verteilungen (Torten)**: Jeder Teaser mit Personen zählt genau 1. Dieses Gewicht wird gleichmäßig auf die
   codierten Personen im Bild verteilt (5 Personen, davon 2 PoC → 0,4 PoC, 0,6 weiß). Gruppenbilder zählen
   so nicht mehr als Einzelbilder.
4. **Framing** (vorerst experimentell, wird auf Aussagekraft geprüft): gleiche Gewichtung, z.B. Geschlecht × headline_aktiv.
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
      "notiz": "",
      "personen": [
        { "name": "...", "geschlecht": "weiblich", "alter": "mittel", "hautfarbe": "weiss",
          "bildrolle": "hauptperson", "in_headline": "namentlich",
          "headline_aktiv": "aktiv", "status": "reich_maechtig", "agenda": "ja",
          "sicherheit": "hoch", "begruendung": "..." }
      ]
    }
  ]
}
```
