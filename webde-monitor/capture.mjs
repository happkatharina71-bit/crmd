// Erfasst die ersten 5 Teaser der mobilen web.de-Startseite (Headline, Link, Bild, Screenshots).
// Aufruf: node capture.mjs            -> legt data/runs/<run_id>/ an
// Optional: TEASER_SELECTOR="css" erzwingt einen festen Selektor, falls die Heuristik danebenliegt.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const START_URL = process.env.START_URL || 'https://web.de/';
const N = 5;
const now = new Date();
const runId = now.toISOString().slice(0, 16).replace(/[:T]/g, '-'); // z.B. 2026-10-21-07-00
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'data', 'runs', runId);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['iPhone 13'],
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
});
const page = await context.newPage();
await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

// Consent-Seite: bis zu 30 s auf den Zustimmen-Button (liegt in einem iframe) warten und klicken
// Weiterleitung zur Consent-Seite passiert per JavaScript, daher erst darauf warten
await page.waitForURL(/consent/, { timeout: 15000 }).catch(() => {});
const consent = /akzeptieren und weiter|alle akzeptieren|zustimmen und weiter/i;
for (let t = 0; t < 30 && /consent/.test(page.url()); t++) {
  for (const frame of page.frames()) {
    const btn = frame.getByText(consent).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForURL((u) => !/consent/.test(u.href), { timeout: 15000 }).catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(1000);
}
await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
if (!page.url().startsWith(START_URL)) await page.goto(START_URL, { waitUntil: 'domcontentloaded' });

// Lazy-Loading anstoßen
for (let y = 0; y < 3; y++) {
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(700);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, 'seite.png'), fullPage: false, clip: { x: 0, y: 0, width: 390, height: 1500 } }).catch(() =>
  page.screenshot({ path: path.join(outDir, 'seite.png') }));

// Teaser finden: Links mit großem Bild + Headline-Text, in Dokument-Reihenfolge, ohne Werbung
const teasers = await page.evaluate(({ n, selector }) => {
  const isAd = (el) => /anzeige|sponsored|werbung|advert/i.test(
    (el.closest('[class*="ad"],[id*="ad"],[data-ad]')?.outerHTML.slice(0, 300) || '') + el.innerText);
  const candidates = selector
    ? [...document.querySelectorAll(selector)]
    : [...document.querySelectorAll('a[href]')].filter((a) => {
        const img = a.querySelector('img') || a.closest('article,li,div')?.querySelector('img');
        const r = img?.getBoundingClientRect();
        return img && r && r.width >= 100 && a.innerText.trim().length >= 15;
      });
  const seen = new Set();
  const out = [];
  for (const el of candidates) {
    const a = el.matches('a') ? el : el.querySelector('a[href]');
    if (!a || seen.has(a.href) || isAd(el)) continue;
    const box = el.closest('article') || el;
    const img = box.querySelector('img') || a.querySelector('img');
    const heading = box.querySelector('h1,h2,h3,h4,[class*="headline"],[class*="title"]');
    seen.add(a.href);
    box.setAttribute('data-capture-pos', String(out.length + 1));
    out.push({
      position: out.length + 1,
      headline: (heading?.innerText || a.innerText).trim().replace(/\s+/g, ' '),
      teasertext: box.innerText.trim().replace(/\s+/g, ' ').slice(0, 400),
      url: a.href,
      bild_url: img?.currentSrc || img?.src || null,
      bild_alt: img?.alt || null,
    });
    if (out.length >= n) break;
  }
  return out;
}, { n: N, selector: process.env.TEASER_SELECTOR || null });

// Download über eine Browser-Seite, da context.request den Proxy der Umgebung nicht nutzt
let dl = null;
const dlPage = async () => (dl ??= await context.newPage());
for (const t of teasers) {
  const file = `teaser-${t.position}.png`;
  await page.locator(`[data-capture-pos="${t.position}"]`).first()
    .screenshot({ path: path.join(outDir, file) })
    .then(() => { t.screenshot = file; })
    .catch(() => { t.screenshot = null; });
  t.dachzeile = t.teasertext.split(t.headline)[0].trim() || null;
  // Bild zusätzlich in großer Auflösung laden (web.de liefert w300 / w950)
  t.bild = null;
  if (t.bild_url) {
    const res = await (await dlPage()).goto(t.bild_url.replace(/-w\d+/, '-w950')).catch(() => null);
    if (res?.ok()) {
      t.bild = `bild-${t.position}.webp`;
      fs.writeFileSync(path.join(outDir, t.bild), await res.body());
    }
  }
}

const capture = { run_id: runId, erfasst_am: now.toISOString(), quelle: START_URL, ansicht: 'mobil (iPhone 13)', teaser: teasers };
fs.writeFileSync(path.join(outDir, 'capture.json'), JSON.stringify(capture, null, 2));
await browser.close();
console.log(`${teasers.length} Teaser erfasst -> ${outDir}`);
if (teasers.length < N) process.exitCode = 2;
