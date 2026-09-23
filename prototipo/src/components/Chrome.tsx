// Site chrome: header, footer, language switch, custom cursor, toast and scroll reveal.
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { company } from '../data/company';
import { pick, useLang } from '../lib/i18n';
import { Link, useRouter, type Route } from '../lib/router';
import { useStore } from '../lib/store';
import { CurrencyToggle, Logo } from './Basics';
import { IconClose, IconHeart, IconMenu } from './Icons';

export function LangToggle({ dark, big }: { dark?: boolean; big?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`seg seg-lang ${dark ? 'seg-dark' : ''} ${big ? 'seg-big' : ''}`} role="group" aria-label="Language / Idioma">
      {(['en', 'es'] as const).map(l => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l} aria-label={l === 'en' ? 'English' : 'Español'}>
          {lang === l && <motion.span layoutId={`lang-${dark ? 'd' : 'l'}${big ? 'b' : ''}`} className="seg-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="seg-label">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { route } = useRouter();
  const { saved, notify } = useStore();
  const { tx } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overDark = (route.name === 'home' || route.name === 'build') && !scrolled && !open;

  const nav: { label: string; to: Route }[] = [
    { label: tx('Buy', 'Comprar'), to: { name: 'search' } },
    { label: 'Land & Build', to: { name: 'build' } },
    { label: tx('True cost', 'Costo real'), to: { name: 'calculator' } },
    { label: tx('Contact', 'Contacto'), to: { name: 'contact' } },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [route.name]);
  useEffect(() => setOpen(false), [route]);

  return (
    <header className={`site-header ${overDark ? 'is-over-dark' : 'is-solid'} ${open ? 'is-open' : ''}`}>
      <div className="header-inner">
        <Link to={{ name: 'home' }} className="header-logo" aria-label={tx('Soluciones Inmobiliarias CR, home', 'Soluciones Inmobiliarias CR, inicio')}><Logo /></Link>
        <nav className="header-nav" aria-label={tx('Main', 'Principal')}>
          {nav.map(n => (
            <Link key={n.to.name} to={n.to} className={`nav-link ${route.name === n.to.name ? 'is-current' : ''}`} aria-current={route.name === n.to.name ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <CurrencyToggle dark={overDark} />
          <LangToggle dark={overDark} />
          <button
            type="button"
            className="saved-count"
            onClick={() => notify(saved.length
              ? tx(`${saved.length} saved. Side-by-side compare arrives in phase 2.`, `${saved.length} guardadas. El comparador llega en la fase 2.`)
              : tx('Tap the heart on any property to save it.', 'Toque el corazón de una propiedad para guardarla.'))}
            aria-label={tx(`${saved.length} saved properties`, `${saved.length} propiedades guardadas`)}
          >
            <IconHeart size={18} />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={saved.length} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{saved.length}</motion.span>
            </AnimatePresence>
          </button>
          <Link to={{ name: 'contact' }} className="btn btn-accent header-cta">{tx('Talk to an advisor', 'Hablar con un asesor')}</Link>
          <button type="button" className="menu-btn" aria-expanded={open} aria-label={open ? tx('Close menu', 'Cerrar menú') : tx('Open menu', 'Abrir menú')} onClick={() => setOpen(o => !o)}>
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobile-nav" aria-label={tx('Mobile', 'Móvil')} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {nav.map((n, i) => (
              <motion.div key={n.to.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={n.to} className="mobile-link">{n.label}</Link>
              </motion.div>
            ))}
            <div className="mobile-tools">
              <div><span className="mobile-tools-label">{tx('Language', 'Idioma')}</span><LangToggle big /></div>
              <div><span className="mobile-tools-label">{tx('Currency', 'Moneda')}</span><CurrencyToggle /></div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const { tx, lang } = useLang();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{tx('Verified homes, lots and farms in the western Central Valley, and the machines to prepare your land.', 'Casas, lotes y fincas verificados en el oeste del Valle Central, y la maquinaria para preparar su terreno.')}</p>
        </div>
        <div>
          <h4>{tx('Explore', 'Explorar')}</h4>
          <Link to={{ name: 'search' }}>{tx('Properties for sale', 'Propiedades en venta')}</Link>
          <Link to={{ name: 'build' }}>Land &amp; Build</Link>
          <Link to={{ name: 'calculator' }}>{tx('True-cost calculator', 'Calculadora de costo real')}</Link>
          <Link to={{ name: 'contact' }}>{tx('Contact', 'Contacto')}</Link>
        </div>
        <div>
          <h4>{tx('Areas', 'Zonas')}</h4>
          <span>Escazú</span><span>Santa Ana {tx('&', 'y')} Ciudad Colón</span><span>Heredia {tx('&', 'y')} Belén</span><span>Alajuela</span>
        </div>
        <div>
          <h4>{tx('Trust', 'Respaldo')}</h4>
          <span>{tx('Member, Cámara Costarricense de Corredores de Bienes Raíces (CCCBR)', 'Miembro de la Cámara Costarricense de Corredores de Bienes Raíces (CCCBR)')}</span>
          <span>{tx('Registered with SUGEF under Law 7786', 'Inscritos ante SUGEF según la Ley 7786')}</span>
          <span>{tx('Closings through SUGEF-regulated escrow agents', 'Cierres con agentes escrow regulados por SUGEF')}</span>
        </div>
        <div>
          <h4>{tx('Office', 'Oficina')}</h4>
          <span>{pick(company.office, lang)}</span>
          <span className="mono">{company.phone}</span>
          <span className="mono">{company.email}</span>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© 2026 {company.name}</span>
        <span>{tx('Prototype with sample listings, figures and testimonials. Photos: Unsplash, Pexels, Poly Haven (see CREDITS.md).', 'Prototipo con propiedades, cifras y testimonios de ejemplo. Fotos: Unsplash, Pexels, Poly Haven (ver CREDITS.md).')}</span>
      </div>
    </footer>
  );
}

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY); setVisible(true);
      const t = (e.target as Element | null)?.closest?.('[data-cursor]');
      setLabel(t ? t.getAttribute('data-cursor') : null);
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div className={`cursor ${label ? 'has-label' : ''}`} style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }} aria-hidden="true">
      <motion.div className="cursor-ring" animate={{ scale: label ? 1 : 0.28 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
        <AnimatePresence>{label && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{label}</motion.span>}</AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div className="toast-host" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast} className="toast" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}
