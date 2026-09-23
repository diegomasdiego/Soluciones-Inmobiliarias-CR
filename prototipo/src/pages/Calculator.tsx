import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { bySlug, properties, RESIDENCY_MIN_USD } from '../data/properties';
import { closingCosts, monthlyPayment, rentalYield, sum, yearlyHolding } from '../lib/costs';
import { money, pct } from '../lib/format';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { IconArrow, IconCheck } from '../components/Icons';

// Chart palette validated for color-vision deficiency (dataviz validator, light surface).
const SERIES = [
  { key: 'mortgage', label: 'Mortgage', color: '#138A5A' },
  { key: 'hoa', label: 'HOA / condo fee', color: '#9A55B0' },
  { key: 'tax', label: 'Property tax', color: '#B8791C' },
  { key: 'insurance', label: 'Insurance', color: '#2F7DC0' },
] as const;

type Loan = 'USD' | 'CRC';
const defaultRate: Record<Loan, number> = { USD: 7.5, CRC: 10 };

function MonthlyBar({ parts, format }: { parts: { key: string; label: string; color: string; value: number }[]; format: (v: number) => string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  const shown = parts.filter(p => p.value > 0);
  const h = shown.find(p => p.key === hover);
  return (
    <div className="mbar">
      <div className="mbar-track" role="img" aria-label={`Monthly cost breakdown: ${shown.map(p => `${p.label} ${format(p.value)}`).join(', ')}`}>
        {shown.map(p => (
          <motion.span
            key={p.key}
            className="mbar-seg"
            style={{ background: p.color }}
            animate={{ flexGrow: p.value / total }}
            transition={{ type: 'spring', stiffness: 160, damping: 26 }}
            onMouseEnter={() => setHover(p.key)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>
      <div className="mbar-tip" aria-hidden="true">{h ? <><span className="swatch" style={{ background: h.color }} />{h.label}: <strong>{format(h.value)}</strong> · {pct(h.value / total, 0)}</> : 'Hover a segment for detail'}</div>
      <ul className="mbar-legend">
        {parts.map(p => (
          <li key={p.key} className={hover === p.key ? 'is-hover' : ''} onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)}>
            <span className="swatch" style={{ background: p.color }} />
            <span>{p.label}</span>
            <span className="mono">{format(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Calculator({ slug }: { slug?: string }) {
  const { currency, rate } = useStore();
  const preset = slug ? bySlug(slug) : undefined;
  const [source, setSource] = useState(preset?.slug ?? 'custom');
  const [price, setPrice] = useState(preset?.priceUsd ?? 350000);
  const [hoa, setHoa] = useState(preset?.hoaUsd ?? 150);
  const [rent, setRent] = useState(preset?.rentUsd ?? 0);
  const [financing, setFinancing] = useState<'mortgage' | 'cash'>('mortgage');
  const [loan, setLoan] = useState<Loan>('USD');
  const [downPct, setDownPct] = useState(30);
  const [ratePct, setRatePct] = useState(defaultRate.USD);
  const [years, setYears] = useState(25);
  const [residency, setResidency] = useState(true);
  const [split, setSplit] = useState(false);

  useEffect(() => {
    if (source === 'custom') return;
    const p = bySlug(source);
    if (!p) return;
    setPrice(p.priceUsd); setHoa(p.hoaUsd); setRent(p.rentUsd ?? 0);
  }, [source]);

  const eligible = price >= RESIDENCY_MIN_USD;
  const lines = useMemo(() => closingCosts(price, { residency: residency && eligible, split }), [price, residency, eligible, split]);
  const closing = sum(lines);
  const down = financing === 'cash' ? price : (price * downPct) / 100;
  const mortgage = financing === 'cash' ? 0 : monthlyPayment(price - down, ratePct / 100, years);
  const { propertyTax, insurance } = yearlyHolding(price);
  const monthlyParts = [
    { ...SERIES[0], value: mortgage },
    { ...SERIES[1], value: hoa },
    { ...SERIES[2], value: propertyTax / 12 },
    { ...SERIES[3], value: insurance / 12 },
  ];
  const monthly = monthlyParts.reduce((a, p) => a + p.value, 0);
  const cashToClose = down + closing;
  const y = rent > 0 ? rentalYield(price, rent, hoa) : null;
  const cashflow = rent > 0 ? rent * 0.92 * 0.9 - monthly : 0;
  const fmt = (v: number) => money(v, currency, rate);

  return (
    <div className="calc-page">
      <header className="wrap page-head">
        <p className="eyebrow">True-cost calculator</p>
        <h1 className="h1">What it really costs to buy in Costa Rica</h1>
        <p className="lead">Closing costs, taxes, fees and financing in one view, using the 2026 rules: 1.5% transfer tax, notary fees, the Law 9996 residency discount and the 0.25% yearly property tax.</p>
      </header>

      <div className="wrap calc-grid">
        <form className="calc-inputs" onSubmit={e => e.preventDefault()}>
          <fieldset>
            <legend>Property</legend>
            <label className="field">
              <span>Start from a listing</span>
              <select id="calc-source" value={source} onChange={e => setSource(e.target.value)}>
                <option value="custom">Custom price</option>
                {properties.map(p => <option key={p.slug} value={p.slug}>{p.title} — {money(p.priceUsd, 'USD', rate)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Purchase price (USD) <strong className="mono">{fmt(price)}</strong></span>
              <input id="calc-price" type="range" min={80000} max={800000} step={1000} value={price} onChange={e => { setPrice(+e.target.value); setSource('custom'); }} />
            </label>
            <div className="field-row">
              <label className="field"><span>HOA per month (USD)</span><input id="calc-hoa" type="number" min={0} step={10} value={hoa} onChange={e => setHoa(Math.max(0, +e.target.value))} /></label>
              <label className="field"><span>Expected rent per month (USD)</span><input id="calc-rent" type="number" min={0} step={50} value={rent} onChange={e => setRent(Math.max(0, +e.target.value))} /></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Financing</legend>
            <div className="seg seg-wide" role="group" aria-label="Financing">
              <button type="button" aria-pressed={financing === 'mortgage'} onClick={() => setFinancing('mortgage')}><span className="seg-label">Mortgage</span></button>
              <button type="button" aria-pressed={financing === 'cash'} onClick={() => setFinancing('cash')}><span className="seg-label">Cash</span></button>
            </div>
            {financing === 'mortgage' && (
              <>
                <div className="field-row">
                  <label className="field">
                    <span>Loan currency</span>
                    <select id="calc-loan" value={loan} onChange={e => { const l = e.target.value as Loan; setLoan(l); setRatePct(defaultRate[l]); }}>
                      <option value="USD">US dollars (6–9% typical)</option>
                      <option value="CRC">Colones (8–12% typical)</option>
                    </select>
                  </label>
                  <label className="field"><span>Interest rate (%)</span><input id="calc-rate" type="number" min={1} max={20} step={0.1} value={ratePct} onChange={e => setRatePct(Math.min(20, Math.max(0, +e.target.value)))} /></label>
                </div>
                <label className="field">
                  <span>Down payment <strong className="mono">{downPct}% · {fmt((price * downPct) / 100)}</strong></span>
                  <input id="calc-down" type="range" min={10} max={80} step={5} value={downPct} onChange={e => setDownPct(+e.target.value)} />
                </label>
                <label className="field">
                  <span>Term</span>
                  <select id="calc-years" value={years} onChange={e => setYears(+e.target.value)}>
                    {[10, 15, 20, 25, 30].map(v => <option key={v} value={v}>{v} years</option>)}
                  </select>
                </label>
                {loan === 'CRC' && <p className="fine">Borrowing in colones while earning in dollars adds exchange-rate risk.</p>}
              </>
            )}
          </fieldset>

          <fieldset>
            <legend>Closing</legend>
            <label className={`switch ${!eligible ? 'is-disabled' : ''}`}>
              <input id="calc-residency" type="checkbox" checked={residency && eligible} disabled={!eligible} onChange={e => setResidency(e.target.checked)} />
              <span className="switch-ui" />
              <span>I’m applying for investor residency (Law 9996) — 20% off the transfer tax{!eligible && ' · needs $150,000 or more'}</span>
            </label>
            <label className="switch">
              <input id="calc-split" type="checkbox" checked={split} onChange={e => setSplit(e.target.checked)} />
              <span className="switch-ui" />
              <span>Split transfer tax and registry fees 50/50 with the seller</span>
            </label>
          </fieldset>
        </form>

        <div className="calc-results" aria-live="polite">
          <div className="result-hero">
            <div>
              <span>Cash needed to close</span>
              <strong>{fmt(cashToClose)}</strong>
              <small>{financing === 'cash' ? 'Full price' : `${downPct}% down`} + {fmt(closing)} closing costs ({pct(closing / price)})</small>
            </div>
            <div>
              <span>Monthly cost of ownership</span>
              <strong>{fmt(monthly)}</strong>
              <small>{financing === 'mortgage' ? `${years}-year loan at ${ratePct}%` : 'No mortgage'} · HOA, tax and insurance</small>
            </div>
          </div>

          <section className="result-block">
            <h2 className="h4">Monthly breakdown</h2>
            <MonthlyBar parts={monthlyParts} format={fmt} />
          </section>

          <section className="result-block">
            <h2 className="h4">Closing costs, itemized</h2>
            <table className="lines">
              <tbody>
                {lines.map(l => (
                  <tr key={l.label}><th scope="row">{l.label}<span>{l.note}</span></th><td className="mono">{fmt(l.value)}</td></tr>
                ))}
                <tr className="total"><th scope="row">Total</th><td className="mono">{fmt(closing)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className={`result-block residency-box ${eligible ? 'ok' : ''}`}>
            {eligible ? <IconCheck size={18} /> : <span className="dot" />}
            <p>{eligible
              ? <>At {fmt(price)} this purchase meets the <strong>$150,000 minimum for investor residency</strong> under Law 9996. Residency does not by itself make you a tax resident.</>
              : <>Investor residency needs at least <strong>$150,000</strong>. You are {fmt(RESIDENCY_MIN_USD - price)} below it.</>}</p>
          </section>

          {y && (
            <section className="result-block">
              <h2 className="h4">As a rental</h2>
              <dl className="yield-grid">
                <div><dt>Gross yield</dt><dd>{pct(y.gross)}</dd></div>
                <div><dt>Net yield</dt><dd>{pct(y.net)}</dd></div>
                <div><dt>Monthly cash flow</dt><dd className={cashflow >= 0 ? 'pos' : 'neg'}>{cashflow >= 0 ? '+' : '−'}{fmt(Math.abs(cashflow))}</dd></div>
              </dl>
              <p className="fine">Net after 8% vacancy, 10% management, HOA, tax and insurance. Cash flow includes the mortgage.</p>
            </section>
          )}

          <section className="result-block seller-note">
            <h2 className="h4">Selling instead?</h2>
            <p>Since October 2025, buyers must withhold 2% of the price (2.5% if the seller lives abroad) toward the seller’s capital-gains tax, declared on TRIBU-CR. It comes out of the seller’s proceeds, not the buyer’s costs.</p>
          </section>

          <p className="fine">Planning estimates, not legal or tax advice. Your notary confirms the final figures. Rates and rules as summarized in our 2026 market research.</p>
          {preset && <Link to={{ name: 'property', slug: preset.slug }} className="link-btn">Back to {preset.title} <IconArrow size={16} /></Link>}
        </div>
      </div>
    </div>
  );
}
