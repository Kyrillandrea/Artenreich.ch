import type { APIRoute } from 'astro';
import { url } from '../lib/url';

/** Vorschau: alles gesperrt. Livegang: PUBLIC_INDEXING=true (siehe README). */
export const GET: APIRoute = ({ site }) => {
  const indexing = import.meta.env.PUBLIC_INDEXING === 'true';
  const body = indexing
    ? `User-agent: *\nAllow: /\nDisallow: ${url('/api/')}\nDisallow: ${url('/kontakt/danke/')}\n\nSitemap: ${new URL(url('/sitemap-index.xml'), site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
