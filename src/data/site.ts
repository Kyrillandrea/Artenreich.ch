/** Bestätigte Unternehmens- und Kontaktangaben (Quelle: artenreich.ch, erfasst 15.10.2026). */

export const company = {
  legalName: 'ARTENREICH BOLINGER GÄRTEN AG',
  brand: 'Artenreich',
  contactPerson: 'Patrick Bolinger',
  office: {
    label: 'Büro',
    street: 'Dorfstrasse 63',
    postalCode: '8302',
    locality: 'Kloten',
    country: 'Schweiz',
    countryCode: 'CH',
  },
  depot: {
    label: 'Werkhof / Lieferungen',
    street: 'Lufingerstrasse 1',
    postalCode: '8302',
    locality: 'Kloten',
  },
  phone: { display: '+41 43 244 20 00', href: 'tel:+41432442000' },
  email: { display: 'info@artenreich.ch', href: 'mailto:info@artenreich.ch', address: 'info@artenreich.ch' },
} as const;

export const links = {
  recruiting: { label: 'Werde artenreich', href: 'https://werdeartenreich.ch/' },
  map: { label: 'Standort auf Google Maps', href: 'https://g.page/r/CW3smWpSPcZvEBA' },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/artenreich.ch/' },
  facebook: { label: 'Facebook', href: 'https://www.facebook.com/artenreich.gaerten' },
  bioterra: { label: 'Bioterra – Naturgarten-Profis', href: 'https://www.bioterra.ch/gartenprofis/naturgarten-profis' },
  /** Bestehende Datenschutzerklärung (Quelle für die Übernahme) */
  privacySource: 'https://artenreich.ch/datenschutz/',
} as const;

export const nav = [
  { label: 'Naturgärten', href: '/naturgarten/' },
  { label: 'Naturpools', href: '/naturpools-schwimmteiche/' },
  { label: 'Impressionen', href: '/impressionen/' },
  { label: 'Über uns', href: '/team/' },
] as const;

export const primaryCta = { label: 'Projekt anfragen', href: '/kontakt/#anfrage' } as const;

export const seo = {
  siteName: 'Artenreich',
  defaultTitle: 'Artenreich – Naturgärten, Schwimmteiche und Naturpools aus Kloten',
  defaultDescription:
    'Individuelle Naturgärten, Schwimmteiche und Naturpools von Artenreich: Gestaltung, Verwirklichung und Betreuung aus Kloten im Kanton Zürich.',
  locale: 'de_CH',
} as const;
