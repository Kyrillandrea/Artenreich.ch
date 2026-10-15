import type { MediaId } from './media';

/**
 * Alle 14 Teamprofile der bestehenden Website (erfasst 15.10.2026).
 * Namen und Biografien sind Originaltexte. Keine ergänzten Funktionen oder Zitate.
 * Personen ohne Biografie in der gesicherten Quelle erhalten bewusst keine.
 */

export interface TeamMember {
  id: string;
  name: string;
  portrait: MediaId;
  /** Angezeigte Biografie; null = in der gesicherten Quelle nicht vorhanden */
  bio: string | null;
  /** Unveränderter Originaltext, falls `bio` redaktionell korrigiert wurde */
  bioOriginal?: string;
  /** Interne redaktionelle Hinweise – nicht sichtbar auf der Website */
  editorial?: string;
}

export const team: TeamMember[] = [
  {
    id: 'patrick-bolinger',
    name: 'Patrick Bolinger',
    portrait: 'team-patrick-bolinger',
    bio: 'Zu Beginn meiner Ausbildung faszinierten mich vor allem Materialien, Bautypen und das Handwerk des Gärtners. Mit grosser Freude schuf ich Lebensräume. Im Vordergrund stand der Mensch, aber noch fehlte der konkrete Bezug zu Pflanzen und Tieren. Im Laufe der Zeit lernte ich, den Zusammenhang zwischen allen Lebewesen immer besser zu erkennen. Heute reicht meine Begeisterung weit über die Werkstoffe hinaus. So wird ein Garten zu einem echten Lebensraum, entwickelt sich weiter und bereitet jahrelang Freude!',
  },
  {
    id: 'fabienne-benz',
    name: 'Fabienne Benz',
    portrait: 'team-fabienne-benz',
    bio: 'In meiner Freizeit bin ich oft und sehr gerne draussen in der Natur. Daher ist es für mich total schön auch im Büroalltag von Artenreich den Bezug zur Natur intensiv zu spüren.',
  },
  {
    id: 'jana-schwilch',
    name: 'Jana Schwilch',
    portrait: 'team-jana-schwilch',
    bio: 'Ich beobachte gerne, wie sich die Gärten mit der Zeit verändern. Wie sie sich nach Wetter, Jahreszeit und meiner Arbeit unterschiedlich entwickeln.',
    editorial: 'Dateiname des Porträts enthält «Jana-Schilch»; der sichtbare Name «Jana Schwilch» bleibt erhalten.',
  },
  {
    id: 'valentina-giannachi',
    name: 'Valentina Giannachi',
    portrait: 'team-valentina-giannachi',
    bio: 'Ich liebe die Nähe zur Natur. Bei Artenreich kann ich meine Leidenschaft für Biodiversität ausleben.',
  },
  {
    id: 'charlie-nufer',
    name: 'Charlie Nufer',
    portrait: 'team-charlie-nufer',
    bio: 'Der lebendigen Natur zu begegnen und voller Tatendrang und Einsatz im Team zu arbeiten, bereitet mir grosse Freude. Ich liebe es, die Sonne im Gesicht und den Regen auf der Haut zu spüren. Zu sehen, welche Lebensräume wir erschaffen und was unsere Arbeit bewirkt, erfüllt mich; es bringt mich jeden Tag aufs Neue zum Staunen und Lächeln.',
  },
  {
    id: 'jens-hoenisch',
    name: 'Jens Hönisch',
    portrait: 'team-jens-hoenisch',
    bio: 'Ich mag es, mit Maschinen zu arbeiten. Und naturnahe und wilde Gärten zu erschaffen, so dass möglichst viele Lebewesen im Garten ihr Zuhause finden können. Dies und vieles mehr motiviert mich jeden Morgen zu arbeiten.',
  },
  {
    id: 'stephanie-muff',
    name: 'Stephanie Muff',
    portrait: 'team-stephanie-muff',
    bio: 'Als Naturgärtnerin liegt mir die Verbindung von Mensch und Natur am Herzen. Ich bin überzeugt, dass ein harmonisches und nachhaltiges Miteinander von Pflanzen, Tieren und Menschen nicht nur unsere Umwelt bereichert, sondern auch unser Wohlbefinden steigert. Mit Leidenschaft gestalte ich gesunde Gärten, die blühen, leben und Freude schenken – Räume, in denen wir als Teil der Natur aufblühen können.',
  },
  {
    id: 'nathalie-lienert',
    name: 'Nathalie Lienert',
    portrait: 'team-nathalie-lienert',
    bio: 'Ich bin sehr gerne in der Natur und deshalb war es für mich von Anfang an klar, eine Lehre draussen zu machen. Hier kann ich meine Leidenschaft ausleben. Und ich kann so mithelfen, Rückzugsorte für Mensch und Tier zu schaffen, aktiv zur Biodiversität beizutragen und natürlich die Kundschaft glücklich zu machen.',
    editorial: 'Bilddatei heisst «Nathalie-Lienhard.jpg»; sichtbarer Name «Nathalie Lienert» bleibt erhalten. Schreibweise bestätigen lassen.',
  },
  {
    id: 'patrick-dubs',
    name: 'Patrick Dubs',
    portrait: 'team-patrick-dubs',
    bio: 'Die Freude an der Natur und an den Lebewesen wie etwa die Wildbiene erfüllen mich. Ich finde es spannend zu beobachten, wie sich die Staudenpflanzen über die Jahre verändern. Diese kleinen Wunder der Natur zeigen mir, wie vielfältig und dynamisch unsere Umwelt ist. Jedes Mal, wenn ich sehe, welche Lebensräume wir schaffen und welche Auswirkungen unsere Arbeit hat, erfüllt mich das mit Freude.',
  },
  {
    id: 'sergio-sebastianutti',
    name: 'Sergio Sebastianutti',
    portrait: 'team-sergio-sebastianutti',
    bio: null,
  },
  {
    id: 'barbara-sommer',
    name: 'Barbara Sommer',
    portrait: 'team-barbara-sommer',
    bio: null,
  },
  {
    id: 'jasper-sehrt',
    name: 'Jasper Sehrt',
    portrait: 'team-jasper-sehrt',
    bio: 'Mein Biologiestudium legte den Grundstein für meine Leidenschaft für Ökologie und angewandten Naturschutz. Dieses Wissen mit dem Handwerk der Gartengestaltung zu verbinden und täglich kreativ umzusetzen, ist für mich Motivation und grosse Freude zugleich.',
  },
  {
    id: 'rahel',
    name: 'Rahel',
    portrait: 'team-rahel',
    bio: 'Es bereitet mir Freude, ein Stück Natur in die Gärten zu bringen und einen Ort zu schaffen, an dem sich Menschen, Flora und Fauna wohlfühlen können. Dabei finde ich es besonders schön, den Wandel der verschiedenen Jahreszeiten mitzuerleben.',
    bioOriginal:
      'Es bereitet mit Freude, ein Stück Natur in die Gärten zu bringen und einen Ort zu schaffen, an dem sich Menschen, Flora und Fauna wohlfühlen können. Dabei finde ich es besonders schön, den Wandel der verschiedenen Jahreszeiten mitzuerleben.',
    editorial: 'Redaktionelle Korrektur «mit» → «mir» im ersten Satz; Bestätigung durch Artenreich ausstehend. Kein bestätigter Nachname.',
  },
  {
    id: 'asia-graziano',
    name: 'Asia Graziano',
    portrait: 'team-asia-graziano',
    bio: null,
  },
];

/** Originalsatz aus der Biografie von Patrick Bolinger – für den Team-Einstieg */
export const teamQuote = {
  text: 'So wird ein Garten zu einem echten Lebensraum, entwickelt sich weiter und bereitet jahrelang Freude!',
  author: 'Patrick Bolinger',
};
