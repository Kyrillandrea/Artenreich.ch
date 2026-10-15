# Prüfbericht

Datum: 15. Oktober 2026 · Build: Astro 7.3.8, Node 22.22, Chromium (Playwright 1.56.1)

**Testbedingung, die alle Ergebnisse betrifft:** Die Entwicklungsumgebung kann `artenreich.ch` nicht
erreichen. Alle Originalbilder (inkl. Logo) wurden deshalb in den Tests **nicht geladen**; die
Bildrahmen zeigen ihre Hintergrundfarbe. Layout, Inhalte und Interaktionen sind davon unabhängig
geprüft; bildbezogene Werte (LCP mit Hero-Foto, Bildausschnitte, Logo-Lesbarkeit) stehen aus.

## 1. Tatsächlich implementiert

- Sieben Routen + Danke-Seite + 404 + Formular-Endpunkt, gemeinsame Komponenten (Header, Footer, Hero,
  Kapitel, Jahreszeiten, Galerie mit Grossansicht, Team, FAQ, Formular, CTA-Band, mobiler CTA).
- Startseite in der vorgegebenen Reihenfolge mit den exakten Hero-Texten und beiden CTAs.
- Alle Inhalte aus `src/data/` (getrennt vom Code): 4 Philosophie-Absätze, 3 Leistungen, 4 Jahreszeiten,
  14 Teamprofile (11 Biografien, 3 ohne), 18 Galerieaufnahmen, Naturpool-Texte und FAQ, Kontakte.
- Anfrageformular: nur Name + E-Mail Pflicht; Projektart, Region, Zeitrahmen, Telefon, Nachricht optional;
  Inline-Validierung, fokussierbare Fehlerzusammenfassung, serverseitige Validierung, Honeypot,
  Ausfüllzeit-Prüfung, Rate-Limit, SMTP-Versand über Umgebungsvariablen, ehrlicher E-Mail-Weg,
  Vorauswahl der Projektart über CTAs und URL-Parameter, Formularversand auch ohne JavaScript.
- Bewegung: einmalige Hero-Bewegung (≤ 20 px) und Bildannäherung, Desktop-Parallax ≤ 40 px nur für sichtbare
  Elemente, Reveals ohne dauerhaft unsichtbare Inhalte, organischer Jahreszeiten-Wechsel (≈ 820 ms),
  Wasser-Ringe (einmalig, < 5 s), Galerie-Hover 1.025 auch bei Tastaturfokus; `prefers-reduced-motion` vollständig.
- SEO: eigene Titel/Beschreibungen, Canonicals, JSON-LD (Organisation mit bestätigten Angaben, FAQ, Kontakt),
  Sitemap und `robots.txt` je nach `PUBLIC_INDEXING`; Vorschau `noindex`.
- Lokale Schriften (Cormorant Garamond 500/600/500 kursiv, Inter variabel; nur Latin/Latin-Ext).
- Asset-Pipeline für die 40 Originale (+ Bioterra) mit Signatur-, Format- und SHA-256-Prüfung; AVIF/WebP/JPEG
  mit `srcset`/`sizes`, Hero priorisiert, alles darunter lazy.
- Livegang-Gate `npm run prelaunch`.

## 2. Tatsächlich getestet

| Prüfung | Ergebnis |
|---|---|
| `astro check` (TypeScript, Templates) | 0 Fehler, 0 Warnungen |
| Produktionsbuild (Vorschau- und Livegang-Modus) | erfolgreich; Livegang-Modus erzeugt Sitemap und offene `robots.txt` |
| Inhaltsprüfung gegen den Build (`check:content`) | **257/257** – alle Originaltexte, 14 Namen/Porträts/Biografien, 18 Bilder, Kontakte, Links auf allen Seiten; keine Begriffe wie «chlorfrei», «wartungsfrei», «Garantie» |
| Formular E2E mit lokalem SMTP-Mock (`test:form`) | **27/27** – Validierung, Honeypot, Zeitprüfung, Versand mit Reply-To, 503 ohne Konfiguration, kein «gesendet» beim mailto-Weg, No-JS-Weg mit Bestätigung nur nach Annahme |
| Interaktion & Barrierefreiheit (`test:ui`) | **36/36** – Menü (Dialog, Escape, Fokusfalle, Fokus-Rückgabe), Jahreszeiten (Pfeiltasten, Pos1/Ende, kein Bildloch), Grossansicht (Enter, Pfeile, Escape, Fokus-Rückgabe), FAQ per Tastatur, reduzierte Bewegung, ohne JavaScript, Skip-Link, sichtbarer Fokus, 200 % Zoom ohne Überbreite, Touch-Ziele ≥ 44 px, mobiler CTA |
| Darstellung (`qa`) 8 Seiten × 1440/1024/768/390/320 px | 40 Ansichten ohne horizontale Überbreite, ohne abgeschnittene Texte, je genau eine H1, alle Bilder mit `alt`, keine Konsolenfehler (ausser den gesperrten Bild-Requests), alle internen Links HTTP 200 |
| Kontraste (WCAG) | Text ≥ 4.5:1 überall geprüft (z. B. Fliesstext 13.96, Muted 6.81, Sage auf Pine 6.41, Akzent auf Hell 5.76, Fehlertext 6.71); Eingaberahmen 3.83:1 |

### Performance (Labormessung, `npm run perf`, lokaler Server, **ohne Bilder**)

| Seite | LCP Desktop | LCP mobil gedrosselt¹ | CLS | Übertragung |
|---|---|---|---|---|
| `/` | 0.20 s | 1.30 s | 0.000 | 232 KB |
| `/naturgarten/` | 0.11 s | 1.06 s | 0.000 | 156 KB |
| `/naturpools-schwimmteiche/` | 0.14 s | 1.19 s | 0.000 | 150 KB |
| `/impressionen/` | 0.08 s | 0.96 s | 0.000 | 135 KB |
| `/team/` | 0.12 s | 0.98 s | 0.000 | 125 KB |
| `/kontakt/` | 0.11 s | 0.94 s | 0.000 | 135 KB |

¹ 390 px, CPU 4× gedrosselt, 1.6 Mbit/s, 150 ms RTT. Die Werte enthalten **keine Bilder**; mit lokalen
Originalbildern wird das Hero-Foto zum LCP-Element. Messung nach `npm run assets:fetch` wiederholen.
Ziel: LCP ≤ 2.5 s, CLS ≤ 0.1.

## 3. Nicht geprüft / extern blockiert

- Darstellung mit echten Fotos und Logo (Bildausschnitte, Lesbarkeit der Hero-Schrift auf dem Foto,
  Logo im Header) – Bilder nicht erreichbar.
- LCP mit Hero-Foto; Lighthouse-Gesamtbewertung.
- Realer SMTP-Versand an das Firmenpostfach (bewusst nicht ausgeführt; nur Mock).
- Abgleich mit Inhaltsänderungen nach dem 15.10.2026, Datenschutzerklärung, alte URLs.
- Safari/Firefox (nur Chromium verfügbar). Eingesetzte Plattformfunktionen (`<dialog>`, `:has()`,
  `details[name]`, `text-wrap`) werden von aktuellen Versionen unterstützt; ältere Browser erhalten
  funktionsfähige Rückfälle (z. B. alle FAQ einzeln aufklappbar).

Siehe [`OFFENE-PUNKTE.md`](OFFENE-PUNKTE.md).
