import type { APIRoute } from 'astro';
import { normalizeInquiry, validateInquiry, type InquiryErrors } from '../../lib/inquiry';
import { readMailConfig, sendInquiry } from '../../lib/mailer';
import { company } from '../../data/site';
import { url as withBase } from '../../lib/url';

/** Serverseitig gerendert – alle übrigen Seiten bleiben statisch. */
export const prerender = false;

const WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 2500;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const limit = Number(process.env.FORM_RATE_LIMIT || 5);
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return recent.length > limit;
}

type Outcome =
  | { status: 200; body: { ok: true } }
  | { status: 422; body: { ok: false; code: 'invalid' | 'too_fast'; errors?: InquiryErrors; message?: string } }
  | { status: 429 | 503 | 502 | 400 | 415; body: { ok: false; code: string; message: string } };

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) return (await request.json()) as Record<string, unknown>;
    if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
      return Object.fromEntries((await request.formData()).entries());
    }
  } catch {
    return null;
  }
  return null;
}

async function handle(request: Request, ip: string): Promise<Outcome> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 20_000) return { status: 400, body: { ok: false, code: 'too_large', message: 'Die Anfrage ist zu umfangreich.' } };

  const raw = await readBody(request);
  if (!raw) return { status: 415, body: { ok: false, code: 'unsupported', message: 'Ungültiges Anfrageformat.' } };

  // Honeypot: nur automatisierte Absender füllen dieses unsichtbare Feld. Kein Versand.
  if (typeof raw.hp_feld === 'string' && raw.hp_feld.trim() !== '') return { status: 200, body: { ok: true } };

  const elapsed = Number(raw.t);
  if (raw.t !== undefined && raw.t !== '' && Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
    return {
      status: 422,
      body: { ok: false, code: 'too_fast', message: 'Das ging sehr schnell. Bitte prüfen Sie Ihre Angaben und senden Sie die Anfrage erneut.' },
    };
  }

  const input = normalizeInquiry(raw);
  const errors = validateInquiry(input);
  if (Object.keys(errors).length) return { status: 422, body: { ok: false, code: 'invalid', errors } };

  // Erst gültige Anfragen zählen – Korrekturen nach Fehlern sollen niemanden aussperren.
  if (rateLimited(ip)) {
    return {
      status: 429,
      body: { ok: false, code: 'rate_limited', message: 'Es wurden in kurzer Zeit viele Anfragen gesendet. Bitte versuchen Sie es in einigen Minuten erneut.' },
    };
  }

  const config = readMailConfig();
  if (!config) {
    return {
      status: 503,
      body: { ok: false, code: 'not_configured', message: 'Der Versand über das Formular ist derzeit nicht verfügbar.' },
    };
  }

  try {
    await sendInquiry(config, input);
  } catch (error) {
    console.error('[anfrage] Versand fehlgeschlagen:', (error as Error).message);
    return {
      status: 502,
      body: { ok: false, code: 'send_failed', message: 'Ihre Anfrage konnte gerade nicht übermittelt werden.' },
    };
  }
  return { status: 200, body: { ok: true } };
}

function htmlPage(title: string, body: string, status: number): Response {
  const html = `<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Artenreich</title><style>body{font:18px/1.6 system-ui,sans-serif;background:#f4f1e9;color:#1f2421;margin:0;padding:48px 22px}main{max-width:40rem;margin:auto}h1{font-family:Georgia,serif;font-weight:500;font-size:2.25rem;line-height:1.1}a{color:#142b23}</style></head><body><main>${body}</main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export const POST: APIRoute = async ({ request, clientAddress, redirect, cookies, url }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  let ip = 'unknown';
  try {
    ip = clientAddress;
  } catch {
    /* clientAddress ist nicht in jeder Umgebung verfügbar */
  }
  // Hinter einem Reverse-Proxy (nginx, Load Balancer) die echte Besucher-IP verwenden
  if (process.env.TRUST_PROXY === 'true') {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) ip = forwarded;
  }

  const outcome = await handle(request, ip);

  if (wantsJson) {
    return new Response(JSON.stringify(outcome.body), {
      status: outcome.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  // Formularversand ohne JavaScript
  if (outcome.status === 200) {
    cookies.set('anfrage_ok', '1', {
      path: withBase('/kontakt/danke/'),
      maxAge: 120,
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
    });
    return redirect(withBase('/kontakt/danke/'), 303);
  }
  const contact = `<p>Sie erreichen uns auch direkt: <a href="${company.phone.href}">${company.phone.display}</a> · <a href="${company.email.href}">${company.email.display}</a></p>`;
  if (outcome.status === 422 && outcome.body.errors) {
    const items = Object.values(outcome.body.errors).map((e) => `<li>${escape(e ?? '')}</li>`).join('');
    return htmlPage(
      'Bitte Angaben prüfen',
      `<h1>Bitte prüfen Sie Ihre Angaben</h1><ul>${items}</ul><p>Mit der Zurück-Funktion Ihres Browsers gelangen Sie zum Formular; Ihre Eingaben bleiben in der Regel erhalten.</p>${contact}`,
      422,
    );
  }
  const message = 'message' in outcome.body && outcome.body.message ? outcome.body.message : 'Die Anfrage konnte nicht verarbeitet werden.';
  return htmlPage(
    'Anfrage nicht übermittelt',
    `<h1>Ihre Anfrage wurde nicht übermittelt</h1><p>${escape(message)}</p>${contact}<p><a href="${withBase('/kontakt/')}">Zurück zur Kontaktseite</a></p>`,
    outcome.status,
  );
};

export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, code: 'method_not_allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'POST' },
  });
