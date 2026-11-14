// Sell with us (#sell): why list with us, a quick valuation by zone and m², the process and the request form.
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { sellerTestimonials, zones } from '../data/company';
import type { Property } from '../data/properties';
import { useProperties } from '../lib/data';
import { int, money } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { comparables, estimate, SIZE, type Condition, type FactorId, type LotState, type SellKind, type Valuation } from '../lib/valuation';
import { Img, Price } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconCheck, IconExcavator, IconPhotos, IconPlane, IconShield } from '../components/Icons';
import { PropertyCard } from '../components/PropertyCard';

// Chart colors checked for color-vision deficiency against the light surface (dataviz validator).
const C = { estimate: '#9A55B0', listing: '#138A5A' };
const spring = { type: 'spring', stiffness: 170, damping: 26 } as const;

type Comp = { p: Property; m2: number; perM2: number };

/** Price per m²: the zone range, the estimate band and our listings, on one axis. */
function ValueStrip({ v, comps, zoneName, hover, setHover }: { v: Valuation; comps: Comp[]; zoneName: string; hover: string | null; setHover: (s: string | null) => void }) {
  const { tx } = useLang();
  const { currency, rate } = useStore();
  const fmt = (usd: number) => money(usd, currency, rate);
  const values = [v.range[0], v.range[1], v.perM2Band[0], v.perM2Band[1], ...comps.map(c => c.perM2)];
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const pad = (maxV - minV) * 0.08;
  const d0 = Math.max(0, minV - pad);
  const d1 = maxV + pad;
  const x = (val: number) => ((val - d0) / (d1 - d0)) * 100;
  const markX = x(v.perM2);
  const h = comps.find(c => c.p.slug === hover);
  const edge = (pos: number) => (pos < 14 ? 'is-left' : pos > 86 ? 'is-right' : '');

  return (
    <figure className="vstrip">
      <div
        className="vstrip-plot"
        role="img"
        aria-label={tx(
          `Price per m²: ${zoneName} range ${fmt(v.range[0])} to ${fmt(v.range[1])}; your estimate ${fmt(v.perM2)}`,
          `Precio por m²: rango en ${zoneName} de ${fmt(v.range[0])} a ${fmt(v.range[1])}; su estimación ${fmt(v.perM2)}`,
        )}
      >
        <div className="vstrip-axis" />
        <motion.div className="vstrip-zone" initial={false} animate={{ left: `${x(v.range[0])}%`, width: `${x(v.range[1]) - x(v.range[0])}%` }} transition={spring} />
        <motion.div className="vstrip-band" style={{ background: C.estimate }} initial={false} animate={{ left: `${x(v.perM2Band[0])}%`, width: `${x(v.perM2Band[1]) - x(v.perM2Band[0])}%` }} transition={spring} />
        <motion.div className={`vstrip-mark ${edge(markX)}`} initial={false} animate={{ left: `${markX}%` }} transition={spring}>
          <span className="vstrip-mark-label mono">{fmt(v.perM2)}/m²</span>
        </motion.div>
        {comps.length > 0 && <div className="vstrip-rug" />}
        {comps.map(c => (
          <motion.span
            key={c.p.slug}
            className={`vstrip-dot ${hover === c.p.slug ? 'is-hover' : ''}`}
            style={{ background: C.listing }}
            initial={false}
            animate={{ left: `${x(c.perM2)}%` }}
            transition={spring}
            onMouseEnter={() => setHover(c.p.slug)}
            onMouseLeave={() => setHover(null)}
            aria-hidden="true"
          />
        ))}
        {h && (
          <span className={`vstrip-tip ${edge(x(h.perM2))}`} style={{ left: `${x(h.perM2)}%` }} aria-hidden="true">
            <strong>{h.p.title}</strong> {fmt(h.perM2)}/m²
          </span>
        )}
        <motion.span className="vstrip-tick mono" initial={false} animate={{ left: `${x(v.range[0])}%` }} transition={spring}>{fmt(v.range[0])}</motion.span>
        <motion.span className="vstrip-tick mono" initial={false} animate={{ left: `${x(v.range[1])}%` }} transition={spring}>{fmt(v.range[1])}</motion.span>
      </div>
      <figcaption className="vstrip-legend">
        <span><i className="sw sw-zone" />{tx(`${zoneName} range`, `Rango en ${zoneName}`)}</span>
        <span><i className="sw" style={{ background: C.estimate }} />{tx('Your estimate', 'Su estimación')}</span>
        {comps.length > 0 && <span><i className="sw sw-dot" style={{ background: C.listing }} />{tx('Our listings', 'Nuestras propiedades')}</span>}
      </figcaption>
    </figure>
  );
}

function Valuator({ onSummary, onRequest }: { onSummary: (s: string | null) => void; onRequest: () => void }) {
  const { lang, tx } = useLang();
  const { currency, rate } = useStore();
  const { properties } = useProperties();
  const [kind, setKind] = useState<SellKind>('house');
  const [zi, setZi] = useState(0);
  const [m2, setM2] = useState(SIZE.house.start);
  const [draft, setDraft] = useState(String(SIZE.house.start));
  const [condition, setCondition] = useState<Condition>('good');
  const [lotState, setLotState] = useState<LotState>('services');
  const [view, setView] = useState(false);
  const [pool, setPool] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const z = zones[zi];
  const zoneName = pick(z.name, lang);
  const lim = SIZE[kind];
  const input = { kind, m2, condition, lotState, view, pool };
  const v = estimate(z, input);
  const comps = useMemo(() => comparables(z, kind, properties), [z, kind, properties]);
  const readyGain = kind === 'lot' && lotState !== 'ready' ? estimate(z, { ...input, lotState: 'ready' }).mid - v.mid : 0;
  const fmt = (usd: number) => money(usd, currency, rate);
  const usd = (n: number) => money(n, 'USD', rate);
  const touch = <T,>(set: (x: T) => void) => (x: T) => { set(x); setTouched(true); };

  const kinds: { id: SellKind; label: string }[] = [
    { id: 'house', label: tx('House', 'Casa') },
    { id: 'condo', label: tx('Condo', 'Apartamento') },
    { id: 'lot', label: tx('Lot', 'Lote') },
  ];
  const conditions: { id: Condition; label: string }[] = [
    { id: 'new', label: tx('New or under 5 years', 'Nueva o de menos de 5 años') },
    { id: 'good', label: tx('Good, well kept', 'Buen estado') },
    { id: 'dated', label: tx('Needs updating', 'Necesita remodelación') },
  ];
  const lotStates: { id: LotState; label: string }[] = [
    { id: 'ready', label: tx('Ready to build: services and a level pad', 'Listo para construir: servicios y terraza nivelada') },
    { id: 'services', label: tx('Services at the street, needs earthworks', 'Servicios en la calle, necesita movimiento de tierras') },
    { id: 'raw', label: tx('Raw land, no services yet', 'Terreno en bruto, sin servicios') },
  ];
  const sizeLabel = kind === 'house' ? tx('Built area', 'Área construida') : kind === 'condo' ? tx('Unit area', 'Área del apartamento') : tx('Lot size', 'Tamaño del lote');
  const perLabel = kind === 'lot' ? tx('per m² of land', 'por m² de terreno') : tx('per m² built', 'por m² construido');
  const kindLabel = kinds.find(k => k.id === kind)!.label;
  const stateLabel = kind === 'lot' ? lotStates.find(s => s.id === lotState)!.label : conditions.find(s => s.id === condition)!.label;

  const factorLabel = (id: FactorId, effect: number) => {
    switch (id) {
      case 'condition':
      case 'state': return stateLabel;
      case 'size': return effect > 0
        ? tx(`${int(m2)} m², smaller than typical: more per m²`, `${int(m2)} m², menor que lo usual: más por m²`)
        : tx(`${int(m2)} m², larger than typical: less per m²`, `${int(m2)} m², mayor que lo usual: menos por m²`);
      case 'view': return tx('Open view', 'Vista abierta');
      case 'pool': return tx('Pool', 'Piscina');
    }
  };
  const signed = (e: number) => `${e >= 0 ? '+' : '−'}${Math.abs(Math.round(e * 100))}%`;

  // What the advisor reads with the request, always in USD.
  const summary = [
    tx('Valuation', 'Valoración'),
    `${kindLabel} · ${zoneName} · ${int(m2)} m² · ${stateLabel.split(':')[0].toLowerCase()}`
      + (view ? ` · ${tx('view', 'vista')}` : '') + (pool && kind === 'house' ? ` · ${tx('pool', 'piscina')}` : ''),
    `≈ ${usd(v.low)}–${usd(v.high)}`,
  ].join(': ').replace(/: ≈/, ' → ≈');
  useEffect(() => onSummary(touched ? summary : null), [touched, summary, onSummary]);

  const setKindAndSize = (k: SellKind) => {
    setKind(k);
    setM2(SIZE[k].start);
    setDraft(String(SIZE[k].start));
    setTouched(true);
    setHover(null);
  };
  const setSize = (n: number) => { setM2(n); setDraft(String(n)); setTouched(true); };

  return (
    <div className="valuator">
      <form className="val-inputs" onSubmit={e => e.preventDefault()}>
        <fieldset>
          <legend>{tx('Property type', 'Tipo de propiedad')}</legend>
          <div className="seg seg-wide" role="group" aria-label={tx('Property type', 'Tipo de propiedad')}>
            {kinds.map(k => (
              <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKindAndSize(k.id)}><span className="seg-label">{k.label}</span></button>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>{tx('Area', 'Zona')}</legend>
          <div className="radio-row">
            {zones.map((zz, i) => (
              <label key={zz.photo} className={`radio ${zi === i ? 'is-on' : ''}`}>
                <input type="radio" name="val-zone" value={i} checked={zi === i} onChange={() => touch(setZi)(i)} />
                {pick(zz.name, lang)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="val-m2">{sizeLabel}</label>
          <div className="val-size">
            <input type="range" min={lim.min} max={lim.max} step={lim.step} value={m2} onChange={e => setSize(+e.target.value)} aria-label={sizeLabel} />
            <span className="val-size-num">
              <input
                id="val-m2"
                type="number"
                inputMode="numeric"
                min={lim.min}
                max={lim.max}
                value={draft}
                onChange={e => {
                  setDraft(e.target.value);
                  const n = Math.round(+e.target.value);
                  if (n >= lim.min && n <= lim.max) { setM2(n); setTouched(true); }
                }}
                onBlur={() => setDraft(String(m2))}
              />
              <span className="mono">m²</span>
            </span>
          </div>
          {kind === 'lot' && <span className="fine">{tx('Over 1 hectare? Farms are valued with a visit.', '¿Más de una hectárea? Las fincas se valoran con una visita.')}</span>}
        </div>
        <fieldset className="field">
          <legend>{kind === 'lot' ? tx('Lot condition', 'Estado del lote') : tx('Condition', 'Estado')}</legend>
          <div className="radio-row val-radios">
            {(kind === 'lot' ? lotStates : conditions).map(o => {
              const on = kind === 'lot' ? lotState === o.id : condition === o.id;
              return (
                <label key={o.id} className={`radio ${on ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="val-condition"
                    value={o.id}
                    checked={on}
                    onChange={() => (kind === 'lot' ? touch(setLotState)(o.id as LotState) : touch(setCondition)(o.id as Condition))}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="val-switches">
          <label className="switch">
            <input type="checkbox" checked={view} onChange={e => touch(setView)(e.target.checked)} />
            <span className="switch-ui" />
            <span>{tx('Open view of the valley or the mountains', 'Vista abierta al valle o a las montañas')}</span>
          </label>
          {kind === 'house' && (
            <label className="switch">
              <input type="checkbox" checked={pool} onChange={e => touch(setPool)(e.target.checked)} />
              <span className="switch-ui" />
              <span>{tx('Private pool', 'Piscina propia')}</span>
            </label>
          )}
        </div>
      </form>

      <div className="val-results" aria-live="polite">
        <div className="val-hero">
          <span>{tx('Estimated market value', 'Valor de mercado estimado')}</span>
          <strong><Price usd={v.low} /> – <Price usd={v.high} /></strong>
          <small>
            {tx('Likely listing price around', 'Precio de salida probable cerca de')} <Price usd={v.mid} /> · ≈ {fmt(v.perM2)} {perLabel}
          </small>
        </div>

        <section className="val-block">
          <h3 className="h4">{tx(`Where it sits in ${zoneName}`, `Dónde queda en ${zoneName}`)}</h3>
          <ValueStrip v={v} comps={comps} zoneName={zoneName} hover={hover} setHover={setHover} />
        </section>

        <section className="val-block">
          <h3 className="h4">{tx('What moves your number', 'Qué mueve su cifra')}</h3>
          <table className="lines val-lines">
            <tbody>
              <tr>
                <th scope="row">{tx(`Starting point: ${kindLabel.toLowerCase()} in ${zoneName}`, `Punto de partida: ${kindLabel.toLowerCase()} en ${zoneName}`)}<span>{tx('Zone range', 'Rango de la zona')} {fmt(v.range[0])}–{fmt(v.range[1])} {perLabel}</span></th>
                <td className="mono">{fmt(v.base)}/m²</td>
              </tr>
              {v.factors.map(f => (
                <tr key={f.id}>
                  <th scope="row">{factorLabel(f.id, f.effect)}</th>
                  <td className={`mono ${f.effect >= 0 ? 'pos' : 'neg'}`}>{signed(f.effect)}</td>
                </tr>
              ))}
              <tr className="total">
                <th scope="row">{tx('Your estimate', 'Su estimación')}</th>
                <td className="mono">{fmt(v.perM2)}/m²</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="val-block">
          <h3 className="h4">{tx(`Our ${kindLabel.toLowerCase()} listings in ${zoneName}`, `${kind === 'house' ? 'Casas' : kind === 'condo' ? 'Apartamentos' : 'Lotes'} que publicamos en ${zoneName}`)}</h3>
          {comps.length ? (
            <ul className="val-comps">
              {comps.map(c => (
                <li key={c.p.slug} className={hover === c.p.slug ? 'is-hover' : ''} onMouseEnter={() => setHover(c.p.slug)} onMouseLeave={() => setHover(null)}>
                  <i className="sw sw-dot" style={{ background: C.listing }} aria-hidden="true" />
                  <Link to={{ name: 'property', slug: c.p.slug }}>{c.p.title}</Link>
                  <span className="val-comp-meta">{c.p.district} · {int(c.m2)} m²</span>
                  <span className="mono">{fmt(c.perM2)}/m²</span>
                  <Price usd={c.p.priceUsd} className="mono" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="fine">{tx(
              `We have no ${kindLabel.toLowerCase()} listings in ${zoneName} right now, so this estimate uses the zone range only.`,
              `Hoy no tenemos ${kind === 'house' ? 'casas' : kind === 'condo' ? 'apartamentos' : 'lotes'} publicados en ${zoneName}, así que la estimación usa solo el rango de la zona.`,
            )}</p>
          )}
        </section>

        {readyGain > 0 && (
          <section className="val-block val-build">
            <IconExcavator size={22} />
            <p>
              {lotState === 'raw'
                ? tx('Services and a level pad could add about ', 'Los servicios y una terraza nivelada podrían sumarle cerca de ')
                : tx('A level building pad could add about ', 'Una terraza nivelada podría sumarle cerca de ')}
              <strong><Price usd={readyGain} /></strong>
              {tx(' to this lot, before the cost of the work. ', ' a este lote, antes del costo de la obra. ')}
              <Link to={{ name: 'build' }} className="link-btn">{tx('Land & Build can do it before you list', 'Land & Build puede hacerlo antes de publicar')} <IconArrow size={16} /></Link>
            </p>
          </section>
        )}

        <button type="button" className="btn btn-accent btn-block" onClick={onRequest}>{tx('Get an exact valuation, free', 'Pedir una valoración exacta, gratis')}</button>
        <p className="fine">{tx(
          'An automatic estimate from 2026 price ranges per zone. It is not an appraisal: an advisor confirms the value with a visit and recent sales, at no cost. Land ranges and the Alajuela range are our own estimates.',
          'Estimación automática con los rangos de precio por zona de 2026. No es un avalúo: un asesor confirma el valor con una visita y ventas recientes, sin costo. Los rangos de terrenos y el de Alajuela son estimaciones propias.',
        )}</p>
      </div>
    </div>
  );
}

export default function Sell() {
  const { lang, tx } = useLang();
  const { properties, bySlug } = useProperties();
  const hero = useRef<HTMLElement>(null);
  const valRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [summary, setSummary] = useState<string | null>(null);
  const ease = [0.2, 0.8, 0.2, 1] as const;
  const sample = bySlug('los-laureles') ?? properties[0];
  const scrollTo = (r: RefObject<HTMLElement | null>) => r.current?.scrollIntoView({ behavior: 'smooth' });

  const pillars = [
    { icon: <IconShield size={22} />, title: tx('Title checked before we list', 'Estudio registral antes de publicar'), body: tx(
      'We pull the registry, match the cadastral plan to the land and rule out liens. Problems come up now, not at the notary, so sales don’t fall apart at closing.',
      'Consultamos el Registro, comparamos el plano catastrado con el terreno y descartamos gravámenes. Los problemas salen ahora y no en la notaría, así la venta no se cae al final.',
    ) },
    { icon: <IconPhotos size={22} />, title: tx('Photos, drone video and a 360° tour', 'Fotos, video con dron y recorrido 360°'), body: tx(
      'One production visit gives buyers what they need to shortlist your property from home: edited photos, a short drone video, a 360° tour and a floor plan.',
      'En una sola visita de producción se hace lo que el comprador necesita para elegir su propiedad desde casa: fotos editadas, un video corto con dron, recorrido 360° y plano.',
    ) },
    { icon: <IconPlane size={22} />, title: tx('Buyers from abroad, in their language', 'Compradores del exterior, en su idioma'), body: tx(
      'Listings in English and Spanish, prices in dollars or colones, video-call tours and remote closings. Properties from $150,000 show the residency-eligible tag.',
      'Fichas en español e inglés, precios en dólares o colones, recorridos por videollamada y cierres a distancia. Las propiedades desde $150.000 llevan la etiqueta de aptas para residencia.',
    ) },
    { icon: <IconExcavator size={22} />, title: tx('Lots that are ready sell faster', 'Los lotes listos se venden más rápido'), body: tx(
      'Selling land? Our Land & Build crew can clear it and cut the building pad first, so buyers see a lot their architect can start on.',
      '¿Vende un terreno? Nuestro equipo de Land & Build puede limpiarlo y hacer la terraza antes, para que el comprador vea un lote donde su arquitecto puede empezar.',
    ) },
  ];
  const kit = [
    { label: tx('Edited photos', 'Fotos editadas'), meta: '30–40' },
    { label: tx('Drone video', 'Video con dron'), meta: '90 s' },
    { label: tx('360° tour of the main rooms', 'Recorrido 360° de los espacios principales'), meta: '360°' },
    { label: tx('Interactive floor plan', 'Plano interactivo'), meta: tx('Plan', 'Plano') },
    { label: tx('Listing in English and Spanish, in dollars or colones', 'Ficha en español e inglés, en dólares o colones'), meta: 'EN · ES' },
    { label: tx('Solid Ground Verified badge with what we checked and when', 'Sello Solid Ground Verified con lo que revisamos y cuándo'), meta: tx('Registry', 'Registro') },
  ];
  const steps = [
    { title: tx('Valuation visit', 'Visita de valoración'), body: tx('We walk the property, measure it and compare it with recent sales. You get a written price opinion within 48 hours.', 'Recorremos la propiedad, la medimos y la comparamos con ventas recientes. Recibe una opinión de precio por escrito en 48 horas.') },
    { title: tx('Title study', 'Estudio registral'), body: tx('Registry, cadastral plan, liens, zoning and municipal taxes. If something needs fixing, you hear it from us, not from a buyer’s lawyer.', 'Registro, plano catastrado, gravámenes, uso de suelo e impuestos municipales. Si hay algo que corregir, se entera por nosotros y no por el abogado del comprador.') },
    { title: tx('Production', 'Producción'), body: tx('Photos, drone video, a 360° tour and a floor plan, in one visit.', 'Fotos, video con dron, recorrido 360° y plano, en una sola visita.') },
    { title: tx('Launch', 'Lanzamiento'), body: tx('A bilingual listing, alerts to buyers already searching your area, and video-call tours for buyers abroad.', 'Ficha bilingüe, avisos a compradores que ya buscan en su zona y recorridos por videollamada para quienes están en el exterior.') },
    { title: tx('Offers and closing', 'Ofertas y cierre'), body: tx('We check proof of funds, negotiate for you and close with a notary through a SUGEF-regulated escrow agent.', 'Verificamos que el comprador tenga los fondos, negociamos por usted y cerramos con notario y un agente escrow regulado por SUGEF.') },
  ];
  const docs = [
    tx('Your ID: cédula, DIMEX or passport', 'Su identificación: cédula, DIMEX o pasaporte'),
    tx('The cadastral plan number (plano catastrado)', 'El número de plano catastrado'),
    tx('Property tax receipts up to date, from the municipality', 'Los recibos de bienes inmuebles al día, de la municipalidad'),
    tx('Condos: a letter from the administration showing fees are paid', 'Condominios: constancia de cuotas al día de la administración'),
    tx('Owned by a company: its legal standing certificate (personería jurídica) and share registry', 'Si está a nombre de una sociedad: personería jurídica y libro de accionistas'),
  ];

  return (
    <div className="sell-page">
      <section className="build-hero sell-hero" ref={hero}>
        <motion.div className="build-hero-bg" style={{ y }}><Img name="sell-hero" alt={tx('Modern house with a lit pool and tropical garden at dusk', 'Casa moderna con piscina iluminada y jardín tropical al atardecer')} eager /></motion.div>
        <div className="build-hero-shade" />
        <div className="wrap build-hero-inner">
          <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {tx('Sell with us', 'Venda con nosotros')}
          </motion.p>
          <h1 className="hero-title hero-title-sm" key={lang}>
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1, ease }}>{tx('Sell your property.', 'Venda su propiedad.')}</motion.span></span>{' '}
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.32, duration: 1, ease }}>{lang === 'es' ? <>Con los <em>papeles en orden.</em></> : <>With the <em>paperwork done.</em></>}</motion.span></span>
          </h1>
          <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            {tx(
              'We check the title before we list, produce photos, drone video and a 360° tour, and show your property to buyers in Costa Rica, North America and Europe, in English and Spanish.',
              'Revisamos el registro antes de publicar, producimos fotos, video con dron y recorrido 360°, y mostramos su propiedad a compradores de Costa Rica, Norteamérica y Europa, en español e inglés.',
            )}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <button type="button" className="btn btn-accent" onClick={() => scrollTo(valRef)}>{tx('What is it worth?', '¿Cuánto vale?')}</button>
            <button type="button" className="btn btn-light-ghost" onClick={() => scrollTo(formRef)}>{tx('Talk to an advisor', 'Hablar con un asesor')}</button>
          </motion.div>
          <motion.dl className="projects-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div><dt>{tx('Days to an accepted offer (median)', 'Días hasta una oferta aceptada (mediana)')}</dt><dd>47</dd></div>
            <div><dt>{tx('Of the asking price, on average', 'Del precio pedido, en promedio')}</dt><dd>97%</dd></div>
            <div><dt>{tx('Buyers from abroad', 'Compradores del exterior')}</dt><dd>{tx('4 in 10', '4 de 10')}</dd></div>
          </motion.dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('Why sell with us', 'Por qué vender con nosotros')}</p>
            <h2 className="h2">{tx('Fewer surprises at the notary, more buyers at the door', 'Menos sorpresas en la notaría, más compradores en la puerta')}</h2>
          </div>
          <div className="sell-pillars">
            {pillars.map((p, i) => (
              <Reveal key={i} delay={i * 0.06} className="sell-pillar">
                <span className="presale-icon">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section sell-kit-sec">
        <div className="wrap sell-kit">
          <div className="sell-kit-copy">
            <p className="eyebrow">{tx('Your listing', 'Su ficha')}</p>
            <h2 className="h2">{tx('Presented the way buyers decide', 'Presentada como deciden los compradores')}</h2>
            <p className="lead">{tx(
              'Most buyers shortlist from a screen, many from another country. Every listing gets the same production as the homes on this site.',
              'La mayoría de los compradores elige desde una pantalla, muchos desde otro país. Cada ficha recibe la misma producción que las casas de este sitio.',
            )}</p>
            <ul className="sell-kit-list">
              {kit.map((k, i) => (
                <Reveal as="li" key={i} delay={i * 0.05}>
                  <span className="check"><IconCheck size={14} /></span>
                  <span>{k.label}</span>
                  <span className="mono sell-kit-meta">{k.meta}</span>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal className="sell-kit-visual">
            <Img name="sell-shoot" alt={tx('Photographer setting up a camera on a tripod in a living room', 'Fotógrafo colocando una cámara en un trípode en una sala')} />
            {sample && <div className="sell-kit-float"><PropertyCard p={sample} /></div>}
          </Reveal>
        </div>
      </section>

      <section className="section sell-val-sec" ref={valRef} id="valuation">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('Free estimate', 'Estimación gratuita')}</p>
            <h2 className="h2">{tx('What is your property worth?', '¿Cuánto vale su propiedad?')}</h2>
            <p className="lead">{tx(
              'Pick the area, the size and a few details. The estimate uses the price per m² of each zone and shows how it got there.',
              'Elija la zona, el tamaño y algunos detalles. La estimación usa el precio por m² de cada zona y muestra cómo llegó a la cifra.',
            )}</p>
          </div>
          <Valuator onSummary={setSummary} onRequest={() => scrollTo(formRef)} />
        </div>
      </section>

      <section className="section presale-how">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('How we sell', 'Cómo vendemos')}</p>
            <h2 className="h2">{tx('Five steps from the first visit to the deed', 'Cinco pasos de la primera visita a la escritura')}</h2>
          </div>
          <ol className="presale-steps sell-steps">
            {steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.06}>
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="sell-docs">
            <Reveal className="sell-docs-col">
              <h3 className="h3">{tx('What to have ready', 'Qué tener a mano')}</h3>
              <ul className="check-list">
                {docs.map((d, i) => <li key={i}><span className="check"><IconCheck size={14} /></span>{d}</li>)}
              </ul>
              <p className="fine">{tx('We request the registry certificate (certificación literal) ourselves.', 'La certificación literal del Registro la solicitamos nosotros.')}</p>
            </Reveal>
            <Reveal className="sell-docs-col sell-closing" delay={0.08}>
              <h3 className="h3">{tx('At closing', 'En el cierre')}</h3>
              <ul className="check-list">
                <li><span className="check"><IconCheck size={14} /></span>{tx('Nothing to pay up front. Our commission is paid only when the sale closes, from the proceeds.', 'Nada que pagar por adelantado. Nuestra comisión se paga solo cuando la venta se cierra, del monto de la venta.')}</li>
                <li><span className="check"><IconCheck size={14} /></span>{tx('The money moves through a SUGEF-regulated escrow agent, never through us.', 'El dinero pasa por un agente escrow regulado por SUGEF, nunca por nosotros.')}</li>
                <li><span className="check"><IconCheck size={14} /></span>{tx('If you are not domiciled in Costa Rica, the buyer withholds 2.5% of the price toward your capital-gains tax and files it on TRIBU-CR. If you live here, there is no withholding.', 'Si usted no está domiciliado en Costa Rica, el comprador retiene el 2,5% del precio a cuenta de su impuesto de ganancias de capital y lo declara en TRIBU-CR. Si vive en el país, no hay retención.')}</li>
                <li><span className="check"><IconCheck size={14} /></span>{tx('Capital-gains tax is 15% of the gain. Your home is exempt, and property bought before July 2019 can pay 2.25% of the price instead on its first sale.', 'El impuesto de ganancias de capital es del 15% sobre la ganancia. Su vivienda habitual está exenta, y una propiedad comprada antes de julio de 2019 puede pagar en su lugar el 2,25% del precio en la primera venta.')}</li>
              </ul>
              <p className="fine">{tx('General information, not legal or tax advice. Your notary confirms what applies to your sale.', 'Información general, no asesoría legal ni tributaria. Su notario confirma lo que aplica a su venta.')}{' '}
                <Link to={{ name: 'guide', slug: 'taxes' }} className="link-btn">{tx('Taxes guide', 'Guía de impuestos')} <IconArrow size={16} /></Link></p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section sell-voices">
        <div className="wrap sell-voices-grid">
          <Reveal className="sell-voices-img">
            <Img name="sell-visit" alt={tx('An advisor talking with a couple in a living room', 'Una asesora conversando con una pareja en una sala')} />
          </Reveal>
          <div>
            <p className="eyebrow">{tx('From owners who sold with us', 'De propietarios que vendieron con nosotros')}</p>
            <div className="sell-quotes">
              {sellerTestimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1} className="quote">
                  <blockquote>“{pick(t.quote, lang)}”</blockquote>
                  <p><strong>{t.name}</strong><span>{pick(t.detail, lang)}</span></p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section quote" ref={formRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{tx('Free valuation', 'Valoración gratuita')}</p>
            <h2 className="h2">{tx('Tell us about your property.', 'Cuéntenos de su propiedad.')}</h2>
            <p className="lead">{tx(
              'An advisor visits within the week in Escazú, Santa Ana, Heredia and Alajuela and sends you a written price opinion. Getting it doesn’t commit you to list with us.',
              'Un asesor la visita en la misma semana en Escazú, Santa Ana, Heredia y Alajuela y le envía una opinión de precio por escrito. Recibirla no le obliga a vender con nosotros.',
            )}</p>
            <ul className="check-list">
              <li><IconCheck size={18} /> {tx('Free, no commitment', 'Gratis y sin compromiso')}</li>
              <li><IconCheck size={18} /> {tx('Written price opinion within 48 hours of the visit', 'Opinión de precio por escrito en 48 horas después de la visita')}</li>
            </ul>
          </div>
          <ContactForm
            context={summary ?? tx('Sell with us: free valuation', 'Venda con nosotros: valoración gratuita')}
            defaultInterest="sell"
            submitLabel={tx('Request my free valuation', 'Solicitar mi valoración gratuita')}
          />
        </div>
      </section>
    </div>
  );
}
