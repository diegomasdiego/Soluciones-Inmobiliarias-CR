import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { RESIDENCY_MIN_USD } from '../data/properties';
import { useProperties } from '../lib/data';
import { closingCosts, monthlyPayment, rentalYield, sum, yearlyHolding } from '../lib/costs';
import { money, pct } from '../lib/format';
import { useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { IconArrow, IconCheck } from '../components/Icons';

// Chart palette validated for color-vision deficiency (dataviz validator, light surface).
const COLORS = { mortgage: '#138A5A', hoa: '#9A55B0', tax: '#B8791C', insurance: '#2F7DC0' };

type Loan = 'USD' | 'CRC';
const defaultRate: Record<Loan, number> = { USD: 7.5, CRC: 10 };

function MonthlyBar({ parts, format, hint }: { parts: { key: string; label: string; color: string; value: number }[]; format: (v: number) => string; hint: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  const shown = parts.filter(p => p.value > 0);
  const h = shown.find(p => p.key === hover);
  return (
    <div className="mbar">
      <div className="mbar-track" role="img" aria-label={shown.map(p => `${p.label} ${format(p.value)}`).join(', ')}>
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
      <div className="mbar-tip" aria-hidden="true">{h ? <><span className="swatch" style={{ background: h.color }} />{h.label}: <strong>{format(h.value)}</strong> · {pct(h.value / total, 0)}</> : hint}</div>
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
  const { lang, tx } = useLang();
  const { properties, bySlug } = useProperties();
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
  }, [source, bySlug]);

  const dec = (s: string) => (lang === 'es' ? s.replace('.', ',') : s);
  const eligible = price >= RESIDENCY_MIN_USD;
  const lines = useMemo(() => closingCosts(price, { residency: residency && eligible, split }, lang), [price, residency, eligible, split, lang]);
  const closing = sum(lines);
  const down = financing === 'cash' ? price : (price * downPct) / 100;
  const mortgage = financing === 'cash' ? 0 : monthlyPayment(price - down, ratePct / 100, years);
  const { propertyTax, insurance } = yearlyHolding(price);
  const monthlyParts = [
    { key: 'mortgage', label: tx('Mortgage', 'Hipoteca'), color: COLORS.mortgage, value: mortgage },
    { key: 'hoa', label: tx('HOA / condo fee', 'Cuota de condominio'), color: COLORS.hoa, value: hoa },
    { key: 'tax', label: tx('Property tax', 'Impuesto de bienes inmuebles'), color: COLORS.tax, value: propertyTax / 12 },
    { key: 'insurance', label: tx('Insurance', 'Seguro'), color: COLORS.insurance, value: insurance / 12 },
  ];
  const monthly = monthlyParts.reduce((a, p) => a + p.value, 0);
  const cashToClose = down + closing;
  const y = rent > 0 ? rentalYield(price, rent, hoa) : null;
  const cashflow = rent > 0 ? rent * 0.92 * 0.9 - monthly : 0;
  const fmt = (v: number) => money(v, currency, rate);

  return (
    <div className="calc-page">
      <header className="wrap page-head">
        <p className="eyebrow">{tx('True-cost calculator', 'Calculadora de costo real')}</p>
        <h1 className="h1">{tx('What it really costs to buy in Costa Rica', 'Lo que realmente cuesta comprar en Costa Rica')}</h1>
        <p className="lead">{tx(
          'Closing costs, taxes, fees and financing in one view, using the 2026 rules: 1.5% transfer tax, notary fees, the Law 9996 residency discount and the 0.25% yearly property tax.',
          'Gastos de cierre, impuestos, cuotas y financiamiento en una sola vista, con las reglas de 2026: impuesto de traspaso del 1,5%, honorarios del notario, el descuento por residencia de la Ley 9996 y el impuesto de bienes inmuebles del 0,25% anual.',
        )}</p>
      </header>

      <div className="wrap calc-grid">
        <form className="calc-inputs" onSubmit={e => e.preventDefault()}>
          <fieldset>
            <legend>{tx('Property', 'Propiedad')}</legend>
            <label className="field">
              <span>{tx('Start from a listing', 'Partir de una propiedad')}</span>
              <select id="calc-source" value={source} onChange={e => setSource(e.target.value)}>
                <option value="custom">{tx('Custom price', 'Precio personalizado')}</option>
                {properties.map(p => <option key={p.slug} value={p.slug}>{p.title} — {money(p.priceUsd, 'USD', rate)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>{tx('Purchase price (USD)', 'Precio de compra (USD)')} <strong className="mono">{fmt(price)}</strong></span>
              <input id="calc-price" type="range" min={80000} max={800000} step={1000} value={price} onChange={e => { setPrice(+e.target.value); setSource('custom'); }} />
            </label>
            <div className="field-row">
              <label className="field"><span>{tx('HOA per month (USD)', 'Cuota de condominio al mes (USD)')}</span><input id="calc-hoa" type="number" min={0} step={10} value={hoa} onChange={e => setHoa(Math.max(0, +e.target.value))} /></label>
              <label className="field"><span>{tx('Expected rent per month (USD)', 'Alquiler esperado al mes (USD)')}</span><input id="calc-rent" type="number" min={0} step={50} value={rent} onChange={e => setRent(Math.max(0, +e.target.value))} /></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>{tx('Financing', 'Financiamiento')}</legend>
            <div className="seg seg-wide" role="group" aria-label={tx('Financing', 'Financiamiento')}>
              <button type="button" aria-pressed={financing === 'mortgage'} onClick={() => setFinancing('mortgage')}><span className="seg-label">{tx('Mortgage', 'Hipoteca')}</span></button>
              <button type="button" aria-pressed={financing === 'cash'} onClick={() => setFinancing('cash')}><span className="seg-label">{tx('Cash', 'Contado')}</span></button>
            </div>
            {financing === 'mortgage' && (
              <>
                <div className="field-row">
                  <label className="field">
                    <span>{tx('Loan currency', 'Moneda del préstamo')}</span>
                    <select id="calc-loan" value={loan} onChange={e => { const l = e.target.value as Loan; setLoan(l); setRatePct(defaultRate[l]); }}>
                      <option value="USD">{tx('US dollars (6–9% typical)', 'Dólares (6–9% típico)')}</option>
                      <option value="CRC">{tx('Colones (8–12% typical)', 'Colones (8–12% típico)')}</option>
                    </select>
                  </label>
                  <label className="field"><span>{tx('Interest rate (%)', 'Tasa de interés (%)')}</span><input id="calc-rate" type="number" min={1} max={20} step={0.1} value={ratePct} onChange={e => setRatePct(Math.min(20, Math.max(0, +e.target.value)))} /></label>
                </div>
                <label className="field">
                  <span>{tx('Down payment', 'Prima')} <strong className="mono">{downPct}% · {fmt((price * downPct) / 100)}</strong></span>
                  <input id="calc-down" type="range" min={10} max={80} step={5} value={downPct} onChange={e => setDownPct(+e.target.value)} />
                </label>
                <label className="field">
                  <span>{tx('Term', 'Plazo')}</span>
                  <select id="calc-years" value={years} onChange={e => setYears(+e.target.value)}>
                    {[10, 15, 20, 25, 30].map(v => <option key={v} value={v}>{v} {tx('years', 'años')}</option>)}
                  </select>
                </label>
                {loan === 'CRC' && <p className="fine">{tx('Borrowing in colones while earning in dollars adds exchange-rate risk.', 'Endeudarse en colones mientras gana en dólares agrega riesgo cambiario.')}</p>}
              </>
            )}
          </fieldset>

          <fieldset>
            <legend>{tx('Closing', 'Cierre')}</legend>
            <label className={`switch ${!eligible ? 'is-disabled' : ''}`}>
              <input id="calc-residency" type="checkbox" checked={residency && eligible} disabled={!eligible} onChange={e => setResidency(e.target.checked)} />
              <span className="switch-ui" />
              <span>{tx('I’m applying for investor residency (Law 9996) — 20% off the transfer tax', 'Voy a solicitar la residencia de inversionista (Ley 9996): 20% menos de impuesto de traspaso')}{!eligible && tx(' · needs $150,000 or more', ' · requiere $150.000 o más')}</span>
            </label>
            <label className="switch">
              <input id="calc-split" type="checkbox" checked={split} onChange={e => setSplit(e.target.checked)} />
              <span className="switch-ui" />
              <span>{tx('Split transfer tax and registry fees 50/50 with the seller', 'Dividir 50/50 con el vendedor el traspaso y los derechos de registro')}</span>
            </label>
          </fieldset>
        </form>

        <div className="calc-results" aria-live="polite">
          <div className="result-hero">
            <div>
              <span>{tx('Cash needed to close', 'Efectivo necesario para el cierre')}</span>
              <strong>{fmt(cashToClose)}</strong>
              <small>{financing === 'cash' ? tx('Full price', 'Precio completo') : tx(`${downPct}% down`, `${downPct}% de prima`)} + {fmt(closing)} {tx('closing costs', 'de gastos de cierre')} ({dec(pct(closing / price))})</small>
            </div>
            <div>
              <span>{tx('Monthly cost of ownership', 'Costo mensual de la propiedad')}</span>
              <strong>{fmt(monthly)}</strong>
              <small>{financing === 'mortgage' ? tx(`${years}-year loan at ${ratePct}%`, `Préstamo a ${years} años al ${dec(String(ratePct))}%`) : tx('No mortgage', 'Sin hipoteca')} · {tx('HOA, tax and insurance', 'cuota, impuestos y seguro')}</small>
            </div>
          </div>

          <section className="result-block">
            <h2 className="h4">{tx('Monthly breakdown', 'Desglose mensual')}</h2>
            <MonthlyBar parts={monthlyParts} format={fmt} hint={tx('Hover a segment for detail', 'Pase el cursor por un segmento para ver el detalle')} />
          </section>

          <section className="result-block">
            <h2 className="h4">{tx('Closing costs, itemized', 'Gastos de cierre, detallados')}</h2>
            <table className="lines">
              <tbody>
                {lines.map(l => (
                  <tr key={l.label}><th scope="row">{l.label}<span>{l.note}</span></th><td className="mono">{fmt(l.value)}</td></tr>
                ))}
                <tr className="total"><th scope="row">{tx('Total', 'Total')}</th><td className="mono">{fmt(closing)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className={`result-block residency-box ${eligible ? 'ok' : ''}`}>
            {eligible ? <IconCheck size={18} /> : <span className="dot" />}
            <p>{eligible
              ? (lang === 'es'
                ? <>Por {fmt(price)}, esta compra cumple el <strong>mínimo de $150.000 para la residencia de inversionista</strong> de la Ley 9996. La residencia, por sí sola, no implica ser residente fiscal.</>
                : <>At {fmt(price)} this purchase meets the <strong>$150,000 minimum for investor residency</strong> under Law 9996. Residency does not by itself make you a tax resident.</>)
              : (lang === 'es'
                ? <>La residencia de inversionista requiere al menos <strong>$150.000</strong>. Le faltan {fmt(RESIDENCY_MIN_USD - price)}.</>
                : <>Investor residency needs at least <strong>$150,000</strong>. You are {fmt(RESIDENCY_MIN_USD - price)} below it.</>)}</p>
          </section>

          {y && (
            <section className="result-block">
              <h2 className="h4">{tx('As a rental', 'Como alquiler')}</h2>
              <dl className="yield-grid">
                <div><dt>{tx('Gross yield', 'Rentabilidad bruta')}</dt><dd>{dec(pct(y.gross))}</dd></div>
                <div><dt>{tx('Net yield', 'Rentabilidad neta')}</dt><dd>{dec(pct(y.net))}</dd></div>
                <div><dt>{tx('Monthly cash flow', 'Flujo mensual')}</dt><dd className={cashflow >= 0 ? 'pos' : 'neg'}>{cashflow >= 0 ? '+' : '−'}{fmt(Math.abs(cashflow))}</dd></div>
              </dl>
              <p className="fine">{tx(
                'Net after 8% vacancy, 10% management, HOA, tax and insurance. Cash flow includes the mortgage.',
                'Neta después de 8% de desocupación, 10% de administración, cuota de condominio, impuestos y seguro. El flujo incluye la hipoteca.',
              )}</p>
            </section>
          )}

          <section className="result-block seller-note">
            <h2 className="h4">{tx('Selling instead?', '¿Va a vender?')}</h2>
            <p>{tx(
              'Since October 2025, buyers must withhold 2% of the price (2.5% if the seller lives abroad) toward the seller’s capital-gains tax, declared on TRIBU-CR. It comes out of the seller’s proceeds, not the buyer’s costs.',
              'Desde octubre de 2025, el comprador debe retener el 2% del precio (2,5% si el vendedor no está domiciliado en el país) a cuenta del impuesto de ganancias de capital del vendedor, declarado en TRIBU-CR. Sale del monto que recibe el vendedor, no de los costos del comprador.',
            )}</p>
          </section>

          <p className="fine">{tx(
            'Planning estimates, not legal or tax advice. Your notary confirms the final figures. Rates and rules as summarized in our 2026 market research.',
            'Estimaciones para planificar, no asesoría legal ni tributaria. Su notario confirma las cifras finales. Tasas y reglas según nuestra investigación de mercado de 2026.',
          )}</p>
          {preset && <Link to={{ name: 'property', slug: preset.slug }} className="link-btn">{tx(`Back to ${preset.title}`, `Volver a ${preset.title}`)} <IconArrow size={16} /></Link>}
        </div>
      </div>
    </div>
  );
}
