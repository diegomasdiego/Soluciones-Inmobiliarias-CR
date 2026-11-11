// Pieces of the projects and pre-sales pages: card, progress, milestone track, unit and lot plans, payment plan.
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { animate, motion, useInView } from 'motion/react';
import {
  deliveryDate, monthYear, paymentPlan, priceFrom, quarter, stageLabel, unitsAvailable, unitsTotal,
  type Project, type ProjectStage, type UnitPlan, type UnitType,
} from '../data/projects';
import { money } from '../lib/format';
import { useLang, type Lang } from '../lib/i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price } from './Basics';

/** 0.088 → "8.8%" (EN) / "8,8%" (ES); whole numbers without decimals. */
export function pctLabel(share: number, lang: Lang) {
  const v = Math.round(share * 1000) / 10;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return `${lang === 'es' ? s.replace('.', ',') : s}%`;
}

export function StageChip({ stage, className }: { stage: ProjectStage; className?: string }) {
  const { lang } = useLang();
  return <span className={`stage-chip is-${stage} ${className ?? ''}`}>{stageLabel[stage][lang]}</span>;
}

export function ProgressBar({ value, dark }: { value: number; dark?: boolean }) {
  const { lang, tx } = useLang();
  return (
    <div className={`pbar ${dark ? 'pbar-dark' : ''}`}>
      <div className="pbar-head">
        <span>{tx('Construction progress', 'Avance de obra')}</span>
        <strong className="mono">{pctLabel(value, lang)}</strong>
      </div>
      <div className="pbar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={tx('Construction progress', 'Avance de obra')}>
        <motion.span initial={{ width: 0 }} whileInView={{ width: `${value * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }} />
      </div>
    </div>
  );
}

/** Number that counts up the first time it scrolls into view. */
export function CountUp({ to, format }: { to: number; format: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: setV });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{format(v)}</span>;
}

export function ProjectCard({ p }: { p: Project }) {
  const { lang, tx } = useLang();
  const { navigate } = useRouter();
  const media = useRef<HTMLButtonElement>(null);
  const avail = unitsAvailable(p);
  const unitWord = p.types.every(t => t.lot) ? tx('lots', 'lotes') : tx('units', 'unidades');
  return (
    <article className="proj-card">
      <button ref={media} type="button" className="proj-card-media" onClick={() => navigate({ name: 'project', slug: p.slug }, { morph: media.current })} data-cursor={tx('View', 'Ver')} aria-label={tx(`Open ${p.name}`, `Abrir ${p.name}`)}>
        <Img name={p.hero} alt="" />
        <StageChip stage={p.stage} />
      </button>
      <div className="proj-card-body">
        <p className="eyebrow">{p.district}, {p.canton}</p>
        <h3><Link to={{ name: 'project', slug: p.slug }}>{p.name}</Link></h3>
        <p className="proj-card-kind">{p.kind[lang]}</p>
        <ProgressBar value={p.progress} />
        <dl className="proj-facts">
          <div><dt>{p.stage === 'delivered' ? tx('Sold from', 'Vendidas desde') : tx('From', 'Desde')}</dt><dd><Price usd={priceFrom(p)} /></dd></div>
          <div><dt>{p.stage === 'delivered' ? tx('Delivered', 'Entregado') : tx('Delivery', 'Entrega')}</dt><dd>{p.stage === 'delivered' ? monthYear(deliveryDate(p), lang) : quarter(deliveryDate(p), lang)}</dd></div>
          <div><dt>{tx('Available', 'Disponibles')}</dt><dd>{avail ? `${avail} / ${unitsTotal(p)} ${unitWord}` : tx('Sold out', 'Agotado')}</dd></div>
        </dl>
      </div>
    </article>
  );
}

export function MilestoneTrack({ p, dark }: { p: Project; dark?: boolean }) {
  const { lang, tx } = useLang();
  const n = p.milestones.length;
  const fill = Math.min(p.current, n - 1) / (n - 1);
  return (
    <div className={`mtrack ${dark ? 'mtrack-dark' : ''}`} style={{ '--mt-edge': `${50 / n}%` } as CSSProperties}>
      <div className="mtrack-line" aria-hidden="true">
        {/* --fill drives scaleX on wide screens and scaleY when the track turns vertical (see projects.css). */}
        <motion.span initial={{ '--fill': 0 } as never} whileInView={{ '--fill': p.stage === 'delivered' ? 1 : fill } as never} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }} />
      </div>
      <ol style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {p.milestones.map((m, i) => {
          const status = i < p.current ? 'done' : i === p.current ? 'current' : 'next';
          return (
            <li key={m.date + i} className={`is-${status}`} aria-current={status === 'current' ? 'step' : undefined}>
              <span className="mtrack-dot" aria-hidden="true" />
              <strong>{m.name[lang]}</strong>
              <span className="mono">{monthYear(m.date, lang)}</span>
              <em>{status === 'done' ? tx('Done', 'Listo') : status === 'current' ? tx('In progress', 'En curso') : tx('Planned', 'Previsto')}</em>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Labels are wrapped to fit their room: rough glyph widths for the plan font sizes, in grid units.
function wrapLabel(text: string, width: number) {
  for (const [size, glyph] of [[2.1, 1.12], [1.6, 0.86]] as const) {
    const max = Math.max(3, Math.floor((width - 2) / glyph));
    const lines: string[] = [];
    for (const word of text.split(' ')) {
      const last = lines[lines.length - 1];
      if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
      else lines.push(word);
    }
    if (lines.every(l => l.length <= max) && lines.length <= 2) return { size, lines };
    if (size === 1.6) return { size, lines: lines.slice(0, 3) };
  }
  return { size: 1.6, lines: [text] };
}

export function UnitPlanView({ plan, label }: { plan: UnitPlan; label: string }) {
  const { lang } = useLang();
  const hatch = `hatch-${useId().replace(/:/g, '')}`;
  return (
    <div className="plan unit-plan">
      <svg viewBox="0 0 100 60" className="plan-svg" role="img" aria-label={label}>
        <defs>
          <pattern id={hatch} width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="1.6" stroke="#9AA39C" strokeWidth=".25" />
          </pattern>
        </defs>
        {plan.floors?.map(f => <text key={f.x} x={f.x} y={5.8} className="plan-floor">{f.label[lang]}</text>)}
        {plan.rooms.map((r, i) => {
          const { size, lines } = wrapLabel(r.name[lang], r.w);
          return (
            <g key={i}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} className={`plan-room ${r.outdoor ? 'is-outdoor' : ''}`} fill={r.outdoor ? `url(#${hatch})` : undefined} />
              <text x={r.x + 1.2} y={r.y + size + 1.2} className="plan-label" style={{ fontSize: `${size}px` }}>
                {lines.map((l, j) => <tspan key={j} x={r.x + 1.2} dy={j ? size * 1.15 : 0}>{l}</tspan>)}
              </text>
            </g>
          );
        })}
        {plan.floors
          ? plan.floors.map(f => <rect key={f.x} x={f.x} y={8} width={f.w} height={48} className="plan-outline" />)
          : <rect x="4" y="4" width="92" height="52" className="plan-outline" />}
      </svg>
    </div>
  );
}

/**
 * Lot seen from above, street on the left: frontage runs along the street, depth to the right.
 * The hatched area is an example of what is left to build on inside typical setbacks.
 */
export function LotPlanView({ lot, label }: { lot: { front: number; depth: number }; label: string }) {
  const { lang, tx } = useLang();
  const hatch = `lot-${useId().replace(/:/g, '')}`;
  const street = 11;
  const scale = Math.min((100 - street - 4 - 9) / lot.depth, 44 / lot.front);
  const w = lot.depth * scale, h = lot.front * scale;
  const x = street + 4, y = (52 - h) / 2;
  const set = { front: 3 * scale, rear: 3 * scale, side: 1.5 * scale };
  const dec = (v: number) => (lang === 'es' ? String(v).replace('.', ',') : String(v));
  return (
    <div className="plan unit-plan">
      <svg viewBox="0 0 100 60" className="plan-svg" role="img" aria-label={label}>
        <defs>
          <pattern id={hatch} width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="1.6" stroke="#7E3A93" strokeWidth=".22" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={street} height="60" className="lot-street" />
        <text transform={`translate(${street / 2 + 0.7} 30) rotate(-90)`} className="lot-street-label" textAnchor="middle">{tx('Street', 'Calle')}</text>
        <rect x={x} y={y} width={w} height={h} className="lot-land" />
        <rect x={x + set.front} y={y + set.side} width={w - set.front - set.rear} height={h - 2 * set.side} fill={`url(#${hatch})`} className="lot-build" />
        <text x={x + w / 2} y={y + h / 2} className="plan-label" textAnchor="middle">{tx('Buildable area', 'Área para construir')}</text>
        <text x={x + w / 2} y={y + h / 2 + 2.6} className="plan-dims" textAnchor="middle">{tx('example setbacks', 'retiros de ejemplo')}</text>
        <rect x={x} y={y} width={w} height={h} className="plan-outline" />
        <line x1={x} y1={y + h + 2} x2={x + w} y2={y + h + 2} className="lot-dim" />
        <text x={x + w / 2} y={y + h + 5} className="plan-dims" textAnchor="middle">{tx('Depth', 'Fondo')} {dec(lot.depth)} m</text>
        <line x1={x + w + 2} y1={y} x2={x + w + 2} y2={y + h} className="lot-dim" />
        <text transform={`translate(${x + w + 4.6} ${y + h / 2}) rotate(-90)`} className="plan-dims" textAnchor="middle">{tx('Front', 'Frente')} {dec(lot.front)} m</text>
      </svg>
    </div>
  );
}

export function PaymentPlanView({ p, type }: { p: Project; type: UnitType }) {
  const { lang, tx } = useLang();
  const { currency, rate } = useStore();
  const rows = paymentPlan(p, type.priceUsd);
  const signing = rows[0].amount + rows[1].amount;
  const milestones = rows.filter(r => r.kind === 'milestone');
  const during = milestones.reduce((s, r) => s + r.amount, 0);
  const delivery = rows[rows.length - 1];
  const catchUp = rows[1].catchUp;
  const when = (r: (typeof rows)[number]) => {
    if (r.kind === 'reserve') return tx('Today', 'Hoy');
    if (r.kind === 'signing') return tx('Within 30 days', 'En los 30 días siguientes');
    if (r.kind === 'delivery') return quarter(r.date!, lang);
    return `${monthYear(r.date!, lang)} ${tx('(est.)', '(est.)')}`;
  };

  return (
    <div className="payplan">
      <div className="payplan-bar" aria-hidden="true">
        {rows.map((r, i) => (
          <motion.span
            key={`${type.id}-${i}`}
            className={`seg-${r.kind}`}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: r.share }}
            transition={{ duration: 0.8, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            title={`${r.label[lang]} · ${pctLabel(r.share, lang)}`}
          />
        ))}
      </div>

      <div className="payplan-sum">
        <div>
          <span>{tx('At signing, incl. reservation', 'Al firmar, con la reserva')}</span>
          <strong><Price usd={signing} /></strong>
          <em>{pctLabel(signing / type.priceUsd, lang)}</em>
        </div>
        <div>
          <span>{milestones.length ? tx(`During construction, ${milestones.length} payment${milestones.length > 1 ? 's' : ''}`, `Durante la obra, ${milestones.length} pago${milestones.length > 1 ? 's' : ''}`) : tx('During construction', 'Durante la obra')}</span>
          <strong><Price usd={during} /></strong>
          <em>{pctLabel(during / type.priceUsd, lang)}</em>
        </div>
        <div>
          <span>{tx('At delivery', 'Contra entrega')}</span>
          <strong><Price usd={delivery.amount} /></strong>
          <em>{pctLabel(delivery.share, lang)} · {tx('usually a bank mortgage', 'usualmente con crédito hipotecario')}</em>
        </div>
      </div>

      <div className="payplan-table-wrap">
        <table className="payplan-table">
          <thead>
            <tr><th>{tx('Payment', 'Pago')}</th><th>{tx('When', 'Cuándo')}</th><th className="num">%</th><th className="num">{tx('Amount', 'Monto')}</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`row-${r.kind}`}>
                <td><span className={`dot seg-${r.kind}`} aria-hidden="true" />{r.label[lang]}</td>
                <td>{when(r)}</td>
                <td className="num mono">{pctLabel(r.share, lang)}</td>
                <td className="num mono">{money(r.amount, currency, rate)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>{tx('Total', 'Total')} · {type.name[lang]}</td><td className="num mono">100%</td><td className="num mono">{money(type.priceUsd, currency, rate)}</td></tr>
          </tfoot>
        </table>
      </div>

      {catchUp ? (
        <p className="payplan-note">{tx(
          `The project has already passed ${pctLabel(catchUp, lang)} worth of milestones, so that share is paid with the contract. Buyers who sign later pay more up front and less during the build.`,
          `El proyecto ya pasó hitos por un ${pctLabel(catchUp, lang)} del precio, así que esa parte se paga con el contrato. Quien firma más tarde paga más al inicio y menos durante la obra.`,
        )}</p>
      ) : null}
      {p.presaleEdge ? (
        <p className="payplan-note">{tx(
          `Estimated list price when the project is delivered: about ${money(type.priceUsd * (1 + p.presaleEdge), currency, rate)} (${pctLabel(p.presaleEdge, lang)} more than today).`,
          `Precio de lista estimado al entregar el proyecto: unos ${money(type.priceUsd * (1 + p.presaleEdge), currency, rate)} (${pctLabel(p.presaleEdge, lang)} más que hoy).`,
        )}</p>
      ) : null}
      <p className="fine">{tx(
        'Example schedule with sample figures. The final plan, dates and price are set in the purchase contract; payments go to a regulated escrow account until delivery.',
        'Calendario de ejemplo con cifras ilustrativas. El plan, las fechas y el precio finales se fijan en el contrato de compraventa; los pagos van a una cuenta escrow regulada hasta la entrega.',
      )}</p>
    </div>
  );
}
