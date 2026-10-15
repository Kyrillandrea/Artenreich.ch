# Projektanweisungen – ARTENREICH Website

- Stack: Astro 7 (statisch) + Node-Adapter nur für `src/pages/api/anfrage.ts` und `/kontakt/danke/`.
- Inhalte nur in `src/data/` pflegen. **Keine Angaben erfinden**: keine Referenzprojekte, Preise,
  Garantien, Pool-Systeme, Servicegebiete, Bewertungen, Berufsbezeichnungen oder Biografien.
  Galerie-Beschreibungen sind Motivbeschreibungen, keine Projektnamen.
- Brunnen (Galerie 08) und Wasserbecken (Galerie 09) nie als Naturpool-/Schwimmteich-Referenz ausgeben.
- Originalbilder nur unverändert in `src/assets/originals/` (via `npm run assets:fetch`); keine generierten Bilder.
- Gelieferte Poolbilder liegen unverändert in `src/assets/pool/` – nie als Artenreich-Referenz beschriften,
  solange Herkunft/Rechte nicht bestätigt sind (siehe `docs/OFFENE-PUNKTE.md`, B5a).
- Interne Links immer über `url()` aus `src/lib/url.ts` (Basispfad für die Vorschau auf GitHub Pages).
- Bewegung: fünf Effekte über `src/scripts/motion.ts`; immer mit Variante für reduzierte Bewegung/ohne JS.
- Datenschutztext nur aus der bestehenden Erklärung übernehmen (`src/content/datenschutz.md`).
- Erfolgsmeldungen des Formulars nur nach tatsächlicher Server-Annahme.
- Designregeln: `design-system/artenreich/MASTER.md`. UI-Skill: `.claude/skills/ui-ux-pro-max/`.
- Vor Übergabe: `npm run check`, `npm run build`, `npm run check:content`, `npm run test:form`,
  dann mit laufendem `npm run preview`: `npm run test:ui` und `npm run qa`.
  Demo: `npm run demo:build && npm run demo:serve`, dann `QA_BASE=http://127.0.0.1:4400/Artenreich.ch npm run test:ui`.
- Offene Punkte: `docs/OFFENE-PUNKTE.md`.
