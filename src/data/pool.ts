import type { MediaId } from './media';

/**
 * Naturpools und Schwimmteiche.
 * Die bestehende Website bestätigt die übergeordneten Leistungen Gestaltung, Umsetzung und Pflege,
 * aber keine konkreten Pool-Systeme, Preise, Referenzanlagen, Wartungsintervalle oder Garantien.
 * Die Inhalte sind daher bewusst als Gesprächs- und Planungsfragen formuliert.
 */

export const poolIntro =
  'Sie wünschen sich einen Platz zum Schwimmen im eigenen Garten? Erzählen Sie uns von Ihrem Grundstück, Ihren Vorstellungen und Ihrem Zeitrahmen. Gemeinsam lässt sich klären, welche Lösung zu Ihrem Vorhaben passt.';

export const poolCta = { label: 'Mein Vorhaben besprechen', projekt: 'naturpool' } as const;

export const planningQuestions = [
  {
    title: 'Wünsche und Ausgangslage',
    text: 'Wie möchten Sie Wasser und Garten nutzen? Welche Gegebenheiten bringt das Grundstück mit?',
  },
  {
    title: 'Gestaltung und Lösung',
    text: 'Wie sollen Wasserfläche, Umfeld und Bepflanzung zusammenwirken?',
  },
  {
    title: 'Umsetzung',
    text: 'Welche Schritte und Einzelheiten müssen für das konkrete Vorhaben abgestimmt werden?',
  },
  {
    title: 'Betreuung',
    text: 'Welche Pflege ist vorgesehen und welche Unterstützung wird gewünscht?',
  },
] as const;

export const poolFaq = [
  {
    q: 'Was brauchen Sie für eine erste Anfrage?',
    a: 'Projektart, Region und eine kurze Beschreibung reichen für den Einstieg. Ein ungefährer Zeitrahmen hilft bei der Einordnung. Pläne und Fotos können bei Bedarf später ergänzt werden.',
  },
  {
    q: 'Welche Lösung passt zu meinem Garten?',
    a: 'Das hängt von Ihren Wünschen und den Gegebenheiten vor Ort ab. Beschreiben Sie in Ihrer Anfrage, wie Sie den Garten und die Wasserfläche nutzen möchten.',
  },
  {
    q: 'Mit welchen Kosten muss ich rechnen?',
    a: 'Eine belastbare Einschätzung setzt voraus, dass Umfang und Anforderungen Ihres Vorhabens geklärt sind. Erzählen Sie uns von Ihrer Idee.',
  },
  {
    q: 'Wie viel Pflege braucht die Anlage?',
    a: 'Der konkrete Pflegebedarf ist abhängig von der vorgesehenen Anlage. Pflegeaufgaben und mögliche Betreuung werden im Rahmen der Planung geklärt.',
  },
  {
    q: 'Wann kann mein Projekt beginnen?',
    a: 'Nennen Sie Ihren ungefähren Wunschzeitraum. Einen Termin kann Artenreich erst nach Prüfung des Vorhabens und der Verfügbarkeit bestätigen.',
  },
] as const;

/**
 * Vorbereitete Datenfelder für freigegebene echte Naturpool-/Schwimmteichaufnahmen.
 * Solange die Liste leer ist, zeigt die Website keine Poolbilder und keine Platzhalter.
 * Eintrag z. B.: { image: 'pool-01', caption: 'Bestätigte Bildunterschrift' }
 */
export const poolMedia: { image: MediaId; caption: string }[] = [];
