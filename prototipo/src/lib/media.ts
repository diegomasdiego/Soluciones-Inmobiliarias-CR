import manifest from '../data/media.json';

export type MediaItem = { src: string; w: number; h: number; blur: string };
const media = manifest as Record<string, MediaItem>;

export function getMedia(name: string): MediaItem {
  const item = media[name];
  if (!item) throw new Error(`Unknown media: ${name}`);
  return item;
}

export const mediaUrl = (name: string) => getMedia(name).src;
