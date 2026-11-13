// Saved properties (#saved) compared side by side, and lists shared by link (#compare-<slug>,<slug>).
// Saved slugs live in this browser (lib/store). Closing and monthly figures use the same model as the
// property page and the calculator (lib/costs): planning estimates, not quotes.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { isResidencyEligible, type Property } from '../data/properties';
import { localize, typeLabel } from '../data/properties.es';
import { closingCosts, monthlyPayment, rentalYield, sum, yearlyHolding } from '../lib/costs';
import { useProperties } from '../lib/data';
import { formatDate, m2, money, pct } from '../lib/format';
import { useLang, type Lang } from '../lib/i18n';
import { Link, toHash, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconCalc, IconCheck, IconClose, IconHeart, IconMail, IconSearch } from '../components/Icons';
import { PropertyCard } from '../components/PropertyCard';

/** Same defaults as the calculator: a dollar loan at 7.5% over 25 years. */
const LOAN = { rate: 0.075, years: 25 };
const DOWNS = [100, 50, 30, 20] as const;
type Down = (typeof DOWNS)[number];

function metrics(p: Property, down: Down, lang: Lang) {
  const land = p.type === 'Lot' || p.type === 'Farm';
  const { propertyTax, insurance } = yearlyHolding(p.priceUsd);
  const closing = sum(closingCosts(p.priceUsd, { residency: isResidencyEligible(p), split: false }, lang));
  const downUsd = (p.priceUsd * down) / 100;
  const loan = down >= 100 ? 0 : monthlyPayment(p.priceUsd - downUsd, LOAN.rate, LOAN.years);
  const taxIns = (propertyTax + insurance) / 12;
  return {
    perBuilt: !land && p.builtM2 ? p.priceUsd / p.builtM2 : null,
    perLand: land && p.lotM2 ? p.priceUsd / p.lotM2 : null,
    closing,
    downUsd,
    cash: downUsd + closing,
    taxIns,
    loan,
    monthly: p.hoaUsd + taxIns + loan,
    yields: p.rentUsd ? rentalYield(p.priceUsd, p.rentUsd, p.hoaUsd) : null,
  };
}

type Cell = { v: number | null; text: string; note?: string; ok?: boolean };
type Row = { id: string; label: string; cells: Cell[]; best?: 'min' | 'max'; bestLabel?: string; bar?: boolean; mono?: boolean };
type Group = { id: string; label: string; rows: Row[] };
const NONE: Cell = { v: null, text: '—' };

function ShareBox({ slugs, onClose }: { slugs: string[]; onClose: () => void }) {
  const { tx } = useLang();
  const { notify } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}#${toHash({ name: 'saved', shared: slugs })}`;
  const text = tx(`${slugs.length} properties to compare in Costa Rica`, `${slugs.length} propiedades para comparar en Costa Rica`);
  const canShare = typeof navigator.share === 'function';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify(tx('Link copied.', 'Enlace copiado.'));
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      input.current?.select();
    }
  };
  return (
    <motion.div className="share-box" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="share-head">
        <strong>{tx('Share this list', 'Compartir esta lista')}</strong>
        <button type="button" className="share-close" onClick={onClose} aria-label={tx('Close', 'Cerrar')}><IconClose size={16} /></button>
      </div>
      <p className="fine">{tx(
        'Anyone with the link sees these properties side by side and can save them to their own list. It only contains the property codes, nothing personal.',
        'Quien abra el enlace verá estas propiedades lado a lado y podrá guardarlas en su propia lista. Solo lleva los códigos de las propiedades, nada personal.',
      )}</p>
      <div className="share-url">
        <input ref={input} readOnly value={url} aria-label={tx('Link to this list', 'Enlace a esta lista')} onFocus={e => e.currentTarget.select()} />
        <button type="button" className="btn btn-accent" onClick={copy}>{copied ? <><IconCheck size={16} /> {tx('Copied', 'Copiado')}</> : tx('Copy link', 'Copiar enlace')}</button>
      </div>
      <div className="share-apps">
        <a className="chip" href={`https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a className="chip" href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`}><IconMail size={15} /> {tx('Email', 'Correo')}</a>
        {canShare && (
          <button type="button" className="chip" onClick={() => navigator.share({ title: text, url }).catch(() => {})}>{tx('More options', 'Más opciones')}</button>
        )}
      </div>
    </motion.div>
  );
}

function Compare({ list, shared, onRemove }: { list: Property[]; shared: boolean; onRemove: (p: Property) => void }) {
  const { lang, tx } = useLang();
  const { currency, rate } = useStore();
  const [down, setDown] = useState<Down>(30);
  const [diffOnly, setDiffOnly] = useState(false);
  const fmt = (v: number) => money(v, currency, rate);
  const dec = (s: string) => (lang === 'es' ? s.replace('.', ',') : s);
  const ps = list.map(p => localize(p, lang));
  const ms = ps.map(p => metrics(p, down, lang));
  const usd = (v: number | null): Cell => (v == null ? NONE : { v, text: fmt(v) });
  const canAdd = !shared && ps.length < 4;

  const groups: Group[] = [
    {
      id: 'size', label: tx('Price and size', 'Precio y tamaño'), rows: [
        { id: 'price', label: tx('Price', 'Precio'), best: 'min', bestLabel: tx('Lowest', 'Menor'), bar: true, cells: ps.map(p => ({ v: p.priceUsd, text: fmt(p.priceUsd), note: p.priceNote })) },
        { id: 'type', label: tx('Type', 'Tipo'), cells: ps.map(p => ({ v: null, text: typeLabel(p.type, lang) })) },
        { id: 'rooms', label: tx('Bedrooms and baths', 'Habitaciones y baños'), cells: ps.map(p => (p.beds != null ? { v: null, text: `${p.beds} ${tx('bd', 'hab.')} · ${dec(String(p.baths ?? 0))} ${tx('ba', p.baths === 1 ? 'baño' : 'baños')}` } : NONE)) },
        { id: 'built', label: tx('Built area', 'Área construida'), best: 'max', bestLabel: tx('Largest', 'Mayor'), cells: ps.map(p => (p.builtM2 ? { v: p.builtM2, text: m2(p.builtM2) } : NONE)) },
        { id: 'lot', label: tx('Land', 'Terreno'), best: 'max', bestLabel: tx('Largest', 'Mayor'), cells: ps.map(p => (p.lotM2 ? { v: p.lotM2, text: p.lotM2 >= 10000 ? `${dec((p.lotM2 / 10000).toFixed(1))} ha` : m2(p.lotM2) } : NONE)) },
        { id: 'perBuilt', label: tx('Price per m² built', 'Precio por m² construido'), best: 'min', bestLabel: tx('Lowest', 'Menor'), bar: true, cells: ms.map(m => usd(m.perBuilt)) },
        { id: 'perLand', label: tx('Price per m² of land', 'Precio por m² de terreno'), best: 'min', bestLabel: tx('Lowest', 'Menor'), bar: true, cells: ms.map(m => usd(m.perLand)) },
        { id: 'year', label: tx('Year built', 'Año de construcción'), best: 'max', bestLabel: tx('Newest', 'Más nueva'), cells: ps.map(p => (p.yearBuilt ? { v: p.yearBuilt, text: p.type === 'Pre-sale' ? tx(`Delivery ${p.yearBuilt}`, `Entrega ${p.yearBuilt}`) : String(p.yearBuilt) } : NONE)) },
      ],
    },
    {
      id: 'buy', label: tx('To buy', 'Al comprar'), rows: [
        { id: 'closing', label: tx('Closing costs (est.)', 'Gastos de cierre (est.)'), best: 'min', bestLabel: tx('Lowest', 'Menor'), cells: ms.map(m => usd(m.closing)) },
        ...(down < 100 ? [{ id: 'down', label: tx(`Down payment (${down}%)`, `Prima (${down}%)`), cells: ms.map(m => usd(m.downUsd)) }] : []),
        { id: 'cash', label: tx('Cash to close', 'Efectivo para cerrar'), best: 'min', bestLabel: tx('Lowest', 'Menor'), bar: true, cells: ms.map(m => usd(m.cash)) },
      ],
    },
    {
      id: 'month', label: tx('Every month', 'Cada mes'), rows: [
        { id: 'hoa', label: tx('HOA / condominium fee', 'Cuota de condominio'), best: 'min', bestLabel: tx('Lowest', 'Menor'), cells: ps.map(p => ({ v: p.hoaUsd, text: p.hoaUsd ? fmt(p.hoaUsd) : tx('None', 'Sin cuota') })) },
        { id: 'taxIns', label: tx('Property tax and insurance', 'Impuesto y seguro'), cells: ms.map(m => usd(m.taxIns)) },
        ...(down < 100 ? [{ id: 'loan', label: tx('Loan payment', 'Cuota del préstamo'), cells: ps.map((p, i) => ({ v: ms[i].loan, text: fmt(ms[i].loan), note: p.type === 'Pre-sale' ? tx('from delivery', 'desde la entrega') : undefined })) }] : []),
        { id: 'monthly', label: tx('Total a month', 'Total al mes'), best: 'min', bestLabel: tx('Lowest', 'Menor'), bar: true, cells: ms.map(m => usd(m.monthly)) },
      ],
    },
    {
      id: 'rent', label: tx('If you rent it out', 'Si la alquila'), rows: [
        { id: 'rentUsd', label: tx('Estimated rent a month', 'Alquiler estimado al mes'), best: 'max', bestLabel: tx('Highest', 'Mayor'), cells: ps.map(p => usd(p.rentUsd ?? null)) },
        { id: 'gross', label: tx('Gross yield', 'Rentabilidad bruta'), cells: ms.map(m => (m.yields ? { v: m.yields.gross, text: dec(pct(m.yields.gross)) } : NONE)) },
        { id: 'net', label: tx('Net yield', 'Rentabilidad neta'), best: 'max', bestLabel: tx('Highest', 'Mayor'), bar: true, cells: ms.map(m => (m.yields ? { v: m.yields.net, text: dec(pct(m.yields.net)) } : NONE)) },
      ],
    },
    {
      id: 'legal', label: tx('Legal status', 'Estado legal'), rows: [
        { id: 'title', label: tx('Title', 'Título'), cells: ps.map(p => ({ v: null, text: p.legal.title })) },
        { id: 'zoning', label: tx('Zoning', 'Uso de suelo'), cells: ps.map(p => ({ v: null, text: p.legal.zoning })) },
        { id: 'folio', label: tx('Folio real', 'Folio real'), mono: true, cells: ps.map(p => ({ v: null, text: p.legal.folio })) },
        { id: 'checked', label: tx('Title study checked', 'Estudio registral revisado'), cells: ps.map(p => ({ v: null, text: formatDate(p.legal.checked, lang), ok: true })) },
        { id: 'residency', label: tx('Investor residency (Law 9996)', 'Residencia de inversionista (Ley 9996)'), cells: ps.map(p => ({ v: null, text: isResidencyEligible(p) ? tx('Eligible', 'Califica') : tx('Under $150,000', 'Menos de $150.000'), ok: isResidencyEligible(p) })) },
      ],
    },
  ];

  const visible = groups
    .map(g => ({
      ...g,
      rows: g.rows.filter(r => !r.cells.every(c => c.text === '—') && !(diffOnly && ps.length > 1 && r.cells.every(c => c.text === r.cells[0].text))),
    }))
    .filter(g => g.rows.length);
  const cols = ps.length + 1 + (canAdd ? 1 : 0);

  return (
    <div className="cmp">
      <div className="cmp-tools">
        <div className="cmp-finance">
          <span className="cmp-tools-label" id="cmp-down">{tx('Financing', 'Financiamiento')}</span>
          <div className="seg cmp-seg" role="group" aria-labelledby="cmp-down">
            {DOWNS.map(d => (
              <button key={d} type="button" aria-pressed={down === d} onClick={() => setDown(d)}>
                {down === d && <motion.span layoutId="cmp-down-bg" className="seg-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <span className="seg-label">{d === 100 ? tx('Cash', 'Contado') : <>{d}%<span className="cmp-seg-long"> {tx('down', 'de prima')}</span></>}</span>
              </button>
            ))}
          </div>
          <span className="fine">{down === 100
            ? tx('No loan.', 'Sin préstamo.')
            : tx(`${down}% down and a dollar loan at ${LOAN.rate * 100}% over ${LOAN.years} years.`, `Prima del ${down}% y préstamo en dólares al ${dec(String(LOAN.rate * 100))}% a ${LOAN.years} años.`)}</span>
        </div>
        <label className="switch cmp-diff">
          <input type="checkbox" checked={diffOnly} onChange={e => setDiffOnly(e.target.checked)} disabled={ps.length < 2} />
          <span className="switch-ui" />
          <span>{tx('Only differences', 'Solo diferencias')}</span>
        </label>
      </div>

      <div className="cmp-scroll" tabIndex={0} role="region" aria-label={tx('Comparison table, scrolls sideways', 'Tabla comparativa, se desplaza hacia los lados')}>
        <table className="cmp-table">
          <caption className="sr-only">{tx('Saved properties compared side by side', 'Propiedades guardadas comparadas lado a lado')}</caption>
          <thead>
            <tr>
              <td className="cmp-corner"><span className="mono">{tx(`${ps.length} ${ps.length === 1 ? 'property' : 'properties'}`, `${ps.length} ${ps.length === 1 ? 'propiedad' : 'propiedades'}`)}</span></td>
              {ps.map(p => (
                <th key={p.slug} scope="col" className="cmp-prop">
                  <div className="cmp-prop-inner">
                    <Link to={{ name: 'property', slug: p.slug }} className="cmp-photo" tabIndex={-1} aria-hidden="true"><Img name={p.photos[0]} alt="" /></Link>
                    <button type="button" className={`cmp-remove ${shared ? '' : 'is-saved'}`} onClick={() => onRemove(p)} aria-label={shared ? tx(`Hide ${p.title}`, `Ocultar ${p.title}`) : tx(`Remove ${p.title} from saved`, `Quitar ${p.title} de guardadas`)}>
                      {shared ? <IconClose size={16} /> : <IconHeart size={16} />}
                    </button>
                    <span className="cmp-type mono">{typeLabel(p.type, lang)} · {p.area}</span>
                    <Link to={{ name: 'property', slug: p.slug }} className="cmp-title">{p.title}</Link>
                    <span className="cmp-loc">{p.district}, {p.canton}</span>
                    <Price usd={p.priceUsd} prefix={p.priceNote} className="cmp-price" />
                    <Link to={{ name: 'calculator', slug: p.slug }} className="cmp-calc"><IconCalc size={15} /> {tx('Adjust in the calculator', 'Ajustar en la calculadora')}</Link>
                  </div>
                </th>
              ))}
              {canAdd && (
                <td className="cmp-add">
                  <Link to={{ name: 'search' }} className="cmp-add-link">
                    <IconSearch size={20} />
                    <span>{ps.length === 1 ? tx('Save another property to compare', 'Guarde otra propiedad para comparar') : tx('Add a property', 'Agregar una propiedad')}</span>
                  </Link>
                </td>
              )}
            </tr>
          </thead>
          {visible.map(g => (
            <tbody key={g.id}>
              <tr className="cmp-group"><th scope="colgroup" colSpan={cols}><span>{g.label}</span></th></tr>
              {g.rows.map(r => {
                const vals = r.cells.map(c => c.v).filter((v): v is number => v != null);
                const lo = Math.min(...vals);
                const hi = Math.max(...vals);
                const target = r.best && vals.length >= 2 && lo !== hi ? (r.best === 'min' ? lo : hi) : null;
                return (
                  <tr key={r.id}>
                    <th scope="row">{r.label}</th>
                    {r.cells.map((c, i) => {
                      const best = target != null && c.v === target;
                      return (
                        <td key={ps[i].slug} className={`${best ? 'is-best' : ''} ${r.mono ? 'mono' : ''} ${c.ok === true ? 'is-ok' : c.ok === false ? 'is-no' : ''}`}>
                          <span className="cmp-val">{c.ok && <IconCheck size={14} />}{c.text}</span>
                          {c.note && <span className="cmp-note">{c.note}</span>}
                          {best && <span className="cmp-best">{r.bestLabel}</span>}
                          {r.bar && c.v != null && hi > 0 && <span className="cmp-bar" aria-hidden="true"><i style={{ width: `${Math.max(4, (c.v / hi) * 100)}%` }} /></span>}
                        </td>
                      );
                    })}
                    {canAdd && <td className="cmp-add-cell" />}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      <p className="fine cmp-foot">{tx(
        'Estimates for planning, with the same model as the true-cost calculator: closing costs include transfer tax (with the Law 9996 discount when it applies), registry, notary and escrow; net yield discounts HOA, tax, insurance, 10% management and 8% vacancy. A notary confirms the final figures.',
        'Estimaciones para planificar, con el mismo modelo de la calculadora de costo real: los gastos de cierre incluyen traspaso (con el descuento de la Ley 9996 cuando aplica), registro, notario y escrow; la rentabilidad neta descuenta cuota, impuesto, seguro, 10% de administración y 8% de desocupación. El notario confirma las cifras finales.',
      )}</p>
    </div>
  );
}

export default function Saved({ shared }: { shared?: string[] }) {
  const { tx } = useLang();
  const { properties, bySlug } = useProperties();
  const { saved, toggleSaved, addSaved, notify } = useStore();
  const { navigate } = useRouter();
  const [share, setShare] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [undo, setUndo] = useState<Property | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 8000);
    return () => window.clearTimeout(t);
  }, [undo]);

  const isShared = !!shared;
  const source = shared ?? saved;
  const list = useMemo(
    () => source.filter(s => !hidden.includes(s)).map(s => bySlug(s)).filter((p): p is Property => !!p),
    [source, hidden, bySlug],
  );
  const missing = source.filter(s => !bySlug(s)).length;
  const sharedNew = isShared ? list.filter(p => !saved.includes(p.slug)) : [];
  const picks = ['los-laureles', 'guachipelin-residences', 'lote-rio-oro'].map(s => bySlug(s)).filter((p): p is Property => !!p);

  const remove = (p: Property) => {
    if (isShared) { setHidden(h => [...h, p.slug]); return; }
    toggleSaved(p.slug);
    setUndo(p);
  };
  const saveShared = () => {
    addSaved(sharedNew.map(p => p.slug));
    notify(tx(`${sharedNew.length} added to your saved list.`, `Se agregaron ${sharedNew.length} a su lista.`));
  };

  return (
    <div className="saved-page">
      <section className="saved-head">
        <div className="wrap">
          <p className="eyebrow">{isShared ? tx('Shared list', 'Lista compartida') : tx('Saved', 'Guardadas')}</p>
          <div className="saved-title-row">
            <h1 className="h1">{isShared ? tx('A list to compare', 'Una lista para comparar') : tx('Your saved properties', 'Sus propiedades guardadas')}</h1>
            {list.length > 0 && (
              <button type="button" className={`btn ${share ? 'btn-ghost' : 'btn-accent'}`} aria-expanded={share} onClick={() => setShare(s => !s)}>
                {tx('Share list', 'Compartir lista')}
              </button>
            )}
          </div>
          <p className="lead">{isShared
            ? tx('Someone sent you these properties. Compare them side by side, and save the ones you like to your own list.', 'Alguien le envió estas propiedades. Compárelas lado a lado y guarde las que le gusten en su propia lista.')
            : tx('Price, size, monthly costs, yield and legal status, side by side. Your list stays in this browser; share it by link to open it on another device or send it to someone.', 'Precio, tamaño, cuotas, rentabilidad y estado legal, lado a lado. Su lista queda en este navegador; compártala con un enlace para abrirla en otro dispositivo o enviársela a alguien.')}</p>

          {isShared && list.length > 0 && (
            <div className="saved-banner">
              <span>{sharedNew.length
                ? tx(`${sharedNew.length} of these ${sharedNew.length === 1 ? 'is' : 'are'} not in your list yet.`, `${sharedNew.length} de estas todavía no ${sharedNew.length === 1 ? 'está' : 'están'} en su lista.`)
                : tx('All of them are already in your list.', 'Todas ya están en su lista.')}</span>
              {sharedNew.length > 0 && <button type="button" className="btn btn-accent" onClick={saveShared}><IconHeart size={16} /> {tx('Save them to my list', 'Guardarlas en mi lista')}</button>}
              <Link to={{ name: 'saved' }} className="link-btn">{tx(`My list (${saved.length})`, `Mi lista (${saved.length})`)} <IconArrow size={16} /></Link>
            </div>
          )}
          {missing > 0 && (
            <p className="fine saved-missing">{tx(
              `${missing} ${missing === 1 ? 'property is' : 'properties are'} no longer listed.`,
              `${missing} ${missing === 1 ? 'propiedad ya no está publicada' : 'propiedades ya no están publicadas'}.`,
            )}</p>
          )}
          <AnimatePresence>{share && list.length > 0 && <ShareBox slugs={list.map(p => p.slug)} onClose={() => setShare(false)} />}</AnimatePresence>
          <AnimatePresence>
            {undo && !isShared && (
              <motion.p className="saved-undo" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {tx(`Removed ${undo.title}.`, `Quitó ${undo.title}.`)}
                <button type="button" className="link-btn" onClick={() => { addSaved([undo.slug]); setUndo(null); }}>{tx('Undo', 'Deshacer')}</button>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {list.length > 0 ? (
        <section className="saved-compare">
          <div className="wrap">
            <Compare list={list} shared={isShared} onRemove={remove} />
          </div>
        </section>
      ) : (
        <section className="section saved-empty">
          <div className="wrap">
            <Reveal className="saved-empty-box">
              <span className="saved-empty-icon"><IconHeart size={26} /></span>
              <h2 className="h3">{isShared ? tx('This list is empty', 'Esta lista está vacía') : tx('No saved properties yet', 'Todavía no ha guardado propiedades')}</h2>
              <p>{tx('Tap the heart on any listing and it appears here, ready to compare with the others.', 'Toque el corazón de cualquier propiedad y aparecerá aquí, lista para compararla con las demás.')}</p>
              <button type="button" className="btn btn-accent" onClick={() => navigate({ name: 'search' })}>{tx(`See all ${properties.length} properties`, `Ver las ${properties.length} propiedades`)}</button>
            </Reveal>
            <h2 className="h4 saved-picks-title">{tx('A few to start with', 'Algunas para empezar')}</h2>
            <div className="card-grid">
              {picks.map((p, i) => <Reveal key={p.slug} delay={i * 0.08}><PropertyCard p={p} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section className="section quote">
          <div className="wrap cta-grid">
            <div>
              <p className="eyebrow">{tx('Next step', 'Siguiente paso')}</p>
              <h2 className="h2">{tx('Want to see them in person?', '¿Quiere verlas en persona?')}</h2>
              <p className="lead">{tx(
                'An advisor can line up visits to these properties on the same day, or tour them with you by video call.',
                'Un asesor puede organizar las visitas a estas propiedades el mismo día, o recorrerlas con usted por videollamada.',
              )}</p>
              <ul className="check-list">
                <li><IconCheck size={18} /> {tx('Visits grouped by area, to save you driving', 'Visitas agrupadas por zona, para que maneje menos')}</li>
                <li><IconCheck size={18} /> {tx('Title study of each one, before you make an offer', 'El estudio registral de cada una, antes de ofertar')}</li>
              </ul>
            </div>
            <ContactForm context={`${tx('Comparing', 'Comparando')}: ${list.map(p => p.title).join(', ')}`} submitLabel={tx('Request visits', 'Pedir visitas')} />
          </div>
        </section>
      )}
    </div>
  );
}
