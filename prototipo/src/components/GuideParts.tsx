// Shared pieces for the buyer guides: rich text, guide icons and the guide card.
import { Fragment, type ReactNode } from 'react';
import type { Guide, GuideIcon } from '../data/guides';
import { pick, useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { IconArrow, IconCalc, IconList, IconPlane } from './Icons';

/** Renders **bold** inside guide text. */
export function rich(text: string): ReactNode {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}

const IconCoast = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2.5-1.5 4.5-1.5S18 17 21 17M3 21c2 0 2-1.5 4.5-1.5S9.5 21 12 21s2.5-1.5 4.5-1.5S18 21 21 21" />
    <path d="M14 13V6m0 0c-2.5-1.5-5-1-6 1m6-1c2.5-1.5 5-1 6 1" />
  </svg>
);

export function GuideIconView({ icon, size = 22 }: { icon: GuideIcon; size?: number }) {
  switch (icon) {
    case 'steps': return <IconList size={size} />;
    case 'coast': return <IconCoast size={size} />;
    case 'passport': return <IconPlane size={size} />;
    case 'tax': return <IconCalc size={size} />;
  }
}

export function GuideCard({ g, index, compact }: { g: Guide; index: number; compact?: boolean }) {
  const { lang, tx } = useLang();
  return (
    <Link to={{ name: 'guide', slug: g.slug }} className={`guide-card ${compact ? 'is-compact' : ''}`}>
      <span className="guide-card-top">
        <span className="guide-card-icon"><GuideIconView icon={g.icon} /></span>
        <span className="guide-card-n mono">{String(index + 1).padStart(2, '0')}</span>
      </span>
      <strong className="guide-card-title">{pick(compact ? g.short : g.title, lang)}</strong>
      {!compact && <span className="guide-card-desc">{pick(g.description, lang)}</span>}
      {!compact && (
        <span className="guide-card-topics">
          {g.topics.map((t, i) => <span key={i}>{pick(t, lang)}</span>)}
        </span>
      )}
      <span className="guide-card-foot">
        <span className="mono">{tx(`${g.minutes} min read`, `${g.minutes} min de lectura`)}</span>
        <span className="guide-card-go">{tx('Read', 'Leer')} <IconArrow size={16} /></span>
      </span>
    </Link>
  );
}
