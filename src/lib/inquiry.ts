/**
 * Anfrageformular: Felder, Optionen und Validierung.
 * Wird identisch im Browser (Inline-Validierung) und auf dem Server verwendet.
 */

export const projectTypes = [
  { value: 'naturpool', label: 'Naturpool' },
  { value: 'schwimmteich', label: 'Schwimmteich' },
  { value: 'naturgarten', label: 'Naturgarten' },
  { value: 'gestaltung', label: 'Gestaltung' },
  { value: 'verwirklichung', label: 'Verwirklichung' },
  { value: 'betreuung', label: 'Betreuung' },
  { value: 'offen', label: 'Noch offen' },
] as const;

export const timeframes = [
  { value: 'offen', label: 'Noch offen' },
  { value: 'bald', label: 'Möglichst bald' },
  { value: '6-12', label: 'In 6–12 Monaten' },
  { value: 'spaeter', label: 'Später' },
] as const;

export type ProjectType = (typeof projectTypes)[number]['value'];

export interface InquiryInput {
  name: string;
  email: string;
  projekt: string;
  region: string;
  zeitrahmen: string;
  telefon: string;
  nachricht: string;
}

export type InquiryField = keyof InquiryInput;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const limits = {
  name: 120,
  email: 254,
  region: 120,
  telefon: 40,
  nachricht: 5000,
} as const;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[+()\d\s./-]{6,40}$/;

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, max) : '';

/** Normalisiert Rohwerte (FormData oder JSON) auf sichere Zeichenketten. */
export function normalizeInquiry(raw: Record<string, unknown>): InquiryInput {
  return {
    name: clean(raw.name, limits.name),
    email: clean(raw.email, limits.email),
    projekt: clean(raw.projekt, 40),
    region: clean(raw.region, limits.region),
    zeitrahmen: clean(raw.zeitrahmen, 40),
    telefon: clean(raw.telefon, limits.telefon),
    nachricht: clean(raw.nachricht, limits.nachricht),
  };
}

export function validateInquiry(input: InquiryInput): InquiryErrors {
  const errors: InquiryErrors = {};

  if (!input.name) errors.name = 'Bitte geben Sie Ihren Namen an.';
  else if (input.name.length < 2) errors.name = 'Bitte geben Sie Ihren vollständigen Namen an.';

  if (!input.email) errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.';
  else if (!EMAIL_RE.test(input.email))
    errors.email = 'Bitte prüfen Sie die E-Mail-Adresse, zum Beispiel name@beispiel.ch.';

  if (input.projekt && !projectTypes.some((p) => p.value === input.projekt))
    errors.projekt = 'Bitte wählen Sie eine der angebotenen Projektarten.';

  if (input.zeitrahmen && !timeframes.some((t) => t.value === input.zeitrahmen))
    errors.zeitrahmen = 'Bitte wählen Sie einen der angebotenen Zeitrahmen.';

  if (input.telefon && !PHONE_RE.test(input.telefon))
    errors.telefon = 'Bitte prüfen Sie die Telefonnummer, zum Beispiel +41 44 123 45 67.';

  return errors;
}

export const labelFor = {
  projekt: (v: string) => projectTypes.find((p) => p.value === v)?.label ?? '',
  zeitrahmen: (v: string) => timeframes.find((t) => t.value === v)?.label ?? '',
};

/** Klartext der Anfrage – für E-Mail-Versand und den mailto-Weg. */
export function inquiryToText(input: InquiryInput): string {
  const rows: [string, string][] = [
    ['Name', input.name],
    ['E-Mail', input.email],
    ['Telefon', input.telefon],
    ['Projektart', labelFor.projekt(input.projekt)],
    ['Region (PLZ oder Ort)', input.region],
    ['Zeitrahmen', labelFor.zeitrahmen(input.zeitrahmen)],
  ];
  const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  if (input.nachricht) lines.push('', 'Nachricht:', input.nachricht);
  return lines.join('\n');
}

export function inquirySubject(input: InquiryInput): string {
  const type = labelFor.projekt(input.projekt);
  const name = input.name.replace(/[\r\n]+/g, ' ');
  return `Anfrage${type ? ` ${type}` : ''} – ${name}`;
}

/** Korrekt kodierter mailto-Link (RFC 6068: Leerzeichen als %20, Zeilenumbrüche als %0D%0A). */
export function buildMailto(to: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
}
