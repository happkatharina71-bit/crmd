// Prüft eine analysis.json gegen das Codebuch und hängt sie an data/teasers.csv + data/persons.csv an.
// Aufruf: node record.mjs data/runs/<run_id>/analysis.json
import fs from 'node:fs';
import path from 'node:path';
import { TEASER_FIELDS, PERSON_FIELDS, TEASER_COLUMNS, PERSON_COLUMNS, MAX_PERSONEN } from './schema.mjs';

const dataDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'data');
const file = process.argv[2];
if (!file) { console.error('Aufruf: node record.mjs <analysis.json>'); process.exit(1); }
const a = JSON.parse(fs.readFileSync(file, 'utf8'));
// Dachzeile, Headline, URL und Zeitpunkt immer aus capture.json übernehmen, falls vorhanden
const capFile = path.join(path.dirname(file), 'capture.json');
if (fs.existsSync(capFile)) {
  const cap = JSON.parse(fs.readFileSync(capFile, 'utf8'));
  a.erfasst_am ??= cap.erfasst_am;
  for (const t of a.teaser || []) {
    const c = cap.teaser.find((x) => x.position === t.position);
    if (c) for (const k of ['dachzeile', 'headline', 'url']) t[k] ??= c[k];
  }
}

const errors = [];
const check = (fields, obj, where) => {
  for (const [k, allowed] of Object.entries(fields))
    if (!allowed.includes(obj[k])) errors.push(`${where}: ${k}="${obj[k]}" nicht erlaubt (${allowed.join('|')})`);
};
if (!a.run_id || !Array.isArray(a.teaser)) errors.push('run_id oder teaser fehlt');
for (const t of a.teaser || []) {
  const w = `Teaser ${t.position}`;
  check(TEASER_FIELDS, t, w);
  const persons = t.personen || [];
  if (!Number.isInteger(t.personen_anzahl) || t.personen_anzahl < 0) errors.push(`${w}: personen_anzahl muss ganze Zahl >= 0 sein`);
  if (t.bild_typ === 'personen' && persons.length === 0) errors.push(`${w}: bild_typ=personen, aber keine Person codiert`);
  if (t.bild_typ !== 'personen' && persons.length > 0) errors.push(`${w}: Personen codiert, aber bild_typ=${t.bild_typ}`);
  if (persons.length > MAX_PERSONEN) errors.push(`${w}: maximal ${MAX_PERSONEN} Personen codieren`);
  if (persons.length > t.personen_anzahl) errors.push(`${w}: mehr Personen codiert als personen_anzahl`);
  persons.forEach((p, i) => check(PERSON_FIELDS, p, `${w} Person ${i + 1}`));
}
if (errors.length) { console.error('Validierung fehlgeschlagen:\n' + errors.join('\n')); process.exit(1); }

const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const append = (name, columns, rows) => {
  const f = path.join(dataDir, name);
  if (!fs.existsSync(f)) fs.writeFileSync(f, columns.join(',') + '\n');
  const existing = fs.readFileSync(f, 'utf8');
  if (existing.split('\n').some((l) => l.startsWith(a.run_id + ','))) {
    console.log(`${name}: run ${a.run_id} schon vorhanden, übersprungen`);
    return;
  }
  fs.appendFileSync(f, rows.map((r) => columns.map((c) => csvCell(r[c])).join(',')).join('\n') + (rows.length ? '\n' : ''));
  console.log(`${name}: ${rows.length} Zeilen angehängt`);
};

append('teasers.csv', TEASER_COLUMNS, a.teaser.map((t) => ({
  ...t, run_id: a.run_id, erfasst_am: a.erfasst_am, personen_codiert: (t.personen || []).length,
})));
append('persons.csv', PERSON_COLUMNS, a.teaser.flatMap((t) => (t.personen || []).map((p, i) => ({
  ...p, run_id: a.run_id, position: t.position, person_nr: i + 1,
}))));
