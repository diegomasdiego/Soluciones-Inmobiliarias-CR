// Language in the URL: Spanish lives under /es, English at the root. Requests without /es are
// served by the English pages (internally /en/...), so English addresses stay short.
// On a first visit to the home page, a browser set to Spanish goes to /es; once someone picks a
// language with the toggle (cookie), their choice wins.
import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE } from './lib/lang';

const prefersSpanish = (header: string | null) => {
  const first = (header ?? '').split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('es');
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The 404 page reads this to answer in the right language.
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  if (/^\/(es|en)(\/|$)/.test(pathname)) return NextResponse.next({ request: { headers } });

  if (pathname === '/' && !request.cookies.has(LANG_COOKIE) && prefersSpanish(request.headers.get('accept-language'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/es';
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Not for Next's own files, the photos in /media, or anything with a file extension
  // (favicon, robots.txt, sitemap.xml, og-image.jpg…).
  matcher: ['/((?!_next|media|api|.*\\..*).*)'],
};
