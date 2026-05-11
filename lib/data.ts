// =====================================================
// MOCK-DATEN — später ersetzbar durch echte News-Pipeline
// =====================================================

export type Job = {
  id: string;
  label: string;
  sub: string;
  aliases: string[];
};

export type NewsItem = {
  id: string;
  headline: string;
  ressort: string;
  format?: string;
};

export type BriefingEntry = {
  newsId: string;
  level: 1 | 2 | 3;
  translation: string;
};

export type Module = {
  id: string;
  label: string;
  description: string;
  needsSetup: boolean;
  setupHint?: string;
  defaultOn: boolean;
  placeholder?: boolean;
};

// Die 6 Beispielberufe mit Synonymen für die Suche
export const JOBS: Job[] = [
  {
    id: "pflege",
    label: "Pflegekraft",
    sub: "Gesundheit & Pflege",
    aliases: [
      "pflegekraft",
      "krankenpfleger",
      "krankenpflegerin",
      "krankenschwester",
      "altenpfleger",
      "altenpflegerin",
      "pfleger",
      "pflegerin",
      "gesundheits- und krankenpfleger",
      "pflegefachkraft",
      "intensivpflege",
    ],
  },
  {
    id: "baeckerin",
    label: "Bäckermeister*in",
    sub: "Handwerk & Lebensmittel",
    aliases: [
      "bäckermeisterin",
      "bäckermeister",
      "bäcker",
      "bäckerin",
      "bäckersfrau",
      "konditor",
      "konditorin",
      "handwerksbetrieb",
      "bäckerei",
    ],
  },
  {
    id: "grafikerin",
    label: "Grafiker*in",
    sub: "Kreativbranche & Design",
    aliases: [
      "grafikerin",
      "grafiker",
      "grafikdesignerin",
      "grafikdesigner",
      "designerin",
      "designer",
      "illustrator",
      "illustratorin",
      "art director",
      "freiberufliche kreative",
      "selbstständige designerin",
    ],
  },
  {
    id: "lehrer",
    label: "Lehrer*in Sek I",
    sub: "Bildung & Schule",
    aliases: [
      "lehrer",
      "lehrerin",
      "lehrkraft",
      "gesamtschullehrer",
      "realschullehrer",
      "gymnasiallehrer",
      "sekundarstufe",
      "schule",
    ],
  },
  {
    id: "itpl",
    label: "IT-Projektleiter*in",
    sub: "Tech & Software",
    aliases: [
      "it-projektleiterin",
      "it-projektleiter",
      "projektleiterin it",
      "projektleiter it",
      "it-managerin",
      "it-manager",
      "softwareprojektleiter",
      "product owner",
      "scrum master",
      "engineering manager",
    ],
  },
  {
    id: "stb",
    label: "Steuerberater*in",
    sub: "Recht & Beratung",
    aliases: [
      "steuerberater",
      "steuerberaterin",
      "steuerkanzlei",
      "wirtschaftsprüfer",
      "wirtschaftsprüferin",
      "kanzlei",
    ],
  },
];

export const SUGGESTIONS_EMPTY = [
  "pflege",
  "baeckerin",
  "grafikerin",
  "lehrer",
  "itpl",
  "stb",
];

// Tagesaktueller News-Pool (Mock)
export const NEWS_POOL: NewsItem[] = [
  {
    id: "n1",
    headline: "Bundesregierung beschließt höheren Mindestlohn ab Januar",
    ressort: "Politik",
  },
  {
    id: "n2",
    headline: "EU-KI-Verordnung: Neue Pflichten für Unternehmen ab Februar in Kraft",
    ressort: "Wirtschaft",
  },
  {
    id: "n3",
    headline: "Krankenhausreform: Bund-Länder-Einigung zu Fallpauschalen",
    ressort: "Politik",
  },
  {
    id: "n4",
    headline: "Energiepreis-Bremse läuft Ende März aus — keine Verlängerung geplant",
    ressort: "Wirtschaft",
  },
  {
    id: "n5",
    headline: "Studie: Generative KI verändert Kreativbranche schneller als erwartet",
    ressort: "Wissen",
    format: "Analyse",
  },
  {
    id: "n6",
    headline: "Lehrkräftemangel: Kultusministerkonferenz beschließt Quereinsteiger-Programm",
    ressort: "Politik",
  },
  {
    id: "n7",
    headline: "Bundesfinanzhof kippt Regelung zur häuslichen Arbeitsstätte",
    ressort: "Ratgeber",
  },
  {
    id: "n8",
    headline: "Mehlpreise stabilisieren sich nach Ernterekord in Frankreich",
    ressort: "Wirtschaft",
  },
  {
    id: "n9",
    headline: "Tarifabschluss öffentlicher Dienst: 5,5 Prozent mehr ab Mai",
    ressort: "Wirtschaft",
  },
  {
    id: "n10",
    headline: "Cyberangriff legt mehrere Krankenhäuser in NRW lahm",
    ressort: "Panorama",
  },
  {
    id: "n11",
    headline: "Neue ELSTER-Schnittstelle: Steuerkanzleien müssen Software anpassen",
    ressort: "Ratgeber",
  },
  {
    id: "n12",
    headline: "Digitalpakt 2.0: Länder fordern Verstetigung statt Einmalförderung",
    ressort: "Politik",
  },
  {
    id: "n13",
    headline: "Studie zu Pflege-Robotik: Akzeptanz steigt deutlich",
    ressort: "Gesundheit",
    format: "Reportage",
  },
  {
    id: "n14",
    headline: "Adobe und Canva erweitern KI-Bildgenerierung",
    ressort: "Wissen",
  },
  {
    id: "n15",
    headline: "Neue EU-Richtlinie zu Scheinselbstständigkeit beschlossen",
    ressort: "Wirtschaft",
  },
];

// Pro Beruf: welche News, welche Stufe, welche Übersetzung
export const BRIEFINGS: Record<string, BriefingEntry[]> = {
  pflege: [
    {
      newsId: "n3",
      level: 1,
      translation:
        "Direkt für dich: Die Reform verändert ab 2027, wie dein Krankenhaus abrechnet. Heißt für deinen Alltag: weniger Druck auf Fallzahlen, mehr Personal pro Station möglich — aber Übergangsphase wird zäh.",
    },
    {
      newsId: "n9",
      level: 1,
      translation:
        "Tariferhöhung gilt auch für Pflegekräfte im öffentlichen Dienst. Ab Mai: 5,5 % mehr brutto. Bei TVöD-P 8a sind das ca. 180–220 € im Monat. Bei privaten Trägern: Druck auf Nachverhandlung steigt.",
    },
    {
      newsId: "n10",
      level: 2,
      translation:
        "Falls dein Haus betroffen ist: alle Patientendaten manuell, Schichtpläne wackeln. Falls nicht: deine Klinik wird in den nächsten Wochen IT-Sicherheit hochfahren — rechne mit neuen Passwort-Regeln und Pflichtschulungen.",
    },
    {
      newsId: "n13",
      level: 3,
      translation:
        "Kein Job-Killer, sondern Entlastung bei Hebearbeiten und Routinekontrollen. Falls in deinem Haus diskutiert: gute Studienbasis für Mitbestimmung — was du übernehmen willst, was nicht.",
    },
    {
      newsId: "n1",
      level: 2,
      translation:
        "Indirekt relevant: Hilfskräfte und Servicekräfte in deiner Klinik bekommen mehr — Druck auf die ganze Lohnstruktur. Pflegehilfskräfte nähern sich Pflegefachkräften an, Verhandlungsmasse für Aufstockung.",
    },
  ],
  baeckerin: [
    {
      newsId: "n1",
      level: 1,
      translation:
        "Falls du Personal beschäftigst: Kalkulation jetzt durchrechnen, nicht erst im Dezember. Bei mehreren Mitarbeitenden je nach Lohngruppe schnell vierstellige Mehrkosten pro Monat ab Januar. Preisanpassung früh kommunizieren.",
    },
    {
      newsId: "n4",
      level: 1,
      translation:
        "Backofen läuft auf Strom oder Gas — Preisbremse weg heißt: Energiekosten könnten ab April 15–25 % steigen. Mit Versorger neuen Vertrag prüfen, kurze Bindung wählen.",
    },
    {
      newsId: "n8",
      level: 2,
      translation:
        "Gute Nachricht für den Wareneinsatz: Mehl wird die nächsten Monate nicht teurer. Falls du Lieferantenverträge neu verhandelst — günstiger Zeitpunkt.",
    },
    {
      newsId: "n15",
      level: 2,
      translation:
        "Wichtig falls du mit Aushilfen oder freien Auslieferer*innen arbeitest: Prüfung wird strenger. Wer regelmäßig nur für einen Betrieb fährt, gilt schneller als scheinselbstständig — Rückforderung Sozialabgaben möglich.",
    },
    {
      newsId: "n9",
      level: 3,
      translation:
        "Zwar nicht dein Tarif, aber: Konkurrenz um Personal wird härter. Stadt, Kita, Klinik zahlen ab Mai mehr — wer Verkäufer*innen halten will, sollte über eigene Lohnanpassung nachdenken.",
    },
  ],
  grafikerin: [
    {
      newsId: "n5",
      level: 1,
      translation:
        "Direkt für dein Geschäftsmodell: Studie sagt, Routine-Layouts und Bildbearbeitung verlieren weiter an Wert. Was steigt: Konzept, Markenaufbau, Beratung. Zeit, Angebot zu schärfen — weg vom Stundensatz, hin zu Paketen.",
    },
    {
      newsId: "n14",
      level: 1,
      translation:
        "Deine Kund*innen können jetzt mehr selbst — heißt: Briefings werden konkreter, Pitches härter. Aber auch: Adobe-Tools werden mächtiger. Wenn du Firefly noch nicht nutzt, jetzt einen Nachmittag investieren.",
    },
    {
      newsId: "n2",
      level: 2,
      translation:
        "Falls du KI in Kund*innenprojekten einsetzt: ab Februar Kennzeichnungspflicht für KI-generierte Inhalte. Betrifft auch dich als Dienstleisterin. Vertragstexte und Lieferbedingungen anpassen.",
    },
    {
      newsId: "n15",
      level: 1,
      translation:
        "Achtung wenn du langfristig nur für 1–2 Hauptkund*innen arbeitest: neue EU-Regel macht Scheinselbstständigkeit leichter feststellbar. Mehrere Kund*innen halten, Auftragslage dokumentieren.",
    },
    {
      newsId: "n7",
      level: 2,
      translation:
        "Falls du im Homeoffice arbeitest und das Arbeitszimmer absetzt: Urteil ändert, was als Arbeitsstätte gilt. Mit deiner Steuerberatung Belege für 2026 jetzt sortieren.",
    },
  ],
  lehrer: [
    {
      newsId: "n6",
      level: 1,
      translation:
        "Direkt im Lehrerzimmer spürbar: Neue Quereinsteiger*innen kommen schneller, mit weniger Vorbereitung. Mentoring-Aufgaben verteilen sich neu. Schulleitung wird vermutlich nach Pat*innen fragen.",
    },
    {
      newsId: "n12",
      level: 1,
      translation:
        "Für deine Klassenraum-Ausstattung: Länder kämpfen um dauerhafte Mittel statt Einmalzahlungen. Heißt für dich kurzfristig: aktuelle Geräte länger halten, Reparatur statt Neukauf einplanen.",
    },
    {
      newsId: "n5",
      level: 2,
      translation:
        "Relevant für deinen Unterricht: KI-Nutzung bei Schüler*innen wird Standard, nicht Ausnahme. Hausaufgaben-Konzept überdenken — Aufgaben, die in 30 Sekunden mit ChatGPT lösbar sind, lohnen sich nicht mehr.",
    },
    {
      newsId: "n2",
      level: 3,
      translation:
        "Hintergrund für Politik/Wirtschaft-Unterricht: EU-KI-Verordnung ist konkret und greifbar — gutes Fallbeispiel für Klasse 9/10, wenn ihr Regulierung digitaler Märkte behandelt.",
    },
    {
      newsId: "n9",
      level: 2,
      translation:
        "Falls verbeamtet: eigene Besoldung läuft separat, aber TV-L-Lehrkräfte an der Schule bekommen mehr. Auswirkungen auf Stimmung im Kollegium und auf Forderungen an Beamtenbesoldung in den nächsten Monaten.",
    },
  ],
  itpl: [
    {
      newsId: "n2",
      level: 1,
      translation:
        "Direkt für die Roadmap: Ab Februar Pflicht zu Risikoklassifizierung, Logging und menschlicher Aufsicht für KI-Systeme. Compliance-Workstream einplanen, falls noch nicht passiert.",
    },
    {
      newsId: "n10",
      level: 1,
      translation:
        "Wake-up-Call für Sicherheits-Reviews. Auch außerhalb von Healthcare wird der Vorstand fragen 'sind wir vorbereitet'. Incident-Response-Pläne und Backup-Tests jetzt aus der Schublade.",
    },
    {
      newsId: "n5",
      level: 2,
      translation:
        "Druck auf interne Kreativ- und Marketingteams steigt. Falls Plattform-Projekte für die anstehen: Anforderungen werden sich in den nächsten 6 Monaten verschieben — weniger Tools, mehr KI-Integration.",
    },
    {
      newsId: "n14",
      level: 3,
      translation:
        "Nicht direkt der eigene Stack, aber Trend: Enterprise-Tools holen bei KI-Funktionen schnell auf. Make-or-Buy-Entscheidungen für interne Lösungen sehen anders aus als vor 6 Monaten.",
    },
    {
      newsId: "n15",
      level: 2,
      translation:
        "Falls externe IT-Freelancer*innen im Projekt sind: Prüfung Scheinselbstständigkeit wird strenger. Vertragsmodelle mit Einkauf abstimmen, eventuell auf Body-Leasing oder Werkvertrag umstellen.",
    },
  ],
  stb: [
    {
      newsId: "n11",
      level: 1,
      translation:
        "Direkt operativ: Software-Anpassung nötig, Team-Schulung einplanen. Realistisch 2–3 Tage Produktivitätsverlust im Übergang. Mandant*innen vorab informieren, dass Bearbeitungszeit kurzzeitig steigen kann.",
    },
    {
      newsId: "n7",
      level: 1,
      translation:
        "Sofort relevant für Mandant*innen mit Homeoffice: Abzugsmöglichkeiten ändern sich. Standard-Vorlage für Beratungsgespräch in den nächsten Wochen vorbereiten — wird gefragt.",
    },
    {
      newsId: "n15",
      level: 1,
      translation:
        "Neue Beratungsleistung anbieten: Mandant*innen mit freien Mitarbeitenden brauchen Risiko-Check. Klare Geschäftschance, wer das Thema aktiv anspricht statt abzuwarten.",
    },
    {
      newsId: "n4",
      level: 2,
      translation:
        "Für Mandant*innen mit energieintensivem Geschäft: Liquiditätsplanung Q2 anpassen. Gute Gelegenheit für proaktive Beratung — wer jetzt anruft, signalisiert Wertschätzung.",
    },
    {
      newsId: "n2",
      level: 3,
      translation:
        "Eher strategisch: KI-Compliance wird Beratungsfeld. Wer sich breiter aufstellen will, sollte in den nächsten 12 Monaten Kompetenz aufbauen — Markt ist noch dünn besetzt.",
    },
  ],
};

export const LEVEL_META: Record<
  1 | 2 | 3,
  { label: string; sub: string; color: string }
> = {
  1: {
    label: "Musst du wissen",
    sub: "Direkte Auswirkung auf deinen Berufsalltag",
    color: "#c8200a",
  },
  2: {
    label: "Solltest du kennen",
    sub: "Branchenkontext, Hintergrund",
    color: "#d68a00",
  },
  3: {
    label: "Könnte dich inspirieren",
    sub: "Trends, angrenzende Felder",
    color: "#3a6a4a",
  },
};

// Hub-Module
export const MODULES: Module[] = [
  {
    id: "lokales",
    label: "Lokales",
    description: "News aus deiner Region",
    needsSetup: true,
    setupHint: "PLZ oder Stadt",
    defaultOn: true,
  },
  {
    id: "job",
    label: "Job-News",
    description: "News, übersetzt für deinen Beruf",
    needsSetup: true,
    setupHint: "Beruf",
    defaultOn: true,
  },
  {
    id: "thema",
    label: "Mein Thema",
    description: "News zu Themen, die dich interessieren",
    needsSetup: true,
    setupHint: "1–3 Themen",
    defaultOn: false,
  },
  {
    id: "top",
    label: "Top News",
    description: "Die wichtigsten Meldungen in einem Satz",
    needsSetup: false,
    defaultOn: true,
  },
  {
    id: "good",
    label: "Good News",
    description: "Was heute Mut macht",
    needsSetup: false,
    defaultOn: true,
  },
  {
    id: "astro",
    label: "Astro",
    description: "Tageshoroskop, KI-gestützt",
    needsSetup: true,
    setupHint: "Geburtsdaten",
    defaultOn: false,
    placeholder: true,
  },
];

export const DEFAULT_ORDER = ["lokales", "job", "thema", "top", "good", "astro"];

// Inhalte für die Hub-Modulkarten (Mock)
export const MODULE_CONTENT: Record<string, any> = {
  lokales: {
    region: "Karlsruhe",
    items: [
      {
        ressort: "Regionales",
        headline: "Karlsruher Marktplatz: Sanierung verzögert sich um sechs Monate",
        summary:
          "Stadtwerke melden Probleme mit Leitungsbestand — Wiedereröffnung nun Herbst statt Frühjahr.",
      },
      {
        ressort: "Regionales",
        headline: "Streik bei den VBK: Straßenbahnen am Mittwoch eingeschränkt",
        summary:
          "Verdi ruft zu ganztägigem Warnstreik auf, Schienenersatzverkehr nur auf Hauptlinien.",
      },
      {
        ressort: "Regionales",
        headline: "Neue Radspur entlang der Kaiserstraße ab Juni",
        summary:
          "Pop-up-Streifen wird zur Dauerlösung — Autospur entfällt zwischen Europaplatz und Marktplatz.",
      },
    ],
  },
  job: {
    profile: "Bäckermeister*in",
    summary: "3 Meldungen heute mit direkter Auswirkung auf deinen Berufsalltag.",
    items: [
      {
        level: 1,
        ressort: "Politik",
        headline: "Bundesregierung beschließt höheren Mindestlohn ab Januar",
        translation:
          "Falls du Personal beschäftigst: Kalkulation jetzt durchrechnen. Preisanpassung früh kommunizieren.",
      },
      {
        level: 1,
        ressort: "Wirtschaft",
        headline: "Energiepreis-Bremse läuft Ende März aus",
        translation:
          "Energiekosten könnten ab April 15–25 % steigen. Mit Versorger neuen Vertrag prüfen.",
      },
      {
        level: 2,
        ressort: "Wirtschaft",
        headline: "Mehlpreise stabilisieren sich nach Ernterekord",
        translation:
          "Gute Nachricht für den Wareneinsatz. Falls Lieferantenverträge anstehen — günstiger Zeitpunkt.",
      },
    ],
  },
  thema: {
    themen: ["Klimapolitik", "Bürgergeld"],
    items: [
      {
        ressort: "Politik",
        thema: "Klimapolitik",
        headline: "Bundestag verabschiedet neues Klimaschutzgesetz",
        summary:
          "Sektor-Ziele für Verkehr und Gebäude werden verbindlicher, Strafzahlungen ab 2027 möglich.",
      },
      {
        ressort: "Wirtschaft",
        thema: "Klimapolitik",
        headline: "CO2-Preis steigt 2027 stärker als geplant",
        summary:
          "Heizöl und Diesel werden deutlich teurer — Kompensation für untere Einkommen vorgesehen.",
      },
      {
        ressort: "Politik",
        thema: "Bürgergeld",
        headline: "Verschärfte Mitwirkungspflichten beim Bürgergeld beschlossen",
        summary:
          "Sanktionen bei Terminversäumnis steigen, neue Beratungspflicht für unter 25-Jährige.",
      },
    ],
  },
  top: {
    items: [
      {
        ressort: "Politik",
        headline: "Trump empört über Irans Antwort auf Vorschlag für Kriegsende",
        summary: "Teheran lehnt zentrale Forderungen ab, neue US-Sanktionen werden geprüft.",
      },
      {
        ressort: "Politik",
        headline: "Bund-Länder-Einigung zur Krankenhausreform",
        summary: "Fallpauschalen werden ab 2027 reduziert, mehr Geld für Vorhaltepauschalen.",
      },
      {
        ressort: "Wirtschaft",
        headline: "Tarifabschluss öffentlicher Dienst: 5,5 Prozent ab Mai",
        summary: "Verhandlungen nach drei Runden beendet, Laufzeit zwei Jahre.",
      },
      {
        ressort: "Panorama",
        headline: "Cyberangriff legt mehrere Krankenhäuser in NRW lahm",
        summary: "Notbetrieb in fünf Kliniken, keine Patientendaten betroffen laut Ermittlern.",
      },
    ],
  },
  good: {
    items: [
      {
        ressort: "Wissen",
        headline: "Erfolgreiche Wiederansiedlung: Luchse in den Pfälzerwäldern vermehren sich",
        summary: "Erstmals seit Programmstart 2016 zweistellige Geburtenzahl pro Jahr.",
      },
      {
        ressort: "Gesundheit",
        headline: "Durchbruch bei Alzheimer-Früherkennung durch einfachen Bluttest",
        summary:
          "Studie mit 1.200 Teilnehmer*innen zeigt 90 % Treffergenauigkeit zehn Jahre vor Symptomen.",
      },
      {
        ressort: "Panorama",
        headline: "Münchner Schüler*innen organisieren bundesweit größte Buch-Spendenaktion",
        summary: "Über 80.000 Bücher für Schulen in sozialen Brennpunkten gesammelt.",
      },
    ],
  },
};
