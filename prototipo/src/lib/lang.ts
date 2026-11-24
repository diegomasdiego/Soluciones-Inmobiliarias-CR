// Languages, shared by server and browser code. English lives at the root (/properties),
// Spanish under /es (/es/propiedades). UI strings are written inline as tx('English', 'Español');
// data files use L = { en, es }.
export type Lang = 'en' | 'es';
export type L = { en: string; es: string };

export const LANGS: Lang[] = ['en', 'es'];
export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'es';
export const pick = (v: L | string, lang: Lang) => (typeof v === 'string' ? v : v[lang]);
export const htmlLang = (lang: Lang) => (lang === 'es' ? 'es-CR' : 'en');
export const ogLocale = (lang: Lang) => (lang === 'es' ? 'es_CR' : 'en_US');

/** Set when the visitor picks a language, so the home page stops following the browser's. */
export const LANG_COOKIE = 'sicr_lang';
