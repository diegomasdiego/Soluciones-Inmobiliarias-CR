// /robots.txt: everything public is open to search engines; the private pages are not.
import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/listings';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/panel', '/portal', '/es/panel', '/es/portal'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
