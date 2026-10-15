#!/usr/bin/env node
/**
 * Sichert die Originalbilder der bestehenden Website lokal und verifiziert sie.
 *
 *   npm run assets:fetch                       # von artenreich.ch herunterladen
 *   npm run assets:fetch -- --from-dir <Pfad>  # aus dem Materialpaket (ZIP entpackt) übernehmen
 *   npm run assets:fetch -- --force            # vorhandene Dateien erneut holen
 *
 * Ablage: src/assets/originals/<datei> (unverändert) + SOURCES.json (Quelle, SHA-256, Masse).
 * Optimierte Varianten erzeugt Astro beim Build separat (AVIF/WebP/JPEG in dist/).
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import sharp from 'sharp';
import { media } from '../src/data/media.ts';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'src/assets/originals');
const manifestPath = join(outDir, 'SOURCES.json');

const args = process.argv.slice(2);
const force = args.includes('--force');
const fromDirIndex = args.indexOf('--from-dir');
const fromDir = fromDirIndex >= 0 ? resolve(args[fromDirIndex + 1] ?? '') : null;

const SIGNATURES = [
  { type: 'jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { type: 'webp', test: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function indexDirectory(dir) {
  const map = new Map();
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else map.set(name.normalize('NFC').toLowerCase(), full);
    }
  };
  walk(dir);
  return map;
}

async function obtain(item, dirIndex) {
  if (dirIndex) {
    const original = decodeURIComponent(basename(new URL(item.src).pathname)).normalize('NFC').toLowerCase();
    const candidates = [original, item.file.toLowerCase()];
    const hit = candidates.map((c) => dirIndex.get(c)).find(Boolean);
    if (!hit) throw new Error(`nicht im Paket gefunden (${original})`);
    return { buffer: await readFile(hit), contentType: null, origin: hit };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(item.src, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) throw new Error(`kein Bild (content-type: ${contentType || 'leer'})`);
    return { buffer: Buffer.from(await res.arrayBuffer()), contentType, origin: item.src };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
  const dirIndex = fromDir ? indexDirectory(fromDir) : null;
  const results = { ok: [], skipped: [], failed: [] };

  for (const item of Object.values(media)) {
    const target = join(outDir, item.file);
    const known = manifest[item.id];
    if (!force && known && existsSync(target) && sha256(await readFile(target)) === known.sha256) {
      results.skipped.push(item.id);
      continue;
    }
    try {
      const { buffer, contentType, origin } = await obtain(item, dirIndex);
      if (buffer.length < 512) throw new Error(`Datei zu klein (${buffer.length} Bytes)`);
      const signature = SIGNATURES.find((s) => s.test(buffer));
      if (!signature) throw new Error('unbekanntes Bildformat (Signatur)');
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) throw new Error('Bildmasse nicht lesbar');
      const expectedExt = item.file.split('.').pop().toLowerCase();
      const ext = signature.type === 'jpeg' ? 'jpg' : signature.type;
      if (ext !== expectedExt) throw new Error(`Format ${ext} passt nicht zur Zieldatei .${expectedExt}`);
      await writeFile(target, buffer);
      manifest[item.id] = {
        id: item.id,
        group: item.group,
        source: item.src,
        obtainedFrom: origin,
        file: `src/assets/originals/${item.file}`,
        sha256: sha256(buffer),
        bytes: buffer.length,
        width: meta.width,
        height: meta.height,
        format: signature.type,
        contentType,
        alt: item.alt,
        fetchedAt: new Date().toISOString(),
      };
      results.ok.push(`${item.id} (${meta.width}×${meta.height})`);
    } catch (error) {
      results.failed.push(`${item.id}: ${error.message}`);
    }
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);

  console.log(`Gesichert: ${results.ok.length}, unverändert: ${results.skipped.length}, fehlgeschlagen: ${results.failed.length}`);
  results.ok.forEach((l) => console.log(`  ✓ ${l}`));
  results.failed.forEach((l) => console.log(`  ✗ ${l}`));
  if (results.failed.length) process.exitCode = 1;
}

main();
