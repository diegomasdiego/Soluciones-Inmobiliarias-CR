// Project page (#project-<slug>): progress, unit types with plans, payment plan by milestone and interest form.
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { advisors } from '../data/company';
import { RESIDENCY_MIN_USD } from '../data/properties';
import {
  deliveryDate, monthYear, priceFrom, projectBySlug, projects, quarter, unitsAvailable, unitsTotal, type Project as P,
} from '../data/projects';
import { m2, money } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconCheck, IconExcavator, IconPhotos } from '../components/Icons';
import { MapView } from '../components/MapView';
import { Lightbox } from '../components/PropertyParts';
import {
  CountUp, LotPlanView, MilestoneTrack, PaymentPlanView, ProjectCard, StageChip, UnitPlanView, pctLabel,
} from '../components/ProjectParts';

export default function Project({ slug }: { slug: string }) {
  const { tx } = useLang();
  const p = projectBySlug(slug);
  if (!p) {
    return (
      <div className="wrap notfound">
        <h1 className="h2">{tx('This project is not listed.', 'Este proyecto no está publicado.')}</h1>
        <Link to={{ name: 'projects' }} className="btn btn-accent">{tx('See all projects', 'Ver todos los proyectos')}</Link>
      </div>
    );
  }
  return <ProjectView p={p} key={p.slug} />;
}

function ProjectView({ p }: { p: P }) {
  const { lang, tx } = useLang();
  const { currency, rate } = useStore();
  const { navigate } = useRouter();
  const [typeId, setTypeId] = useState(() => (p.types.find(t => t.available > 0) ?? p.types[0]).id);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const payRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const type = p.types.find(t => t.id === typeId) ?? p.types[0];
  const delivered = p.stage === 'delivered';
  const isLots = p.types.every(t => t.lot);
  const avail = unitsAvailable(p);
  const advisor = advisors[p.advisor];
  const others = projects.filter(o => o.slug !== p.slug).sort((a, b) => Number(a.stage === 'delivered') - Number(b.stage === 'delivered')).slice(0, 2);
  const dec = (v: number) => (lang === 'es' ? String(v).replace('.', ',') : String(v));
  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <article className="project">
      <header className="proj-hero">
        <button type="button" className="proj-hero-img vt-hero" onClick={() => setLightbox(0)} aria-label={tx('Open photo gallery', 'Abrir la galería de fotos')} data-cursor={tx('View', 'Ver')}>
          <Img name={p.hero} alt={tx(`${p.name}, main photo`, `${p.name}, foto principal`)} eager />
        </button>
        <div className="proj-hero-shade" />
        <div className="wrap-wide proj-hero-inner">
          <nav className="crumbs crumbs-light" aria-label={tx('Breadcrumb', 'Ruta de navegación')}>
            <Link to={{ name: 'projects' }}>{tx('Projects', 'Proyectos')}</Link><span>/</span><span>{p.area}</span><span>/</span><span aria-current="page">{p.name}</span>
          </nav>
          <StageChip stage={p.stage} />
          <motion.h1 className="proj-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>{p.name}</motion.h1>
          <motion.p className="proj-tagline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{p.tagline[lang]}</motion.p>
          <motion.dl className="proj-hero-facts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <div><dt>{delivered ? tx('Sold from', 'Vendidas desde') : tx('From', 'Desde')}</dt><dd><Price usd={priceFrom(p)} /></dd></div>
            <div><dt>{p.district}, {p.canton}</dt><dd>{p.kind[lang]}</dd></div>
            <div><dt>{delivered ? tx('Delivered', 'Entregado') : tx('Delivery', 'Entrega')}</dt><dd>{delivered ? monthYear(deliveryDate(p), lang) : quarter(deliveryDate(p), lang)}</dd></div>
            <div><dt>{tx('Progress', 'Avance')}</dt><dd>{pctLabel(p.progress, lang)}</dd></div>
          </motion.dl>
          <div className="proj-hero-actions">
            {!delivered && <button type="button" className="btn btn-accent" onClick={() => scrollTo(formRef.current)}>{tx('Request the price list', 'Pedir la lista de precios')}</button>}
            {!delivered && <button type="button" className="btn btn-light-ghost" onClick={() => scrollTo(payRef.current)}>{tx('See the payment plan', 'Ver el plan de pagos')}</button>}
            <button type="button" className="pill-btn" onClick={() => setLightbox(0)}><IconPhotos size={16} /> {p.photos.length} {tx('photos', 'fotos')}</button>
          </div>
        </div>
      </header>

      <section className="section proj-overview">
        <div className="wrap-wide proj-overview-grid">
          <div>
            <p className="eyebrow">{tx('The project', 'El proyecto')}</p>
            <h2 className="h3">{p.kind[lang]}</h2>
            <p className="proj-body">{p.body[lang]}</p>
            <ul className="feature-list">{p.amenities.map(a => <li key={a.en}>{a[lang]}</li>)}</ul>
            {p.landAndBuild && (
              <div className="build-callout proj-lb">
                <IconExcavator size={26} />
                <div>
                  <p>{p.landAndBuild[lang]}</p>
                  <Link to={{ name: 'build' }} className="link-btn">{tx('See Land & Build', 'Ver Land & Build')} <IconArrow size={16} /></Link>
                </div>
              </div>
            )}
            {p.propertySlug && (
              <Link to={{ name: 'property', slug: p.propertySlug }} className="link-btn">{tx('See the listing in property search', 'Ver la ficha en el buscador de propiedades')} <IconArrow size={16} /></Link>
            )}
          </div>
          <div className="proj-photos">
            {p.photos.slice(1, 4).map((ph, i) => (
              <button key={ph} type="button" onClick={() => setLightbox(i + 1)} data-cursor={tx('View', 'Ver')} aria-label={tx(`Open photo ${i + 2}`, `Abrir la foto ${i + 2}`)}>
                <Img name={ph} alt="" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section proj-progress">
        <div className="wrap-wide">
          <div className="proj-progress-head">
            <div>
              <p className="eyebrow eyebrow-light">{tx('Construction progress', 'Avance de obra')} · {tx('report of', 'informe de')} {monthYear(p.updated, lang)}</p>
              <h2 className="h2 light">{delivered ? tx('Built and delivered.', 'Construido y entregado.') : tx('Where the build is today', 'Cómo va la obra hoy')}</h2>
            </div>
            <p className="proj-progress-num mono" aria-label={pctLabel(p.progress, lang)}>
              <CountUp to={p.progress * 100} format={v => `${Math.round(v)}%`} />
            </p>
          </div>
          <MilestoneTrack p={p} dark />
          <figure className="proj-progress-photo">
            <Img name={p.progressPhoto} alt={p.progressNote[lang]} />
            <figcaption>{p.progressNote[lang]}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section proj-types">
        <div className="wrap-wide">
          <div className="section-head row">
            <div>
              <p className="eyebrow">{isLots ? tx('Lots', 'Lotes') : tx('Unit types and plans', 'Tipologías y planos')}</p>
              <h2 className="h2">{isLots ? tx('Choose your lot', 'Escoja su lote') : tx('Choose your layout', 'Escoja su distribución')}</h2>
            </div>
            <p className="lead narrow">{delivered
              ? tx('All units are sold. Join the list to hear about the next project first.', 'Todas las unidades están vendidas. Únase a la lista para conocer primero el próximo proyecto.')
              : tx(`${avail} of ${unitsTotal(p)} still available.`, `Quedan ${avail} de ${unitsTotal(p)} disponibles.`)}</p>
          </div>

          <div className="type-tabs" role="tablist" aria-label={tx('Unit types', 'Tipologías')}>
            {p.types.map(t => (
              <button key={t.id} type="button" role="tab" aria-selected={t.id === type.id} onClick={() => setTypeId(t.id)}>
                <strong>{t.name[lang]}</strong>
                <span className="mono">{t.available ? money(t.priceUsd, currency, rate) : tx('Sold out', 'Agotado')}</span>
              </button>
            ))}
          </div>

          <motion.div key={type.id} className="type-panel" role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="type-plan">
              {type.lot
                ? <LotPlanView lot={type.lot} label={tx(`Lot diagram: ${type.name.en}`, `Diagrama del lote: ${type.name.es}`)} />
                : type.plan && <UnitPlanView plan={type.plan} label={tx(`Floor plan: ${type.name.en}`, `Plano: ${type.name.es}`)} />}
              <p className="fine">{type.lot
                ? tx('Setbacks shown are an example; the municipal zoning plan sets the real ones.', 'Los retiros son de ejemplo; los reales los define el plan regulador de la municipalidad.')
                : tx('Schematic plan, not to scale.', 'Plano esquemático, sin escala.')}</p>
            </div>
            <div className="type-info">
              <h3 className="h3">{type.name[lang]}</h3>
              {type.note && <p>{type.note[lang]}</p>}
              <dl className="spec-table">
                {type.beds != null && <div><dt>{tx('Bedrooms', 'Habitaciones')}</dt><dd>{type.beds}</dd></div>}
                {type.baths != null && <div><dt>{tx('Bathrooms', 'Baños')}</dt><dd>{dec(type.baths)}</dd></div>}
                {type.builtM2 != null && <div><dt>{tx('Built area', 'Área construida')}</dt><dd>{m2(type.builtM2)}</dd></div>}
                {type.lotM2 != null && <div><dt>{isLots ? tx('Lot size', 'Tamaño del lote') : tx('Land', 'Terreno')}</dt><dd>{m2(type.lotM2)}</dd></div>}
                {type.lot && <div><dt>{tx('Front × depth', 'Frente × fondo')}</dt><dd>{dec(type.lot.front)} × {dec(type.lot.depth)} m</dd></div>}
                <div><dt>{tx('Price', 'Precio')}</dt><dd><Price usd={type.priceUsd} /></dd></div>
                {(type.builtM2 ?? type.lotM2) != null && <div><dt>{tx('Price per m²', 'Precio por m²')}</dt><dd>{money(type.priceUsd / (type.builtM2 ?? type.lotM2!), currency, rate)}</dd></div>}
              </dl>
              <div className="type-avail">
                <span>{type.available
                  ? tx(`${type.available} of ${type.units} available`, `${type.available} de ${type.units} disponibles`)
                  : tx(`All ${type.units} sold`, `Las ${type.units} vendidas`)}</span>
                <div className="avail-dots" aria-hidden="true">
                  {Array.from({ length: type.units }, (_, i) => <span key={i} className={i < type.units - type.available ? 'is-sold' : ''} />)}
                </div>
              </div>
              <div className="type-badges">
                {type.priceUsd >= RESIDENCY_MIN_USD && !isLots && <span className="badge badge-residency">{tx('Residency-eligible', 'Apta para residencia')}</span>}
                {!delivered && !isLots && <span className="badge">{tx('Choice of finishes', 'Acabados a escoger')}</span>}
                {isLots && <span className="badge">{tx('Delivered registered, with its own folio', 'Se entrega inscrito, con folio propio')}</span>}
              </div>
              {!delivered && (
                <button type="button" className="btn btn-ghost" onClick={() => scrollTo(payRef.current)}>{tx('Payment plan for this unit', 'Plan de pagos de esta unidad')} <IconArrow size={16} /></button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {!delivered && (
        <section className="section proj-pay" ref={payRef}>
          <div className="wrap-wide">
            <div className="section-head row">
              <div>
                <p className="eyebrow">{tx('Payment plan', 'Plan de pagos')}</p>
                <h2 className="h2">{tx('Pay as each milestone is reached', 'Pague conforme se cumple cada hito')}</h2>
              </div>
              <div className="type-switch" role="group" aria-label={tx('Unit type', 'Tipología')}>
                {p.types.filter(t => t.available > 0).map(t => (
                  <button key={t.id} type="button" className="chip" aria-pressed={t.id === type.id} onClick={() => setTypeId(t.id)}>{t.name[lang]}</button>
                ))}
              </div>
            </div>
            <PaymentPlanView p={p} type={type} />
          </div>
        </section>
      )}

      <section className="section proj-location">
        <div className="wrap-wide loc-grid">
          <div>
            <p className="eyebrow">{tx('Location', 'Ubicación')}</p>
            <h2 className="h3">{p.district}, {p.canton} · {p.province}</h2>
            <ul className="nearby">
              {p.nearby.map(n => <li key={n.name.en}><span>{n.name[lang]}</span><span className="mono">{n.minutes} min</span></li>)}
              <li className="fine">{tx('Typical drive times, outside rush hour.', 'Tiempos de manejo típicos, fuera de hora pico.')}</li>
            </ul>
          </div>
          <MapView items={[]} points={[{ id: p.slug, label: p.name, lat: p.lat, lng: p.lng }]} mini />
        </div>
      </section>

      <section className="section quote" ref={formRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{delivered ? tx('Next projects', 'Próximos proyectos') : tx('Price list and plans', 'Lista de precios y planos')}</p>
            <h2 className="h2">{delivered
              ? tx('Be first in line for the next one.', 'Sea de los primeros en el próximo.')
              : tx(`Get the full price list for ${p.name}.`, `Reciba la lista de precios completa de ${p.name}.`)}</h2>
            <p className="lead">{delivered
              ? tx('We will write before the next launch, with plans and launch prices.', 'Le escribimos antes del próximo lanzamiento, con planos y precios de lanzamiento.')
              : tx('We send the available units, finishes catalogue and the payment plan for the unit you choose. You can also visit the site or the model unit.', 'Le enviamos las unidades disponibles, el catálogo de acabados y el plan de pagos de la unidad que escoja. También puede visitar la obra o la unidad modelo.')}</p>
            <ul className="check-list">
              <li><IconCheck size={18} /> {tx('Site visits Monday to Saturday', 'Visitas a la obra de lunes a sábado')}</li>
              <li><IconCheck size={18} /> {tx('Monthly progress report by email', 'Informe de avance mensual por correo')}</li>
            </ul>
            {advisor && (
              <div className="aside-card advisor">
                <span className="avatar">{advisor.initials}</span>
                <div>
                  <strong>{advisor.name}</strong>
                  <span>{pick(advisor.role, lang)}</span>
                  <span className="mono">{advisor.languages}</span>
                </div>
              </div>
            )}
          </div>
          <ContactForm
            context={delivered ? `${tx('Waiting list', 'Lista de espera')} · ${p.name}` : `${p.name} · ${type.name[lang]}`}
            defaultInterest="presale"
            submitLabel={delivered ? tx('Join the list', 'Unirme a la lista') : tx('Send me the price list', 'Enviarme la lista de precios')}
          />
        </div>
      </section>

      <section className="section similar">
        <div className="wrap-wide">
          <div className="section-head row">
            <p className="eyebrow">{tx('Other projects', 'Otros proyectos')}</p>
            <button type="button" className="link-btn" onClick={() => navigate({ name: 'projects' })}>{tx('All projects', 'Todos los proyectos')} <IconArrow size={16} /></button>
          </div>
          <div className="proj-grid">
            {others.map((o, i) => <Reveal key={o.slug} delay={i * 0.08}><ProjectCard p={o} /></Reveal>)}
          </div>
        </div>
      </section>

      <Lightbox photos={p.photos} title={p.name} index={lightbox} onClose={() => setLightbox(null)} />
    </article>
  );
}
