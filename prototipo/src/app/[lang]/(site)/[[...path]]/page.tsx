// Every public page of the site, in both languages. The path decides the route (lib/routes.ts);
// the page is drawn on the server with its content, title, description, alternate language and
// structured data, then refreshed every 5 minutes so new or changed listings appear.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageView } from '../../../../components/PageView';
import { isLang, type Lang } from '../../../../lib/lang';
import { loadListings } from '../../../../lib/listings';
import { describePage, publicRoutes, toMetadata } from '../../../../lib/meta';
import { parsePath, toPath, type Route } from '../../../../lib/routes';

export const revalidate = 300;
// Listings added in Convex after the build are drawn the first time someone opens them.
export const dynamicParams = true;

type Params = Promise<{ lang: string; path?: string[] }>;

async function resolve(params: Params) {
  const { lang, path } = await params;
  if (!isLang(lang)) return null;
  const route = parsePath(path ?? [], lang);
  if (!route || route.name === 'panel' || route.name === 'portal') return null;
  const { properties } = await loadListings();
  const info = describePage(route, lang, properties);
  return info ? { lang, route, info } : null;
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const lang = params.lang as Lang;
  const { properties } = await loadListings();
  return publicRoutes(properties).map((route: Route) => {
    const parts = toPath(route, lang).split('/').filter(Boolean);
    if (parts[0] === 'es') parts.shift();
    return { path: parts.map(decodeURIComponent) };
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await resolve(params);
  return page ? toMetadata(page.info, page.route, page.lang) : {};
}

export default async function Page({ params }: { params: Params }) {
  const page = await resolve(params);
  if (!page) notFound();
  return (
    <>
      {page.info.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page.info.jsonLd).replace(/</g, '\\u003c') }} />
      )}
      <PageView route={page.route} />
    </>
  );
}
