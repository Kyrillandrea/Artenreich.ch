# ARTENREICH – Nature in Motion

Neue Unternehmenswebsite der **ARTENREICH BOLINGER GÄRTEN AG** (Kloten).
Statisch vorgerenderte Seiten mit Astro, ein serverseitiger Endpunkt für das Anfrageformular.

> **Vorschau-Status:** Die Website ist vollständig implementiert und geprüft. Für den Livegang
> fehlen extern noch: lokale Originalbilder, die übernommene Datenschutzerklärung und die
> SMTP-Zugangsdaten. Details: [`docs/OFFENE-PUNKTE.md`](docs/OFFENE-PUNKTE.md).
> Die Vorschau ist bis zur Freigabe auf `noindex` gestellt.

## Vorschau im Web (Demo)

Die Demo wird bei jedem Push auf `claude/artenreich-website` automatisch gebaut und auf GitHub Pages
veröffentlicht: **https://kyrillandrea.github.io/Artenreich.ch/**
(Workflow: [`.github/workflows/demo-pages.yml`](.github/workflows/demo-pages.yml)).

- Demo-Modus: dezenter Hinweis «Vorschau», `noindex` + gesperrte `robots.txt`, das Formular versendet
  nichts und sagt das ehrlich (E-Mail-/Telefon-Weg bleibt nutzbar).
- Der Workflow sichert vor dem Build die Originalbilder von artenreich.ch (`npm run assets:fetch`);
  gelingt das nicht, lädt die Demo fehlende Bilder direkt von artenreich.ch.
- Einmalig nötig: GitHub → Repository → **Settings → Pages → Build and deployment → Source: «GitHub Actions»**.

Als **einzelne HTML-Datei** (Startseite mit allen Effekten, per Doppelklick offline vorführbar):

```bash
npm run demo:file   # → dist/artenreich-demo.html
```

Lokal genau wie auf GitHub Pages testen:

```bash
npm run demo:build && npm run demo:serve   # http://127.0.0.1:4400/Artenreich.ch/
```

## Bewegung: die fünf Effekte

| Technik | Wo | Umsetzung |
|---|---|---|
| 01 Layered Parallax | Hero Startseite und Naturpools | Tiefenebenen (Foto, Dunst, Text, Bildfenster) mit eigener Scroll-Geschwindigkeit + Maus-Tiefe (`Hero.astro`, `scripts/layered-hero.ts`) |
| 02 Scroll Text Reveal | «Ein Garten. Unzählige Lebensräume.» | Buchstaben erblühen beim Scrollen, fallende Blätter (`BloomHeading.astro`) |
| 03 Scroll-driven Rotation | Jahreszeiten (Startseite, Naturgarten) | «Jahresrad» dreht sich beim Scrollen, Bühne bleibt stehen (`Seasons.astro`, `scripts/seasons.ts`) |
| 04 Cursor Tracking | Naturpool-Kapitel Startseite | «Wasser-Auge»: Ringe, Bild und Lichtreflex folgen dem Cursor, Wellen bei Bewegung/Tippen (`WaterEye.astro`) |
| 05 Stacking Cards | Leistungen, Planungsfragen | Karten stapeln sich versetzt, untere treten zurück – ohne Abdunkeln (`StackCards.astro`) |

Alle Effekte laufen über eine gemeinsame Scroll-Engine (`scripts/motion.ts`, ein `requestAnimationFrame`,
nur sichtbare Elemente). Bei `prefers-reduced-motion`, ohne JavaScript und auf kleinen Bildschirmen
gibt es ruhige, vollständig lesbare Varianten (z. B. Jahreszeiten als Tabs bzw. Kapitel).

## Schnellstart

Voraussetzung: Node.js ≥ 22.12

```bash
npm install
npm run dev            # Entwicklung: http://localhost:4321
```

Produktionsbuild und lokale Vorschau:

```bash
npm run build
npm run preview        # Node-Server (dist/server/entry.mjs) auf http://localhost:4321
```

## Seiten

| Route | Inhalt |
|---|---|
| `/` | Hero, Haltung, Naturpool-Schwerpunkt, Leistungen, Jahreszeiten, Impressionen, Team, Anfrage |
| `/naturgarten/` | Vollständige Philosophie (4 Absätze), Gestaltung · Verwirklichung · Betreuung, Jahreszeiten |
| `/naturpools-schwimmteiche/` | Einführung, Planungsfragen, Pflege, FAQ, Anfrage mit vorgewählter Projektart |
| `/impressionen/` | Alle 18 Galerieaufnahmen mit zugänglicher Grossansicht |
| `/team/` | Alle 14 Profile, vorhandene Biografien, Recruiting-Link |
| `/kontakt/` | Büro, Werkhof separat, Telefon, E-Mail, Karte, Anfrageformular |
| `/datenschutz/` | Datenschutz (Übernahme des bestehenden Texts ausstehend, siehe unten) |
| `/kontakt/danke/` | Bestätigung nach Formularversand ohne JavaScript (serverseitig, noindex) |
| `/api/anfrage/` | POST-Endpunkt des Anfrageformulars |

## Konfiguration

Alle Einstellungen über Umgebungsvariablen – Vorlage: [`.env.example`](.env.example).

| Variable | Zweck |
|---|---|
| `PUBLIC_INDEXING` | `true` nur für den freigegebenen Livegang (Build-Zeit): `index, follow`, Sitemap, offene `robots.txt` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | SMTP-Versand der Anfragen (Laufzeit, nur Server) |
| `MAIL_FROM` | Absenderadresse, die der SMTP-Server versenden darf |
| `MAIL_TO` | Empfänger der Anfragen (erst nach Freigabe eintragen) |
| `FORM_RATE_LIMIT` | Gültige Anfragen pro IP und 10 Minuten (Standard 5) |
| `TRUST_PROXY` | `true` hinter einem Reverse-Proxy (wertet `X-Forwarded-For` aus) |
| `HOST`, `PORT` | Adresse des Node-Servers |
| `BASE_PATH`, `SITE_URL` | Basispfad und Domain (Build-Zeit), z. B. `/Artenreich.ch/` für GitHub Pages |
| `PUBLIC_DEMO` | `true` für die Vorschau: Hinweis «Vorschau», Formular versendet nichts |

Ohne SMTP-Konfiguration nimmt der Server keine Anfragen an (HTTP 503). Die Website meldet
dann ehrlich, dass der Formularversand nicht verfügbar ist, behält alle Eingaben und bietet
**«Anfrage per E-Mail»** (korrekt kodierter `mailto:`-Link) sowie die Telefonnummer an.
Eine Erfolgsmeldung erscheint ausschliesslich, nachdem der SMTP-Server die Nachricht angenommen hat.

## Originalbilder

```bash
npm run assets:fetch                          # von artenreich.ch herunterladen und prüfen
npm run assets:fetch -- --from-dir <Ordner>   # aus dem entpackten Materialpaket übernehmen
```

Die Originale landen unverändert in `src/assets/originals/` (mit SHA-256, Grösse und Abmessungen in
`SOURCES.json`). Der Build erzeugt daraus AVIF/WebP/JPEG in mehreren Breiten mit `srcset`/`sizes`.
Solange Originale fehlen, nutzt die Vorschau die Original-URLs – der Livegang-Check blockiert das.

## Prüfungen

| Befehl | Prüft |
|---|---|
| `npm run check` | TypeScript und Astro-Templates |
| `npm run check:content` | Alle Originalinhalte im Build (Texte, 14 Profile, 18 Bilder, Kontakte, Links) |
| `npm run test:form` | Formular Ende-zu-Ende mit lokalem SMTP-Mock (kein Versand an echte Adressen) |
| `npm run test:ui` | Menü, Jahreszeiten, Galerie, FAQ, Tastatur, Fokus, reduzierte Bewegung, ohne JS, Zoom, Touch-Ziele |
| `npm run qa` | Screenshots 1440/1024/768/390/320, Überbreite, H1, Alt-Texte, Konsole, interne Links |
| `npm run perf` | LCP, CLS und Übertragungsgrösse (Desktop und gedrosselt mobil) |
| `npm run prelaunch` | Livegang-Gate: lokale Originale, Datenschutz, Indexierung, keine Hotlinks, Inhalte |

`test:form` startet eigene Server-Instanzen; `test:ui`, `qa` und `perf` erwarten einen laufenden
Server (`npm run preview`, alternativ `QA_BASE=<URL>`).

## Livegang

1. `npm run assets:fetch` (oder `--from-dir` mit dem Materialpaket) und Bildausschnitte visuell prüfen.
2. Bestehende Datenschutzerklärung in `src/content/datenschutz.md` übernehmen, abgleichen
   ([`docs/DATENSCHUTZ-ABGLEICH.md`](docs/DATENSCHUTZ-ABGLEICH.md)), freigeben lassen, `verified: true`.
3. SMTP-Variablen auf dem Server setzen und mit einem autorisierten Testziel prüfen.
4. `PUBLIC_INDEXING=true npm run build && npm run prelaunch` – muss ohne Blocker durchlaufen.
5. Deployment des Ordners `dist/` auf einen Node-Host (`node dist/server/entry.mjs`).
   Ein rein statischer Host genügt für alle Seiten; das Formular fällt dort automatisch auf den E-Mail-Weg zurück.

## Struktur

```
src/
  data/          Inhalte getrennt vom Code (Firma, Medien, Texte, Team, Naturpools)
  components/    Header, Footer, Hero, Kapitel, Jahreszeiten, Galerie, Team, FAQ, Formular, CTAs
  layouts/       BaseLayout (Meta, SEO, strukturierte Daten, Skip-Link)
  pages/         Routen + api/anfrage.ts
  scripts/       Kleine Client-Module (Reveal, Parallax, Jahreszeiten, Grossansicht, Formular, CTA)
  lib/           Formular-Validierung (Client + Server), Mailer, Medienauflösung
  styles/        Design-Tokens und Basisstile
public/fonts/    Cormorant Garamond + Inter (lokal, SIL Open Font License)
scripts/         Asset-Download, Prüf- und Testskripte
docs/            Prüfbericht, offene Punkte, Quellen, Datenschutz-Abgleich
design-system/   Designsystem (Master)
```
