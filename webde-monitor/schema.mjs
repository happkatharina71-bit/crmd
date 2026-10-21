// Codebuch: erlaubte Werte je Feld (Details und Regeln in CODEBUCH.md)
export const TEASER_FIELDS = {
  bild_typ: ['personen', 'landschaft_ort', 'objekt', 'tier', 'grafik_text', 'sonstiges'],
  menschenmenge: ['ja', 'nein'],
};
export const PERSON_FIELDS = {
  geschlecht: ['weiblich', 'maennlich', 'divers', 'nicht_erkennbar'],
  alter: ['jung', 'mittel', 'alt', 'nicht_erkennbar'],
  hautfarbe: ['weiss', 'poc', 'nicht_erkennbar'],
  globaler_sueden: ['ja', 'nein', 'unklar'],
  bildrolle: ['hauptperson', 'nebenperson'],
  in_headline: ['namentlich', 'indirekt', 'nein'],
  headline_aktiv: ['aktiv', 'passiv', 'nicht_thematisiert'],
  status: ['reich_maechtig', 'arm_benachteiligt', 'neutral', 'unklar'],
  agenda: ['ja', 'nein', 'unklar'],
  sicherheit: ['hoch', 'mittel', 'niedrig'],
};
export const TEASER_COLUMNS = ['run_id', 'erfasst_am', 'position', 'dachzeile', 'headline', 'url', 'bild_typ', 'personen_anzahl', 'personen_codiert', 'menschenmenge', 'notiz'];
export const PERSON_COLUMNS = ['run_id', 'position', 'person_nr', 'name', ...Object.keys(PERSON_FIELDS), 'begruendung'];
export const MAX_PERSONEN = 5;
