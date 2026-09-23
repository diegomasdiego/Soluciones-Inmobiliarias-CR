import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Property } from '../data/properties';
import { roomName } from '../data/properties.es';
import { formatDate } from '../lib/format';
import { useLang } from '../lib/i18n';
import { Img } from './Basics';
import { IconArrow, IconArrowLeft, IconCheck, IconClose, IconShield } from './Icons';

export function VerifiedPanel({ p, dark }: { p: Pick<Property, 'legal'>; dark?: boolean }) {
  const { lang, tx } = useLang();
  const d = formatDate(p.legal.checked, lang);
  const checks = [
    { label: tx('Title (Folio Real) matches the seller', 'El folio real coincide con el vendedor'), meta: p.legal.folio },
    { label: tx('Cadastral plan matches the land', 'El plano catastrado coincide con el terreno'), meta: p.legal.plano },
    { label: tx('No liens, annotations or lawsuits', 'Sin gravámenes, anotaciones ni litigios'), meta: 'Registro Nacional' },
    { label: tx('Municipal taxes up to date', 'Impuestos municipales al día'), meta: tx('Municipality', 'Municipalidad') },
    { label: tx('Escrow-ready with a SUGEF-regulated agent', 'Listo para escrow con un agente regulado por SUGEF'), meta: 'Escrow' },
  ];
  return (
    <div className={`verified ${dark ? 'verified-dark' : ''}`}>
      <div className="verified-head">
        <IconShield size={22} />
        <div>
          <strong>Solid Ground Verified</strong>
          <span>{tx(`Checked on ${d} · refreshed before closing`, `Revisado el ${d} · se actualiza antes del cierre`)}</span>
        </div>
      </div>
      <ul>
        {checks.map((c, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 * i }}>
            <span className="verified-tick"><IconCheck size={14} /></span>
            <span>{c.label}</span>
            <span className="verified-meta">{c.meta}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function Lightbox({ photos, title, index, onClose }: { photos: string[]; title: string; index: number | null; onClose: () => void }) {
  const { tx } = useLang();
  const [i, setI] = useState(index ?? 0);
  const [dir, setDir] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (index != null) { setI(index); closeRef.current?.focus(); } }, [index]);

  const go = useCallback((d: number) => { setDir(d); setI(v => (v + d + photos.length) % photos.length); }, [photos.length]);

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, go, onClose]);

  return (
    <AnimatePresence>
      {index != null && (
        <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={tx(`${title} photos`, `Fotos de ${title}`)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="lightbox-bar">
            <span className="mono">{String(i + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
            <span className="lightbox-title">{title}</span>
            <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label={tx('Close photos', 'Cerrar fotos')}><IconClose /></button>
          </div>
          <div className="lightbox-stage" data-cursor={tx('Drag', 'Arrastre')}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={i}
                className="lightbox-slide"
                custom={dir}
                initial={{ x: dir >= 0 ? '12%' : '-12%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: dir >= 0 ? '-12%' : '12%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => { if (info.offset.x < -80) go(1); else if (info.offset.x > 80) go(-1); }}
              >
                <Img name={photos[i]} alt={tx(`${title}, photo ${i + 1}`, `${title}, foto ${i + 1}`)} eager draggable={false} />
              </motion.div>
            </AnimatePresence>
            <button type="button" className="lightbox-nav prev" onClick={() => go(-1)} aria-label={tx('Previous photo', 'Foto anterior')}><IconArrowLeft /></button>
            <button type="button" className="lightbox-nav next" onClick={() => go(1)} aria-label={tx('Next photo', 'Foto siguiente')}><IconArrow /></button>
          </div>
          <div className="lightbox-thumbs">
            {photos.map((ph, k) => (
              <button key={ph} type="button" className={k === i ? 'is-current' : ''} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} aria-label={tx(`Photo ${k + 1}`, `Foto ${k + 1}`)}>
                <Img name={ph} alt="" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloorPlan({ p, onOpenPhoto }: { p: Property; onOpenPhoto: (i: number) => void }) {
  const { lang, tx } = useLang();
  const [hover, setHover] = useState<number | null>(null);
  if (!p.plan) return null;
  const hs = hover != null ? p.plan.hotspots[hover] : null;
  return (
    <div className="plan">
      <svg viewBox="0 0 100 60" className="plan-svg" role="img" aria-label={tx(`Floor plan of ${p.title}`, `Plano de ${p.title}`)}>
        <defs>
          <pattern id="plan-hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="1.6" stroke="#9AA39C" strokeWidth=".25" />
          </pattern>
        </defs>
        {p.plan.rooms.map((r, i) => {
          const outdoor = /terrace|garden|deck/i.test(r.name);
          const dims = r.dims ? (r.dims.includes('pool') ? roomName(r.dims, lang) : lang === 'es' ? r.dims.replace(/(\d)\.(\d)/g, '$1,$2') : r.dims) : undefined;
          return (
            <g key={i}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} className={`plan-room ${outdoor ? 'is-outdoor' : ''}`} fill={outdoor ? 'url(#plan-hatch)' : undefined} />
              <text x={r.x + 1.4} y={r.y + 3.4} className="plan-label">{roomName(r.name, lang)}</text>
              {dims && <text x={r.x + 1.4} y={r.y + 6.2} className="plan-dims">{dims}</text>}
            </g>
          );
        })}
        <rect x="4" y="4" width="92" height="52" className="plan-outline" />
      </svg>
      {p.plan.hotspots.map((h, i) => (
        <button
          key={i}
          type="button"
          className="plan-hotspot"
          style={{ left: `${h.x}%`, top: `${(h.y / 60) * 100}%` }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          onClick={() => onOpenPhoto(h.photo)}
          aria-label={tx(`See photo: ${h.label}`, `Ver foto: ${roomName(h.label, lang)}`)}
        >
          <span />
        </button>
      ))}
      <AnimatePresence>
        {hs && (
          <motion.div
            className="plan-peek"
            style={{ left: `${Math.min(Math.max(hs.x, 18), 82)}%`, top: `${(hs.y / 60) * 100}%` }}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <Img name={p.photos[hs.photo]} alt="" />
            <span>{roomName(hs.label, lang)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
