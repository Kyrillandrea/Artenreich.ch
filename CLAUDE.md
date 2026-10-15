# Projektanweisungen – ARTENREICH Website

- Stack: Astro 7 (statisch) + Node-Adapter nur für `src/pages/api/anfrage.ts` und `/kontakt/danke/`.
- Inhalte nur in `src/data/` pflegen. **Keine Angaben erfinden**: keine Referenzprojekte, Preise,
  Garantien, Pool-Systeme, Servicegebiete, Bewertungen, Berufsbezeichnungen oder Biografien.
  Galerie-Beschreibungen sind Motivbeschreibungen, keine Projektnamen.
- Brunnen (Galerie 08) und Wasserbecken (Galerie 09) nie als Naturpool-/Schwimmteich-Referenz ausgeben.
- Originalbilder nur unverändert in `src/assets/originals/` (via `npm run assets:fetch`); keine generierten Bilder.
- Datenschutztext nur aus der bestehenden Erklärung übernehmen (`src/content/datenschutz.md`).
- Erfolgsmeldungen des Formulars nur nach tatsächlicher Server-Annahme.
- Designregeln: `design-system/artenreich/MASTER.md`. UI-Skill: `.claude/skills/ui-ux-pro-max/`.
- Vor Übergabe: `npm run check`, `npm run build`, `npm run check:content`, `npm run test:form`,
  dann mit laufendem `npm run preview`: `npm run test:ui` und `npm run qa`.
- Offene Punkte: `docs/OFFENE-PUNKTE.md`.
