// Projects and pre-sales (#projects): projects in launch, under construction and delivered.
import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { projects, unitsAvailable, type ProjectStage } from '../data/projects';
import { useLang } from '../lib/i18n';
import { Img } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconCalc, IconCheck, IconExcavator, IconPhotos, IconShield } from '../components/Icons';
import { ProjectCard } from '../components/ProjectParts';

type Filter = 'all' | ProjectStage;

export default function Projects() {
  const { lang, tx } = useLang();
  const hero = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [filter, setFilter] = useState<Filter>('all');
  const ease = [0.2, 0.8, 0.2, 1] as const;

  const active = projects.filter(p => p.stage !== 'delivered');
  const available = active.reduce((s, p) => s + unitsAvailable(p), 0);
  const counts = useMemo(() => ({
    all: projects.length,
    launch: projects.filter(p => p.stage === 'launch').length,
    construction: projects.filter(p => p.stage === 'construction').length,
    delivered: projects.filter(p => p.stage === 'delivered').length,
  }), []);
  const shown = projects.filter(p => filter === 'all' || p.stage === filter);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: tx('All', 'Todos') },
    { id: 'launch', label: tx('Pre-sale launch', 'Preventa de lanzamiento') },
    { id: 'construction', label: tx('Under construction', 'En construcción') },
    { id: 'delivered', label: tx('Delivered', 'Entregados') },
  ];
  const steps = [
    { title: tx('Reserve', 'Reserve'), body: tx('A small refundable deposit holds the unit and the pre-sale price while you review the contract.', 'Un depósito pequeño y reembolsable aparta la unidad y el precio de preventa mientras revisa el contrato.') },
    { title: tx('Sign', 'Firme'), body: tx('The purchase contract fixes price, finishes, delivery date and the payment plan. About 10% is paid at signing.', 'El contrato de compraventa fija precio, acabados, fecha de entrega y plan de pagos. Al firmar se paga cerca del 10%.') },
    { title: tx('Pay as it’s built', 'Pague según avanza'), body: tx('Each payment is due only when a construction milestone is reached and verified, never on a fixed calendar.', 'Cada pago se cobra solo cuando se alcanza y se verifica un hito de obra, nunca por calendario fijo.') },
    { title: tx('Receive and register', 'Reciba e inscriba'), body: tx('At delivery you pay the balance, usually with a bank mortgage, and the unit is registered in your name.', 'Al entregar paga el saldo, usualmente con crédito hipotecario, y la unidad se inscribe a su nombre.') },
  ];
  const promises = [
    { icon: <IconPhotos size={22} />, title: tx('Monthly progress reports', 'Informe de avance cada mes'), body: tx('Photos and a percentage for every project, the same figures you see on these pages.', 'Fotos y porcentaje de cada proyecto, las mismas cifras que ve en estas páginas.') },
    { icon: <IconShield size={22} />, title: tx('Title checked before launch', 'Estudio registral antes de lanzar'), body: tx('We study the mother property, permits and zoning before a project goes on sale.', 'Estudiamos la finca madre, los permisos y el uso de suelo antes de poner un proyecto a la venta.') },
    { icon: <IconCalc size={22} />, title: tx('Payments in escrow', 'Pagos en escrow'), body: tx('Your payments go to a regulated escrow account and are released by milestone.', 'Sus pagos van a una cuenta escrow regulada y se liberan por hito.') },
    { icon: <IconExcavator size={22} />, title: tx('Our own earthworks crew', 'Nuestro propio equipo de movimiento de tierras'), body: tx('Land & Build prepares the sites, so the first months of the build stay on schedule.', 'Land & Build prepara los terrenos, así los primeros meses de la obra cumplen el calendario.') },
  ];

  return (
    <div className="projects-page">
      <section className="build-hero projects-hero" ref={hero}>
        <motion.div className="build-hero-bg" style={{ y }}><Img name="proj-rebar" alt={tx('Crew placing rebar on a building, with mountains behind', 'Cuadrilla colocando varilla en un edificio, con montañas al fondo')} eager /></motion.div>
        <div className="build-hero-shade" />
        <div className="wrap build-hero-inner">
          <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {tx('Projects & pre-sales', 'Proyectos y preventas')}
          </motion.p>
          <h1 className="hero-title hero-title-sm" key={lang}>
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1, ease }}>{tx('Buy at pre-sale.', 'Compre en preventa.')}</motion.span></span>{' '}
            <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.32, duration: 1, ease }}>{lang === 'es' ? <>Pague según <em>avanza la obra.</em></> : <>Pay as it’s <em>built.</em></>}</motion.span></span>
          </h1>
          <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            {tx(
              'New homes, apartments and lots in Escazú, Santa Ana, Heredia and Alajuela, with launch prices and payments tied to real construction progress.',
              'Casas, apartamentos y lotes nuevos en Escazú, Santa Ana, Heredia y Alajuela, con precios de lanzamiento y pagos ligados al avance real de la obra.',
            )}
          </motion.p>
          <motion.dl className="projects-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <div><dt>{tx('Projects on sale', 'Proyectos a la venta')}</dt><dd>{active.length}</dd></div>
            <div><dt>{tx('Units and lots available', 'Unidades y lotes disponibles')}</dt><dd>{available}</dd></div>
            <div><dt>{tx('Delivered on time', 'Entregados a tiempo')}</dt><dd>{counts.delivered}</dd></div>
          </motion.dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <p className="eyebrow">{tx('The projects', 'Los proyectos')}</p>
              <h2 className="h2">{tx('From launch to keys in hand', 'Del lanzamiento a la entrega de llaves')}</h2>
            </div>
            <div className="chips" role="group" aria-label={tx('Filter by stage', 'Filtrar por etapa')}>
              {filters.map(f => (
                <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label} <span className="mono chip-count">{counts[f.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="proj-grid">
            {shown.map((p, i) => <Reveal key={p.slug} delay={(i % 2) * 0.08}><ProjectCard p={p} /></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section presale-how">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{tx('How a pre-sale works', 'Cómo funciona una preventa')}</p>
            <h2 className="h2">{tx('Four steps, and you only pay for progress you can see', 'Cuatro pasos, y solo paga por avance que puede ver')}</h2>
          </div>
          <ol className="presale-steps">
            {steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.06}>
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="presale-promises">
            {promises.map((pr, i) => (
              <Reveal key={i} delay={i * 0.05} className="presale-promise">
                <span className="presale-icon">{pr.icon}</span>
                <div><h3>{pr.title}</h3><p>{pr.body}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section quote" ref={formRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{tx('Next launches', 'Próximos lanzamientos')}</p>
            <h2 className="h2">{tx('Hear about new projects before they go public.', 'Conozca los proyectos nuevos antes de que salgan al público.')}</h2>
            <p className="lead">{tx(
              'Launch prices go to the first buyers. Tell us the area, size and budget you have in mind and we will write when a project matches.',
              'Los precios de lanzamiento son para los primeros compradores. Cuéntenos la zona, el tamaño y el presupuesto que busca y le escribimos cuando un proyecto coincida.',
            )}</p>
            <ul className="check-list">
              <li><IconCheck size={18} /> {tx('No cost, no commitment', 'Sin costo ni compromiso')}</li>
              <li><IconCheck size={18} /> {tx('Plans and price list before the launch', 'Planos y lista de precios antes del lanzamiento')}</li>
            </ul>
          </div>
          <ContactForm context={tx('Waiting list: upcoming launches', 'Lista de espera: próximos lanzamientos')} defaultInterest="presale" submitLabel={tx('Join the list', 'Unirme a la lista')} />
        </div>
      </section>
    </div>
  );
}
