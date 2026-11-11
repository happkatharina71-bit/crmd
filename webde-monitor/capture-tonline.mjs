// Erfasst die ersten 5 Slides des Hero-Karussells der mobilen t-online-Startseite (Vergleichslauf).
// Anzeigen-Slides werden übersprungen, es rücken die nächsten Slides nach.
// Aufruf: node capture-tonline.mjs   -> legt data-tonline/runs/<run_id>/ an
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const START_URL = 'https://www.t-online.de/';
const N = 5;
const now = new Date();
const runId = now.toISOString().slice(0, 16).replace(/[:T]/g, '-');
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'data-tonline', 'runs', runId);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 13'], locale: 'de-DE', timezoneId: 'Europe/Berlin' });
const page = await context.newPage();
await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

// Consent-Layer (falls vorhanden) bestätigen
const consent = /akzeptieren|zustimmen|einverstanden/i;
for (const frame of page.frames()) {
  const btn = frame.getByRole('button', { name: consent }).first();
  if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); await page.waitForTimeout(2000); break; }
}

const hero = page.locator('article[data-testid="Teaser.Hero"]').first();
await hero.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, 'seite.png'), clip: { x: 0, y: 0, width: 390, height: 1500 } }).catch(() =>
  page.screenshot({ path: path.join(outDir, 'seite.png') }));

// Alle Slides lesen (liegen vollständig im DOM); Dachzeile/Headline aus den Tracking-Daten des Links
const slides = await page.evaluate(() => {
  const first = document.querySelector('article[data-testid="Teaser.Hero"]');
  const track = first?.closest('div.flex');
  if (!track) return [];
  return [...track.children].map((s, i) => {
    const art = s.querySelector('article');
    const a = art?.querySelector('a[data-tracking]');
    let tr = {};
    try { tr = JSON.parse(a?.getAttribute('data-tracking') || '{}'); } catch {}
    const img = art?.querySelector('a img');
    const text = (art?.innerText || '').trim();
    const ad = !a || !!s.querySelector('[id*="nativendo"],[data-component*="Commercial"]') || /\bAnzeige\b/i.test(text) || tr.contentVermarktung === '1';
    return {
      slide: i + 1, anzeige: ad,
      dachzeile: tr.teaserHeadline || null, headline: tr.teaserTitle || null,
      teasertext: text.replace(/\s+/g, ' ').slice(0, 400),
      url: a ? new URL(a.getAttribute('href'), location.href).href : null,
      bild_url: img?.getAttribute('src') || null, bild_alt: img?.alt || null,
    };
  });
});

const teasers = [];
for (const s of slides) {
  if (s.anzeige) continue;
  teasers.push({ position: teasers.length + 1, ...s });
  if (teasers.length >= N) break;
}

// Bilder laden (über eine Browser-Seite, damit der Proxy der Umgebung greift) und Slide-Screenshots
const dl = await context.newPage();
for (const t of teasers) {
  t.bild = null;
  if (t.bild_url) {
    const res = await dl.goto(t.bild_url.replace(/fit-in\/\d+x0/, 'fit-in/1366x0')).catch(() => null);
    if (res?.ok()) { t.bild = `bild-${t.position}.jpg`; fs.writeFileSync(path.join(outDir, t.bild), await res.body()); }
  }
  t.screenshot = null;
  const art = page.locator('article[data-testid="Teaser.Hero"]').nth(slides.filter((x) => !x.anzeige && x.slide <= t.slide).length - 1);
  await art.screenshot({ path: path.join(outDir, `teaser-${t.position}.png`) }).then(() => { t.screenshot = `teaser-${t.position}.png`; }).catch(() => {});
}

const capture = { run_id: runId, erfasst_am: now.toISOString(), quelle: START_URL, ansicht: 'mobil (iPhone 13), Hero-Karussell', slides_gesamt: slides.length, anzeigen_uebersprungen: slides.filter((s) => s.anzeige && s.slide <= (teasers.at(-1)?.slide || 0)).length, teaser: teasers };
fs.writeFileSync(path.join(outDir, 'capture.json'), JSON.stringify(capture, null, 2));
await browser.close();
console.log(`${teasers.length} Teaser erfasst (${capture.anzeigen_uebersprungen} Anzeige(n) übersprungen) -> ${outDir}`);
if (teasers.length < N) process.exitCode = 2;
