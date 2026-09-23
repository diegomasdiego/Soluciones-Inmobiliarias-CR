// Tiny hash router. Hashes are bare tokens (#search, #property-los-laureles) so deep links
// also work inside the artifact viewer. Navigation uses the View Transitions API when available,
// so a card photo can morph into the property page hero.
import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

export type Route =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'property'; slug: string }
  | { name: 'calculator'; slug?: string }
  | { name: 'build' }
  | { name: 'contact'; topic?: string };

export function parseHash(hash: string): Route {
  const h = decodeURIComponent(hash.replace(/^#/, ''));
  if (h === 'search') return { name: 'search' };
  if (h.startsWith('property-')) return { name: 'property', slug: h.slice(9) };
  if (h === 'calculator') return { name: 'calculator' };
  if (h.startsWith('calculator-')) return { name: 'calculator', slug: h.slice(11) };
  if (h === 'build') return { name: 'build' };
  if (h === 'contact') return { name: 'contact' };
  if (h.startsWith('contact-')) return { name: 'contact', topic: h.slice(8) };
  return { name: 'home' };
}

export function toHash(r: Route): string {
  switch (r.name) {
    case 'home': return 'home';
    case 'search': return 'search';
    case 'property': return `property-${r.slug}`;
    case 'calculator': return r.slug ? `calculator-${r.slug}` : 'calculator';
    case 'build': return 'build';
    case 'contact': return r.topic ? `contact-${r.topic}` : 'contact';
  }
}

type NavOpts = { morph?: HTMLElement | null; keepScroll?: boolean };
type Ctx = { route: Route; navigate: (to: Route, opts?: NavOpts) => void };
const RouterCtx = createContext<Ctx | null>(null);

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type VTDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onPop = () => {
      const next = parseHash(window.location.hash);
      const apply = () => { flushSync(() => setRoute(next)); window.scrollTo(0, 0); };
      const doc = document as VTDoc;
      if (doc.startViewTransition && !reduceMotion()) doc.startViewTransition(apply); else apply();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: Route, opts: NavOpts = {}) => {
    try { history.pushState(null, '', '#' + toHash(to)); } catch { /* sandboxed frames may refuse history changes */ }
    const apply = () => {
      flushSync(() => setRoute(to));
      if (!opts.keepScroll) window.scrollTo(0, 0);
    };
    const doc = document as VTDoc;
    if (!doc.startViewTransition || reduceMotion()) { apply(); return; }
    if (opts.morph) {
      document.querySelectorAll('.vt-hero').forEach(el => el.classList.remove('vt-hero'));
      opts.morph.style.viewTransitionName = 'hero-photo';
    }
    const vt = doc.startViewTransition(apply);
    vt.finished.finally(() => { if (opts.morph) opts.morph.style.viewTransitionName = ''; });
  }, []);

  return <RouterCtx.Provider value={{ route, navigate }}>{children}</RouterCtx.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterCtx);
  if (!ctx) throw new Error('useRouter outside RouterProvider');
  return ctx;
}

export function Link({ to, children, className, onClick, ...rest }: { to: Route; children: ReactNode; className?: string; onClick?: () => void } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { navigate } = useRouter();
  return (
    <a
      href={'#' + toHash(to)}
      className={className}
      onClick={e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
