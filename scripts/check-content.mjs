#!/usr/bin/env node
/**
 * Inhaltsprüfung gegen den Build (dist/client): Sind alle Originalinhalte tatsächlich
 * auf den passenden Seiten sichtbar? Prüft Texte, Profile, Bilder, Kontakte und Links.
 *
 *   npm run build && npm run check:content
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { company, links } from '../src/data/site.ts';
import { hero, philosophy, services, seasons, gallery } from '../src/data/content.ts';
import { team } from '../src/data/team.ts';
import { media } from '../src/data/media.ts';
import { poolIntro, planningQuestions, poolFaq } from '../src/data/pool.ts';

const dist = resolve(import.meta.dirname, '../dist/client');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('Kein Build gefunden. Zuerst `npm run build` ausführen.');
  process.exit(1);
}

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const pages = {};
const html = (route) => {
  if (!pages[route]) {
    const file = route === '/' ? 'index.html' : join(route, 'index.html');
    pages[route] = decode(readFileSync(join(dist, file), 'utf8'));
  }
  return pages[route];
};
// Sichtbarer Text ohne Skripte/JSON-LD und ohne Attributwerte
const visible = (route) =>
  html(route)
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const results = [];
const expect = (label, ok) => {
  results.push({ label, ok });
  if (!ok) console.log(`✗ ${label}`);
};
const has = (route, text, label = text.slice(0, 60)) => expect(`${route}: ${label}`, visible(route).includes(text.replace(/\s+/g, ' ')));
const hasAttr = (route, needle, label) => expect(`${route}: ${label}`, html(route).includes(needle));

// Hero
has('/', hero.title[0]);
has('/', hero.title[1]);
has('/', hero.subtitle);
has('/', hero.primary.label);
has('/', hero.secondary.label);

// Startseiten-Kapitel in Reihenfolge
const order = [
  'Natur erleben.',
  'Ein Garten.',
  'Wasser erleben.',
  'Von der Idee zum lebendigen Garten.',
  'Vier',
  'Gärten, die leben.',
  'Mit der Natur verbunden.',
  'Was darf bei Ihnen wachsen?',
];
const home = visible('/');
const positions = order.map((t) => home.indexOf(t));
expect('Startseite: Kapitel vollständig und in Reihenfolge', positions.every((p, i) => p >= 0 && (i === 0 || p > positions[i - 1])));

// Philosophie vollständig auf /naturgarten/
philosophy.forEach((p, i) => has('/naturgarten/', p, `Philosophie Absatz ${i + 1}`));

// Leistungen
for (const s of services) {
  for (const route of ['/', '/naturgarten/']) {
    has(route, s.title, `Leistung ${s.title}`);
    has(route, s.text, `Leistungstext ${s.title}`);
    hasAttr(route, media[s.image].src.split('/').pop(), `Leistungsbild ${s.title}`);
  }
}

// Jahreszeiten
for (const season of seasons) {
  for (const route of ['/', '/naturgarten/']) {
    has(route, season.title, `Jahreszeit ${season.title}`);
    season.lines.forEach((l) => has(route, l, `${season.title}: ${l}`));
    hasAttr(route, media[season.image].src.split('/').pop(), `Bild ${season.title}`);
  }
}

// Team
expect('Team: 14 Profile in den Daten', team.length === 14);
for (const m of team) {
  has('/team/', m.name, `Name ${m.name}`);
  hasAttr('/team/', media[m.portrait].src.split('/').pop(), `Porträt ${m.name}`);
  if (m.bio) has('/team/', m.bio, `Biografie ${m.name}`);
  has('/', m.name, `Startseite Team ${m.name}`);
}
hasAttr('/team/', links.recruiting.href, 'Recruiting-Link');
hasAttr('/', links.recruiting.href, 'Recruiting-Link Startseite');

// Galerie
expect('Galerie: 18 Aufnahmen in den Daten', gallery.length === 18);
for (const id of gallery) {
  has('/impressionen/', media[id].alt, `Galerie ${id}`);
  hasAttr('/impressionen/', `id="${id}"`, `Anker ${id}`);
}

// Naturpools
has('/naturpools-schwimmteiche/', poolIntro, 'Einführungstext');
has('/naturpools-schwimmteiche/', 'Mein Vorhaben besprechen', 'CTA');
planningQuestions.forEach((q) => has('/naturpools-schwimmteiche/', q.text, `Planung: ${q.title}`));
poolFaq.forEach((f) => {
  has('/naturpools-schwimmteiche/', f.q, `FAQ: ${f.q}`);
  has('/naturpools-schwimmteiche/', f.a, `FAQ-Antwort: ${f.q}`);
});
for (const banned of ['chlorfrei', 'wartungsfrei', 'garantiert klares', 'Garantie']) {
  for (const route of ['/', '/naturpools-schwimmteiche/']) {
    expect(`${route}: keine unbelegte Aussage «${banned}»`, !visible(route).toLowerCase().includes(banned.toLowerCase()));
  }
}

// Kontaktangaben (Footer auf jeder Seite)
for (const route of ['/', '/naturgarten/', '/naturpools-schwimmteiche/', '/impressionen/', '/team/', '/kontakt/', '/datenschutz/']) {
  has(route, company.legalName, 'Firmenname');
  has(route, company.office.street, 'Büroadresse');
  has(route, company.depot.street, 'Werkhofadresse');
  has(route, company.phone.display, 'Telefon');
  has(route, company.email.display, 'E-Mail');
  hasAttr(route, `href="${company.phone.href}"`, 'tel-Link');
  hasAttr(route, `href="${company.email.href}"`, 'mailto-Link');
  hasAttr(route, 'href="/datenschutz/"', 'Datenschutz-Link');
  hasAttr(route, links.recruiting.href, 'Recruiting im Footer');
  hasAttr(route, 'logo.png', 'Original-Logo');
}
has('/kontakt/', company.depot.label, 'Werkhof separat');
has('/kontakt/', company.contactPerson, 'Ansprechperson');

const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} Inhaltsprüfungen bestanden.`);
process.exit(failed.length ? 1 : 0);
