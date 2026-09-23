// The client's logo (vectorized from logo.JPG) recolored with the site palette.
// LogoLockup: building + the three lines of lettering side by side, for the header (uses currentColor).
// LogoBadge: the full circular emblem, for the footer and brand surfaces.
import { useId } from 'react';
import { LOGO } from '../data/logo';

type PartName = keyof typeof LOGO.paths;
type BoxName = keyof typeof LOGO.box;

function Part({ name, box, x, y, s }: { name: PartName; box: BoxName; x: number; y: number; s: number }) {
  const [bx, by] = LOGO.box[box];
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-bx} ${-by})`}>
      <path d={LOGO.paths[name]} fillRule="evenodd" />
    </g>
  );
}

const GAP1 = 30, GAP2 = 26, MARK_GAP = 110;

export function LogoLockup({ className }: { className?: string }) {
  const [, , mw, mh] = LOGO.box.mark;
  const lines = (['line1', 'line2', 'line3'] as const).map(k => LOGO.box[k]);
  const textH = lines[0][3] + GAP1 + lines[1][3] + GAP2 + lines[2][3];
  const s = mh / textH;
  const textW = Math.max(...lines.map(b => b[2])) * s;
  const x0 = mw + MARK_GAP;
  let y = 0;
  const parts = (['line1', 'line2', 'line3'] as const).map((k, i) => {
    const b = LOGO.box[k];
    const el = <Part key={k} name={k} box={k} x={x0 + (textW - b[2] * s) / 2} y={y} s={s} />;
    y += b[3] * s + (i === 0 ? GAP1 : GAP2) * s;
    return el;
  });
  return (
    <svg className={className} viewBox={`0 0 ${Math.ceil(x0 + textW)} ${mh}`} fill="currentColor" role="img" aria-label="Soluciones Inmobiliarias C.R.">
      <Part name="mark" box="mark" x={0} y={0} s={1} />
      {parts}
    </svg>
  );
}

// cafetal / basalto: filled disc. on-dark / on-light: linework only, for dark or light backgrounds.
type BadgeVariant = 'cafetal' | 'basalto' | 'on-dark' | 'on-light';
const badgeColors: Record<BadgeVariant, { disc?: string; from: string; to: string }> = {
  cafetal: { disc: '#1E4A3B', from: '#F4F6F2', to: '#C9D6CD' },
  basalto: { disc: '#151B18', from: '#F4F6F2', to: '#D9B3E6' },
  'on-dark': { from: '#F4F6F2', to: '#D9B3E6' },
  'on-light': { from: '#1E4A3B', to: '#2A6250' },
};

export function LogoBadge({ variant = 'cafetal', className }: { variant?: BadgeVariant; className?: string }) {
  const id = useId().replace(/:/g, '');
  const c = badgeColors[variant];
  const [x, y, w, h] = LOGO.box.badge;
  const all = Object.values(LOGO.paths).join(' ');
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label="Soluciones Inmobiliarias C.R.">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>
      {c.disc && <circle cx={LOGO.size / 2} cy={LOGO.size / 2} r={w / 2} fill={c.disc} />}
      <path d={all} fill={`url(#lg-${id})`} fillRule="evenodd" />
    </svg>
  );
}
