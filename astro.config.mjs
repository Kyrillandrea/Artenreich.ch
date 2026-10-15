// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Indexierung ist bis zur Freigabe des Livegangs bewusst deaktiviert.
// Für den Livegang: PUBLIC_INDEXING=true setzen (siehe README).
const indexing = process.env.PUBLIC_INDEXING === 'true';

// Basispfad und Domain sind konfigurierbar (z. B. Vorschau auf GitHub Pages unter /Artenreich.ch/).
const base = process.env.BASE_PATH || '/';
const site = process.env.SITE_URL || 'https://artenreich.ch';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: indexing
    ? [
        sitemap({
          filter: (page) => !page.includes('/kontakt/danke/'),
        }),
      ]
    : [],
  image: {
    responsiveStyles: false,
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
