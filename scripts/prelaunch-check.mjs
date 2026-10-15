#!/usr/bin/env node
/**
 * Livegang-Gate. Schlägt fehl, solange Voraussetzungen für die produktive Website fehlen.
 *
 *   PUBLIC_INDEXING=true npm run build && npm run prelaunch
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { media, coreMediaIds } from '../src/data/media.ts';

const root = resolve(import.meta.dirname, '..');
const blockers = [];
const warnings = [];

// 1. Originalbilder lokal und unverändert
const manifestPath = join(root, 'src/assets/originals/SOURCES.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const missing = [];
for (const id of [...coreMediaIds, 'label-bioterra']) {
  const file = join(root, 'src/assets/originals', media[id].file);
  const entry = manifest[id];
  if (!existsSync(file) || !entry) missing.push(id);
  else if (createHash('sha256').update(readFileSync(file)).digest('hex') !== entry.sha256) missing.push(`${id} (Prüfsumme abweichend)`);
}
if (missing.length) blockers.push(`Originalbilder fehlen lokal (${missing.length}): ${missing.join(', ')} → npm run assets:fetch`);

// 2. Datenschutzerklärung übernommen und freigegeben
const privacy = readFileSync(join(root, 'src/content/datenschutz.md'), 'utf8');
if (!/^verified:\s*true\s*$/m.test(privacy)) blockers.push('Datenschutzerklärung nicht übernommen/freigegeben (src/content/datenschutz.md, verified: true)');

// 3. Build für den Livegang
const indexHtml = join(root, 'dist/client/index.html');
if (!existsSync(indexHtml)) blockers.push('Kein Build vorhanden');
else {
  const html = readFileSync(indexHtml, 'utf8');
  if (!html.includes('content="index, follow"')) blockers.push('Build ist im Vorschaumodus (noindex). Mit PUBLIC_INDEXING=true bauen.');
  // Keine Hotlinks auf die alte Website im Build
  const hotlinks = new Set();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.html')) {
        for (const m of readFileSync(full, 'utf8').matchAll(/https:\/\/artenreich\.ch\/wp-content\/[^"' )]+/g)) hotlinks.add(m[0]);
      }
    }
  };
  walk(join(root, 'dist/client'));
  if (hotlinks.size) blockers.push(`${hotlinks.size} Bild-Hotlinks auf die bestehende Website im Build`);
}

// 4. Inhaltsprüfung
const content = spawnSync(process.execPath, [join(root, 'scripts/check-content.mjs')], { encoding: 'utf8' });
if (content.status !== 0) blockers.push(`Inhaltsprüfung fehlgeschlagen:\n${content.stdout}`);

// 5. Versandkonfiguration (Laufzeit-Variablen des Servers)
const mailVars = ['SMTP_HOST', 'MAIL_FROM', 'MAIL_TO'].filter((k) => !process.env[k]);
if (mailVars.length) warnings.push(`Mailversand in dieser Umgebung nicht konfiguriert (${mailVars.join(', ')}). Auf dem Server setzen und mit autorisiertem Testziel prüfen.`);

console.log(blockers.length ? `Livegang blockiert:\n- ${blockers.join('\n- ')}` : 'Alle Livegang-Voraussetzungen erfüllt.');
if (warnings.length) console.log(`Hinweise:\n- ${warnings.join('\n- ')}`);
process.exit(blockers.length ? 1 : 0);
