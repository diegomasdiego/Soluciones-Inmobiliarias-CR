'use client';
// Net income per month for a managed property: one series (bars), hover or focus a month to see
// its breakdown. The same figures are available as a table under the chart.
import { useEffect, useRef, useState } from 'react';
import type { PortalReport } from '../../data/portal';
import { money } from '../../lib/format';
import { useLang } from '../../lib/i18n';
import { fmtMonth } from '../../lib/when';

const H = 220;
const PAD = { top: 18, right: 8, bottom: 28, left: 52 };
const usd = (n: number) => money(n, 'USD', 1);
const net = (r: PortalReport) => r.incomeUsd - r.feeUsd - r.maintenanceUsd - r.otherUsd;

/** Round step for about four gridlines. */
function niceStep(range: number) {
  const raw = range / 4;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

/** A bar with 4px rounded corners on its data end only; the end at the baseline stays square. */
function barPath(x: number, w: number, y0: number, y1: number) {
  const up = y1 < y0;
  const h = Math.abs(y1 - y0);
  const r = Math.min(4, w / 2, h);
  if (h < 0.5) return '';
  return up
    ? `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`
    : `M${x},${y0} V${y1 - r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 - r} V${y0} Z`;
}

export function ReportChart({ reports }: { reports: PortalReport[] }) {
  const { lang, tx } = useLang();
  const [hover, setHover] = useState<number | null>(null);
  // Drawn at the box's real width, so labels keep their size on a phone.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const values = reports.map(net);
  const step = niceStep(Math.max(...values, 0) - Math.min(...values, 0) || 1000);
  const top = Math.ceil(Math.max(...values, 0) / step) * step || step;
  const bottom = Math.floor(Math.min(...values, 0) / step) * step;
  const plotH = H - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + ((top - v) / (top - bottom)) * plotH;
  const band = (W - PAD.left - PAD.right) / reports.length;
  const barW = Math.min(36, band * 0.56);
  const ticks: number[] = [];
  for (let v = bottom; v <= top + 0.5; v += step) ticks.push(v);
  const last = reports.length - 1;
  const r = hover !== null ? reports[hover] : null;

  return (
    <figure className="pd-chart">
      <figcaption className="pd-label">{tx('Net to you per month', 'Neto para usted por mes')}</figcaption>
      <div className="pd-chart-box" ref={box} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tx(
          `Net income per month, from ${usd(Math.min(...values))} to ${usd(Math.max(...values))}.`,
          `Ingreso neto por mes, de ${usd(Math.min(...values))} a ${usd(Math.max(...values))}.`,
        )}>
          {ticks.map(v => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className={v === 0 ? 'pd-axis' : 'pd-grid'} />
              <text x={PAD.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="pd-tick">{money(v, 'USD', 1)}</text>
            </g>
          ))}
          {reports.map((rep, i) => {
            const cx = PAD.left + band * i + band / 2;
            const v = values[i];
            return (
              <g key={rep._id}
                tabIndex={0}
                role="button"
                aria-label={`${fmtMonth(rep.month, lang)}: ${tx('net', 'neto')} ${usd(v)}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={`pd-bar ${hover === i ? 'is-on' : ''}`}>
                <rect x={cx - band / 2} y={PAD.top} width={band} height={plotH} className="pd-hit" />
                <path d={barPath(cx - barW / 2, barW, y(0), y(v))} />
                <text x={cx} y={H - 8} textAnchor="middle" className="pd-tick">{fmtMonth(rep.month, lang, false)}</text>
                {i === last && hover === null && <text x={cx} y={y(v) + (v >= 0 ? -6 : 14)} textAnchor="middle" className="pd-value">{usd(v)}</text>}
              </g>
            );
          })}
        </svg>
        {r && hover !== null && (
          <div className="pd-tip" style={{ left: Math.min(Math.max(PAD.left + band * hover + band / 2, 100), W - 100), top: Math.min(y(values[hover]), y(0)) }} role="status">
            <strong>{fmtMonth(r.month, lang)}</strong>
            <dl>
              <div><dt>{tx('Rent', 'Alquiler')}</dt><dd>{usd(r.incomeUsd)}</dd></div>
              <div><dt>{tx('Management', 'Administración')}</dt><dd>−{usd(r.feeUsd)}</dd></div>
              <div><dt>{tx('Maintenance', 'Mantenimiento')}</dt><dd>−{usd(r.maintenanceUsd)}</dd></div>
              <div><dt>{tx('HOA and other', 'Condominio y otros')}</dt><dd>−{usd(r.otherUsd)}</dd></div>
              <div className="is-net"><dt>{tx('Net', 'Neto')}</dt><dd>{usd(values[hover])}</dd></div>
            </dl>
            {r.note && <p>{r.note}</p>}
          </div>
        )}
      </div>
    </figure>
  );
}
