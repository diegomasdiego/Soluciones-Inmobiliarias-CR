// Interactive pieces used inside the buyer guides: purchase timeline, maritime-zone cross-section,
// investor-residency check and yearly ownership taxes.
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { company } from '../data/company';
import { RESIDENCY_MIN_USD } from '../data/properties';
import { RATES } from '../lib/costs';
import { money } from '../lib/format';
import { useLang } from '../lib/i18n';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { IconArrow, IconCalc, IconCheck, IconClose } from './Icons';

/** Purchase timeline; each step jumps to its section of the guide. */
export function BuyTimeline({ onJump }: { onJump: (id: string) => void }) {
  const { tx } = useLang();
  const steps = [
    { id: 'offer', when: tx('Day 0', 'Día 0'), title: tx('Offer accepted', 'Oferta aceptada') },
    { id: 'escrow', when: tx('Days 1–5', 'Días 1–5'), title: tx('Deposit to escrow', 'Depósito en escrow') },
    { id: 'due-diligence', when: tx('Weeks 1–3', 'Semanas 1–3'), title: tx('Title study and checks', 'Estudio registral y revisiones') },
    { id: 'closing', when: tx('Weeks 4–8', 'Semanas 4–8'), title: tx('Signing at the notary', 'Firma ante el notario') },
    { id: 'registration', when: tx('Then days to weeks', 'Luego, días a semanas'), title: tx('Registration', 'Inscripción') },
  ];
  return (
    <ol className="gw-timeline" aria-label={tx('Typical purchase timeline', 'Plazos típicos de una compra')}>
      {steps.map((s, i) => (
        <li key={s.id}>
          <button type="button" onClick={() => onJump(s.id)}>
            <span className="gw-tl-n mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="gw-tl-when mono">{s.when}</span>
            <strong>{s.title}</strong>
          </button>
        </li>
      ))}
    </ol>
  );
}

type ZoneId = 'public' | 'restricted' | 'private';

/** Cross-section of the coast: the 50 m public zone, the 150 m restricted zone and titled land beyond. */
export function ZmtDiagram() {
  const { tx } = useLang();
  const [zone, setZone] = useState<ZoneId>('restricted');
  const zones: Record<ZoneId, { name: string; span: string; rows: [string, string][] }> = {
    public: {
      name: tx('Public zone', 'Zona pública'),
      span: tx('0 to 50 m from the high-tide line', '0 a 50 m desde la pleamar ordinaria'),
      rows: [
        [tx('Can it be owned?', '¿Se puede ser dueño?'), tx('No. It is for public use.', 'No. Es de uso público.')],
        [tx('Who grants rights?', '¿Quién da derechos?'), tx('Nobody: no concessions here.', 'Nadie: aquí no hay concesiones.')],
        [tx('What can you do?', '¿Qué se puede hacer?'), tx('Walk and enjoy it. No building or fencing.', 'Transitar y disfrutarla. No se puede construir ni cercar.')],
      ],
    },
    restricted: {
      name: tx('Restricted zone', 'Zona restringida'),
      span: tx('50 to 200 m', '50 a 200 m'),
      rows: [
        [tx('Can it be owned?', '¿Se puede ser dueño?'), tx('No. It is used through a concession.', 'No. Se usa mediante una concesión.')],
        [tx('Who grants rights?', '¿Quién da derechos?'), tx('The municipality, with ICT approval in tourist areas, where an approved plan exists.', 'La municipalidad, con aprobación del ICT en zonas turísticas, donde haya un plan regulador aprobado.')],
        [tx('What can you do?', '¿Qué se puede hacer?'), tx('Build for the use the plan allows. 5 to 20 years, renewable, with a yearly canon.', 'Construir para el uso que permita el plan. De 5 a 20 años, prorrogable, con un canon anual.')],
      ],
    },
    private: {
      name: tx('Titled land', 'Propiedad inscrita'),
      span: tx('Beyond 200 m', 'Después de los 200 m'),
      rows: [
        [tx('Can it be owned?', '¿Se puede ser dueño?'), tx('Yes, with a folio real, by citizens and foreigners alike.', 'Sí, con folio real, tanto costarricenses como extranjeros.')],
        [tx('Who grants rights?', '¿Quién da derechos?'), tx('The deed, recorded at the Registro Nacional.', 'La escritura, inscrita en el Registro Nacional.')],
        [tx('What can you do?', '¿Qué se puede hacer?'), tx('What the municipal zoning allows. You pay the yearly property tax.', 'Lo que permita el uso de suelo municipal. Se paga el impuesto de bienes inmuebles.')],
      ],
    },
  };
  const z = zones[zone];
  const order: ZoneId[] = ['public', 'restricted', 'private'];
  return (
    <figure className="gw-zmt">
      <svg viewBox="0 0 1000 250" className="gw-zmt-svg" role="img" aria-label={tx('Cross-section of the coast: sea, 50 m public zone, 150 m restricted zone and titled land beyond 200 m', 'Corte de la costa: mar, zona pública de 50 m, zona restringida de 150 m y propiedad inscrita después de los 200 m')}>
        <rect x="0" y="0" width="1000" height="250" className="zmt-sky" />
        <rect x="0" y="150" width="190" height="100" className="zmt-sea" />
        <path d="M0 158 q24 -8 48 0 t48 0 t48 0 t46 0" className="zmt-wave" />
        <g className={`zmt-band ${zone === 'public' ? 'is-on' : ''}`} onClick={() => setZone('public')}>
          <rect x="190" y="40" width="120" height="130" className="zmt-public" />
        </g>
        <g className={`zmt-band ${zone === 'restricted' ? 'is-on' : ''}`} onClick={() => setZone('restricted')}>
          <rect x="310" y="40" width="360" height="130" className="zmt-restricted" />
        </g>
        <g className={`zmt-band ${zone === 'private' ? 'is-on' : ''}`} onClick={() => setZone('private')}>
          <rect x="670" y="40" width="330" height="130" className="zmt-private" />
        </g>
        <path d="M190 160 C 300 156, 420 146, 560 140 S 820 126, 1000 118 L1000 250 L190 250 Z" className="zmt-ground" />
        <path d="M190 160 C 300 156, 420 146, 560 140 S 820 126, 1000 118" className="zmt-ground-line" />
        {/* Umbrella on the beach, a house under concession, a titled house with a fence */}
        <g className="zmt-icon"><path d="M236 156 v-34" /><path d="M214 124 q22 -18 44 0 z" /></g>
        <g className="zmt-icon"><path d="M455 143 v-26 l26 -18 26 18 v26 z" /><path d="M474 143 v-12 h14 v12" /></g>
        <g className="zmt-icon"><path d="M800 129 v-28 l28 -20 28 20 v28 z" /><path d="M820 129 v-13 h16 v13" /><path d="M880 127 v-12 M896 126 v-12 M912 125 v-12 M876 118 h40" /></g>
        {[[190, tx('High tide', 'Pleamar')], [310, '50 m'], [670, '200 m']].map(([x, label]) => (
          <g key={String(x)}>
            <line x1={Number(x)} x2={Number(x)} y1="30" y2="236" className="zmt-mark" />
            <text x={Number(x) + 6} y="232" className="zmt-mark-label">{label}</text>
          </g>
        ))}
        <text x="20" y="200" className="zmt-label-sea">{tx('Sea', 'Mar')}</text>
      </svg>
      <div className="gw-zmt-tabs" role="group" aria-label={tx('Choose a zone', 'Elegir una zona')}>
        {order.map(id => (
          <button key={id} type="button" className={`zmt-tab zmt-tab-${id}`} aria-pressed={zone === id} onClick={() => setZone(id)}>
            <i aria-hidden="true" />{zones[id].name}<span className="mono">{zones[id].span}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.dl key={zone} className="gw-zmt-info" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} aria-live="polite">
          {z.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </motion.dl>
      </AnimatePresence>
      <figcaption className="fine">{tx('Diagram not to scale on height. Mangroves and estuaries are public zone wherever they reach.', 'Diagrama sin escala vertical. Los manglares y esteros son zona pública hasta donde lleguen.')}</figcaption>
    </figure>
  );
}

/** Does this purchase meet the investment requirements? */
export function ResidencyCheck() {
  const { tx } = useLang();
  const { currency, rate, runQuery } = useStore();
  const { navigate } = useRouter();
  const [price, setPrice] = useState(240000);
  const [owner, setOwner] = useState<'me' | 'company'>('me');
  const [financing, setFinancing] = useState<'cash' | 'mortgage'>('cash');
  const [downPct, setDownPct] = useState(50);
  const fmt = (v: number) => money(v, currency, rate);
  const min = fmt(RESIDENCY_MIN_USD);
  const down = (price * downPct) / 100;
  const checks = [
    {
      ok: owner === 'me',
      label: owner === 'me' ? tx('In your own name', 'A su nombre') : tx('Owned by a company: the property does not count', 'A nombre de una sociedad: la propiedad no cuenta'),
      hint: owner === 'company' ? tx('Your shares can count instead, if the company has a real economic activity in Costa Rica.', 'Pueden contar sus acciones, si la sociedad tiene una actividad económica real en Costa Rica.') : '',
    },
    {
      ok: price >= RESIDENCY_MIN_USD,
      label: price >= RESIDENCY_MIN_USD
        ? tx(`Municipal value of about ${fmt(price)}, if the deed shows the real price`, `Valor municipal cercano a ${fmt(price)}, si la escritura muestra el precio real`)
        : tx(`${fmt(RESIDENCY_MIN_USD - price)} short of the ${min} minimum`, `Le faltan ${fmt(RESIDENCY_MIN_USD - price)} para el mínimo de ${min}`),
      hint: '',
    },
    ...(financing === 'mortgage' ? [{
      ok: down >= RESIDENCY_MIN_USD,
      label: down >= RESIDENCY_MIN_USD
        ? tx(`Down payment of ${fmt(down)} reaches the minimum`, `La prima de ${fmt(down)} alcanza el mínimo`)
        : tx(`Down payment of ${fmt(down)}: your own money must reach ${min}`, `Prima de ${fmt(down)}: su propio dinero debe llegar a ${min}`),
      hint: '',
    }] : []),
  ];
  const pass = checks.every(c => c.ok);
  return (
    <div className="gw-box gw-res">
      <div className="gw-res-inputs">
        <label className="field">
          <span>{tx('Purchase price', 'Precio de compra')} <strong className="mono">{fmt(price)}</strong></span>
          <input type="range" min={80000} max={700000} step={5000} value={price} onChange={e => setPrice(+e.target.value)} />
        </label>
        <fieldset className="field">
          <legend>{tx('Registered in the name of', 'Inscrita a nombre de')}</legend>
          <div className="seg seg-wide" role="group">
            <button type="button" aria-pressed={owner === 'me'} onClick={() => setOwner('me')}><span className="seg-label">{tx('Me', 'Mi nombre')}</span></button>
            <button type="button" aria-pressed={owner === 'company'} onClick={() => setOwner('company')}><span className="seg-label">{tx('A company', 'Una sociedad')}</span></button>
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>{tx('Paid with', 'Forma de pago')}</legend>
          <div className="seg seg-wide" role="group">
            <button type="button" aria-pressed={financing === 'cash'} onClick={() => setFinancing('cash')}><span className="seg-label">{tx('Cash', 'Contado')}</span></button>
            <button type="button" aria-pressed={financing === 'mortgage'} onClick={() => setFinancing('mortgage')}><span className="seg-label">{tx('Mortgage', 'Hipoteca')}</span></button>
          </div>
        </fieldset>
        {financing === 'mortgage' && (
          <label className="field">
            <span>{tx('Down payment', 'Prima')} <strong className="mono">{downPct}% · {fmt(down)}</strong></span>
            <input type="range" min={10} max={90} step={5} value={downPct} onChange={e => setDownPct(+e.target.value)} />
          </label>
        )}
      </div>
      <div className={`gw-res-out ${pass ? 'is-ok' : ''}`} aria-live="polite">
        <strong className="gw-res-verdict">{pass ? tx('This purchase can support the application', 'Esta compra puede respaldar la solicitud') : tx('Not enough yet', 'Así todavía no alcanza')}</strong>
        <ul>
          {checks.map((c, i) => (
            <li key={i} className={c.ok ? 'ok' : 'no'}>
              <span className="gw-res-icon">{c.ok ? <IconCheck size={14} /> : <IconClose size={14} />}</span>
              <span>{c.label}{c.hint && <small>{c.hint}</small>}</span>
            </li>
          ))}
        </ul>
        <p className="fine">{tx('Uses the $150,000 minimum that the DGME publishes. Keep the investment for every renewal.', 'Usa el mínimo de $150.000 que publica la DGME. Debe mantener la inversión en cada renovación.')}</p>
        <button type="button" className="link-btn" onClick={() => { runQuery('residency'); navigate({ name: 'search' }); }}>{tx('See properties of $150,000 or more', 'Ver propiedades de $150.000 o más')} <IconArrow size={16} /></button>
      </div>
    </div>
  );
}

// Impuesto solidario 2026 (Decree 45358-H): exempt amount and brackets, in colones.
const SOLIDARIO_EXEMPT = 143_000_000;
const SOLIDARIO: [number, number][] = [
  [359_000_000, 0.0025], [720_000_000, 0.003], [1_081_000_000, 0.0035], [1_443_000_000, 0.004],
  [1_800_000_000, 0.0045], [2_162_000_000, 0.005], [Infinity, 0.0055],
];

function solidario(baseCrc: number) {
  let tax = 0;
  let from = 0;
  for (const [upTo, r] of SOLIDARIO) {
    if (baseCrc <= from) break;
    tax += (Math.min(baseCrc, upTo) - from) * r;
    from = upTo;
  }
  return tax;
}

/** Yearly property tax and luxury home tax for a home. */
export function HoldingTaxes() {
  const { tx } = useLang();
  const { currency, rate } = useStore();
  const [value, setValue] = useState(450000);
  const [built, setBuilt] = useState(250000);
  const fx = company.exchangeRate;
  const fmt = (usd: number) => money(usd, currency, rate);
  const crc = (usd: number) => money(usd, 'CRC', fx);
  const construction = Math.min(built, value);
  const propertyTax = value * RATES.propertyTax;
  const applies = construction * fx > SOLIDARIO_EXEMPT;
  const luxury = applies ? solidario(value * fx) / fx : 0;
  const exempt = crc(SOLIDARIO_EXEMPT / fx);
  return (
    <div className="gw-box gw-hold">
      <div className="gw-hold-inputs">
        <label className="field">
          <span>{tx('Registered value of the home', 'Valor registrado de la vivienda')} <strong className="mono">{fmt(value)}</strong></span>
          <input type="range" min={100000} max={1500000} step={10000} value={value} onChange={e => { const v = +e.target.value; setValue(v); if (built > v) setBuilt(v); }} />
        </label>
        <label className="field">
          <span>{tx('Of which, the construction', 'De eso, la construcción')} <strong className="mono">{fmt(construction)}</strong></span>
          <input type="range" min={0} max={value} step={10000} value={construction} onChange={e => setBuilt(+e.target.value)} />
        </label>
      </div>
      <dl className="gw-hold-out">
        <div>
          <dt>{tx('Property tax, 0.25% a year', 'Bienes inmuebles, 0,25% al año')}</dt>
          <dd className="mono">{fmt(propertyTax)}</dd>
        </div>
        <div>
          <dt>{tx('Luxury home tax', 'Impuesto solidario')}</dt>
          <dd className="mono">{applies ? fmt(luxury) : tx('Does not apply', 'No aplica')}</dd>
          <small>{applies
            ? tx(`Construction of ${crc(construction)} is above ${exempt}, so construction plus land pay.`, `La construcción de ${crc(construction)} supera ${exempt}, así que pagan construcción y terreno.`)
            : tx(`Construction of ${crc(construction)} is at or below ${exempt}.`, `La construcción de ${crc(construction)} no supera ${exempt}.`)}</small>
        </div>
        <div className="gw-hold-total">
          <dt>{tx('Total a year', 'Total al año')}</dt>
          <dd className="mono">{fmt(propertyTax + luxury)}</dd>
        </div>
      </dl>
      <p className="fine">{tx(
        `Hacienda values construction with its own tables, usually below market prices, so treat this as an upper estimate. Exchange rate ₡${fx} per dollar.`,
        `Hacienda valora la construcción con sus propias tablas, por lo general por debajo del precio de mercado, así que tómelo como una estimación alta. Tipo de cambio de ₡${fx} por dólar.`,
      )}</p>
    </div>
  );
}

export function CalculatorCta() {
  const { tx } = useLang();
  return (
    <Link to={{ name: 'calculator' }} className="gw-calc">
      <span className="gw-calc-icon"><IconCalc size={22} /></span>
      <span><strong>{tx('Work out the true cost of your purchase', 'Calcule el costo real de su compra')}</strong><small>{tx('Closing costs, monthly costs and financing, for any price.', 'Gastos de cierre, costos mensuales y financiamiento, para cualquier precio.')}</small></span>
      <IconArrow size={18} />
    </Link>
  );
}
