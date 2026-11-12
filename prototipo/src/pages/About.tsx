// About us (#about): the company's story, where it works, its credentials, team, partner network and clients.
// The brand is the company: no single person is featured. All names and dates are sample data.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react';
import { allies, groupLabels, lineLabels, milestones, stages, team, teamSize, type Ally, type AllyIcon, type Member, type Milestone, type TeamGroup } from '../data/about';
import { company, equipment, sellerTestimonials, testimonials, zones } from '../data/company';
import { useProperties } from '../lib/data';
import { pick, useLang } from '../lib/i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm, type InterestId } from '../components/ContactForm';
import { IconArrow, IconArrowLeft, IconBank, IconCalc, IconCheck, IconClose, IconExcavator, IconLock, IconPen, IconPlan, IconPlane, IconSearch, IconShield, IconTruck, IconUsers } from '../components/Icons';
import { LogoBadge } from '../components/Logo';
import { MapView } from '../components/MapView';
import { Topo, type TopoCenter } from '../components/Topo';

const ease = [0.2, 0.8, 0.2, 1] as const;
const credTopo: TopoCenter[] = [{ x: 0.12, y: 0.2, rings: 20, spacing: 30, seed: 3.1 }, { x: 0.95, y: 1.1, rings: 16, spacing: 32, seed: 0.9 }];
const OFFICE = { lat: 9.9405, lng: -84.1368 };

function Hero() {
  const { lang, tx } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  return (
    <section className="build-hero about-hero" ref={ref}>
      <motion.div className="build-hero-bg" style={{ y }}>
        <Img name="valley-dusk" alt={tx('The Central Valley at dusk from the hills of Escazú, with the city lights below', 'El Valle Central al atardecer desde los cerros de Escazú, con las luces de la ciudad abajo')} eager />
      </motion.div>
      <div className="build-hero-shade" />
      <div className="wrap build-hero-inner">
        <motion.p className="eyebrow eyebrow-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {tx('About us', 'Nosotros')}
        </motion.p>
        <h1 className="hero-title hero-title-sm" key={lang}>
          <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 1, ease }}>{tx('We grew', 'Crecimos')}</motion.span></span>{' '}
          <span className="line"><motion.span initial={{ y: '108%' }} animate={{ y: 0 }} transition={{ delay: 0.32, duration: 1, ease }}>{lang === 'es' ? <>en <em>terreno firme.</em></> : <>on <em>solid ground.</em></>}</motion.span></span>
        </h1>
        <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          {tx(
            `${company.name} started in 2015 as a small office in Escazú. Today it is a company of ${teamSize} people that sells homes, lots and farms in the western Central Valley, and prepares land with its own machines.`,
            `${company.name} empezó en 2015 como una oficina pequeña en Escazú. Hoy es una empresa de ${teamSize} personas que vende casas, lotes y fincas en el oeste del Valle Central, y prepara terrenos con su propia maquinaria.`,
          )}
        </motion.p>
        <motion.dl className="projects-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          {company.stats.map((s, i) => (
            <div key={i}><dt>{pick(s.unit, lang)} {pick(s.label, lang)}</dt><dd>{s.value}</dd></div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

function MilestoneItem({ m, reached, onActive }: { m: Milestone; reached: boolean; onActive: () => void }) {
  const { lang } = useLang();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => { if (inView) onActive(); }, [inView, onActive]);
  return (
    <li ref={ref} className={`tl-item line-${m.line} ${reached ? 'is-reached' : ''}`}>
      <span className="tl-dot" aria-hidden="true" />
      <p className="tl-meta"><span className="mono tl-year">{m.year}</span><span className="tl-tag">{pick(lineLabels[m.line], lang)}</span></p>
      <h3>{pick(m.title, lang)}</h3>
      <p>{pick(m.body, lang)}</p>
    </li>
  );
}

function Story() {
  const { lang, tx } = useLang();
  const rail = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rail, offset: ['start 55%', 'end 55%'] });
  const [active, setActive] = useState(0);
  const setters = useRef(milestones.map((_, i) => () => setActive(i))).current;
  const m = milestones[active];
  return (
    <section className="section about-story">
      <div className="wrap about-story-grid">
        <div className="about-story-side">
          <div className="about-story-sticky">
            <p className="eyebrow">{tx('Our story', 'Historia')}</p>
            <h2 className="h2">{tx('From a small office to a company', 'De una oficina pequeña a una empresa')}</h2>
            <p className="lead">{tx(
              'We grew one need at a time: buyers from abroad, title checks we could show, lots that had to be ready to build.',
              'Crecimos una necesidad a la vez: compradores del exterior, estudios registrales que se pudieran mostrar y lotes que tenían que quedar listos para construir.',
            )}</p>
            <div className={`about-year line-${m.line}`} aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={m.year} className="about-year-n" initial={{ y: '70%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-70%', opacity: 0 }} transition={{ duration: 0.5, ease }}>
                  {m.year}
                </motion.span>
              </AnimatePresence>
              <span className="about-year-tag">{pick(lineLabels[m.line], lang)} · {String(active + 1).padStart(2, '0')}/{String(milestones.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
        <div className="tl" ref={rail}>
          <div className="tl-rail" aria-hidden="true"><motion.div className="tl-fill" style={{ scaleY: scrollYProgress }} /></div>
          <ol className="tl-list">
            {milestones.map((mm, i) => <MilestoneItem key={mm.year} m={mm} reached={i <= active} onActive={setters[i]} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Where() {
  const { lang, tx } = useLang();
  const { properties } = useProperties();
  const { runQuery } = useStore();
  const { navigate } = useRouter();
  const office = { id: 'office', label: tx('Our office', 'Nuestra oficina'), ...OFFICE, showLabel: true };
  return (
    <section className="section about-where">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">{tx('What we do, and where', 'Qué hacemos y dónde')}</p>
          <h2 className="h2">{tx('Two lines of work, four valleys', 'Dos líneas de trabajo, cuatro valles')}</h2>
        </div>
        <div className="about-where-grid">
          <Reveal className="about-map-wrap">
            <MapView items={properties} points={[office]} mini className="about-map" />
            <p className="fine">{tx(`Illustrated map · each dot is one of our ${properties.length} listings`, `Mapa ilustrado · cada punto es una de nuestras ${properties.length} propiedades`)}</p>
          </Reveal>
          <div className="about-lines">
            <Reveal className="about-line">
              <p className="eyebrow">{tx('Real estate', 'Bienes raíces')}</p>
              <h3 className="h3">{tx('Homes, condos, lots and farms', 'Casas, apartamentos, lotes y fincas')}</h3>
              <p>{tx('Buying, selling and pre-sales, with a title study before anything is listed.', 'Compra, venta y preventas, con estudio registral antes de publicar.')}</p>
              <ul className="about-zones">
                {zones.map(z => {
                  const name = pick(z.name, lang);
                  const n = properties.filter(p => z.area.includes(p.area)).length;
                  return (
                    <li key={z.photo}>
                      <button type="button" onClick={() => { runQuery(name); navigate({ name: 'search' }); }}>
                        <span><strong>{name}</strong><span>{pick(z.tagline, lang)}</span></span>
                        <span className="mono">{tx(`${n} listed`, `${n} ${n === 1 ? 'publicada' : 'publicadas'}`)}</span>
                        <IconArrow size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
            <Reveal className="about-line about-line-build" delay={0.08}>
              <p className="eyebrow">Land &amp; Build</p>
              <h3 className="h3">{tx(`${equipment.length} machines of our own, with operators`, `${equipment.length} máquinas propias, con operador`)}</h3>
              <p>{tx('Clearing, terraces, trenches and hauling, so the lots we sell are ready for a builder.', 'Limpieza, terrazas, zanjas y acarreo, para que los lotes que vendemos queden listos para construir.')}</p>
              <ul className="machine-chips about-machines">
                {equipment.map(e => <li key={e.id}>{pick(e.name, lang)}</li>)}
              </ul>
              <Link to={{ name: 'build' }} className="link-btn">{tx('See Land & Build', 'Ver Land & Build')} <IconArrow size={18} /></Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Credentials() {
  const { tx } = useLang();
  const items = [
    {
      icon: <IconUsers size={22} />, meta: tx('Members since 2019', 'Afiliados desde 2019'),
      title: tx('Members of the CCCBR', 'Miembros de la CCCBR'),
      body: tx(
        'Costa Rica does not license brokers. The Costa Rican Chamber of Real Estate Brokers asks its members to follow a code of ethics and to keep training, and that is the standard we hold ourselves to.',
        'En Costa Rica no se exige licencia para ser corredor. La Cámara Costarricense de Corredores de Bienes Raíces pide a sus miembros seguir un código de ética y capacitarse, y ese es el estándar que nos ponemos.',
      ),
    },
    {
      icon: <IconShield size={22} />, meta: tx('Law 7786, art. 15 bis · since 2018', 'Ley 7786, art. 15 bis · desde 2018'),
      title: tx('Registered with SUGEF', 'Inscritos ante SUGEF'),
      body: tx(
        'Every company that buys and sells real estate professionally must register as a reporting entity. That is why we ask for your ID and the source of the funds: it is the law, and it protects you too.',
        'Toda empresa que se dedica a la compra y venta de inmuebles debe inscribirse como sujeto obligado. Por eso le pedimos su identificación y el origen de los fondos: es la ley, y también le protege a usted.',
      ),
    },
    {
      icon: <IconLock size={22} />, meta: tx('SUGEF-regulated escrow', 'Escrow regulado por SUGEF'),
      title: tx('Your money never goes through us', 'El dinero nunca pasa por nosotros'),
      body: tx(
        'Deposits and the final payment go to a regulated escrow agent, who releases them when the deed is recorded at the Registro Nacional.',
        'Los depósitos y el pago final van a un agente escrow regulado, que los libera cuando la escritura queda inscrita en el Registro Nacional.',
      ),
    },
    {
      icon: <IconCheck size={22} />, meta: 'Solid Ground Verified',
      title: tx('A title study on every listing', 'Estudio registral en cada ficha'),
      body: tx(
        'Before we list, we check the title, match the cadastral plan to the land and rule out liens. The listing shows what we checked and when.',
        'Antes de publicar revisamos el folio real, comparamos el plano catastrado con el terreno y descartamos gravámenes. La ficha muestra qué revisamos y cuándo.',
      ),
    },
  ];
  return (
    <section className="section about-creds" aria-labelledby="creds-title">
      <Topo className="about-creds-topo" centers={credTopo} color="rgba(232,238,232,.09)" />
      <div className="wrap about-creds-grid">
        <div className="about-creds-head">
          <LogoBadge variant="on-dark" className="about-creds-badge" />
          <p className="eyebrow eyebrow-light">{tx('Credentials', 'Respaldo')}</p>
          <h2 className="h2 light" id="creds-title">{tx('What stands behind every sale', 'Lo que respalda cada venta')}</h2>
          <Link to={{ name: 'search' }} className="link-btn about-creds-link">{tx('See verified listings', 'Ver propiedades verificadas')} <IconArrow size={18} /></Link>
        </div>
        <ul className="about-creds-list">
          {items.map((c, i) => (
            <Reveal as="li" key={i} delay={i * 0.06} className="cred">
              <span className="cred-icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <span className="mono cred-meta">{c.meta}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Team({ onWrite }: { onWrite: (m: Member) => void }) {
  const { lang, tx } = useLang();
  const [group, setGroup] = useState<TeamGroup | 'all'>('all');
  const groups = Object.keys(groupLabels) as TeamGroup[];
  const size = (g: TeamGroup | 'all') => team.filter(m => g === 'all' || m.group === g).reduce((n, m) => n + (m.count ?? 1), 0);
  const shown = team.filter(m => group === 'all' || m.group === group);
  return (
    <section className="section about-team">
      <div className="wrap">
        <div className="about-team-intro">
          <div className="about-team-copy">
            <p className="eyebrow">{tx('Team', 'Equipo')}</p>
            <h2 className="h2">{tx('A team, not a single person', 'Un equipo, no una sola persona')}</h2>
            <p className="lead">{tx(
              'Every client has a lead advisor. Behind them work title studies, closings, compliance, production and the machine crew, so nothing depends on one person’s calendar.',
              'Cada cliente tiene un asesor principal. Detrás trabajan estudios registrales, cierres, cumplimiento, producción y la cuadrilla de maquinaria, así que nada depende de la agenda de una sola persona.',
            )}</p>
          </div>
          <Reveal className="about-team-img">
            <Img name="about-team" alt={tx('Team members working around a wooden table with notebooks and papers', 'Integrantes del equipo trabajando alrededor de una mesa de madera con cuadernos y papeles')} />
          </Reveal>
        </div>

        <div className="team-filter" role="group" aria-label={tx('Filter the team by area', 'Filtrar el equipo por área')}>
          {(['all', ...groups] as const).map(g => (
            <button key={g} type="button" className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g === 'all' ? tx('Everyone', 'Todos') : pick(groupLabels[g], lang)}
              <span className="chip-count">{size(g)}</span>
            </button>
          ))}
        </div>

        <motion.ul className="team-grid" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map(m => {
              const name = pick(m.name, lang);
              return (
                <motion.li
                  key={m.id}
                  layout
                  className={`team-card g-${m.group}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <div className="team-top">
                    <span className={`team-avatar ${m.count ? 'is-crew' : ''}`} aria-hidden="true">{m.count ? <><IconExcavator size={20} /><small>×{m.count}</small></> : m.initials}</span>
                    <span className="team-group mono">{pick(groupLabels[m.group], lang)}</span>
                  </div>
                  <h3>{name}</h3>
                  <p className="team-role">{pick(m.role, lang)}</p>
                  <p className="team-focus">{pick(m.focus, lang)}</p>
                  <p className="team-meta mono"><span>{m.languages}</span><span>{tx(`Since ${m.since}`, `Desde ${m.since}`)}</span></p>
                  {m.contact && (
                    <button type="button" className="link-btn team-write" onClick={() => onWrite(m)}>
                      {tx(`Write to ${name.split(' ')[0]}`, `Escribirle a ${name.split(' ')[0]}`)} <IconArrow size={16} />
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

const allyIcons: Record<AllyIcon, ReactNode> = {
  team: <IconUsers size={20} />, pen: <IconPen size={20} />, lock: <IconLock size={20} />, plan: <IconPlan size={20} />,
  inspect: <IconSearch size={20} />, calc: <IconCalc size={20} />, bank: <IconBank size={20} />, plane: <IconPlane size={20} />, truck: <IconTruck size={20} />,
};

function AllyRow({ a, open, onToggle }: { a: Ally; open: boolean; onToggle: () => void }) {
  const { lang, tx } = useLang();
  const on = stages.map(s => a.when.includes(s.id));
  const when = stages.filter(s => a.when.includes(s.id)).map(s => pick(s.label, lang)).join(' · ');
  const panel = `ally-${a.id}`;
  return (
    <li className={`ally ${open ? 'is-open' : ''} ${a.own ? 'is-own' : ''}`}>
      <button type="button" className="ally-row" aria-expanded={open} aria-controls={panel} onClick={onToggle}>
        <span className="ally-name">
          <span className="ally-icon">{allyIcons[a.icon]}</span>
          <span><strong>{pick(a.name, lang)}</strong><span>{pick(a.count, lang)}</span></span>
        </span>
        <span className="ally-stages" aria-hidden="true">
          {on.map((v, i) => (
            <span key={i} className={`ally-cell ${v ? 'on' : ''} ${v && !on[i - 1] ? 'start' : ''} ${v && !on[i + 1] ? 'end' : ''}`}><i /></span>
          ))}
        </span>
        <span className="sr-only">{tx(`Takes part in: ${when}`, `Participa en: ${when}`)}</span>
        <span className="ally-when mono" aria-hidden="true">{when}</span>
        <span className="ally-chev" aria-hidden="true"><IconArrow size={16} /></span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panel} className="ally-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }}>
            <p>{pick(a.body, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function Allies() {
  const { lang, tx } = useLang();
  const [open, setOpen] = useState<string | null>('us');
  return (
    <section className="section about-allies">
      <div className="wrap">
        <div className="about-allies-head">
          <div className="section-head">
            <p className="eyebrow">{tx('Partner network', 'Red de aliados')}</p>
            <h2 className="h2">{tx('Everyone a purchase needs, already on call', 'Todos los que necesita una compra, ya coordinados')}</h2>
            <p className="lead">{tx(
              'Notaries, escrow agents, engineers and machinery we have worked with for years. We introduce at least two options where there is a choice, and you can always bring your own.',
              'Notarías, agentes escrow, ingenieros y maquinaria con los que trabajamos desde hace años. Donde hay opción le presentamos al menos dos, y usted siempre puede llevar a los suyos.',
            )}</p>
          </div>
          <Reveal className="about-allies-img">
            <Img name="about-signing" alt={tx('Hands reviewing and signing an offer to purchase', 'Manos revisando y firmando una oferta de compra')} />
          </Reveal>
        </div>
        <div className="ally-table">
          <div className="ally-head" aria-hidden="true">
            <span>{tx('Who', 'Quién')}</span>
            <span className="ally-stages">{stages.map(s => <span key={s.id}>{pick(s.label, lang)}</span>)}</span>
            <span />
          </div>
          <ul className="ally-list">
            {allies.map(a => <AllyRow key={a.id} a={a} open={open === a.id} onToggle={() => setOpen(o => (o === a.id ? null : a.id))} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}

type Voice = { quote: string; name: string; detail: string; tag: 'buy' | 'sell' | 'build' };

function Voices() {
  const { lang, tx } = useLang();
  const voices: Voice[] = [
    ...testimonials.map((t, i): Voice => ({ quote: pick(t.quote, lang), name: t.name, detail: pick(t.detail, lang), tag: i === 1 ? 'build' : 'buy' })),
    ...sellerTestimonials.map((t): Voice => ({ quote: pick(t.quote, lang), name: t.name, detail: pick(t.detail, lang), tag: 'sell' })),
  ];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => { setDir(n > i || (i === voices.length - 1 && n === 0) ? 1 : -1); setI((n + voices.length) % voices.length); };
  const v = voices[i];
  const tags = { buy: tx('Bought', 'Compró'), sell: tx('Sold', 'Vendió'), build: 'Land & Build' };
  return (
    <section className="section about-voices" aria-roledescription="carousel" aria-label={tx('Client stories', 'Historias de clientes')}>
      <div className="wrap about-voices-grid">
        <div className="about-voices-side">
          <p className="eyebrow">{tx('Clients', 'Clientes')}</p>
          <h2 className="h2">{tx('In their words', 'En sus palabras')}</h2>
          <div className="voices-nav">
            <button type="button" className="icon-btn" onClick={() => go(i - 1)} aria-label={tx('Previous story', 'Historia anterior')}><IconArrowLeft size={18} /></button>
            <span className="mono">{String(i + 1).padStart(2, '0')} / {String(voices.length).padStart(2, '0')}</span>
            <button type="button" className="icon-btn" onClick={() => go(i + 1)} aria-label={tx('Next story', 'Historia siguiente')}><IconArrow size={18} /></button>
          </div>
        </div>
        <div className="voices-stage" aria-live="polite">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.figure
              key={`${lang}-${i}`}
              className="voice"
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.45, ease }}
            >
              <span className={`voice-tag tag-${v.tag}`}>{tags[v.tag]}</span>
              <blockquote>“{v.quote}”</blockquote>
              <figcaption><strong>{v.name}</strong><span>{v.detail}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="voices-dots" role="group" aria-label={tx('Choose a story', 'Elegir una historia')}>
            {voices.map((vv, n) => (
              <button key={n} type="button" aria-pressed={n === i} aria-label={`${vv.name}`} onClick={() => go(n)}><span /></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const interestFor: Record<string, InterestId> = { mauricio: 'land', sofia: 'invest', esteban: 'build', gabriela: 'other' };

export default function About() {
  const { lang, tx } = useLang();
  const [to, setTo] = useState<Member | null>(null);
  const formRef = useRef<HTMLElement>(null);
  const write = (m: Member) => { setTo(m); formRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const toName = to ? pick(to.name, lang) : '';
  const interest = to ? interestFor[to.id] ?? 'home' : 'home';
  return (
    <div className="about-page">
      <Hero />
      <Story />
      <Where />
      <Credentials />
      <Team onWrite={write} />
      <Allies />
      <Voices />
      <section className="section quote" ref={formRef}>
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{tx('Let’s talk', 'Hablemos')}</p>
            <h2 className="h2">{to ? tx(`Write to ${toName}.`, `Escríbale a ${toName}.`) : tx('Who would you like to talk to?', '¿Con quién quiere hablar?')}</h2>
            <p className="lead">{to
              ? tx('We pass your message on with their name on it. If they are away, someone else on the team replies.', 'Le pasamos su mensaje con su nombre. Si no está disponible, le responde otra persona del equipo.')
              : tx('Tell us what you need and the right person on the team replies within one business day.', 'Cuéntenos qué necesita y la persona indicada del equipo le responde en menos de un día hábil.')}</p>
            <AnimatePresence initial={false}>
              {to && (
                <motion.div className={`about-to g-${to.group}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <span className="team-avatar" aria-hidden="true">{to.initials}</span>
                  <span><strong>{toName}</strong><span>{pick(to.role, lang)}</span></span>
                  <button type="button" className="icon-btn" onClick={() => setTo(null)} aria-label={tx('Send to the whole team instead', 'Enviar mejor a todo el equipo')}><IconClose size={16} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <ul className="check-list">
              <li><IconCheck size={18} /> {tx('Reply within one business day', 'Respuesta en menos de un día hábil')}</li>
              <li><IconCheck size={18} /> {tx('In English or Spanish', 'En español o en inglés')}</li>
            </ul>
          </div>
          <ContactForm
            key={interest}
            defaultInterest={interest}
            context={to ? tx(`Message for ${toName} (${pick(to.role, 'en')})`, `Mensaje para ${toName} (${pick(to.role, 'es')})`) : tx('About us: general enquiry', 'Nosotros: consulta general')}
          />
        </div>
      </section>
    </div>
  );
}
