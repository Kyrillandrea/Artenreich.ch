#!/usr/bin/env node
/**
 * Erzeugt aus dem Demo-Build eine einzelne, selbständige HTML-Datei der Startseite
 * (CSS, JavaScript, Schriften und lokale Bilder eingebettet) – zum Vorführen per Doppelklick.
 *
 *   PUBLIC_DEMO=true npx astro build && node scripts/single-file.mjs
 *   → dist/artenreich-demo.html
 *
 * Bilder, die noch nicht lokal gesichert sind, werden von artenreich.ch geladen (Internet nötig).
 * Links auf Unterseiten zeigen auf die Online-Demo (DEMO_URL).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { rolldown } from 'rolldown';

const root = resolve(import.meta.dirname, '..');
const client = join(root, 'dist/client');
const DEMO_URL = (process.env.DEMO_URL || 'https://kyrillandrea.github.io/Artenreich.ch/').replace(/\/?$/, '/');
const mime = { woff2: 'font/woff2', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

const dataUri = async (path) => {
  const ext = path.split('.').pop().toLowerCase();
  return `data:${mime[ext] ?? 'application/octet-stream'};base64,${(await readFile(join(client, path))).toString('base64')}`;
};
const replaceAsync = async (str, re, fn) => {
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(re)) {
    parts.push(str.slice(last, m.index), await fn(...m));
    last = m.index + m[0].length;
  }
  return parts.join('') + str.slice(last);
};

let html = await readFile(join(client, 'index.html'), 'utf8');

// Stylesheets einbetten (Schriften als data-URI)
html = await replaceAsync(html, /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/g, async (_, href) => {
  let css = await readFile(join(client, href), 'utf8');
  css = await replaceAsync(css, /url\((\/_astro\/[^)]+)\)/g, async (__, u) => `url(${await dataUri(u)})`);
  return `<style>${css}</style>`;
});
// Schrift-Preloads sind eingebettet überflüssig
html = html.replace(/<link rel="preload"[^>]*as="font"[^>]*>/g, '');

// Modul-Skripte samt Abhängigkeiten zu einem Skript bündeln
html = await replaceAsync(html, /<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g, async (_, src) => {
  const bundle = await rolldown({ input: join(client, src), logLevel: 'silent' });
  const { output } = await bundle.generate({ format: 'iife', minify: true });
  // Wie Module erst nach dem Parsen des Dokuments ausführen
  const code = output[0].code.replace(/<\/script/gi, '<\\/script');
  return `<script>document.addEventListener('DOMContentLoaded',function(){${code}});</script>`;
});

// Bilder: <source>-Varianten entfernen, eine passende lokale Variante einbetten
html = html.replace(/<source type="image\/(avif|webp)"[^>]*>/g, '');
html = await replaceAsync(html, /<img\b[^>]*>/g, async (tag) => {
  const srcset = tag.match(/srcset="([^"]+)"/)?.[1];
  let src = tag.match(/src="([^"]+)"/)?.[1];
  if (srcset) {
    // Kandidat um 1280 px Breite wählen (Qualität vs. Dateigrösse)
    const cands = srcset.split(',').map((c) => c.trim().split(/\s+/)).map(([u, w]) => [u, parseInt(w)]);
    cands.sort((a, b) => Math.abs(a[1] - 1280) - Math.abs(b[1] - 1280));
    src = cands[0][0];
  }
  let out = tag.replace(/\s(srcset|sizes)="[^"]*"/g, '');
  if (src?.startsWith('/_astro/')) out = out.replace(/src="[^"]+"/, `src="${await dataUri(src)}"`);
  return out;
});
// Bioterra-Label u. a. lokal referenzierte Bilder
html = await replaceAsync(html, /src="(\/_astro\/[^"]+)"/g, async (_, u) => `src="${await dataUri(u)}"`);

// Interne Links → Online-Demo; Anker auf der Startseite bleiben lokal
html = html.replace(/href="\/(?!\/)([^"#]*)(#[^"]*)?"/g, (_, path, hash = '') =>
  path === '' && hash ? `href="${hash}"` : `href="${DEMO_URL}${path}${hash}"`,
);
html = html.replace(/action="\/api\/anfrage\/"/, `action="${DEMO_URL}api/anfrage/"`);

const out = join(root, 'dist/artenreich-demo.html');
await writeFile(out, html);
console.log(`${out} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`);
