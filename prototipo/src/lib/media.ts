import manifest from '../data/media.json';

export type MediaItem = { src: string; w: number; h: number; blur: string };
const media = manifest as Record<string, MediaItem>;

/** A photo, panorama or video from public/media, with an absolute path (pages live at /properties/…). */
export function getMedia(name: string): MediaItem {
  const item = media[name];
  if (!item) throw new Error(`Unknown media: ${name}`);
  return { ...item, src: '/' + item.src.replace(/^\.?\//, '') };
}

export const mediaUrl = (name: string) => getMedia(name).src;
