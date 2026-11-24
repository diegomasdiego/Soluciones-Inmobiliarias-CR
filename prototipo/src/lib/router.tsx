'use client';
// Routing for the views, on top of Next.js: views keep using routes ({ name: 'property', slug })
// and this file turns them into real URLs in the current language (lib/routes.ts).
import { useCallback, useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter as useNextRouter } from 'next/navigation';
import { useLang } from './i18n';
import { fromPathname, toPath, type Route } from './routes';

export { toPath, type Route } from './routes';

type NavOpts = { keepScroll?: boolean };

export function useRouter() {
  const pathname = usePathname();
  const next = useNextRouter();
  const { lang } = useLang();
  const route = useMemo<Route>(() => fromPathname(pathname ?? '/').route ?? { name: 'home' }, [pathname]);
  const navigate = useCallback((to: Route, opts: NavOpts = {}) => {
    next.push(toPath(to, lang), { scroll: !opts.keepScroll });
  }, [next, lang]);
  /** The absolute URL of a route, for sharing. */
  const urlOf = useCallback((to: Route) => `${window.location.origin}${toPath(to, lang)}`, [lang]);
  return { route, navigate, urlOf };
}

export function Link({ to, children, className, onClick, ...rest }: { to: Route; children: ReactNode; className?: string; onClick?: () => void } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { lang } = useLang();
  return (
    <NextLink href={toPath(to, lang)} className={className} onClick={onClick} {...rest}>
      {children}
    </NextLink>
  );
}
