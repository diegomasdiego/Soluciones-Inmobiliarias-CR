import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react';
import { company, equipment, testimonials, zones, type Zone } from '../data/company';
import { bySlug, properties, RESIDENCY_MIN_USD } from '../data/properties';
import { closingCosts, sum, yearlyHolding } from '../lib/costs';
import { money } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { mediaUrl } from '../lib/media';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { AISearch } from '../components/AISearch';
import { Img, Price } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconCheck, IconPause, IconPlay } from '../components/Icons';
import { PropertyCard } from '../components/PropertyCard';
import { VerifiedPanel } from '../components/PropertyParts';
import { Topo, type TopoCenter } from '../components/Topo';

const ease = [0.2, 0.8, 0.2, 1] as const;
const heroTopo: TopoCenter[] = [{ x: 0.82, y: 0.35, rings: 24, spacing: 28, seed: 0.4 }, { x: 0.05, y: 1.05, rings: 16, spacing: 30, seed: 2.1 }];
const zoneTopo: TopoCenter[] = [{ x: 0.7, y: 0.6, rings: 16, spacing: 34, seed: 1.6 }];

function Hero() {
  const { tx, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.current?.pause(); setPlaying(false); }
  }, []);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <section className="hero" ref={ref} aria-label={tx('Introduction', 'Introducción')}>
      <motion.div className="hero-media" style={{ y, scale }}>
        <video ref={video} muted playsInline loop autoPlay preload="auto" poster={mediaUrl('hero-poster')}>
          <source src={mediaUrl('heroVideo')} type="video/mp4" />
        </video>
      </motion.div>
      <div className="hero-shade" />
      <Topo className="hero-topo" centers={heroTopo} color="rgba(232,238,232,.18)" animate speed={0.8} />
      <motion.div className="wrap hero-content" style={{ opacity: fade }}>
        <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}>
          {tx('Real estate · Land & Build · Central Valley, Costa Rica', 'Bienes raíces · Land & Build · Valle Central, Costa Rica')}
        </motion.p>
        <h1 className="hero-title" key={lang}>
          {lang === 'es' ? (
            <>
              <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1.1, ease }}>Terreno <em>firme</em></motion.span></span>{' '}
              <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.34, duration: 1.1, ease }}>en Costa Rica.</motion.span></span>
            </>
          ) : (
            <>
              <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1.1, ease }}>Solid <em>ground</em></motion.span></span>{' '}
              <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.34, duration: 1.1, ease }}>in Costa Rica.</motion.span></span>
            </>
          )}
        </h1>
        <motion.p className="hero-lead" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}>
          {tx(
            'Verified homes, lots and farms in Escazú, Santa Ana, Heredia and Alajuela — and the machines to prepare your land.',
            'Casas, lotes y fincas verificados en Escazú, Santa Ana, Heredia y Alajuela, y la maquinaria para preparar su terreno.',
          )}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.9 }}>
          <AISearch variant="hero" />
        </motion.div>
      </motion.div>
      <div className="wrap hero-foot">
        <span className="mono">{tx('10.0294° N · 84.1970° W — Alajuela highlands, looking over the valley', '10.0294° N · 84.1970° O — Altos de Alajuela, con vista al valle')}</span>
        <button type="button" className="hero-pause" onClick={toggle} aria-label={playing ? tx('Pause background video', 'Pausar el video de fondo') : tx('Play background video', 'Reproducir el video de fondo')}>
          {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
        </button>
      </div>
    </section>
  );
}

function Stats() {
  const { lang, tx } = useLang();
  return (
    <section className="stats" aria-label={tx('Company at a glance', 'La empresa en cifras')}>
      <div className="wrap stats-grid">
        {company.stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="stat">
            <span className="stat-value">{s.value}{s.unit.en && <small> {pick(s.unit, lang)}</small>}</span>
            <span className="stat-label">{pick(s.label, lang)}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const { tx } = useLang();
  const featured = ['los-laureles', 'altos-de-pozos', 'guachipelin-residences'].map(s => bySlug(s)!);
  return (
    <section className="section featured">
      <div className="wrap">
        <div className="section-head row">
          <div>
            <p className="eyebrow">{tx('Handpicked this month', 'Seleccionadas este mes')}</p>
            <h2 className="h2">{tx('Homes we would buy ourselves', 'Casas que compraríamos nosotros mismos')}</h2>
          </div>
          <Link to={{ name: 'search' }} className="link-btn">{tx(`See all ${properties.length} properties`, `Ver las ${properties.length} propiedades`)} <IconArrow size={18} /></Link>
        </div>
        <div className="card-grid">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.1}><PropertyCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ZoneStep({ z, onActive, count }: { z: Zone; onActive: () => void; count: number }) {
  const { lang, tx } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const { runQuery } = useStore();
  const { navigate } = useRouter();
  const name = pick(z.name, lang);
  useEffect(() => { if (inView) onActive(); }, [inView, onActive]);
  return (
    <div ref={ref} className={`zone-step ${inView ? 'is-active' : ''}`}>
      <div className="zone-step-mobile"><Img name={z.photo} alt={name} /></div>
      <p className="eyebrow">{z.lat.toFixed(4)}° N · {Math.abs(z.lng).toFixed(4)}° {tx('W', 'O')}</p>
      <h3 className="zone-name">{name}</h3>
      <p className="zone-tagline">{pick(z.tagline, lang)}</p>
      <p className="zone-body">{pick(z.body, lang)}</p>
      <dl className="zone-stats">
        <div><dt>{tx('Price per m² built', 'Precio por m² construido')}</dt><dd>{z.pricePerM2}{z.estimate && <sup>*</sup>}</dd></div>
        <div><dt>{tx('Appreciation', 'Plusvalía')}</dt><dd>{pick(z.growth, lang)}</dd></div>
        <div><dt>{tx('To SJO airport', 'Al aeropuerto SJO')}</dt><dd>{z.toAirport}</dd></div>
        <div><dt>{tx('Listings now', 'Propiedades hoy')}</dt><dd>{count}</dd></div>
      </dl>
      {z.estimate && <p className="fine">{tx('* Estimate. Other ranges from 2026 market data.', '* Estimación. Los demás rangos provienen de datos de mercado de 2026.')}</p>}
      <button type="button" className="link-btn" onClick={() => { runQuery(name); navigate({ name: 'search' }); }}>
        {tx(`Browse ${name}`, `Ver ${name}`)} <IconArrow size={18} />
      </button>
    </div>
  );
}

function Zones() {
  const { lang, tx } = useLang();
  const [active, setActive] = useState(0);
  const setters = useRef(zones.map((_, i) => () => setActive(i))).current;
  return (
    <section className="zones" aria-label={tx('Where we work', 'Dónde trabajamos')}>
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">{tx('Where we work', 'Dónde trabajamos')}</p>
          <h2 className="h2">{tx('Four valleys, one team that knows every road', 'Cuatro valles, un equipo que conoce cada camino')}</h2>
        </div>
      </div>
      <div className="wrap zones-grid">
        <div className="zones-sticky">
          <div className="zones-visual">
            {zones.map((z, i) => (
              <motion.div key={z.photo} className="zones-img" initial={false} animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.08 }} transition={{ duration: 1.1, ease }}>
                <Img name={z.photo} alt="" />
              </motion.div>
            ))}
            <div className="zones-shade" />
            <Topo className="zones-topo" centers={zoneTopo} color="rgba(255,255,255,.3)" phase={active * 1.6} />
            <div className="zones-caption">
              <AnimatePresence mode="wait">
                <motion.span key={`${lang}-${active}`} className="zones-caption-name" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.5, ease }}>
                  {pick(zones[active].name, lang)}
                </motion.span>
              </AnimatePresence>
              <div className="zones-dots" aria-hidden="true">{zones.map((_, i) => <span key={i} className={i === active ? 'on' : ''} />)}</div>
            </div>
          </div>
        </div>
        <div className="zones-steps">
          {zones.map((z, i) => (
            <ZoneStep key={z.photo} z={z} onActive={setters[i]} count={properties.filter(p => z.area.includes(p.area)).length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Verified() {
  const { tx } = useLang();
  const p = bySlug('los-laureles')!;
  const checks = [
    tx('Title (Folio Real) and owner confirmed at the Registro Nacional', 'Folio real y propietario confirmados en el Registro Nacional'),
    tx('Cadastral plan matched to the land on the ground', 'Plano catastrado comparado con el terreno en sitio'),
    tx('Liens, annotations and lawsuits ruled out', 'Sin gravámenes, anotaciones ni litigios'),
    tx('Municipal taxes up to date', 'Impuestos municipales al día'),
    tx('Closing through a SUGEF-regulated escrow agent', 'Cierre con un agente escrow regulado por SUGEF'),
  ];
  return (
    <section className="section verified-sec">
      <div className="wrap verified-grid">
        <div className="verified-copy">
          <p className="eyebrow">Solid Ground Verified</p>
          <h2 className="h2">{tx('Costa Rica doesn’t license brokers. So we show our work.', 'En Costa Rica no se exige licencia para ser corredor. Por eso mostramos lo que revisamos.')}</h2>
          <p className="lead">{tx(
            'Anyone can list a property here. Before we list one, we pull the registry, match the cadastral plan to the land and confirm there are no liens — and we put what we checked, and when, on every listing.',
            'Aquí cualquiera puede anunciar una propiedad. Antes de publicar una, consultamos el Registro, comparamos el plano catastrado con el terreno y confirmamos que no tenga gravámenes. Y en cada ficha mostramos qué revisamos y cuándo.',
          )}</p>
          <ul className="check-list">
            {checks.map((t, i) => (
              <Reveal as="li" key={i} delay={i * 0.06}><span className="check"><IconCheck size={14} /></span>{t}</Reveal>
            ))}
          </ul>
        </div>
        <Reveal className="verified-visual">
          <Img name="laureles-2" alt={tx('Casa Los Laureles, exterior', 'Casa Los Laureles, exterior')} />
          <div className="verified-float"><VerifiedPanel p={p} /></div>
          <span className="verified-stamp mono">{tx('Folio real', 'Folio real')} {p.legal.folio}</span>
        </Reveal>
      </div>
    </section>
  );
}

function CostTeaser() {
  const { lang, tx } = useLang();
  const [price, setPrice] = useState(350000);
  const { currency, rate, runQuery } = useStore();
  const { navigate } = useRouter();
  const closing = sum(closingCosts(price, { residency: price >= RESIDENCY_MIN_USD, split: false }, lang));
  const { propertyTax } = yearlyHolding(price);
  const eligible = price >= RESIDENCY_MIN_USD;
  return (
    <section className="section cost-teaser">
      <div className="wrap cost-grid">
        <Reveal className="residency-card">
          <p className="eyebrow">{tx('Law 9996', 'Ley 9996')}</p>
          <h3 className="h3">{tx('$150,000 in property can open the door to residency.', 'Una propiedad de $150.000 puede abrirle la puerta a la residencia.')}</h3>
          <p>
            {tx('Investor residency starts at $150,000, and most of our listings are above it. Look for the ', 'La residencia como inversionista empieza en $150.000, y la mayoría de nuestras propiedades supera ese monto. Busque la etiqueta ')}
            <span className="badge badge-residency">{tx('Residency-eligible', 'Apta para residencia')}</span>
            {tx(' tag.', '.')}
          </p>
          <button type="button" className="btn btn-ghost" onClick={() => { runQuery('residency'); navigate({ name: 'search' }); }}>{tx('See eligible homes', 'Ver propiedades aptas')} <IconArrow size={18} /></button>
        </Reveal>
        <Reveal className="truecost-card" delay={0.1}>
          <p className="eyebrow">{tx('True cost', 'Costo real')}</p>
          <h3 className="h3">{tx('What will it really cost to buy?', '¿Cuánto cuesta realmente comprar?')}</h3>
          <label htmlFor="teaser-price" className="range-label">{tx('Purchase price', 'Precio de compra')} <Price usd={price} /></label>
          <input id="teaser-price" type="range" min={100000} max={600000} step={5000} value={price} onChange={e => setPrice(+e.target.value)} />
          <dl className="teaser-out">
            <div><dt>{tx('Closing costs (est.)', 'Gastos de cierre (est.)')}</dt><dd>{money(closing, currency, rate)}</dd></div>
            <div><dt>{tx('Property tax a year', 'Impuesto de bienes inmuebles al año')}</dt><dd>{money(propertyTax, currency, rate)}</dd></div>
            <div><dt>{tx('Investor residency', 'Residencia de inversionista')}</dt><dd className={eligible ? 'ok' : 'no'}>{eligible ? tx('Eligible', 'Califica') : tx('Below $150k', 'Menos de $150k')}</dd></div>
          </dl>
          <Link to={{ name: 'calculator' }} className="link-btn">{tx('Open the full calculator', 'Abrir la calculadora completa')} <IconArrow size={18} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function BuildTeaser() {
  const { lang, tx } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  return (
    <section className="build-teaser" ref={ref}>
      <motion.div className="build-teaser-bg" style={{ y }}><Img name="build-hero" alt="" /></motion.div>
      <div className="build-teaser-shade" />
      <div className="wrap build-teaser-inner">
        <Reveal>
          <p className="eyebrow eyebrow-light">Land &amp; Build</p>
          <h2 className="h2 light">{lang === 'es' ? <>Compre el lote.<br />Nosotros preparamos el terreno.</> : <>Buy the lot.<br />We’ll prepare the ground.</>}</h2>
          <p className="lead light">{tx(
            'Our own excavators, dump trucks and compactors clear, terrace and drain your land — so the lot you buy from us is ready for your builder.',
            'Nuestras propias excavadoras, vagonetas y compactadoras limpian, hacen terrazas y drenan su terreno, para que el lote que nos compra quede listo para su constructor.',
          )}</p>
        </Reveal>
        <ul className="machine-chips">
          {equipment.map((e, i) => <Reveal as="li" key={e.id} delay={0.05 * i}>{pick(e.name, lang)}</Reveal>)}
        </ul>
        <Link to={{ name: 'build' }} className="btn btn-light">{tx('Explore Land & Build', 'Conocer Land & Build')} <IconArrow size={18} /></Link>
      </div>
    </section>
  );
}

function Testimonials() {
  const { lang, tx } = useLang();
  return (
    <section className="section testimonials">
      <div className="wrap">
        <p className="eyebrow">{tx('From our clients', 'Lo que dicen nuestros clientes')}</p>
        <div className="quotes">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="quote">
              <blockquote>“{pick(t.quote, lang)}”</blockquote>
              <p><strong>{t.name}</strong><span>{pick(t.detail, lang)}</span></p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const { lang, tx } = useLang();
  return (
    <section className="section cta">
      <div className="wrap cta-grid">
        <div>
          <p className="eyebrow">{tx('Start here', 'Empiece aquí')}</p>
          <h2 className="h2">{tx('Tell us what you’re looking for.', 'Cuéntenos qué está buscando.')}</h2>
          <p className="lead">{tx(
            'An advisor replies within one business day with options that match — including ones not yet online.',
            'Un asesor le responde en menos de un día hábil con opciones a su medida, incluso algunas que todavía no están publicadas.',
          )}</p>
          <p className="cta-meta mono">{pick(company.hours, lang)}</p>
        </div>
        <ContactForm compact submitLabel={tx('Send', 'Enviar')} />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Featured />
      <Zones />
      <Verified />
      <CostTeaser />
      <BuildTeaser />
      <Testimonials />
      <Cta />
    </>
  );
}
