import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '../lib/i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { IconArrow, IconSpark } from './Icons';

const examples = {
  en: [
    '3 bedrooms in Escazú under $500k near schools',
    'Condo near the airport I can rent out',
    'Lot with a view to build on',
    'Farm with water in Alajuela',
    'House with a pool in Santa Ana under $500k',
  ],
  es: [
    'Casa de 3 habitaciones en Escazú hasta 500 mil cerca de escuelas',
    'Apartamento cerca del aeropuerto para alquilar',
    'Lote con vista para construir',
    'Finca con agua en Alajuela',
    'Casa con piscina en Santa Ana, menos de 500 mil',
  ],
};

const chips = {
  en: [
    { label: 'Family home near schools', q: '3 bedrooms under $500k near schools' },
    { label: 'Rental investment', q: 'Condo I can rent out, good yield' },
    { label: 'Qualifies for residency', q: 'Home that qualifies me for investor residency' },
    { label: 'Land to build', q: 'Lot with a view to build' },
  ],
  es: [
    { label: 'Casa familiar cerca de escuelas', q: 'Casa de 3 habitaciones hasta 500 mil cerca de escuelas' },
    { label: 'Inversión para alquilar', q: 'Apartamento para alquilar con buena rentabilidad' },
    { label: 'Califica para residencia', q: 'Casa que califique para residencia de inversionista' },
    { label: 'Terreno para construir', q: 'Lote con vista para construir' },
  ],
};

export function AISearch({ variant = 'hero', id = 'ai-search' }: { variant?: 'hero' | 'inline'; id?: string }) {
  const { query, runQuery } = useStore();
  const { route, navigate } = useRouter();
  const { lang, tx } = useLang();
  const [value, setValue] = useState(variant === 'inline' ? query : '');
  const [hint, setHint] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { if (variant === 'inline') setValue(query); }, [query, variant]);
  useEffect(() => {
    const t = window.setInterval(() => setHint(h => (h + 1) % examples.en.length), 3600);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => setError(''), [lang]);

  const submit = (q: string) => {
    const s = q.trim();
    if (!s) { setError(tx('Describe what you are looking for, or pick a suggestion.', 'Describa lo que busca, o escoja una sugerencia.')); return; }
    setError('');
    runQuery(s);
    if (route.name !== 'search') navigate({ name: 'search' });
  };

  return (
    <div className={`ai ai-${variant}`}>
      <form className="ai-box" role="search" onSubmit={e => { e.preventDefault(); submit(value); }}>
        <IconSpark size={20} className="ai-icon" />
        <label htmlFor={id} className="sr-only">{tx('Describe the property you are looking for', 'Describa la propiedad que busca')}</label>
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
                key={`${lang}-${hint}`}
                className="ai-placeholder"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                aria-hidden="true"
              >
                {examples[lang][hint]}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
        <button type="submit" className="ai-go">
          <span>{tx('Search', 'Buscar')}</span><IconArrow size={18} />
        </button>
      </form>
      {error && <p className="ai-error" id={`${id}-err`} role="alert">{error}</p>}
      {variant === 'hero' && (
        <div className="ai-chips" aria-label={tx('Suggestions', 'Sugerencias')}>
          {chips[lang].map(c => (
            <button key={c.label} type="button" onClick={() => { setValue(c.q); submit(c.q); }}>{c.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
