/**
 * Medienbestand der bestehenden Website artenreich.ch (erfasst am 15. Oktober 2026).
 *
 * 40 Originaldateien: 1 Logo + 4 Jahreszeiten + 3 Leistungen + 14 Teamporträts + 18 Galeriebilder.
 * Das Bioterra-Label ist zusätzlich erfasst und gehört nicht zu diesen 40 Dateien.
 *
 * `file` ist der lokale Dateiname unter `src/assets/originals/` nach dem verifizierten
 * Download (`npm run assets:fetch`). Solange die Originale lokal fehlen, verwendet die
 * Website die Original-URL – das ist ausschliesslich für die Vorschau gedacht.
 * `npm run prelaunch` verhindert einen Livegang ohne lokale Originale.
 */

export type MediaGroup = 'brand' | 'season' | 'service' | 'team' | 'gallery' | 'label' | 'pool';

export interface MediaItem {
  id: string;
  group: MediaGroup;
  /** Original-URL auf der bestehenden Website */
  src: string;
  /** Lokaler Dateiname in src/assets/originals/ */
  file: string;
  /** Alternativtext; leer nur für rein dekorative Verwendung */
  alt: string;
  /** Bildausschnitt für object-fit: cover (CSS object-position) */
  focus?: string;
  /** Bekannte Abmessungen (nur wenn aus der Quelle belegt) */
  width?: number;
  height?: number;
  /** Redaktionelle Hinweise zur Bestätigung (nicht sichtbar) */
  note?: string;
  /** Ablageordner unter src/assets/ (Standard: originals) */
  dir?: 'originals' | 'pool';
}

const WP = 'https://artenreich.ch/wp-content';

export const media = {
  logo: {
    id: 'logo',
    group: 'brand',
    src: `${WP}/themes/artenreich/assets/img/logo.png`,
    file: 'logo.png',
    alt: 'artenreich',
  },

  // Leistungen
  'service-gestaltung': {
    id: 'service-gestaltung',
    group: 'service',
    src: `${WP}/uploads/2022/06/plan-artenreich-schweiz-gartengestaltung.jpg`,
    file: 'service-gestaltung.jpg',
    alt: 'Gezeichneter Gartenplan mit Wegen, Sitzplätzen und Pflanzflächen.',
  },
  'service-verwirklichung': {
    id: 'service-verwirklichung',
    group: 'service',
    src: `${WP}/uploads/2022/06/artenreich_Verwirklichung_gartengestaltung_schweiz.jpg`,
    file: 'service-verwirklichung.jpg',
    alt: 'Natursteinmauer mit Gartenmaterial im Sonnenlicht.',
  },
  'service-betreuung': {
    id: 'service-betreuung',
    group: 'service',
    src: `${WP}/uploads/2022/06/DSC_0772.jpg`,
    file: 'service-betreuung.jpg',
    alt: 'Hände bei der Pflege blühender Gartenpflanzen.',
  },

  // Jahreszeiten
  'season-fruehling': {
    id: 'season-fruehling',
    group: 'season',
    src: `${WP}/uploads/2018/09/Fr%C3%BChling-Crokus_web.jpg`,
    file: 'season-fruehling.jpg',
    alt: 'Blühende Krokusse im Frühlingsgarten.',
  },
  'season-sommer': {
    id: 'season-sommer',
    group: 'season',
    src: `${WP}/uploads/2022/06/Titelbild-Sommer_artenreich_gartengestaltung-schweiz.jpg`,
    file: 'season-sommer.jpg',
    alt: 'Sonniger Gartensitzplatz mit Stühlen und dichter Bepflanzung.',
  },
  'season-herbst': {
    id: 'season-herbst',
    group: 'season',
    src: `${WP}/uploads/2018/09/Herbst-Viburnum_Web.jpg`,
    file: 'season-herbst.jpg',
    alt: 'Rotes und oranges Herbstlaub.',
  },
  'season-winter': {
    id: 'season-winter',
    group: 'season',
    src: `${WP}/uploads/2018/03/DSC_4650.jpg`,
    file: 'season-winter.jpg',
    alt: 'Trockene Stauden und Gräser in einer winterlichen Gartenlandschaft.',
  },

  // Team
  'team-patrick-bolinger': {
    id: 'team-patrick-bolinger',
    group: 'team',
    src: `${WP}/uploads/2022/06/Patrick-Bolinger.jpg`,
    file: 'team-patrick-bolinger.jpg',
    alt: 'Porträt von Patrick Bolinger.',
  },
  'team-fabienne-benz': {
    id: 'team-fabienne-benz',
    group: 'team',
    src: `${WP}/uploads/2022/06/Fabienne-Benz.jpg`,
    file: 'team-fabienne-benz.jpg',
    alt: 'Porträt von Fabienne Benz.',
  },
  'team-jana-schwilch': {
    id: 'team-jana-schwilch',
    group: 'team',
    src: `${WP}/uploads/2023/11/Jana-Schilch-scaled-1080x1080.jpg`,
    file: 'team-jana-schwilch.jpg',
    alt: 'Porträt von Jana Schwilch.',
    width: 1080,
    height: 1080,
    note: 'Dateiname enthält «Jana-Schilch»; sichtbarer Name auf der Website ist «Jana Schwilch».',
  },
  'team-valentina-giannachi': {
    id: 'team-valentina-giannachi',
    group: 'team',
    src: `${WP}/uploads/2026/03/Valentina-Giannachi-1080x1080.jpg`,
    file: 'team-valentina-giannachi.jpg',
    alt: 'Porträt von Valentina Giannachi.',
    width: 1080,
    height: 1080,
  },
  'team-charlie-nufer': {
    id: 'team-charlie-nufer',
    group: 'team',
    src: `${WP}/uploads/2026/03/Charlie-Nufer-ersetzen.jpg`,
    file: 'team-charlie-nufer.jpg',
    alt: 'Porträt von Charlie Nufer.',
  },
  'team-jens-hoenisch': {
    id: 'team-jens-hoenisch',
    group: 'team',
    src: `${WP}/uploads/2026/03/Jens-Hoenisch-ersetzen.jpg`,
    file: 'team-jens-hoenisch.jpg',
    alt: 'Porträt von Jens Hönisch.',
  },
  'team-stephanie-muff': {
    id: 'team-stephanie-muff',
    group: 'team',
    src: `${WP}/uploads/2026/03/Stephanie-Muff-1080x1080.jpg`,
    file: 'team-stephanie-muff.jpg',
    alt: 'Porträt von Stephanie Muff.',
    width: 1080,
    height: 1080,
  },
  'team-nathalie-lienert': {
    id: 'team-nathalie-lienert',
    group: 'team',
    src: `${WP}/uploads/2026/03/Nathalie-Lienhard.jpg`,
    file: 'team-nathalie-lienert.jpg',
    alt: 'Porträt von Nathalie Lienert.',
    note: 'Bilddatei heisst «Nathalie-Lienhard.jpg»; sichtbarer Name ist «Nathalie Lienert». Bestätigung ausstehend.',
  },
  'team-patrick-dubs': {
    id: 'team-patrick-dubs',
    group: 'team',
    src: `${WP}/uploads/2026/03/Patrick-Dubs.jpg`,
    file: 'team-patrick-dubs.jpg',
    alt: 'Porträt von Patrick Dubs.',
  },
  'team-sergio-sebastianutti': {
    id: 'team-sergio-sebastianutti',
    group: 'team',
    src: `${WP}/uploads/2026/03/Sergio.jpg`,
    file: 'team-sergio-sebastianutti.jpg',
    alt: 'Porträt von Sergio Sebastianutti.',
  },
  'team-barbara-sommer': {
    id: 'team-barbara-sommer',
    group: 'team',
    src: `${WP}/uploads/2026/03/Barbara.jpg`,
    file: 'team-barbara-sommer.jpg',
    alt: 'Porträt von Barbara Sommer.',
  },
  'team-jasper-sehrt': {
    id: 'team-jasper-sehrt',
    group: 'team',
    src: `${WP}/uploads/2026/03/Jasper-Sehrt.jpg`,
    file: 'team-jasper-sehrt.jpg',
    alt: 'Porträt von Jasper Sehrt.',
  },
  'team-rahel': {
    id: 'team-rahel',
    group: 'team',
    src: `${WP}/uploads/2026/03/Rahel.jpg`,
    file: 'team-rahel.jpg',
    alt: 'Porträt von Rahel.',
  },
  'team-asia-graziano': {
    id: 'team-asia-graziano',
    group: 'team',
    src: `${WP}/uploads/2026/03/Asia.jpg`,
    file: 'team-asia-graziano.jpg',
    alt: 'Porträt von Asia Graziano.',
  },

  // Galerie – Motivbeschreibungen, keine bestätigten Projektnamen
  'galerie-01': { id: 'galerie-01', group: 'gallery', src: `${WP}/uploads/2022/06/4.jpg`, file: 'galerie-01.jpg', alt: 'Blühende Stauden vor einem Haus mit gelber Markise.' },
  'galerie-02': { id: 'galerie-02', group: 'gallery', src: `${WP}/uploads/2018/07/DSC_7079.jpg`, file: 'galerie-02.jpg', alt: 'Sitzplatz mit zwei Drahtstühlen, Baum und dichter Gartenbepflanzung.' },
  'galerie-03': { id: 'galerie-03', group: 'gallery', src: `${WP}/uploads/2022/06/6.jpg`, file: 'galerie-03.jpg', alt: 'Sitzplatz unter einem Sonnenschirm, umgeben von Gräsern im warmen Abendlicht.' },
  'galerie-04': { id: 'galerie-04', group: 'gallery', src: `${WP}/uploads/2022/06/7.jpg`, file: 'galerie-04.jpg', alt: 'Vielfältige Blüten und Gräser neben aufgeschichtetem Holz.' },
  'galerie-05': { id: 'galerie-05', group: 'gallery', src: `${WP}/uploads/2022/06/8.jpg`, file: 'galerie-05.jpg', alt: 'Farne und Pflanzen zwischen Natursteinen.' },
  'galerie-06': { id: 'galerie-06', group: 'gallery', src: `${WP}/uploads/2022/06/9.jpg`, file: 'galerie-06.jpg', alt: 'Person mit Sonnenhut bei der Pflege einer üppigen Gartenbepflanzung.' },
  'galerie-07': { id: 'galerie-07', group: 'gallery', src: `${WP}/uploads/2022/06/10.1.jpg`, file: 'galerie-07.jpg', alt: 'Person an einem runden Gartengrill vor einer Natursteinmauer.' },
  'galerie-08': { id: 'galerie-08', group: 'gallery', src: `${WP}/uploads/2022/06/11.jpg`, file: 'galerie-08.jpg', alt: 'Runder Brunnen mit Wasserauslauf neben einer Steinmauer.', note: 'Brunnen – keine belegte Naturpool- oder Schwimmteichreferenz.' },
  'galerie-09': { id: 'galerie-09', group: 'gallery', src: `${WP}/uploads/2022/06/12.jpg`, file: 'galerie-09.jpg', alt: 'Kinder an einem grossen rechteckigen Wasserbecken im Freien.', note: 'Wasserbecken – keine belegte Schwimmteichreferenz; keine Projektart ableiten.' },
  'galerie-10': { id: 'galerie-10', group: 'gallery', src: `${WP}/uploads/2018/08/8_Maulbeeren-2.jpg`, file: 'galerie-10.jpg', alt: 'Grüne Zweige vor blauem Himmel.' },
  'galerie-11': { id: 'galerie-11', group: 'gallery', src: `${WP}/uploads/2018/08/1_Gartenhaus-vor-Haus-2.jpg`, file: 'galerie-11.jpg', alt: 'Kleines verglastes Gartenhaus vor einem Wohnhaus.' },
  'galerie-12': { id: 'galerie-12', group: 'gallery', src: `${WP}/uploads/2022/06/15.jpg`, file: 'galerie-12.jpg', alt: 'Rote Johannisbeeren an einem Strauch.' },
  'galerie-13': { id: 'galerie-13', group: 'gallery', src: `${WP}/uploads/2022/06/16.jpg`, file: 'galerie-13.jpg', alt: 'Gestreifte Raupe an einer grünen Pflanze.' },
  'galerie-14': { id: 'galerie-14', group: 'gallery', src: `${WP}/uploads/2022/06/17.jpg`, file: 'galerie-14.jpg', alt: 'Insekt auf einer violetten Blüte.' },
  'galerie-15': { id: 'galerie-15', group: 'gallery', src: `${WP}/uploads/2018/09/5.3.jpg`, file: 'galerie-15.jpg', alt: 'Eidechse auf einem Ast zwischen grünen Pflanzen.' },
  'galerie-16': { id: 'galerie-16', group: 'gallery', src: `${WP}/uploads/2018/07/DSC_7297.jpg`, file: 'galerie-16.jpg', alt: 'Violette Blüten vor einer hellen verputzten Wand.' },
  'galerie-17': { id: 'galerie-17', group: 'gallery', src: `${WP}/uploads/2022/06/20.1.jpg`, file: 'galerie-17.jpg', alt: 'Person zwischen blühenden Gartenpflanzen.' },
  'galerie-18': { id: 'galerie-18', group: 'gallery', src: `${WP}/uploads/2022/06/21.jpg`, file: 'galerie-18.jpg', alt: 'Moosige Natursteine und Gräser im Sonnenlicht.' },

  // Zusätzlich erfasst, nicht Teil der 40 Kerndateien
  'label-bioterra': {
    id: 'label-bioterra',
    group: 'label',
    src: `${WP}/uploads/2024/10/Bioterra_Label_Fachbetrieb_1181x1181_pos-130x130.png`,
    file: 'label-bioterra.png',
    alt: 'Bioterra Fachbetrieb',
    width: 130,
    height: 130,
  },

  // Naturpool-/Schwimmteich-Aufnahmen, vom Auftraggeber am 15.10.2026 geliefert (unverändert).
  // Herkunft, Nutzungsrechte und Zuordnung zu Artenreich sind NICHT bestätigt:
  // keine Bildunterschriften als Referenzprojekt, nur Motivbeschreibungen.
  'pool-01': {
    id: 'pool-01',
    group: 'pool',
    dir: 'pool',
    src: '',
    file: 'pool-01.jpg',
    alt: 'Naturpool mit Wasserlinie zur Landschaft, Seerosen und Blick auf grüne Hügel.',
    focus: '32% 60%',
    note: 'Vom Auftraggeber geliefert. Herkunft und Rechte bestätigen.',
  },
  'pool-02': {
    id: 'pool-02',
    group: 'pool',
    dir: 'pool',
    src: '',
    file: 'pool-02.jpg',
    alt: 'Naturpool von oben mit Holzdecks, Seerosen und üppiger Bepflanzung.',
    note: 'Vom Auftraggeber geliefert. Wirkt wie eine Visualisierung – Herkunft und Rechte bestätigen.',
  },
  'pool-03': {
    id: 'pool-03',
    group: 'pool',
    dir: 'pool',
    src: '',
    file: 'pool-03.jpg',
    alt: 'Schwimmteich mit Seerosen vor Natursteinstufen und einem Wohnhaus mit Holzfassade.',
    note: 'Vom Auftraggeber geliefert. Herkunft und Rechte bestätigen.',
  },
  'pool-04': {
    id: 'pool-04',
    group: 'pool',
    dir: 'pool',
    src: '',
    file: 'pool-04.jpg',
    alt: 'Schwimmteich von oben mit badenden Menschen, Flachwasserzone und Blütenstauden.',
    note: 'Vom Auftraggeber geliefert. Erkennbare Personen – Herkunft, Rechte und Einwilligung bestätigen.',
  },
  'pool-05': {
    id: 'pool-05',
    group: 'pool',
    dir: 'pool',
    src: '',
    file: 'pool-05.jpg',
    alt: 'Schwimmteich mit Holzdeck und zwei Liegen vor Seen- und Bergkulisse.',
    note: 'Vom Auftraggeber geliefert. Herkunft und Rechte bestätigen.',
  },
} satisfies Record<string, MediaItem>;

export type MediaId = keyof typeof media;

/** Die 40 Kerndateien der bestehenden Website (ohne Label und ohne gelieferte Poolbilder) */
export const coreMediaIds = (Object.keys(media) as MediaId[]).filter(
  (id) => media[id].group !== 'label' && media[id].group !== 'pool',
);

/** Medien, die von artenreich.ch stammen und per `assets:fetch` gesichert werden */
export const remoteMediaIds = (Object.keys(media) as MediaId[]).filter((id) => media[id].group !== 'pool');
