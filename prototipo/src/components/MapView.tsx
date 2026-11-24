'use client';
// Real map (MapLibre GL with OpenFreeMap's open tiles, no key needed). Listings are price pins,
// or dots on the small maps; extra points (the office, a project) are labelled dots. The map
// library loads only when a map is on the page, and the view fits whatever is shown.
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { Property } from '../data/properties';
import { localize } from '../data/properties.es';
import { moneyShort } from '../lib/format';
import { useLang } from '../lib/i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price } from './Basics';
import { IconArrow, IconClose } from './Icons';

const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const CENTER: [number, number] = [-84.16, 9.96];
const SJO: [number, number] = [-84.2088, 9.9939];

type Point = { id: string; label: string; lat: number; lng: number; showLabel?: boolean };
type Props = {
  items: Property[];
  /** Extra labelled dots that are not listings (for example, a project's location). */
  points?: Point[];
  active?: string | null;
  onHover?: (slug: string | null) => void;
  mini?: boolean;
  className?: string;
};

const es = {
  'NavigationControl.ZoomIn': 'Acercar',
  'NavigationControl.ZoomOut': 'Alejar',
  'AttributionControl.ToggleAttribution': 'Ver créditos del mapa',
  'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + rueda del mouse para acercar el mapa',
  'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + desplazamiento para acercar el mapa',
  'CooperativeGesturesHandler.MobileHelpText': 'Use dos dedos para mover el mapa',
};

/** Tints the light base map toward the site's palette (water, parks, background). */
function tint(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#EEF1EC');
      else if (layer.type === 'fill' && id.includes('water')) map.setPaintProperty(layer.id, 'fill-color', '#CBDCD6');
      else if (layer.type === 'fill' && /park|wood|forest|grass|landcover/.test(id)) map.setPaintProperty(layer.id, 'fill-color', '#DDE7DA');
    } catch { /* a layer without that property */ }
  }
}

export function MapView({ items, points = [], active, onHover, mini, className }: Props) {
  const { currency, rate } = useStore();
  const { navigate } = useRouter();
  const { lang, tx } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const lib = useRef<typeof import('maplibre-gl') | null>(null);
  const markers = useRef(new Map<string, HTMLElement>());
  const placed = useRef<Marker[]>([]);
  const fitted = useRef(false);
  const hover = useRef(onHover);
  hover.current = onHover;
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // What is drawn, as one key, so pins are rebuilt only when it really changes.
  const key = useMemo(
    () => JSON.stringify([items.map(p => [p.slug, p.priceUsd]), points.map(p => [p.id, p.lat, p.lng, p.label, !!p.showLabel]), currency, rate, mini, lang]),
    [items, points, currency, rate, mini, lang],
  );
  const latest = useRef({ items, points });
  latest.current = { items, points };

  // Create the map once (again if the language changes, for the control labels).
  useEffect(() => {
    let cancelled = false;
    let instance: MapLibreMap | undefined;
    import('maplibre-gl')
      .then(ml => {
        if (cancelled || !box.current) return;
        lib.current = ml;
        // The worker is served from public/maplibre (scripts/copy-map-worker.mjs).
        ml.setWorkerUrl(`/maplibre/worker-${ml.getVersion()}.mjs`);
        instance = new ml.Map({
          container: box.current,
          style: STYLE,
          center: CENTER,
          zoom: 10.6,
          attributionControl: { compact: true },
          cooperativeGestures: !!mini,
          dragRotate: false,
          touchPitch: false,
          ...(lang === 'es' ? { locale: es } : null),
        });
        instance.touchZoomRotate.disableRotation();
        instance.keyboard.disableRotation();
        if (!mini) instance.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
        // Pins can go on right away; the base map fades in once its style has arrived.
        instance.on('style.load', () => { if (!cancelled && instance) { tint(instance); setShown(true); } });
        instance.on('click', () => setSelected(null));
        map.current = instance;
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
      markers.current.clear();
      placed.current = [];
      fitted.current = false;
      setReady(false);
      setShown(false);
    };
  }, [mini, lang]);

  // Pins and dots, then fit the view to them.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml) return;
    const { items: list, points: extra } = latest.current;
    placed.current.forEach(mk => mk.remove());
    placed.current = [];
    markers.current.clear();

    const place = (el: HTMLElement, at: [number, number], anchor: 'bottom' | 'center') => {
      placed.current.push(new ml.Marker({ element: el, anchor }).setLngLat(at).addTo(m));
    };

    for (const p of list) {
      const price = moneyShort(p.priceUsd, currency, rate);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = mini ? 'mpin mpin-dot' : 'mpin';
      el.setAttribute('aria-label', `${p.title}, ${price}`);
      if (mini) el.tabIndex = -1;
      else el.textContent = price;
      el.addEventListener('mouseenter', () => hover.current?.(p.slug));
      el.addEventListener('mouseleave', () => hover.current?.(null));
      el.addEventListener('click', e => { e.stopPropagation(); if (!mini) setSelected(p.slug); });
      markers.current.set(p.slug, el);
      place(el, [p.lng, p.lat], mini ? 'center' : 'bottom');
    }
    for (const pt of extra) {
      const el = document.createElement('span');
      el.className = 'mpin-point';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', pt.label);
      el.innerHTML = '<span class="mpin-point-dot"></span>';
      if (pt.showLabel) {
        const label = document.createElement('span');
        label.className = 'mpin-point-label';
        label.textContent = pt.label;
        el.appendChild(label);
      }
      place(el, [pt.lng, pt.lat], 'center');
    }
    if (!mini) {
      const el = document.createElement('span');
      el.className = 'mpin-place';
      el.textContent = 'SJO';
      el.setAttribute('aria-hidden', 'true');
      place(el, SJO, 'center');
    }

    const coords: [number, number][] = [...list.map(p => [p.lng, p.lat] as [number, number]), ...extra.map(p => [p.lng, p.lat] as [number, number])];
    const fit = (duration: number) => {
      const { clientWidth: w, clientHeight: h } = m.getContainer();
      if (w < 60 || h < 60) return; // hidden (the list view on phones); fitted again when shown
      if (coords.length === 1) m.easeTo({ center: coords[0], zoom: mini ? 13.5 : 13, duration });
      else if (coords.length > 1) {
        const bounds = new ml.LngLatBounds(coords[0], coords[0]);
        coords.forEach(c => bounds.extend(c));
        m.fitBounds(bounds, { padding: mini ? 36 : { top: 70, bottom: 50, left: 50, right: 50 }, maxZoom: 14, duration });
      }
    };
    fit(fitted.current ? 600 : 0);
    fitted.current = true;
    // When a hidden map is shown (phones switch between list and map), frame the pins again.
    let wasHidden = m.getContainer().clientWidth < 60;
    const onResize = () => {
      const hidden = m.getContainer().clientWidth < 60;
      if (wasHidden && !hidden) fit(0);
      wasHidden = hidden;
    };
    m.on('resize', onResize);
    return () => { m.off('resize', onResize); };
  }, [ready, key, currency, rate, mini]);

  // Highlight the pin of the card under the pointer, or the one opened.
  useEffect(() => {
    for (const [slug, el] of markers.current) {
      const on = slug === active || slug === selected;
      el.classList.toggle('is-active', on);
      const wrapper = el.closest<HTMLElement>('.maplibregl-marker') ?? el;
      wrapper.style.zIndex = on ? '3' : '';
    }
  }, [active, selected, ready, key]);

  const found = items.find(p => p.slug === selected);
  const sel = found && localize(found, lang);

  return (
    <div className={`map ${mini ? 'map-mini' : ''} ${shown ? 'is-ready' : ''} ${className ?? ''}`}>
      <div ref={box} className="map-canvas" aria-label={tx('Map', 'Mapa')} role="region" />
      {failed && <p className="map-failed">{tx('The map could not load here.', 'No se pudo cargar el mapa aquí.')}</p>}

      <AnimatePresence>
        {sel && !mini && (
          <motion.div
            key={sel.slug}
            className="map-pop"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <button type="button" className="map-pop-close" aria-label={tx('Close', 'Cerrar')} onClick={() => setSelected(null)}><IconClose size={16} /></button>
            <Img name={sel.photos[0]} alt={sel.title} />
            <div className="map-pop-body">
              <strong>{sel.title}</strong>
              <span>{sel.district}, {sel.canton}</span>
              <Price usd={sel.priceUsd} prefix={sel.priceNote} className="map-pop-price" />
              <button type="button" className="link-btn" onClick={() => navigate({ name: 'property', slug: sel.slug })}>{tx('View property', 'Ver propiedad')} <IconArrow size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!mini && <p className="map-note">{tx('Approximate locations', 'Ubicaciones aproximadas')}</p>}
    </div>
  );
}
