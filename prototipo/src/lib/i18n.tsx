// English / Spanish. UI strings are written inline as tx('English', 'Español') so each pair
// stays next to where it is used; data files use L = { en, es }.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'es';
export type L = { en: string; es: string };
export const pick = (v: L | string, lang: Lang) => (typeof v === 'string' ? v : v[lang]);

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tx: (en: string, es: string) => string };
const LangCtx = createContext<Ctx | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('sicr.lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-CR' : 'en';
    try { localStorage.setItem('sicr.lang', lang); } catch { /* storage unavailable */ }
  }, [lang]);
  const tx = useCallback((en: string, es: string) => (lang === 'es' ? es : en), [lang]);
  const value = useMemo(() => ({ lang, setLang: setLangState, tx }), [lang, tx]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang outside LangProvider');
  return ctx;
}
