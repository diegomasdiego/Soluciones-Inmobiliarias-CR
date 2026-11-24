'use client';
// English / Spanish in the browser. The language comes from the URL (/es/... is Spanish); switching
// it goes to the same page in the other language and remembers the choice in a cookie.
// Server code imports the plain helpers from ./lang instead.
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LANG_COOKIE, type Lang } from './lang';
import { fromPathname, toPath } from './routes';

export { pick, type L, type Lang } from './lang';

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tx: (en: string, es: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setLang = useCallback((next: Lang) => {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const { route } = fromPathname(pathname ?? '/');
    router.push(toPath(route ?? { name: 'home' }, next) + window.location.search, { scroll: false });
  }, [lang, pathname, router]);
  const tx = useCallback((en: string, es: string) => (lang === 'es' ? es : en), [lang]);
  const value = useMemo(() => ({ lang, setLang, tx }), [lang, setLang, tx]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang outside LangProvider');
  return ctx;
}
