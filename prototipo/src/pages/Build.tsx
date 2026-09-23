import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { buildServices, buildSteps, equipment } from '../data/company';
import { int } from '../lib/format';
import { useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconTruck } from '../components/Icons';

// Typical swell (bulking) factors: excavated material takes more room in the truck than in the ground.
const materials = [
  { id: 'earth', label: 'Topsoil / common earth', swell: 0.25 },
  { id: 'clay', label: 'Clay', swell: 0.35 },
  { id: 'gravel', label: 'Sand and gravel', swell: 0.12 },
  { id: 'rock', label: 'Broken rock', swell: 0.55 },
];
const TRUCK_M3 = 12;

function TripEstimator({ onChange }: { onChange: (summary: string) => void }) {
  const [volume, setVolume] = useState(180);
  const [mat, setMat] = useState('clay');
  const m = materials.find(x => x.id === mat)!;
  const loose = volume * (1 + m.swell);
  const trips = Math.ceil(loose / TRUCK_M3);
  const summary = `${int(volume)} m³ of ${m.label.toLowerCase()} · ≈${trips} truck trips`;
  useEffect(() => onChange(summary), [summary, onChange]);

  return (
    <div className="estimator">
      <div className="estimator-inputs">
        <label className="field">
          <span>Volume to remove, measured in the ground <strong className="mono">{int(volume)} m³</strong></span>
          <input id="est-volume" type="range" min={12} max={1500} step={6} value={volume} onChange={e => setVolume(+e.target.value)} />
        </label>
        <fieldset className="field">
          <legend>Material</legend>
          <div className="radio-row">
            {materials.map(x => (
              <label key={x.id} className={`radio ${mat === x.id ? 'is-on' : ''}`}>
                <input type="radio" name="est-mat" value={x.id} checked={mat === x.id} onChange={() => setMat(x.id)} />
                {x.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="estimator-out">
        <div className="trips">
          <IconTruck size={28} />
          <motion.strong key={trips} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{trips}</motion.strong>
          <span>trips in 12 m³ dump trucks</span>
        </div>
        <p className="mono formula">{int(volume)} m³ × {(1 + m.swell).toFixed(2)} swell = {int(loose)} m³ loose ÷ {TRUCK_M3} m³</p>
        <p className="fine">Dug-out material expands (“swells”) about {Math.round(m.swell * 100)}% for {m.label.toLowerCase()}. Trip prices depend on distance to the disposal site.</p>
      </div>
    </div>
  );
}

export default function Build() {
  const ref = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [estimate, setEstimate] = useState('180 m³ of clay · ≈21 truck trips');
  const { runQuery } = useStore();
  const { navigate } = useRouter();

  return (
    <div className="build-page">
      <section className="build-hero" ref={ref}>
        <motion.div className="build-hero-bg" style={{ y }}><Img name="build-hero" alt="Crawler excavator on a site at sunrise" eager /></motion.div>
        <div className="build-hero-shade" />
        <div className="wrap build-hero-inner">
          <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>Land &amp; Build · Excavators, dump trucks, earthworks</motion.p>
          <h1 className="hero-title hero-title-sm">
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>From raw land</motion.span></span>{' '}
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.32, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>to <em>ready ground.</em></motion.span></span>
          </h1>
          <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            Our own machines and operators clear, terrace, drain and compact your lot — whether you bought it from us or not.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <button type="button" className="btn btn-accent" onClick={() => quoteRef.current?.scrollIntoView({ behavior: 'smooth' })}>Get a quote</button>
            <button type="button" className="btn btn-light-ghost" onClick={() => { runQuery('lot'); navigate({ name: 'search' }); }}>See lots for sale</button>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Services</p>
            <h2 className="h2">Everything between buying land and pouring a foundation</h2>
          </div>
          <div className="service-grid">
            {buildServices.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05} className="service">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section fleet">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <p className="eyebrow">The fleet</p>
              <h2 className="h2">Six machines, operators included</h2>
            </div>
            <p className="lead narrow">Every machine comes with a certified operator. Moving machines between sites uses a lowboy trailer, quoted by distance.</p>
          </div>
          <div className="equip-grid">
            {equipment.map((e, i) => (
              <Reveal key={e.id} delay={(i % 3) * 0.08} className="equip-card">
                <div className="equip-img" data-cursor="View"><Img name={e.photo} alt={e.name} /></div>
                <div className="equip-body">
                  <h3>{e.name}</h3>
                  <p className="mono equip-spec">{e.spec}</p>
                  <p>{e.use}</p>
                  <p className="equip-billing">{e.billing}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section steps-sec">
        <div className="wrap steps-grid">
          <div className="steps-intro">
            <p className="eyebrow">How a lot gets build-ready</p>
            <h2 className="h2">Six steps, one crew</h2>
            <div className="steps-img"><Img name="earthworks-aerial" alt="Aerial view of an earthworks site" /></div>
          </div>
          <ol className="steps">
            {buildSteps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.05}>
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{s.title}</h3><p>{s.body}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section estimator-sec">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Quick estimate</p>
            <h2 className="h2">How many dump-truck trips will your lot need?</h2>
          </div>
          <TripEstimator onChange={setEstimate} />
        </div>
      </section>

      <section className="section quote" ref={quoteRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">Get a quote</p>
            <h2 className="h2">Send us the lot, we’ll send a plan and a price.</h2>
            <p className="lead">Include the cadastral plan number or a location pin if you have it. We visit within the week in Escazú, Santa Ana, Heredia and Alajuela.</p>
            <div className="quote-img"><Img name="aggregates" alt="Gravel stockpile" /></div>
          </div>
          <ContactForm context={`Land & Build · ${estimate}`} defaultInterest="Land & Build (machinery)" submitLabel="Request a quote" />
        </div>
      </section>

      <section className="section build-back">
        <div className="wrap">
          <button type="button" className="link-btn" onClick={() => { runQuery('lot or farm'); navigate({ name: 'search' }); }}>Looking for land first? See lots and farms <IconArrow size={18} /></button>
        </div>
      </section>
    </div>
  );
}
