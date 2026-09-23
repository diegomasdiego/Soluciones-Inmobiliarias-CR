import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getMedia } from '../lib/media';
import { money } from '../lib/format';
import { useLang } from '../lib/i18n';
import { useStore } from '../lib/store';
import { IconHeart } from './Icons';
import { LogoLockup } from './Logo';

export function Logo() {
  return (
    <span className="logo">
      <LogoLockup className="logo-lockup" />
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
  const { tx } = useLang();
  const on = saved.includes(slug);
  return (
    <button
      type="button"
      className={`save-btn ${on ? 'is-on' : ''} ${className ?? ''}`}
      aria-pressed={on}
      aria-label={on ? tx('Remove from saved', 'Quitar de guardadas') : tx('Save property', 'Guardar propiedad')}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleSaved(slug);
        notify(added
          ? tx('Saved. Compare saved homes side by side in phase 2.', 'Guardada. El comparador de propiedades llega en la fase 2.')
          : tx('Removed from saved.', 'Se quitó de guardadas.'));
      }}
    >
      <motion.span key={String(on)} initial={on ? { scale: 0.6 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} style={{ display: 'inline-flex' }}>
        <IconHeart size={18} />
      </motion.span>
      {label && <span>{on ? tx('Saved', 'Guardada') : tx('Save', 'Guardar')}</span>}
    </button>
  );
}

export function CurrencyToggle({ dark }: { dark?: boolean }) {
  const { currency, setCurrency } = useStore();
  const { tx } = useLang();
  return (
    <div className={`seg seg-currency ${dark ? 'seg-dark' : ''}`} role="group" aria-label={tx('Currency', 'Moneda')}>
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
