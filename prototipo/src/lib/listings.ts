// Server side: the published listings for drawing pages, read from Convex once per render and
// refreshed with the pages (every 5 minutes, see `revalidate`). Falls back to the bundled samples
// when Convex is not configured, empty or unreachable, so a page is never blank.
import { cache } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { properties as samples, type Property } from '../data/properties';

export type Listings = { properties: Property[]; source: 'sample' | 'database' };

export const loadListings = cache(async (): Promise<Listings> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return { properties: samples, source: 'sample' };
  try {
    const list = (await new ConvexHttpClient(url).query(api.properties.list, {})) as Property[];
    return list.length ? { properties: list, source: 'database' } : { properties: samples, source: 'sample' };
  } catch (err) {
    console.error('Listings: Convex unreachable, using the sample listings.', err instanceof Error ? err.message : err);
    return { properties: samples, source: 'sample' };
  }
});

/** The site's public address, for absolute links (canonical, link previews, sitemap). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://soluciones-inmobiliarias-cr-production.up.railway.app').replace(/\/$/, '');
