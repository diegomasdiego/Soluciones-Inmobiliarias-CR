'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { areaList, typeList, type Area, type PropertyType } from '../data/properties';
import { useProperties } from '../lib/data';
import { localize, typeLabel } from '../data/properties.es';
import { useLang } from '../lib/i18n';
import { activeFilterCount, applyFilters, describeFilters, emptyFilters, explainMatch, type Filters, type Sort } from '../lib/search';
import { useStore } from '../lib/store';
import { AISearch } from '../components/AISearch';
import { IconClose, IconList, IconMap, IconSpark } from '../components/Icons';
import { MapView } from '../components/MapView';
import { PropertyCard } from '../components/PropertyCard';

const priceSteps = [150000, 250000, 350000, 450000, 500000];
const NO_RANK: string[] = [];

export default function Search() {
  const { filters, setFilters, clearQuery, sort, setSort, query, interpretation } = useStore();
  const { lang, tx } = useLang();
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const { properties } = useProperties();
  const interp = query ? interpretation : null;
  const rank = interp?.rank ?? NO_RANK;
  const results = useMemo(() => applyFilters(properties, filters, sort, rank), [properties, filters, sort, rank]);
  const fromAi = interp?.source === 'ai';
  // Reasons and the note come in the language of the search; after a language switch the cards fall back to the built-in notes.
  const aiText = fromAi && interp.lang === lang;
  const understood = useMemo(() => (interp ? describeFilters(interp.filters, lang) : []), [interp, lang]);
  const wishes = fromAi ? interp.preferences.map(p => p[lang]) : [];
  const note = aiText ? interp.note : '';

  const toggles: { key: keyof Filters; label: string }[] = [
    { key: 'residency', label: tx('Residency-eligible', 'Apta para residencia') },
    { key: 'investment', label: tx('Rental yield 6.5%+', 'Rentabilidad 6,5%+') },
    { key: 'pool', label: tx('Pool', 'Piscina') },
    { key: 'view', label: tx('View', 'Vista') },
    { key: 'nearSchools', label: tx('Near schools', 'Cerca de escuelas') },
    { key: 'nearAirport', label: tx('Near SJO', 'Cerca del SJO') },
  ];

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const setF = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const resetAll = () => { setFilters(emptyFilters); clearQuery(); };

  return (
    <div className="search-page">
      <div className="search-top wrap-wide">
        <div className="search-title">
          <p className="eyebrow">{tx('Properties for sale · Central Valley', 'Propiedades en venta · Valle Central')}</p>
          <h1 className="h2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={results.length} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="count">{results.length}</motion.span>
            </AnimatePresence>{' '}
            {results.length === 1 ? tx('property', 'propiedad') : tx('properties', 'propiedades')}
          </h1>
        </div>
        <AISearch variant="inline" id="search-ai" />
      </div>

      {interp && (
        <div className="wrap-wide understood" aria-live="polite" aria-busy={interp.pending}>
          <IconSpark size={16} />
          <span>{understood.length + wishes.length === 0
            ? tx(`Results for “${query}”`, `Resultados para “${query}”`)
            : fromAi
              ? tx(`The AI read “${query}” as:`, `La IA entendió “${query}” como:`)
              : tx(`Understood “${query}” as:`, `Entendimos “${query}” como:`)}</span>
          {understood.map(u => <span key={u} className="chip chip-accent">{u}</span>)}
          {wishes.map(u => <span key={`w-${u}`} className="chip chip-wish">{u}</span>)}
          {interp.pending && (
            <span className="chip chip-thinking"><span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span>{tx('Refining with AI', 'Afinando con IA')}</span>
          )}
          <button type="button" className="chip chip-clear" onClick={clearQuery}><IconClose size={14} /> {tx('Clear', 'Borrar')}</button>
        </div>
      )}
      {note && <p className="wrap-wide ai-note">{note}</p>}

      <div className="wrap-wide filters" role="group" aria-label={tx('Filters', 'Filtros')}>
        <div className="filter-group" role="group" aria-label={tx('Property type', 'Tipo de propiedad')}>
          {typeList.map(t => (
            <button key={t} type="button" className="chip" aria-pressed={filters.types.includes(t)} onClick={() => setF({ types: toggleIn<PropertyType>(filters.types, t) })}>{typeLabel(t, lang)}</button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label={tx('Area', 'Zona')}>
          {areaList.map(a => (
            <button key={a} type="button" className="chip" aria-pressed={filters.areas.includes(a)} onClick={() => setF({ areas: toggleIn<Area>(filters.areas, a) })}>{a}</button>
          ))}
        </div>
        <div className="filter-selects">
          <label className="select-wrap">
            <span>{tx('Max price', 'Precio máximo')}</span>
            <select value={filters.maxPrice ?? ''} onChange={e => setF({ maxPrice: e.target.value ? +e.target.value : undefined })}>
              <option value="">{tx('Any', 'Cualquiera')}</option>
              {priceSteps.map(v => <option key={v} value={v}>${v / 1000}k</option>)}
              {filters.maxPrice && !priceSteps.includes(filters.maxPrice) && <option value={filters.maxPrice}>${Math.round(filters.maxPrice / 1000)}k</option>}
            </select>
          </label>
          <label className="select-wrap">
            <span>{tx('Bedrooms', 'Habitaciones')}</span>
            <select value={filters.minBeds ?? ''} onChange={e => setF({ minBeds: e.target.value ? +e.target.value : undefined })}>
              <option value="">{tx('Any', 'Cualquiera')}</option>
              {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v}+</option>)}
            </select>
          </label>
          <label className="select-wrap">
            <span>{tx('Sort', 'Ordenar')}</span>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)}>
              {rank.length > 0 && <option value="match">{tx('Best match', 'Mejor coincidencia')}</option>}
              <option value="featured">{tx('Featured', 'Destacadas')}</option>
              <option value="price-asc">{tx('Price, low to high', 'Precio, de menor a mayor')}</option>
              <option value="price-desc">{tx('Price, high to low', 'Precio, de mayor a menor')}</option>
              <option value="yield">{tx('Rental yield', 'Rentabilidad')}</option>
            </select>
          </label>
        </div>
        <div className="filter-group" role="group" aria-label={tx('Features', 'Características')}>
          {toggles.map(t => (
            <button key={t.key} type="button" className="chip chip-soft" aria-pressed={!!filters[t.key]} onClick={() => setF({ [t.key]: filters[t.key] ? undefined : true })}>{t.label}</button>
          ))}
          {activeFilterCount(filters) > 0 && (
            <button type="button" className="chip chip-clear" onClick={resetAll}>{tx('Reset all', 'Quitar filtros')}</button>
          )}
        </div>
      </div>

      <div className="view-toggle" role="group" aria-label={tx('View', 'Vista')}>
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><IconList size={16} /> {tx('List', 'Lista')}</button>
        <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}><IconMap size={16} /> {tx('Map', 'Mapa')}</button>
      </div>

      <div className={`wrap-wide search-body show-${view}`}>
        <div className="search-list">
          {results.length === 0 ? (
            <div className="empty">
              <h2 className="h3">{tx('Nothing matches all of that — yet.', 'Nada coincide con todo eso, por ahora.')}</h2>
              <p>{tx(
                'Remove a filter, or tell an advisor what you need: many properties are sold before they’re listed.',
                'Quite un filtro o cuéntele a un asesor lo que necesita: muchas propiedades se venden antes de publicarse.',
              )}</p>
              <button type="button" className="btn btn-ghost" onClick={resetAll}>{tx('Show all properties', 'Ver todas las propiedades')}</button>
            </div>
          ) : (
            <motion.div layout className="card-grid card-grid-2">
              <AnimatePresence mode="popLayout">
                {results.map(p => {
                  const reason = aiText ? interp.reasons[p.slug] : undefined;
                  return (
                    <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                      <PropertyCard p={p} active={hover === p.slug} onHover={setHover} note={reason || explainMatch(localize(p, lang), filters, lang) || undefined} noteAi={!!reason} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <aside className="search-map" aria-label={tx('Map of results', 'Mapa de resultados')}>
          <MapView items={results} active={hover} onHover={setHover} />
        </aside>
      </div>
    </div>
  );
}
