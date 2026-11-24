// /sitemap.xml: every public page in English and Spanish, each pointing to its other language.
import type { MetadataRoute } from 'next';
import { GUIDES_UPDATED } from '../data/guides';
import { loadListings, SITE_URL } from '../lib/listings';
import { publicRoutes } from '../lib/meta';
import { toPath } from '../lib/routes';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { properties } = await loadListings();
  const now = new Date();
  return publicRoutes(properties)
    .filter(r => r.name !== 'saved')
    .flatMap(route => (['en', 'es'] as const).map(lang => ({
      url: SITE_URL + (toPath(route, lang) === '/' ? '' : toPath(route, lang)),
      lastModified: route.name === 'guide' ? new Date(GUIDES_UPDATED) : now,
      changeFrequency: route.name === 'property' || route.name === 'search' ? 'daily' as const : 'weekly' as const,
      priority: route.name === 'home' ? 1 : route.name === 'property' || route.name === 'search' ? 0.8 : 0.6,
      alternates: { languages: { en: SITE_URL + toPath(route, 'en'), 'es-CR': SITE_URL + toPath(route, 'es') } },
    })));
}
