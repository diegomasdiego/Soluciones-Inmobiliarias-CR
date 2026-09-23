import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { IconArrow, IconSpark } from './Icons';

const examples = [
  '3 bedrooms in Santa Ana under $450k near schools',
  'Condo near the airport I can rent out',
  'Lot with a view to build my own house',
  'Farm with water in Alajuela',
  'Casa con piscina en Escazú, menos de 500 mil',
];

const chips = [
  { label: 'Family home near schools', q: '3 bedrooms under $500k near schools' },
  { label: 'Rental investment', q: 'Condo I can rent out, good yield' },
  { label: 'Qualifies for residency', q: 'Home that qualifies me for investor residency' },
  { label: 'Land to build', q: 'Lot with a view to build' },
];

export function AISearch({ variant = 'hero', id = 'ai-search' }: { variant?: 'hero' | 'inline'; id?: string }) {
  const { query, runQuery } = useStore();
  const { route, navigate } = useRouter();
  const [value, setValue] = useState(variant === 'inline' ? query : '');
  const [hint, setHint] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { if (variant === 'inline') setValue(query); }, [query, variant]);
  useEffect(() => {
    const t = window.setInterval(() => setHint(h => (h + 1) % examples.length), 3600);
    return () => window.clearInterval(t);
  }, []);

  const submit = (q: string) => {
    const s = q.trim();
    if (!s) { setError('Describe what you are looking for, or pick a suggestion.'); return; }
    setError('');
    runQuery(s);
    if (route.name !== 'search') navigate({ name: 'search' });
  };

  return (
    <div className={`ai ai-${variant}`}>
      <form
        className="ai-box"
        role="search"
        onSubmit={e => { e.preventDefault(); submit(value); }}
      >
        <IconSpark size={20} className="ai-icon" />
        <label htmlFor={id} className="sr-only">Describe the property you are looking for</label>
        <div className="ai-field">
          <input
            id={id}
            value={value}
            onChange={e => { setValue(e.target.value); if (error) setError(''); }}
            autoComplete="off"
            aria-describedby={error ? `${id}-err` : undefined}
          />
          {!value && (
            <AnimatePresence mode="wait">
              <motion.span
                key={hint}
                className="ai-placeholder"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                aria-hidden="true"
              >
                {examples[hint]}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
        <button type="submit" className="ai-go">
          <span>Search</span><IconArrow size={18} />
        </button>
      </form>
      {error && <p className="ai-error" id={`${id}-err`} role="alert">{error}</p>}
      {variant === 'hero' && (
        <div className="ai-chips" aria-label="Suggestions">
          {chips.map(c => (
            <button key={c.label} type="button" onClick={() => { setValue(c.q); submit(c.q); }}>{c.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
