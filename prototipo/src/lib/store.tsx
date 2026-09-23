// App-wide state: currency, saved properties, the current search and a small toast queue.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { company } from '../data/company';
import type { Currency } from './format';
import { emptyFilters, parseQuery, type Filters, type Sort } from './search';

type Store = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number;
  saved: string[];
  toggleSaved: (slug: string) => boolean;
  filters: Filters;
  setFilters: (f: Filters) => void;
  /** Free-text query from the smart search; its "understood" chips are derived per language. */
  query: string;
  runQuery: (q: string) => void;
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

  const runQuery = useCallback((q: string) => {
    const { filters: f } = parseQuery(q);
    setQuery(q);
    setFilters(f);
    setSort(f.investment ? 'yield' : 'featured');
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setFilters(emptyFilters);
  }, []);

  const value = useMemo<Store>(() => ({
    currency, setCurrency: setCurrencyState, rate: company.exchangeRate,
    saved, toggleSaved, filters, setFilters, query, runQuery, clearQuery, sort, setSort, toast, notify,
  }), [currency, saved, toggleSaved, filters, query, runQuery, clearQuery, sort, toast, notify]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
