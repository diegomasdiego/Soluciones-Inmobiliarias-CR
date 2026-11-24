// The site's routes and their URLs in each language, shared by server and browser code.
// English at the root, Spanish under /es with Spanish words: /properties/los-laureles and
// /es/propiedades/los-laureles are the same page. Listing, project and guide slugs stay the same.
import type { Lang } from './lang';

export type Route =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'property'; slug: string }
  | { name: 'calculator'; slug?: string }
  | { name: 'build' }
  | { name: 'contact'; topic?: string }
  | { name: 'projects' }
  | { name: 'project'; slug: string }
  | { name: 'sell' }
  | { name: 'about' }
  /** Saved properties; `shared` holds the slugs of a list someone sent by link. */
  | { name: 'saved'; shared?: string[] }
  | { name: 'guides' }
  | { name: 'guide'; slug: string }
  | { name: 'panel' }
  /** Client portal; `demo` shows it with fictitious data, without signing in. */
  | { name: 'portal'; demo?: boolean };

const SEG = {
  search: { en: 'properties', es: 'propiedades' },
  calculator: { en: 'calculator', es: 'calculadora' },
  build: { en: 'land-and-build', es: 'land-and-build' },
  contact: { en: 'contact', es: 'contacto' },
  projects: { en: 'projects', es: 'proyectos' },
  sell: { en: 'sell', es: 'vender' },
  about: { en: 'about', es: 'nosotros' },
  saved: { en: 'saved', es: 'guardadas' },
  compare: { en: 'compare', es: 'comparar' },
  guides: { en: 'guides', es: 'guias' },
  panel: { en: 'panel', es: 'panel' },
  portal: { en: 'portal', es: 'portal' },
} as const;
type Seg = keyof typeof SEG;

export const MAX_SHARED = 12;

/** The URL path of a route in a language: toPath({ name: 'property', slug: 'x' }, 'es') = '/es/propiedades/x'. */
export function toPath(r: Route, lang: Lang): string {
  const base = lang === 'es' ? '/es' : '';
  const s = (k: Seg) => SEG[k][lang];
  const join = (...parts: string[]) => `${base}/${parts.map(encodeURIComponent).join('/')}`;
  switch (r.name) {
    case 'home': return base || '/';
    case 'search': return join(s('search'));
    case 'property': return join(s('search'), r.slug);
    case 'calculator': return r.slug ? join(s('calculator'), r.slug) : join(s('calculator'));
    case 'build': return join(s('build'));
    case 'contact': return r.topic ? join(s('contact'), r.topic) : join(s('contact'));
    case 'projects': return join(s('projects'));
    case 'project': return join(s('projects'), r.slug);
    case 'sell': return join(s('sell'));
    case 'about': return join(s('about'));
    case 'saved': return r.shared?.length ? `${base}/${s('compare')}/${r.shared.map(encodeURIComponent).join(',')}` : join(s('saved'));
    case 'guides': return join(s('guides'));
    case 'guide': return join(s('guides'), r.slug);
    case 'panel': return join(s('panel'));
    case 'portal': return r.demo ? join(s('portal'), 'demo') : join(s('portal'));
  }
}

/** The route for the path segments after the language prefix, or null when nothing matches. */
export function parsePath(segments: string[], lang: Lang): Route | null {
  const dec = (x: string) => { try { return decodeURIComponent(x); } catch { return x; } };
  const [a, b, ...rest] = segments.map(dec);
  if (rest.length) return null;
  const is = (k: Seg) => a === SEG[k][lang];
  if (a === undefined) return { name: 'home' };
  if (is('search')) return b ? { name: 'property', slug: b } : { name: 'search' };
  if (is('calculator')) return { name: 'calculator', slug: b };
  if (is('contact')) return { name: 'contact', topic: b };
  if (is('projects')) return b ? { name: 'project', slug: b } : { name: 'projects' };
  if (is('guides')) return b ? { name: 'guide', slug: b } : { name: 'guides' };
  if (is('compare') && b) return { name: 'saved', shared: b.split(',').filter(Boolean).slice(0, MAX_SHARED) };
  if (b !== undefined) {
    if (is('portal') && b === 'demo') return { name: 'portal', demo: true };
    return null;
  }
  if (is('build')) return { name: 'build' };
  if (is('sell')) return { name: 'sell' };
  if (is('about')) return { name: 'about' };
  if (is('saved')) return { name: 'saved' };
  if (is('panel')) return { name: 'panel' };
  if (is('portal')) return { name: 'portal' };
  return null;
}

/** Language and route of a browser path such as /es/propiedades/x. */
export function fromPathname(pathname: string): { lang: Lang; route: Route | null } {
  const parts = pathname.split('/').filter(Boolean);
  const lang: Lang = parts[0] === 'es' ? 'es' : 'en';
  if (parts[0] === 'es' || parts[0] === 'en') parts.shift();
  return { lang, route: parsePath(parts, lang) };
}

/**
 * Links from before the site had real URLs used the hash (#property-los-laureles,
 * #compare-a,b). They still arrive from WhatsApp and email, so the site sends them to the new address.
 */
export function parseLegacyHash(hash: string): Route | null {
  let h = '';
  try { h = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  const fixed: Record<string, Route> = {
    home: { name: 'home' }, search: { name: 'search' }, calculator: { name: 'calculator' }, build: { name: 'build' },
    contact: { name: 'contact' }, projects: { name: 'projects' }, sell: { name: 'sell' }, about: { name: 'about' },
    saved: { name: 'saved' }, guides: { name: 'guides' }, panel: { name: 'panel' }, portal: { name: 'portal' },
    'portal-demo': { name: 'portal', demo: true },
  };
  if (fixed[h]) return fixed[h];
  const prefixed: [string, (rest: string) => Route][] = [
    ['property-', slug => ({ name: 'property', slug })],
    ['calculator-', slug => ({ name: 'calculator', slug })],
    ['contact-', topic => ({ name: 'contact', topic })],
    ['project-', slug => ({ name: 'project', slug })],
    ['guide-', slug => ({ name: 'guide', slug })],
    ['compare-', list => ({ name: 'saved', shared: list.split(',').filter(Boolean).slice(0, MAX_SHARED) })],
  ];
  for (const [prefix, make] of prefixed) if (h.startsWith(prefix) && h.length > prefix.length) return make(h.slice(prefix.length));
  return null;
}
