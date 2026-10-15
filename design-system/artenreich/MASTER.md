# Designsystem «Nature in Motion» – Master

Quelle der Wahrheit für Gestaltung und Bewegung. Umsetzung in `src/styles/global.css` (Tokens) und
den Komponenten. Grundlage: Auftrag ARTENREICH + Abfragen des Skills *UI/UX Pro Max*
(Muster «Scroll-Triggered Storytelling», Stil «Nature Distilled»; «Liquid Glass» bewusst verworfen).

## Haltung
Hochwertige Schweizer Gartengestaltung mit ökologischer Substanz. Echte Fotografie, grosszügiger
Weissraum, Asymmetrie, Editorial-Typografie. Keine Kartenraster, Pillen, Fake-Kennzahlen,
riesigen gerundeten Container oder Glas-Effekte.

## Farben
| Token | Wert | Verwendung |
|---|---|---|
| `--c-pine` | `#142B23` | Dunkle Kapitel, Buttons, Fokus auf Hell |
| `--c-offwhite` | `#F4F1E9` | Grundfläche, Text auf Pine |
| `--c-sage` | `#9DAF91` | Flächen, Akzente; **Text nur auf Pine** (6.4:1) |
| `--c-sage-ink` | `#4E6445` | Akzenttext auf Hell (5.8:1) |
| `--c-ink` | `#1F2421` | Charcoal, Fliesstext |
| `--c-muted` | `#4D5550` | Sekundärtext (6.8:1) |
| `--c-sand` / `--c-stone` | `#E9E3D6` / `#C9BFAD` | Steintöne, Footer, Jahreszeiten, Bildrahmen |
| `--c-error` | `#9B2C1F` | Formularfehler (6.7:1) |

Logo: unverändertes Original-PNG (Gold/Braun), nur auf hellem Grund.

## Typografie
- Serif: **Cormorant Garamond** 500/600, 500 kursiv (sparsam zur Betonung). Auf Bildern 600.
- Grotesk: **Inter** variabel.
- Display/H1: `clamp(46px → 136px)` (≈128 px bei 1440, ≈52 px bei 390). H2 40→88 px. H3 28→42 px.
- Fliesstext 17 px (mobil) → 19 px (Desktop), Zeilenhöhe 1.62.
- Kapitelnummern mit Versalziffern (`lining-nums`).
- Eyebrow: 13 px Versalien, Laufweite 0.16em, mit 28-px-Linie.

## Raster
12 Spalten. Aussenabstand mobil 20–22 px, Tablet 32 px, Desktop 64–80 px. Max. Inhaltsbreite 1440 px.
Kapitelabstand `clamp(88px, 11vw, 184px)`. Radius 2 px.

## Bewegung
| Element | Regel |
|---|---|
| Hero | Text einmalig ≤ 20 px/1 s gestaffelt; Bildannäherung 1.07 → 1 in 3.2 s; Detailbild mit Bogenmaske |
| Naturdetails | Parallax ≤ 40 px, nur ≥ 1024 px, nur sichtbare Elemente |
| Kapitel | Reveal 24 px / 0.9 s; nie dauerhaft unsichtbar |
| Jahreszeiten | Kreisförmige Maske ≈ 820 ms vom gewählten Tab aus, altes Bild bleibt darunter |
| Galerie | Hover/Fokus-Skalierung 1.025 |
| Wasser | Konzentrische Ringe, einmalige Welle < 5 s |
| Reduzierte Bewegung | Alles statisch sichtbar, kein Parallax, kein Smooth-Scroll |

Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.

## Komponentenregeln
- Buttons: 52 px hoch, eckig (2 px), Pfeil gleitet 4 px.
- Touch-Ziele ≥ 44 × 44 px. Fokus: 2 px Outline, 3 px Abstand, Farbe je Untergrund.
- Formular: sichtbare Labels, Pflicht/optional ausgeschrieben, Fehler am Feld + Zusammenfassung.
