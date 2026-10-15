# Offene Punkte und Freigaben

Stand: 15. Oktober 2026. Getrennt nach **externen Blockern** (verhindern den Livegang),
**Bestätigungen durch Artenreich** und **Werkzeugen**.

## A. Externe Blocker für den Livegang

| # | Punkt | Ursache | Lösung |
|---|---|---|---|
| A1 | **40 Originalbilder + Bioterra-Label nicht lokal gesichert** | Netzwerk-Richtlinie der Entwicklungsumgebung sperrt `artenreich.ch` (auch serverseitiges Abrufen). | Domain in der Umgebung freigeben und `npm run assets:fetch` ausführen – oder das Materialpaket (`ARTENREICH-Nature-in-Motion-Paket.zip`) entpacken und `npm run assets:fetch -- --from-dir <Ordner>`. Danach Bildausschnitte visuell prüfen (Hero, Porträts mit `object-position: 50% 30%`). |
| A2 | **Datenschutzerklärung nicht übernommen** | Quelle `https://artenreich.ch/datenschutz/` nicht abrufbar. Es wurde bewusst kein Rechtstext erfunden. | Text unverändert in `src/content/datenschutz.md` einfügen, mit [`DATENSCHUTZ-ABGLEICH.md`](DATENSCHUTZ-ABGLEICH.md) abgleichen, freigeben lassen, `verified: true`. |
| A3 | **SMTP-Zugangsdaten fehlen** | Keine Konfiguration vorhanden. | Variablen laut `.env.example` auf dem Server setzen; Versand mit autorisiertem Testziel prüfen. Bis dahin bietet die Website ehrlich den E-Mail-Weg an. |
| A4 | **Inhaltsänderungen seit dem 15.10.2026 nicht prüfbar** | `artenreich.ch` und `werdeartenreich.ch` nicht erreichbar. | Vor dem Livegang Texte, Team und Kontaktangaben mit der Live-Seite abgleichen (`npm run check:content` prüft die Übernahme aus `src/data/`). |
| A5 | **Hosting / Domain** | Nicht beauftragt. Die produktive Domain wurde nicht verändert. Die Vorschau läuft auf GitHub Pages (Demo-Modus, noindex). | Node-Host festlegen (oder statischer Host mit E-Mail-Fallback). `PUBLIC_INDEXING=true` erst beim Livegang. |

## B. Bestätigungen durch Artenreich

| # | Punkt |
|---|---|
| B1 | **Nathalie Lienert:** Bilddatei heisst «Nathalie-Lienhard.jpg». Angezeigt wird der sichtbare Name «Nathalie Lienert». Schreibweise bestätigen. |
| B2 | **Jana Schwilch:** Dateiname enthält «Jana-Schilch». Angezeigt wird «Jana Schwilch» (sichtbarer Name der Website). |
| B3 | **Rahel:** Originaltext «Es bereitet **mit** Freude …» wurde redaktionell zu «… **mir** Freude …» korrigiert. Original archiviert in `src/data/team.ts` (`bioOriginal`). Korrektur bestätigen. Kein bestätigter Nachname. |
| B4 | **Sergio Sebastianutti, Barbara Sommer, Asia Graziano:** keine Biografie in der Quelle – es wird nur Name und Porträt gezeigt. Biografien bei Bedarf liefern. |
| B5 | **Naturpools / Schwimmteiche:** Keine Systeminformationen, Preise, Pflegeintervalle oder Garantien bestätigt – Texte bleiben Planungs- und Gesprächsfragen. Für verbindliche Aussagen fachliche Bestätigung liefern. |
| B5a | **Gelieferte Poolbilder (5 Stück, 15.10.2026):** werden im Hero, im Wasser-Kapitel und bei den Planungsfragen verwendet – bewusst **ohne** Bildunterschrift als Artenreich-Referenz. Vor dem Livegang klären: Herkunft und Nutzungsrechte aller fünf Bilder; ob es eigene Anlagen sind (dann als Referenz beschriften und in `poolMedia` eintragen); `pool-02` wirkt wie eine Visualisierung; `pool-04` zeigt erkennbare Personen (Einwilligung). Auflösung 1320 px – für Vollbild auf grossen Monitoren höher aufgelöste Originale nachliefern. |
| B6 | **Hero-Film:** Originalvideo (Teichwasser → Wasserpflanzen → Steintextur → Schwimmteich) fehlt. Struktur ist vorbereitet: `src/data/content.ts` → `hero.video` (Poster, Quellen; stummes Abspielen nur ohne reduzierte Bewegung/Datensparmodus, mit Pause-Schaltfläche). |
| B7 | **Servicegebiete:** Kloten ist als Firmensitz belegt. Bediente Regionen (Suchfokus Zürich) sind nicht bestätigt und werden nicht behauptet. Nach Bestätigung ergänzen (Texte und `areaServed` in den strukturierten Daten). |
| B8 | **Bioterra-Label:** Wie auf der bestehenden Website im Footer eingebunden (nicht als Auszeichnung bezeichnet). Aktuelle Zugehörigkeit und Darstellung bestätigen. |
| B9 | **Favicon:** Keines vorhanden. Aus der Originalmarke ableiten lassen (keine eigene Nachzeichnung). |
| B10 | **Alte URLs / Anker:** Die Struktur der bestehenden Website konnte nicht abgerufen werden. Startseite enthält die Anker `#philosophie`, `#naturpools`, `#leistungen`, `#gestaltung`, `#verwirklichung`, `#betreuung`, `#jahreszeiten`, `#impressionen`, `#team`, `#anfrage`. Weitere alte URLs vor dem Livegang erfassen und als Weiterleitungen einrichten. |
| B11 | **Logo-Darstellung:** Das Logo wird unverändert (Original-PNG, Höhe 40–56 px) auf hellem Grund gezeigt. Nach dem lokalen Sichern die Lesbarkeit im Header prüfen. |

## C. Werkzeuge und Plugins

| Werkzeug | Status |
|---|---|
| **UI/UX Pro Max (Skill)** | Installiert unter `.claude/skills/ui-ux-pro-max/` und genutzt: Designsystem-Abfrage, Stil-, Typografie-, UX- und Astro-Abfragen. Der vorgeschlagene Stil «Liquid Glass» wurde verworfen (widerspricht dem Auftrag: keine Glas-Effekte); übernommen wurden «Nature Distilled», fokussierbare Fehlerzusammenfassung, `scroll-padding` gegen verdeckten Fokus, `astro:assets` mit `<picture>`. |
| **21st / Magic MCP** | In `.mcp.json` eingetragen (`https://21st.dev/api/mcp`, Schlüssel über `API_KEY_21ST`). **Nicht nutzbar:** Verbindung scheitert (Proxy 403 – `21st.dev` von der Netzwerk-Richtlinie gesperrt) und kein API-Schlüssel vorhanden. Laut Projekt-README wurden alte Magic-Schlüssel zurückgesetzt; neuer Schlüssel unter https://21st.dev/mcp. Nach dem Setzen muss der Server in Claude Code einmal freigegeben werden. |
| **Superdesign** | Nicht verfügbar (kein Skill/CLI in der Umgebung, `superdesign.dev` gesperrt). Der bestehende Entwurf konnte nicht geprüft werden und wurde nicht verwendet. |
| **Magnific, Tripo 3D** | Nicht verfügbar und für diese Website nicht erforderlich (keine generativen Bildänderungen, kein 3D). |
| **Playwright / Chromium** | Verwendet für Screenshots, Interaktions-, Barrierefreiheits-, Formular- und Performance-Prüfungen. |
