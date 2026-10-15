# Originalbilder

Dieser Ordner enthält ausschliesslich unveränderte Originaldateien der bestehenden Website
artenreich.ch – nach verifiziertem Download bzw. Übernahme aus dem Materialpaket:

```bash
npm run assets:fetch                        # Download von artenreich.ch
npm run assets:fetch -- --from-dir <Pfad>   # aus dem entpackten Materialpaket
```

`SOURCES.json` dokumentiert für jede Datei Quelle, SHA-256, Grösse und Abmessungen.
Optimierte Varianten (AVIF/WebP/JPEG in mehreren Breiten) erzeugt der Build separat.
Keine generierten, nachbearbeiteten oder fremden Bilder hier ablegen.
