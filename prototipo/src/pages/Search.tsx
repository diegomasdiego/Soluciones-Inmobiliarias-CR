import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { areaList, properties, typeList, type Area, type PropertyType } from '../data/properties';
import { activeFilterCount, applyFilters, emptyFilters, explainMatch, type Filters, type Sort } from '../lib/search';
import { useStore } from '../lib/store';
import { AISearch } from '../components/AISearch';
import { IconClose, IconList, IconMap, IconSpark } from '../components/Icons';
import { MapView } from '../components/MapView';
import { PropertyCard } from '../components/PropertyCard';

const priceSteps = [150000, 250000, 350000, 450000, 500000];
const toggles: { key: keyof Filters; label: string }[] = [
  { key: 'residency', label: 'Residency-eligible' },
  { key: 'investment', label: 'Rental yield 6.5%+' },
  { key: 'pool', label: 'Pool' },
  { key: 'view', label: 'View' },
  { key: 'nearSchools', label: 'Near schools' },
  { key: 'nearAirport', label: 'Near SJO' },
];

export default function Search() {
  const { filters, setFilters, understood, clearQuery, sort, setSort, query } = useStore();
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const results = useMemo(() => applyFilters(properties, filters, sort), [filters, sort]);
  const hasAI = understood.length > 0;

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const setF = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  return (
    <div className="search-page">
      <div className="search-top wrap-wide">
        <div className="search-title">
          <p className="eyebrow">Properties for sale · Central Valley</p>
          <h1 className="h2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={results.length} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="count">{results.length}</motion.span>
            </AnimatePresence>{' '}
            {results.length === 1 ? 'property' : 'properties'}
          </h1>
        </div>
        <AISearch variant="inline" id="search-ai" />
      </div>

      {hasAI && (
        <div className="wrap-wide understood" aria-live="polite">
          <IconSpark size={16} />
          <span>Understood{query ? <> “{query}” as</> : ''}:</span>
          {understood.map(u => <span key={u} className="chip chip-accent">{u}</span>)}
          <button type="button" className="chip chip-clear" onClick={clearQuery}><IconClose size={14} /> Clear</button>
        </div>
      )}

      <div className="wrap-wide filters" role="group" aria-label="Filters">
        <div className="filter-group" role="group" aria-label="Property type">
          {typeList.map(t => (
            <button key={t} type="button" className="chip" aria-pressed={filters.types.includes(t)} onClick={() => setF({ types: toggleIn<PropertyType>(filters.types, t) })}>{t}</button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label="Area">
          {areaList.map(a => (
            <button key={a} type="button" className="chip" aria-pressed={filters.areas.includes(a)} onClick={() => setF({ areas: toggleIn<Area>(filters.areas, a) })}>{a}</button>
          ))}
        </div>
        <div className="filter-selects">
          <label className="select-wrap">
            <span>Max price</span>
            <select value={filters.maxPrice ?? ''} onChange={e => setF({ maxPrice: e.target.value ? +e.target.value : undefined })}>
              <option value="">Any</option>
              {priceSteps.map(v => <option key={v} value={v}>${v / 1000}k</option>)}
              {filters.maxPrice && !priceSteps.includes(filters.maxPrice) && <option value={filters.maxPrice}>${Math.round(filters.maxPrice / 1000)}k</option>}
            </select>
          </label>
          <label className="select-wrap">
            <span>Bedrooms</span>
            <select value={filters.minBeds ?? ''} onChange={e => setF({ minBeds: e.target.value ? +e.target.value : undefined })}>
              <option value="">Any</option>
              {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v}+</option>)}
            </select>
          </label>
          <label className="select-wrap">
            <span>Sort</span>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="yield">Rental yield</option>
            </select>
          </label>
        </div>
        <div className="filter-group" role="group" aria-label="Features">
          {toggles.map(t => (
            <button key={t.key} type="button" className="chip chip-soft" aria-pressed={!!filters[t.key]} onClick={() => setF({ [t.key]: filters[t.key] ? undefined : true })}>{t.label}</button>
          ))}
          {activeFilterCount(filters) > 0 && (
            <button type="button" className="chip chip-clear" onClick={() => { setFilters(emptyFilters); clearQuery(); }}>Reset all</button>
          )}
        </div>
      </div>

      <div className="view-toggle" role="group" aria-label="View">
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><IconList size={16} /> List</button>
        <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}><IconMap size={16} /> Map</button>
      </div>

      <div className={`wrap-wide search-body show-${view}`}>
        <div className="search-list">
          {results.length === 0 ? (
            <div className="empty">
              <h2 className="h3">Nothing matches all of that — yet.</h2>
              <p>Remove a filter, or tell an advisor what you need: many properties are sold before they’re listed.</p>
              <button type="button" className="btn btn-ghost" onClick={() => { setFilters(emptyFilters); clearQuery(); }}>Show all properties</button>
            </div>
          ) : (
            <motion.div layout className="card-grid card-grid-2">
              <AnimatePresence mode="popLayout">
                {results.map(p => (
                  <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                    <PropertyCard p={p} active={hover === p.slug} onHover={setHover} note={explainMatch(p, filters) || undefined} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <aside className="search-map" aria-label="Map of results">
          <MapView items={results} active={hover} onHover={setHover} />
        </aside>
      </div>
    </div>
  );
}
