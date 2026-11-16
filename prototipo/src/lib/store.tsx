// App-wide state: currency, saved properties, the current search and a small toast queue.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { company } from '../data/company';
import { aiSearch } from './data';
import type { Currency } from './format';
import type { Lang } from './i18n';
import { emptyFilters, parseQuery, type Filters, type Sort } from './search';

/** How the current query was read: by the rules at once, then (when configured) by the AI search. */
export type Interpretation = {
  /** The filters as understood when the query ran; the visitor may change the live filters afterwards. */
  filters: Filters;
  source: 'rules' | 'ai';
  /** The AI search is still working on this query. */
  pending: boolean;
  /** Language the reasons and the note were written in. */
  lang: Lang;
  /** One line per picked listing, by slug, best fit first in `rank`. */
  reasons: Record<string, string>;
  rank: string[];
  /** Soft wishes the AI used to rank that no filter expresses. */
  preferences: { en: string; es: string }[];
  note: string;
};

type Store = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number;
  saved: string[];
  toggleSaved: (slug: string) => boolean;
  /** Adds several properties at once (a shared list), keeping their order. */
  addSaved: (slugs: string[]) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  /** Free-text query from the smart search; its "understood" chips are derived per language. */
  query: string;
  interpretation: Interpretation | null;
  /** Runs a query with the rules; with `ai`, also asks the AI search and applies its answer when it arrives. */
  runQuery: (q: string, opts?: { ai?: boolean; lang?: Lang }) => void;
  clearQuery: () => void;
  sort: Sort;
  setSort: (s: Sort) => void;
  toast: string | null;
  notify: (msg: string) => void;
};

const StoreCtx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => load('sicr.currency', 'USD'));
  const [saved, setSaved] = useState<string[]>(() => load('sicr.saved', []));
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery] = useState('');
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [sort, setSort] = useState<Sort>('featured');
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => save('sicr.currency', currency), [currency]);
  useEffect(() => save('sicr.saved', saved), [saved]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleSaved = useCallback((slug: string) => {
    const adding = !saved.includes(slug);
    setSaved(prev => (adding ? [...prev.filter(s => s !== slug), slug] : prev.filter(s => s !== slug)));
    return adding;
  }, [saved]);

  const addSaved = useCallback((slugs: string[]) => {
    setSaved(prev => [...prev, ...slugs.filter((s, i) => !prev.includes(s) && slugs.indexOf(s) === i)]);
  }, []);

  // Each query gets a number, so a late AI answer for an older query is ignored.
  const seq = useRef(0);
  // The live filters, to tell whether the visitor changed them while the AI was working.
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const runQuery = useCallback((q: string, opts?: { ai?: boolean; lang?: Lang }) => {
    const id = ++seq.current;
    const lang = opts?.lang ?? 'en';
    const f = parseQuery(q);
    filtersRef.current = f;
    setQuery(q);
    setFilters(f);
    setSort(f.investment ? 'yield' : 'featured');
    setInterpretation({ filters: f, source: 'rules', pending: !!opts?.ai, lang, reasons: {}, rank: [], preferences: [], note: '' });
    if (!opts?.ai) return;

    const keepRules = () => { if (seq.current === id) setInterpretation(i => (i ? { ...i, pending: false } : i)); };
    aiSearch(q, lang).then(res => {
      if (seq.current !== id) return;
      if (res.status !== 'ok') { keepRules(); return; }
      const af: Filters = { ...res.filters, types: [...res.filters.types], areas: [...res.filters.areas] };
      // Replace the rules' filters only if the visitor hasn't touched them in the meantime.
      if (filtersRef.current === f) {
        filtersRef.current = af;
        setFilters(af);
        setSort(res.sort === 'match' && !res.picks.length ? 'featured' : res.sort);
      }
      setInterpretation({
        filters: af,
        source: 'ai',
        pending: false,
        lang,
        reasons: Object.fromEntries(res.picks.map(p => [p.slug, p.reason])),
        rank: res.picks.map(p => p.slug),
        preferences: res.preferences,
        note: res.note,
      });
    }, keepRules);
  }, []);

  const clearQuery = useCallback(() => {
    seq.current++;
    setQuery('');
    setFilters(emptyFilters);
    setInterpretation(null);
    setSort(s => (s === 'match' ? 'featured' : s));
  }, []);

  const value = useMemo<Store>(() => ({
    currency, setCurrency: setCurrencyState, rate: company.exchangeRate,
    saved, toggleSaved, addSaved, filters, setFilters, query, interpretation, runQuery, clearQuery, sort, setSort, toast, notify,
  }), [currency, saved, toggleSaved, addSaved, filters, query, interpretation, runQuery, clearQuery, sort, toast, notify]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
