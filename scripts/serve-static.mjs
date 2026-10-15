#!/usr/bin/env node
/**
 * Statischer Vorschau-Server für den Demo-Build – bildet GitHub Pages nach (Unterpfad, 404.html).
 *
 *   npm run demo:build && npm run demo:serve   → http://127.0.0.1:4400/Artenreich.ch/
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../dist/client');
const base = (process.env.BASE_PATH || '/Artenreich.ch/').replace(/\/?$/, '/');
const port = Number(process.env.PORT || 4400);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};

const send = (res, status, file) => {
  res.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  if (path === base.slice(0, -1)) {
    res.writeHead(301, { location: base });
    return res.end();
  }
  if (!path.startsWith(base) || req.method !== 'GET') {
    return send(res, path.startsWith(base) ? 405 : 404, join(root, '404.html'));
  }
  let file = normalize(join(root, path.slice(base.length)));
  if (!file.startsWith(root)) return send(res, 404, join(root, '404.html'));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return send(res, 404, join(root, '404.html'));
  send(res, 200, file);
}).listen(port, '127.0.0.1', () => console.log(`Demo: http://127.0.0.1:${port}${base}`));
