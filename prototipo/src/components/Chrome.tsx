// Site chrome: header, footer, custom cursor, toast and scroll reveal.
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { company } from '../data/company';
import { Link, useRouter, type Route } from '../lib/router';
import { useStore } from '../lib/store';
import { CurrencyToggle, Logo } from './Basics';
import { IconClose, IconHeart, IconMenu } from './Icons';

const nav: { label: string; to: Route }[] = [
  { label: 'Buy', to: { name: 'search' } },
  { label: 'Land & Build', to: { name: 'build' } },
  { label: 'True cost', to: { name: 'calculator' } },
  { label: 'Contact', to: { name: 'contact' } },
];

export function Header() {
  const { route } = useRouter();
  const { saved, notify } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overDark = (route.name === 'home' || route.name === 'build') && !scrolled && !open;

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
        <Link to={{ name: 'home' }} className="header-logo" aria-label="Soluciones Inmobiliarias CR, home"><Logo /></Link>
        <nav className="header-nav" aria-label="Main">
          {nav.map(n => (
            <Link key={n.label} to={n.to} className={`nav-link ${route.name === n.to.name ? 'is-current' : ''}`} aria-current={route.name === n.to.name ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <CurrencyToggle dark={overDark} />
          <div className="lang" role="group" aria-label="Language">
            <button type="button" aria-pressed="true">EN</button>
            <button type="button" aria-pressed="false" onClick={() => notify('Versión en español: llega en la siguiente fase.')}>ES</button>
          </div>
          <button type="button" className="saved-count" onClick={() => notify(saved.length ? `${saved.length} saved. Side-by-side compare arrives in phase 2.` : 'Tap the heart on any property to save it.')} aria-label={`${saved.length} saved properties`}>
            <IconHeart size={18} />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={saved.length} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{saved.length}</motion.span>
            </AnimatePresence>
          </button>
          <Link to={{ name: 'contact' }} className="btn btn-accent header-cta">Talk to an advisor</Link>
          <button type="button" className="menu-btn" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}>
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobile-nav" aria-label="Mobile" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {nav.map((n, i) => (
              <motion.div key={n.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={n.to} className="mobile-link">{n.label}</Link>
              </motion.div>
            ))}
            <div className="mobile-tools"><CurrencyToggle /></div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Verified homes, lots and farms in the western Central Valley, and the machines to prepare your land.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to={{ name: 'search' }}>Properties for sale</Link>
          <Link to={{ name: 'build' }}>Land &amp; Build</Link>
          <Link to={{ name: 'calculator' }}>True-cost calculator</Link>
          <Link to={{ name: 'contact' }}>Contact</Link>
        </div>
        <div>
          <h4>Areas</h4>
          <span>Escazú</span><span>Santa Ana &amp; Ciudad Colón</span><span>Heredia &amp; Belén</span><span>Alajuela</span>
        </div>
        <div>
          <h4>Trust</h4>
          <span>Member, Cámara Costarricense de Corredores de Bienes Raíces (CCCBR)</span>
          <span>Registered with SUGEF under Law 7786</span>
          <span>Closings through SUGEF-regulated escrow agents</span>
        </div>
        <div>
          <h4>Office</h4>
          <span>{company.office}</span>
          <span className="mono">{company.phone}</span>
          <span className="mono">{company.email}</span>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© 2026 {company.name}</span>
        <span>Prototype with sample listings, figures and testimonials. Photos: Unsplash, Pexels, Poly Haven (see CREDITS.md).</span>
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
