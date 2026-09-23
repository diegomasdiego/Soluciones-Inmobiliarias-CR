// Illustrated map of the western Central Valley. Pins are HTML (crisp text), roads are SVG,
// terrain is the contour-line motif. Positions use a simple lat/lng projection.
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Property } from '../data/properties';
import { moneyShort } from '../lib/format';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price } from './Basics';
import { IconArrow, IconClose, IconPlane } from './Icons';
import { Topo, type TopoCenter } from './Topo';

const B = { latMax: 10.065, latMin: 9.885, lngMin: -84.285, lngMax: -84.065 };
export const project = (lat: number, lng: number) => ({
  x: ((lng - B.lngMin) / (B.lngMax - B.lngMin)) * 100,
  y: ((B.latMax - lat) / (B.latMax - B.latMin)) * 100,
});

const roads: { name: string; major?: boolean; pts: [number, number][] }[] = [
  { name: 'Ruta 27', major: true, pts: [[9.935, -84.065], [9.938, -84.1], [9.942, -84.135], [9.947, -84.16], [9.95, -84.175], [9.94, -84.19], [9.93, -84.215], [9.92, -84.24], [9.912, -84.265], [9.905, -84.285]] },
  { name: 'Ruta 1', major: true, pts: [[9.938, -84.07], [9.955, -84.1], [9.965, -84.13], [9.975, -84.16], [9.985, -84.185], [9.995, -84.205], [10.008, -84.215], [10.02, -84.222], [10.035, -84.24], [10.05, -84.26], [10.065, -84.28]] },
  { name: 'Ruta 3', pts: [[9.945, -84.07], [9.965, -84.09], [9.985, -84.105], [9.998, -84.117], [10.012, -84.13], [10.02, -84.16], [10.018, -84.205]] },
  { name: 'Ruta 121', pts: [[9.925, -84.12], [9.919, -84.14], [9.922, -84.16], [9.932, -84.182], [9.925, -84.21]] },
  { name: 'Ruta 122', pts: [[9.999, -84.117], [10.03, -84.11], [10.065, -84.1]] },
];

const places: { name: string; lat: number; lng: number; big?: boolean }[] = [
  { name: 'San José', lat: 9.931, lng: -84.083, big: true },
  { name: 'Escazú', lat: 9.912, lng: -84.14, big: true },
  { name: 'Santa Ana', lat: 9.925, lng: -84.19, big: true },
  { name: 'Ciudad Colón', lat: 9.905, lng: -84.245 },
  { name: 'Belén', lat: 9.984, lng: -84.172 },
  { name: 'Heredia', lat: 10.006, lng: -84.12, big: true },
  { name: 'Alajuela', lat: 10.024, lng: -84.214, big: true },
  { name: 'Cerros de Escazú', lat: 9.892, lng: -84.13 },
];

const terrain: TopoCenter[] = [
  { x: 0.66, y: 1.1, rings: 18, spacing: 30, seed: 1.2 },
  { x: 0.8, y: -0.3, rings: 22, spacing: 34, seed: 2.6 },
  { x: 0.18, y: -0.45, rings: 24, spacing: 34, seed: 0.4 },
];

type Props = {
  items: Property[];
  active?: string | null;
  onHover?: (slug: string | null) => void;
  mini?: boolean;
  className?: string;
};

export function MapView({ items, active, onHover, mini, className }: Props) {
  const { currency, rate } = useStore();
  const { navigate } = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = items.find(p => p.slug === selected);
  const airport = project(9.9939, -84.2088);

  return (
    <div className={`map ${mini ? 'map-mini' : ''} ${className ?? ''}`} onClick={() => setSelected(null)}>
      <Topo centers={terrain} color="rgba(30,74,59,.22)" className="map-topo" />
      <svg className="map-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {roads.map(r => {
          const d = r.pts.map(([la, ln], i) => { const p = project(la, ln); return `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`; }).join(' ');
          return (
            <g key={r.name}>
              <path d={d} className="road-casing" strokeWidth={r.major ? 7 : 4.5} vectorEffect="non-scaling-stroke" />
              <path d={d} className={r.major ? 'road road-major' : 'road'} strokeWidth={r.major ? 3.2 : 2} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
      {places.map(pl => {
        const p = project(pl.lat, pl.lng);
        return <span key={pl.name} className={`map-place ${pl.big ? 'is-big' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>{pl.name}</span>;
      })}
      <span className="map-airport" style={{ left: `${airport.x}%`, top: `${airport.y}%` }}><IconPlane size={14} /> SJO</span>
      <span className="map-north" aria-hidden="true">N ↑ · Poás 18 km</span>

      {items.map(p => {
        const pos = project(p.lat, p.lng);
        const isActive = active === p.slug || selected === p.slug;
        return (
          <button
            key={p.slug}
            type="button"
            className={`pin ${isActive ? 'is-active' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isActive ? 30 : 10 }}
            onMouseEnter={() => onHover?.(p.slug)}
            onMouseLeave={() => onHover?.(null)}
            onClick={e => { e.stopPropagation(); if (mini) return; setSelected(p.slug); }}
            aria-label={`${p.title}, ${moneyShort(p.priceUsd, currency, rate)}`}
          >
            {mini ? <span className="pin-dot" /> : moneyShort(p.priceUsd, currency, rate)}
          </button>
        );
      })}

      <AnimatePresence>
        {sel && !mini && (
          <motion.div
            key={sel.slug}
            className="map-pop"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={e => e.stopPropagation()}
          >
            <button type="button" className="map-pop-close" aria-label="Close" onClick={() => setSelected(null)}><IconClose size={16} /></button>
            <Img name={sel.photos[0]} alt={sel.title} />
            <div className="map-pop-body">
              <strong>{sel.title}</strong>
              <span>{sel.district}, {sel.canton}</span>
              <Price usd={sel.priceUsd} prefix={sel.priceNote} className="map-pop-price" />
              <button type="button" className="link-btn" onClick={() => navigate({ name: 'property', slug: sel.slug })}>View property <IconArrow size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!mini && <p className="map-note">Illustrated map · positions approximate</p>}
    </div>
  );
}
