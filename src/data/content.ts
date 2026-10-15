import type { MediaId } from './media';

/**
 * Originaltexte der bestehenden Website artenreich.ch (erfasst 15.10.2026).
 * Diese Texte werden unverändert dargestellt. Änderungen nur nach Freigabe durch Artenreich.
 */

export const hero = {
  title: ['Natur erleben.', 'Lebensräume schaffen.'],
  subtitle: 'Individuelle Naturgärten, Schwimmteiche und Naturpools von Artenreich.',
  primary: { label: 'Naturpool anfragen', projekt: 'naturpool' },
  secondary: { label: 'Unsere Arbeiten entdecken', href: '/impressionen/' },
  /**
   * Bildebenen für den Layered-Parallax-Einstieg (hinten → vorn).
   * Poolbilder vom Auftraggeber geliefert; nicht als Referenzprojekt beschriftet.
   */
  layers: { back: 'pool-01', front: ['pool-03', 'pool-02'] } as { back: MediaId; front: [MediaId, MediaId] },
  /**
   * Vorbereitet für den späteren Originalfilm (Teichwasser → Wasserpflanzen → Steintextur →
   * Schwimmteich). Erst eintragen, wenn freigegebenes Material vorliegt.
   * Beispiel: { poster: 'hero-poster', sources: [{ src: '/media/hero-1080.webm', type: 'video/webm' }] }
   */
  video: null as null | { poster: MediaId; sources: { src: string; type: string; media?: string }[] },
};

/** Vollständige Original-Philosophie – vier Absätze */
export const philosophy = [
  'In einem Naturgarten erleben Sie den ständigen Wandel der Natur. Jedes Jahr erfahren Sie diese Wunder von Neuem und doch nie gleich – denn Natur und Wetter sind nicht planbar.',
  'Es macht uns Freude, Ihren Garten nach Ihren Wünschen und Möglichkeiten zu planen und zu gestalten. Ihr Lebensraum wie auch der Tiere und Pflanzen wird grösser und reicher und zu einem eigentlichen kleinen Paradies. Dank etwas Geduld und viel Liebe wird Ihr Garten immer lebendiger, ist fest in Ihrem Alltag verwurzelt und begegnet Ihnen in den unterschiedlichsten Tonarten. Farbnuancen, Licht- und Schattenspiele, Stibitzen, Naschen, Blütenduft, Regenluft, Summen, Gezwitscher, Rauschen – belebend und beruhigend.',
  'Verbundenheit mit der Natur ist unsere Quelle. Kreativ verwenden wir einheimische Pflanzen und Materialien und fördern Vielfalt für den perfekten Naturgarten. Achtsamkeit, Sorgfalt und Verantwortung pflegen wir mit natürlicher Selbstverständlichkeit Ihnen, unseren Mitarbeitern und der Natur gegenüber.',
  'Wir unterstützen Sie bei der Planung, der Umsetzung und der Pflege im Einklang mit den Jahreszeiten. So können Sie jeden Tag staunen, sich erfreuen, Erholung finden und Neues in Ihrem Naturgarten entdecken.',
] as const;

/** Auszug aus Absatz 2 – nur als typografisches Zitat, der vollständige Absatz bleibt erhalten */
export const sensoryLine =
  'Farbnuancen, Licht- und Schattenspiele, Stibitzen, Naschen, Blütenduft, Regenluft, Summen, Gezwitscher, Rauschen – belebend und beruhigend.';

export interface Service {
  id: 'gestaltung' | 'verwirklichung' | 'betreuung';
  title: string;
  text: string;
  image: MediaId;
}

export const services: Service[] = [
  {
    id: 'gestaltung',
    title: 'Gestaltung',
    text: 'Aus Ihren Gartenträumen und -wünschen entwerfen wir Vorschläge und veranschaulichen Ideen.',
    image: 'service-gestaltung',
  },
  {
    id: 'verwirklichung',
    title: 'Verwirklichung',
    text: 'Pläne setzen wir rücksichtsvoll um – sie erwachen zum Leben.',
    image: 'service-verwirklichung',
  },
  {
    id: 'betreuung',
    title: 'Betreuung',
    text: 'Jedem Garten, ob alt oder neu, schenken wir Aufmerksamkeit und Pflege.',
    image: 'service-betreuung',
  },
];

export interface Season {
  id: 'fruehling' | 'sommer' | 'herbst' | 'winter';
  title: string;
  lines: [string, string, string];
  image: MediaId;
}

export const seasons: Season[] = [
  { id: 'fruehling', title: 'Frühling', lines: ['Zartes Erwachen beobachten', 'Summende Bienen', 'Blütenduft'], image: 'season-fruehling' },
  { id: 'sommer', title: 'Sommer', lines: ['Wolkenlose Stunden erleben', 'Erfrischendes Wasser', 'Blumenpracht'], image: 'season-sommer' },
  { id: 'herbst', title: 'Herbst', lines: ['Zauberhafte Farbenspiele bewundern', 'Raschelndes Laub', 'Erntezeit'], image: 'season-herbst' },
  { id: 'winter', title: 'Winter', lines: ['Versteckte Pflanzen finden', 'Beruhigende Stille', 'Eiskristalle'], image: 'season-winter' },
];

/** Alle 18 Galerieaufnahmen in Originalreihenfolge. Motivbeschreibungen, keine Projektdaten. */
export const gallery: MediaId[] = [
  'galerie-01', 'galerie-02', 'galerie-03', 'galerie-04', 'galerie-05', 'galerie-06',
  'galerie-07', 'galerie-08', 'galerie-09', 'galerie-10', 'galerie-11', 'galerie-12',
  'galerie-13', 'galerie-14', 'galerie-15', 'galerie-16', 'galerie-17', 'galerie-18',
];

/** Kuratierter Einstieg auf der Startseite (keine Bilder, die bereits im Hero stehen) */
export const galleryTeaser: MediaId[] = ['galerie-01', 'galerie-04', 'galerie-18', 'galerie-06', 'galerie-16'];
