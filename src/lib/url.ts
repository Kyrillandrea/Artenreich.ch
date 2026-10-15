/**
 * Interne Pfade mit dem konfigurierten Basispfad versehen.
 * Produktion: Basis "/" (artenreich.ch). Vorschau auf GitHub Pages: Basis "/Artenreich.ch/".
 */
const RAW_BASE = import.meta.env.BASE_URL || '/';
export const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

export function url(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return BASE + path.slice(1);
}

export const isDemo = import.meta.env.PUBLIC_DEMO === 'true';
