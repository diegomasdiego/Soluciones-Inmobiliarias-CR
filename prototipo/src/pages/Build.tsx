import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { buildServices, buildSteps, equipment } from '../data/company';
import { int } from '../lib/format';
import { pick, useLang, type Lang } from '../lib/i18n';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconTruck } from '../components/Icons';

// Typical swell (bulking) factors: excavated material takes more room in the truck than in the ground.
const materials = [
  { id: 'earth', en: 'Topsoil / common earth', es: 'Tierra común / capa vegetal', swell: 0.25 },
  { id: 'clay', en: 'Clay', es: 'Arcilla', swell: 0.35 },
  { id: 'gravel', en: 'Sand and gravel', es: 'Arena y grava', swell: 0.12 },
  { id: 'rock', en: 'Broken rock', es: 'Roca fragmentada', swell: 0.55 },
];
const TRUCK_M3 = 12;

const summaryText = (volume: number, mat: (typeof materials)[number], lang: Lang) => {
  const trips = Math.ceil((volume * (1 + mat.swell)) / TRUCK_M3);
  return lang === 'es'
    ? `${int(volume)} m³ de ${mat.es.toLowerCase()} · ≈${trips} viajes de vagoneta`
    : `${int(volume)} m³ of ${mat.en.toLowerCase()} · ≈${trips} truck trips`;
};

function TripEstimator({ onChange }: { onChange: (summary: string) => void }) {
  const { lang, tx } = useLang();
  const [volume, setVolume] = useState(180);
  const [mat, setMat] = useState('clay');
  const m = materials.find(x => x.id === mat)!;
  const loose = volume * (1 + m.swell);
  const trips = Math.ceil(loose / TRUCK_M3);
  const summary = summaryText(volume, m, lang);
  useEffect(() => onChange(summary), [summary, onChange]);
  const dec = (s: string) => (lang === 'es' ? s.replace('.', ',') : s);

  return (
    <div className="estimator">
      <div className="estimator-inputs">
        <label className="field">
          <span>{tx('Volume to remove, measured in the ground', 'Volumen a remover, medido en el terreno')} <strong className="mono">{int(volume)} m³</strong></span>
          <input id="est-volume" type="range" min={12} max={1500} step={6} value={volume} onChange={e => setVolume(+e.target.value)} />
        </label>
        <fieldset className="field">
          <legend>{tx('Material', 'Material')}</legend>
          <div className="radio-row">
            {materials.map(x => (
              <label key={x.id} className={`radio ${mat === x.id ? 'is-on' : ''}`}>
                <input type="radio" name="est-mat" value={x.id} checked={mat === x.id} onChange={() => setMat(x.id)} />
                {x[lang]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="estimator-out">
        <div className="trips">
          <IconTruck size={28} />
          <motion.strong key={trips} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{trips}</motion.strong>
          <span>{tx('trips in 12 m³ dump trucks', 'viajes en vagonetas de 12 m³')}</span>
        </div>
        <p className="mono formula">{int(volume)} m³ × {dec((1 + m.swell).toFixed(2))} {tx('swell', 'esponjamiento')} = {int(loose)} m³ {tx('loose', 'sueltos')} ÷ {TRUCK_M3} m³</p>
        <p className="fine">{tx(
          `Dug-out material expands (“swells”) about ${Math.round(m.swell * 100)}% for ${m.en.toLowerCase()}. Trip prices depend on distance to the disposal site.`,
          `El material excavado aumenta de volumen (“esponjamiento”) cerca de un ${Math.round(m.swell * 100)}% en ${m.es.toLowerCase()}. El precio por viaje depende de la distancia al botadero.`,
        )}</p>
      </div>
    </div>
  );
}

export default function Build() {
  const { lang, tx } = useLang();
  const ref = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [estimate, setEstimate] = useState('');
  const { runQuery } = useStore();
  const { navigate } = useRouter();
  const ease = [0.2, 0.8, 0.2, 1] as const;

  return (
    <div className="build-page">
      <section className="build-hero" ref={ref}>
        <motion.div className="build-hero-bg" style={{ y }}><Img name="build-hero" alt={tx('Crawler excavator on a site at sunrise', 'Excavadora de oruga en un terreno al amanecer')} eager /></motion.div>
        <div className="build-hero-shade" />
        <div className="wrap build-hero-inner">
          <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {tx('Land & Build · Excavators, dump trucks, earthworks', 'Land & Build · Excavadoras, vagonetas, movimiento de tierras')}
          </motion.p>
          <h1 className="hero-title hero-title-sm" key={lang}>
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1, ease }}>{tx('From raw land', 'Del terreno en bruto')}</motion.span></span>{' '}
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.32, duration: 1, ease }}>{lang === 'es' ? <>a un terreno <em>listo.</em></> : <>to <em>ready ground.</em></>}</motion.span></span>
          </h1>
          <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            {tx(
              'Our own machines and operators clear, terrace, drain and compact your lot — whether you bought it from us or not.',
              'Nuestras propias máquinas y operadores limpian, hacen terrazas, drenan y compactan su lote, lo haya comprado con nosotros o no.',
            )}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <button type="button" className="btn btn-accent" onClick={() => quoteRef.current?.scrollIntoView({ behavior: 'smooth' })}>{tx('Get a quote', 'Pedir una cotización')}</button>
            <button type="button" className="btn btn-light-ghost" onClick={() => { runQuery('lot'); navigate({ name: 'search' }); }}>{tx('See lots for sale', 'Ver lotes en venta')}</button>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('Services', 'Servicios')}</p>
            <h2 className="h2">{tx('Everything between buying land and pouring a foundation', 'Todo lo que hay entre comprar un terreno y chorrear los cimientos')}</h2>
          </div>
          <div className="service-grid">
            {buildServices.map((s, i) => (
              <Reveal key={i} delay={i * 0.05} className="service">
                <h3>{pick(s.title, lang)}</h3>
                <p>{pick(s.body, lang)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section fleet">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <p className="eyebrow">{tx('The fleet', 'La flota')}</p>
              <h2 className="h2">{tx('Six machines, operators included', 'Seis máquinas, con operador incluido')}</h2>
            </div>
            <p className="lead narrow">{tx(
              'Every machine comes with a certified operator. Moving machines between sites uses a lowboy trailer, quoted by distance.',
              'Cada máquina trabaja con un operador certificado. El traslado entre sitios se hace en plataforma (lowboy) y se cotiza según la distancia.',
            )}</p>
          </div>
          <div className="equip-grid">
            {equipment.map((e, i) => (
              <Reveal key={e.id} delay={(i % 3) * 0.08} className="equip-card">
                <div className="equip-img" data-cursor={tx('View', 'Ver')}><Img name={e.photo} alt={pick(e.name, lang)} /></div>
                <div className="equip-body">
                  <h3>{pick(e.name, lang)}</h3>
                  <p className="mono equip-spec">{pick(e.spec, lang)}</p>
                  <p>{pick(e.use, lang)}</p>
                  <p className="equip-billing">{pick(e.billing, lang)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section steps-sec">
        <div className="wrap steps-grid">
          <div className="steps-intro">
            <p className="eyebrow">{tx('How a lot gets build-ready', 'Cómo queda un lote listo para construir')}</p>
            <h2 className="h2">{tx('Six steps, one crew', 'Seis pasos, un solo equipo')}</h2>
            <div className="steps-img"><Img name="earthworks-aerial" alt={tx('Aerial view of an earthworks site', 'Vista aérea de un movimiento de tierras')} /></div>
          </div>
          <ol className="steps">
            {buildSteps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.05}>
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{pick(s.title, lang)}</h3><p>{pick(s.body, lang)}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section estimator-sec">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('Quick estimate', 'Estimación rápida')}</p>
            <h2 className="h2">{tx('How many dump-truck trips will your lot need?', '¿Cuántos viajes de vagoneta necesita su lote?')}</h2>
          </div>
          <TripEstimator onChange={setEstimate} />
        </div>
      </section>

      <section className="section quote" ref={quoteRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{tx('Get a quote', 'Pedir una cotización')}</p>
            <h2 className="h2">{tx('Send us the lot, we’ll send a plan and a price.', 'Envíenos el lote y le enviamos un plan y un precio.')}</h2>
            <p className="lead">{tx(
              'Include the cadastral plan number or a location pin if you have it. We visit within the week in Escazú, Santa Ana, Heredia and Alajuela.',
              'Incluya el número de plano catastrado o la ubicación si la tiene. Visitamos en la misma semana en Escazú, Santa Ana, Heredia y Alajuela.',
            )}</p>
            <div className="quote-img"><Img name="aggregates" alt={tx('Gravel stockpile', 'Montículo de piedra')} /></div>
          </div>
          <ContactForm context={`Land & Build · ${estimate}`} defaultInterest="build" submitLabel={tx('Request a quote', 'Solicitar cotización')} />
        </div>
      </section>

      <section className="section build-back">
        <div className="wrap">
          <button type="button" className="link-btn" onClick={() => { runQuery('lot or farm'); navigate({ name: 'search' }); }}>{tx('Looking for land first? See lots and farms', '¿Primero busca terreno? Vea lotes y fincas')} <IconArrow size={18} /></button>
        </div>
      </section>
    </div>
  );
}
