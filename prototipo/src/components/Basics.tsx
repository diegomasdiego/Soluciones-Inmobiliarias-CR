import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getMedia } from '../lib/media';
import { money } from '../lib/format';
import { useStore } from '../lib/store';
import { IconHeart } from './Icons';

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <ellipse cx="24" cy="27" rx="20" ry="14" />
      <ellipse cx="23" cy="24.5" rx="13.5" ry="9.5" />
      <ellipse cx="22.5" cy="22" rx="7.5" ry="5.2" />
      <circle cx="22.2" cy="20.8" r="1.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-word">Soluciones</span>
        <span className="logo-sub">Inmobiliarias · CR</span>
      </span>
    </span>
  );
}

type ImgProps = { name: string; alt: string; className?: string; style?: CSSProperties; eager?: boolean; sizes?: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

/** Image from the media manifest, with a blurred placeholder while it loads. */
export function Img({ name, alt, className, style, eager, ...rest }: ImgProps) {
  const m = getMedia(name);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { if (ref.current?.complete) setLoaded(true); }, []);
  return (
    <img
      ref={ref}
      src={m.src}
      alt={alt}
      width={m.w}
      height={m.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`img ${loaded ? 'is-loaded' : ''} ${className ?? ''}`}
      style={{ backgroundImage: m.blur ? `url(${m.blur})` : undefined, ...style }}
      {...rest}
    />
  );
}

/** Price that animates when the currency changes. */
export function Price({ usd, className, prefix }: { usd: number; className?: string; prefix?: string }) {
  const { currency, rate } = useStore();
  return (
    <span className={`price-roll ${className ?? ''}`}>
      {prefix && <span className="price-prefix">{prefix} </span>}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={currency}
          initial={{ y: '70%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-70%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{ display: 'inline-block' }}
        >
          {money(usd, currency, rate)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function SaveButton({ slug, className, label }: { slug: string; className?: string; label?: boolean }) {
  const { saved, toggleSaved, notify } = useStore();
  const on = saved.includes(slug);
  return (
    <button
      type="button"
      className={`save-btn ${on ? 'is-on' : ''} ${className ?? ''}`}
      aria-pressed={on}
      aria-label={on ? 'Remove from saved' : 'Save property'}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleSaved(slug);
        notify(added ? 'Saved. Compare saved homes side by side in phase 2.' : 'Removed from saved.');
      }}
    >
      <motion.span key={String(on)} initial={on ? { scale: 0.6 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} style={{ display: 'inline-flex' }}>
        <IconHeart size={18} />
      </motion.span>
      {label && <span>{on ? 'Saved' : 'Save'}</span>}
    </button>
  );
}

export function CurrencyToggle({ dark }: { dark?: boolean }) {
  const { currency, setCurrency } = useStore();
  return (
    <div className={`seg ${dark ? 'seg-dark' : ''}`} role="group" aria-label="Currency">
      {(['USD', 'CRC'] as const).map(c => (
        <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)}>
          {currency === c && <motion.span layoutId={`seg-${dark ? 'd' : 'l'}`} className="seg-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="seg-label">{c === 'USD' ? 'USD $' : 'CRC ₡'}</span>
        </button>
      ))}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className ?? ''}`}>{children}</p>;
}
