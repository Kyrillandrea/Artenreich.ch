# Datenschutz – Abgleich mit der technischen Umsetzung

Dieses Dokument ist **kein Rechtstext**. Es beschreibt sachlich, welche Daten die neue Website
technisch verarbeitet, damit die bestehende Datenschutzerklärung (https://artenreich.ch/datenschutz/)
übernommen und bei Bedarf angepasst werden kann. Die Formulierung und Freigabe liegt bei
Artenreich bzw. deren Rechtsberatung.

Status: Der bestehende Text konnte in der Entwicklungsumgebung nicht abgerufen werden
(Netzwerk-Richtlinie). Er ist daher noch **nicht** übernommen; die Seite `/datenschutz/` verweist
bis dahin auf die bestehende Erklärung und nennt die Kontaktadresse.

## Was die neue Website verarbeitet

| Bereich | Umsetzung | Daten |
|---|---|---|
| Hosting / Server | Node-Server (Astro), Anbieter noch offen | Übliche Server-Logdaten je nach Hoster (IP, Zeitpunkt, URL, User-Agent) |
| Anfrageformular | POST an `/api/anfrage/`, Versand per SMTP an `MAIL_TO` | Name, E-Mail (Pflicht); optional Projektart, Region, Zeitrahmen, Telefon, Nachricht |
| Spam-Schutz | Unsichtbares Feld (Honeypot), Ausfüllzeit, Rate-Limit | IP-Adresse wird **nur im Arbeitsspeicher** des Servers für max. 10 Minuten gehalten, nicht gespeichert |
| Bestätigung ohne JavaScript | Cookie `anfrage_ok` | Technisch notwendig, HttpOnly, Pfad `/kontakt/danke/`, Gültigkeit 120 Sekunden, wird beim Anzeigen gelöscht |
| Schriften | Lokal ausgeliefert (gebündelt unter `/_astro/`) | Keine Verbindung zu Google Fonts oder anderen Schriftdiensten |
| Analyse / Tracking | **Keines** eingebaut | – |
| Karten | Nur Link zu Google Maps (`g.page`), keine Einbettung | Daten fliessen erst beim Klick auf den Link an Google |
| Social Media | Nur Links zu Instagram und Facebook, keine Plugins/Einbettungen | Erst beim Klick |
| Bioterra-Label | Bild + Link zu bioterra.ch | Erst beim Klick |
| Recruiting | Link zu werdeartenreich.ch | Erst beim Klick |
| E-Mail-Weg | `mailto:`-Link öffnet das eigene E-Mail-Programm | Versand über das E-Mail-Konto der Besucherin/des Besuchers |
| Vorschau auf GitHub Pages | Demo-Hosting bei GitHub (USA); Formular versendet dort nichts | Server-Logdaten bei GitHub; nur für die Vorschau |
| Bilder (nur Vorschau) | Solange Originale nicht lokal liegen, lädt die **Vorschau** Bilder von artenreich.ch | Entfällt nach `npm run assets:fetch` vollständig |

## Zu klärende Punkte

1. Hosting-Anbieter und Standort des Servers (Auftragsbearbeitung).
2. SMTP-Dienst / Mailserver für den Formularversand und Aufbewahrungsdauer der Anfragen im Postfach.
3. Ob die bestehende Erklärung Dienste nennt, die auf der neuen Website **nicht** mehr eingesetzt werden
   (z. B. eingebettete Karten, Schriftdienste, Analyse) – diese Passagen anpassen.
4. Ob Cookies erwähnt werden müssen (nur das technisch notwendige `anfrage_ok`).
