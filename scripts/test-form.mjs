#!/usr/bin/env node
/**
 * Ende-zu-Ende-Test des Anfrageformulars gegen den gebauten Server.
 * Versand geht ausschliesslich an einen lokalen SMTP-Mock (smtp-server) – nie an echte Adressen.
 *
 *   npm run build && npm run test:form
 */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { SMTPServer } from 'smtp-server';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` – ${detail}` : ''}`);
};

// --- SMTP-Mock ---------------------------------------------------------------
const mails = [];
const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (c) => (raw += c));
    stream.on('end', () => {
      mails.push({ raw, from: session.envelope.mailFrom.address, to: session.envelope.rcptTo.map((r) => r.address) });
      callback();
    });
  },
});
smtp.listen(0, '127.0.0.1');
await once(smtp.server, 'listening');
const smtpPort = smtp.server.address().port;

// --- Server-Instanzen ----------------------------------------------------------
async function startServer(port, env) {
  const child = spawn(process.execPath, ['dist/server/entry.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok) return { child, log: () => log };
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server auf Port ${port} startet nicht:\n${log}`);
}

const configured = await startServer(4331, {
  SMTP_HOST: '127.0.0.1',
  SMTP_PORT: String(smtpPort),
  SMTP_SECURE: 'false',
  MAIL_FROM: 'website@test.invalid',
  MAIL_TO: 'empfang@test.invalid',
  FORM_RATE_LIMIT: '50',
});
const unconfigured = await startServer(4332, { SMTP_HOST: '', MAIL_FROM: '', MAIL_TO: '' });
const A = 'http://127.0.0.1:4331';
const B = 'http://127.0.0.1:4332';

const postJson = (base, body) =>
  fetch(`${base}/api/anfrage/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });

try {
  // --- API -------------------------------------------------------------------
  let res = await postJson(A, { name: '', email: 'kein-mail' });
  let json = await res.json();
  check('Server-Validierung: Pflichtfelder', res.status === 422 && json.errors?.name && json.errors?.email, `HTTP ${res.status}`);

  res = await postJson(A, { name: 'Test Person', email: 'test@beispiel.ch', projekt: 'erfunden' });
  json = await res.json();
  check('Server-Validierung: unbekannte Projektart', res.status === 422 && json.errors?.projekt);

  const before = mails.length;
  res = await postJson(A, { name: 'Bot', email: 'bot@spam.invalid', hp_feld: 'http://spam' });
  check('Honeypot: angenommen ohne Versand', res.status === 200 && mails.length === before);

  res = await postJson(A, { name: 'Schnell', email: 'schnell@beispiel.ch', t: '400' });
  check('Zeitprüfung: zu schnelle Anfrage abgewiesen', res.status === 422 && (await res.json()).code === 'too_fast');

  res = await postJson(A, {
    name: 'Erika Muster',
    email: 'erika@beispiel.ch',
    projekt: 'naturpool',
    region: '8302 Kloten',
    zeitrahmen: '6-12',
    telefon: '+41 44 123 45 67',
    nachricht: 'Wir wünschen uns einen Platz zum Schwimmen.\nZweite Zeile.',
    t: '9000',
  });
  json = await res.json();
  const mail = mails.at(-1)?.raw ?? '';
  check('Gültige Anfrage: HTTP 200 erst nach Versand', res.status === 200 && json.ok === true);
  check('Mail an konfigurierten Empfänger', mails.at(-1)?.to.includes('empfang@test.invalid'));
  check('Reply-To ist die Kundenadresse', /Reply-To:.*erika@beispiel\.ch/i.test(mail));
  check('Mailinhalt vollständig', ['Naturpool', '8302 Kloten', 'In 6=E2=80=9312 Monaten|In 6–12 Monaten', 'Zweite Zeile'].every((s) => new RegExp(s).test(mail)));

  res = await postJson(B, { name: 'Erika Muster', email: 'erika@beispiel.ch' });
  json = await res.json();
  check('Ohne Konfiguration: ehrlich 503, kein Erfolg', res.status === 503 && json.code === 'not_configured');

  // Formularversand ohne JavaScript
  res = await fetch(`${A}/api/anfrage/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: 'Ohne JS', email: 'ohnejs@beispiel.ch' }),
    redirect: 'manual',
  });
  const cookie = res.headers.get('set-cookie') ?? '';
  check('Ohne JS: Weiterleitung zur Bestätigung', res.status === 303 && res.headers.get('location') === '/kontakt/danke/');
  let page = await fetch(`${A}/kontakt/danke/`, { headers: { cookie: cookie.split(';')[0] } }).then((r) => r.text());
  check('Bestätigung nur nach Annahme (mit Cookie)', page.includes('Ihre Anfrage ist bei uns eingegangen'));
  page = await fetch(`${A}/kontakt/danke/`).then((r) => r.text());
  check('Keine Bestätigung bei direktem Aufruf', !page.includes('Ihre Anfrage ist bei uns eingegangen'));

  res = await fetch(`${A}/api/anfrage/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: '', email: '' }),
    redirect: 'manual',
  });
  check('Ohne JS: Fehlerseite mit Hinweisen', res.status === 422 && (await res.text()).includes('Bitte geben Sie Ihren Namen an'));

  // --- Browser ---------------------------------------------------------------
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && consoleErrors.push(m.text()));

  await p.goto(`${A}/`, { waitUntil: 'domcontentloaded' });
  await p.click('.hero a[data-projekt="naturpool"]');
  check('Startseite: «Naturpool anfragen» wählt Naturpool vor', await p.isChecked('input[name="projekt"][value="naturpool"]'));

  await p.goto(`${A}/kontakt/?projekt=schwimmteich#anfrage`, { waitUntil: 'domcontentloaded' });
  check('URL-Parameter wählt Projektart vor', await p.isChecked('input[name="projekt"][value="schwimmteich"]'));

  await p.goto(`${A}/naturpools-schwimmteiche/`, { waitUntil: 'domcontentloaded' });
  check('Naturpool-Seite: Naturpool vorausgewählt', await p.isChecked('input[name="projekt"][value="naturpool"]'));

  // Leeres Absenden → Fehlerzusammenfassung mit Fokus
  await p.click('[data-submit]');
  const summaryFocused = await p.evaluate(() => document.activeElement?.matches('[data-error-summary]'));
  const summaryItems = await p.locator('[data-error-list] li').count();
  check('Fehlerzusammenfassung erhält Fokus', summaryFocused, `${summaryItems} Einträge`);
  check('Inline-Fehler am Feld', (await p.getAttribute('#anfrage-name', 'aria-invalid')) === 'true');

  // Link in der Zusammenfassung führt zum Feld
  await p.click('[data-error-list] li:first-child a');
  check('Fehlerlink fokussiert das Feld', await p.evaluate(() => document.activeElement?.id === 'anfrage-name'));

  await p.fill('#anfrage-name', 'Max Beispiel');
  await p.fill('#anfrage-email', 'max@beispiel');
  await p.click('[data-submit]');
  check('Ungültige E-Mail: Daten bleiben erhalten', (await p.inputValue('#anfrage-name')) === 'Max Beispiel');

  await p.fill('#anfrage-email', 'max@beispiel.ch');
  await p.fill('#anfrage-nachricht', 'Wasserfläche im Garten');
  await p.waitForTimeout(2600);
  const mailCount = mails.length;
  await p.click('[data-submit]');
  await p.waitForSelector('[data-success]', { timeout: 10000 });
  check('Erfolgsmeldung erst nach Server-Annahme', mails.length === mailCount + 1);
  check('Erfolgsmeldung erhält Fokus', await p.evaluate(() => document.activeElement?.matches('[data-success]')));

  // Ohne Mail-Konfiguration: kein «gesendet»
  await p.goto(`${B}/kontakt/`, { waitUntil: 'domcontentloaded' });
  await p.fill('#anfrage-name', 'Max Beispiel');
  await p.fill('#anfrage-email', 'max@beispiel.ch');
  await p.waitForTimeout(2600);
  await p.click('[data-submit]');
  await p.waitForFunction(() => document.querySelector('[data-status]')?.textContent?.includes('nicht verfügbar'));
  const statusText = await p.textContent('[data-status]');
  check('Ohne Konfiguration: ehrlicher Hinweis + E-Mail-Weg', /per E-Mail senden/.test(statusText) && !/Vielen Dank/.test(statusText));
  check('Ohne Konfiguration: Eingaben bleiben erhalten', (await p.inputValue('#anfrage-name')) === 'Max Beispiel');
  const inlineMailto = await p.getAttribute('[data-status] a[href^="mailto:"]', 'href');
  const decoded = decodeURIComponent(inlineMailto ?? '');
  check('mailto korrekt kodiert', inlineMailto?.startsWith('mailto:info@artenreich.ch?subject=') && decoded.includes('Name: Max Beispiel') && !inlineMailto.includes(' '));

  // mailto-Weg meldet nie «gesendet»
  await p.click('[data-mailto]', { noWaitAfter: true }).catch(() => {});
  const mailtoStatus = await p.textContent('[data-status]');
  check('mailto-Hinweis ohne «gesendet»', /erst versendet, wenn Sie die E-Mail dort absenden/.test(mailtoStatus));

  check('Keine Konsolenfehler', consoleErrors.length === 0, consoleErrors.join(' | '));
  await browser.close();
} catch (error) {
  check('Testlauf', false, error.stack);
} finally {
  configured.child.kill();
  unconfigured.child.kill();
  smtp.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden.`);
process.exit(failed.length ? 1 : 0);
