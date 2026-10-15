import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { media, coreMediaIds, type MediaId, type MediaItem } from '../data/media';

/**
 * Lokale Originale (nach `npm run assets:fetch`). Vite bündelt nur tatsächlich vorhandene Dateien.
 */
const localFiles = import.meta.glob<{ default: ImageMetadata }>(
  ['/src/assets/originals/*.{jpg,jpeg,png,webp,JPG,PNG}', '/src/assets/pool/*.{jpg,jpeg,png,webp}'],
  { eager: true },
);

export function getMediaItem(id: MediaId): MediaItem {
  return media[id];
}

export function getLocalImage(id: MediaId): ImageMetadata | undefined {
  const item: MediaItem = media[id];
  return localFiles[`/src/assets/${item.dir ?? 'originals'}/${item.file}`]?.default;
}

/** Grosse Variante für Grossansichten: lokal optimiert, sonst Original-URL (nur Vorschau). */
export async function getFullSrc(id: MediaId, width = 2200): Promise<string> {
  const local = getLocalImage(id);
  if (!local) return media[id].src;
  const result = await getImage({ src: local, width: Math.min(width, local.width), format: 'webp', quality: 78 });
  return result.src;
}

export const missingLocalMedia = coreMediaIds.filter((id) => !getLocalImage(id));

if (missingLocalMedia.length > 0 && import.meta.env.PROD) {
  console.warn(
    `[media] ${missingLocalMedia.length} von ${coreMediaIds.length} Originalbildern fehlen lokal – ` +
      'die Vorschau verwendet die Original-URLs. Vor dem Livegang `npm run assets:fetch` ausführen.',
  );
}
