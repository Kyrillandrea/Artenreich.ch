#!/usr/bin/env node
/**
 * Darstellungs- und Funktionsprüfung mit Playwright gegen einen laufenden Server.
 *
 *   npm run build && npm run preview          # Server auf http://127.0.0.1:4321
 *   npm run qa                                 # Prüfung + Screenshots in qa/output/
 *   QA_BASE=https://vorschau.example npm run qa
 *
 * Prüft je Seite und Breite: horizontale Überbreite, Anzahl H1, Bilder ohne alt-Attribut,
 * Konsolenfehler, interne Links (HTTP-Status) und erstellt Ganzseiten-Screenshots.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:4321';
const OUT = resolve(import.meta.dirname, '../qa/output');
const PAGES = ['/', '/naturgarten/', '/naturpools-schwimmteiche/', '/impressionen/', '/team/', '/kontakt/', '/datenschutz/', '/gibt-es-nicht/'];
const WIDTHS = (process.env.QA_WIDTHS ?? '1440,1024,768,390,320').split(',').map(Number);
const SHOTS = process.env.QA_SHOTS !== '0';

const report = { base: BASE, date: new Date().toISOString(), pages: [], links: [], problems: [] };

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const internalLinks = new Set();

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, deviceScaleFactor: 1 });
    for (const path of PAGES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const blockedExternal = new Set();
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
      page.on('requestfailed', (req) => {
        const url = new URL(req.url());
        if (!url.host.startsWith('127.0.0.1') && !url.host.startsWith('localhost')) blockedExternal.add(url.host);
      });

      const response = await page.goto(BASE + path, { waitUntil: 'networkidle' });
      // Sanft durchscrollen, damit Reveals/Lazy-Loading auslösen
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 300));
      });

      const info = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - window.innerWidth;
        const wide = [];
        if (overflow > 0) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed') {
              wide.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(r.right)}px`);
              if (wide.length > 8) break;
            }
          }
        }
        const h1 = document.querySelectorAll('h1').length;
        const noAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
        const hidden = [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length;
        const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
        // Wörter, die breiter als ihr Container sind (abgeschnittene Headlines)
        const clipped = [];
        for (const el of document.querySelectorAll('h1, h2, h3, .display, .h2, .lead, a, button, li, p')) {
          if (el.closest('.sr-only') || el.classList.contains('sr-only') || el.closest('dialog:not([open])')) continue;
          if (getComputedStyle(el).overflowX !== 'visible' || el.clientWidth === 0) continue;
          if (el.scrollWidth > el.clientWidth + 2) clipped.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}: ${el.textContent.trim().slice(0, 50)}`);
          if (clipped.length > 10) break;
        }
        return { overflow, wide, h1, noAlt, hidden, links, clipped, title: document.title };
      });

      for (const href of info.links) {
        if (href && href.startsWith('/') && !href.startsWith('//')) internalLinks.add(href.split('#')[0] || '/');
      }

      const entry = {
        width,
        path,
        status: response?.status(),
        title: info.title,
        h1: info.h1,
        overflow: info.overflow,
        wide: info.wide,
        clipped: info.clipped,
        imgWithoutAlt: info.noAlt,
        invisibleAfterScroll: info.hidden,
        consoleErrors: consoleErrors.filter((e) => !/Failed to load resource/.test(e)),
        failedResourceLoads: consoleErrors.filter((e) => /Failed to load resource/.test(e)).length,
        blockedExternalHosts: [...blockedExternal],
      };
      report.pages.push(entry);

      if (entry.overflow > 0) report.problems.push(`${path} @${width}: horizontale Überbreite ${entry.overflow}px ${entry.wide.join('; ')}`);
      if (entry.clipped.length) report.problems.push(`${path} @${width}: Text breiter als Container: ${entry.clipped.join(' | ')}`);
      if (entry.h1 !== 1) report.problems.push(`${path} @${width}: ${entry.h1} H1-Elemente`);
      if (entry.imgWithoutAlt) report.problems.push(`${path} @${width}: ${entry.imgWithoutAlt} Bilder ohne alt`);
      if (entry.consoleErrors.length) report.problems.push(`${path} @${width}: Konsole: ${entry.consoleErrors.join(' | ')}`);

      if (SHOTS) {
        const name = `${path === '/' ? 'start' : path.replace(/\//g, '')}-${width}.png`;
        await page.screenshot({ path: join(OUT, name), fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }

  for (const href of internalLinks) {
    const res = await fetch(BASE + href, { redirect: 'manual' });
    report.links.push({ href, status: res.status });
    if (res.status >= 400) report.problems.push(`Interner Link ${href}: HTTP ${res.status}`);
  }

  await browser.close();
  await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Seiten geprüft: ${report.pages.length}, interne Links: ${report.links.length}`);
  console.log(report.problems.length ? `Probleme:\n- ${report.problems.join('\n- ')}` : 'Keine Probleme gefunden.');
  const blocked = new Set(report.pages.flatMap((p) => p.blockedExternalHosts));
  if (blocked.size) console.log(`Nicht ladbare externe Hosts (Umgebung): ${[...blocked].join(', ')}`);
  if (report.problems.length) process.exitCode = 1;
}

main();
