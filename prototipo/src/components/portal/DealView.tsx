'use client';
// One deal in the client portal: a purchase (stages, figures, documents, messages) or a managed
// property (monthly reports, maintenance, documents, messages). Purely presentational: the live
// portal, the demo and the team panel pass the data and the actions, and the panel adds its
// editing controls through `team`.
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ACCEPT, clientDocCategories, docCategories, MAX_FILE_MB, stages, ticketStatuses,
  type DocCategory, type PortalData, type PortalDoc, type PortalTicket, type PortalUpdate,
} from '../../data/portal';
import { money } from '../../lib/format';
import { pick, useLang, type Lang } from '../../lib/i18n';
import { useProperties } from '../../lib/data';
import { ago, fmtDate, fmtDay } from '../../lib/when';
import { Img } from '../Basics';
import { IconCheck, IconLock, IconMail } from '../Icons';
import { ReportChart } from './ReportChart';

export type DealActions = {
  post: (text: string) => Promise<void>;
  upload: (file: File, category: DocCategory) => Promise<void>;
  download: (doc: PortalDoc) => Promise<void>;
  openTicket: (title: string, detail: string) => Promise<void>;
};

/** Controls only the team panel shows. */
export type TeamTools = {
  header?: ReactNode;
  stageEditor?: ReactNode;
  reportEditor?: ReactNode;
  ticketControls?: (t: PortalTicket) => ReactNode;
  docControls?: (d: PortalDoc) => ReactNode;
  updateControls?: (u: PortalUpdate) => ReactNode;
  uploadCategories?: DocCategory[];
};

const usd = (n: number) => money(n, 'USD', 1);
const fileSize = (b: number) => (b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`);

/** Text for the error codes the actions throw (server codes and local checks). */
export function errorText(code: string, tx: (en: string, es: string) => string) {
  switch (code) {
    case 'rate': return tx('Too many in a row. Try again later.', 'Demasiados envíos seguidos. Intente más tarde.');
    case 'too-big': return tx(`The file is over ${MAX_FILE_MB} MB.`, `El archivo pasa de ${MAX_FILE_MB} MB.`);
    case 'file-type': return tx('Use PDF, JPG, PNG, HEIC, Word or Excel.', 'Use PDF, JPG, PNG, HEIC, Word o Excel.');
    case 'demo': return tx('This is a demo: nothing is sent or saved.', 'Es una demostración: no se envía ni se guarda nada.');
    case 'demo-file': return tx('Demo files do not download.', 'En la demostración no se descargan archivos.');
    case 'empty': return tx('Write something first.', 'Escriba algo primero.');
    default: return tx('That did not work. Try again in a moment.', 'No funcionó. Intente de nuevo en un momento.');
  }
}
const codeOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

export function DealView({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { deal } = data;
  return (
    <div className="pd">
      <DealHeader data={data} />
      {team?.header}
      {deal.kind === 'purchase' ? <Purchase data={data} actions={actions} team={team} /> : <Managed data={data} actions={actions} team={team} />}
      <Documents data={data} actions={actions} team={team} />
    </div>
  );
}

// ---------------------------------------------------------------- header

function DealHeader({ data }: { data: PortalData }) {
  const { lang, tx } = useLang();
  const { bySlug } = useProperties();
  const { deal, tickets, reports } = data;
  const photo = deal.propertySlug ? bySlug(deal.propertySlug)?.photos[0] : undefined;

  const facts: [string, string, string?][] = [];
  if (deal.kind === 'purchase') {
    if (deal.priceUsd) facts.push([tx('Agreed price', 'Precio acordado'), usd(deal.priceUsd)]);
    if (deal.depositUsd) facts.push([tx('In escrow', 'En escrow'), usd(deal.depositUsd)]);
    if (deal.priceUsd && deal.depositUsd) facts.push([tx('Balance at signing', 'Saldo al firmar'), usd(deal.priceUsd - deal.depositUsd), tx('plus closing costs', 'más gastos de cierre')]);
    const signing = deal.stageDates[3];
    if (signing) facts.push([deal.stage > 3 ? tx('Signed', 'Firmada') : tx('Signing', 'Firma'), fmtDay(signing, lang), deal.stage > 3 ? undefined : tx('expected', 'estimada')]);
  } else {
    if (deal.rentUsd) facts.push([tx('Monthly rent', 'Alquiler mensual'), usd(deal.rentUsd)]);
    const last12 = reports.slice(-12);
    if (last12.length) facts.push([tx(`Net, last ${last12.length} months`, `Neto, últimos ${last12.length} meses`), usd(last12.reduce((s, r) => s + net(r), 0))]);
    const open = tickets.filter(t => t.status !== 'done').length;
    facts.push([tx('Open maintenance', 'Mantenimiento abierto'), String(open)]);
  }

  return (
    <header className="pd-head">
      <div className="pd-head-photo">
        {photo ? <Img name={photo} alt={deal.title} /> : <div className="pd-head-nophoto" aria-hidden="true" />}
      </div>
      <div className="pd-head-main">
        <p className="eyebrow">
          {deal.kind === 'purchase' ? tx('Purchase', 'Compra') : tx('Managed property', 'Propiedad administrada')}
          {deal.status === 'closed' && <span className="pd-closed"> · {tx('Closed', 'Cerrado')}</span>}
        </p>
        <h1 className="pd-title">{deal.title}</h1>
        <p className="pd-sub">{deal.place}{deal.advisor ? <> · {tx('Advisor', 'Asesor(a)')}: <strong>{deal.advisor}</strong></> : null}</p>
        {facts.length > 0 && (
          <dl className="pd-facts">
            {facts.map(([k, v, note]) => (
              <div key={k}><dt>{k}</dt><dd>{v}{note && <small> {note}</small>}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- purchase

function Purchase({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { lang, tx } = useLang();
  const { deal, docs } = data;
  const finished = deal.stage >= stages.length;
  const [open, setOpen] = useState(Math.min(deal.stage, stages.length - 1));
  const s = stages[open];
  const state = (i: number) => (i < deal.stage ? 'done' : i === deal.stage ? 'current' : 'pending');
  const stageDocs = docs.filter(d => d.category === s.id);
  const date = deal.stageDates[open];

  return (
    <>
      <section className="pd-card pd-stages" aria-labelledby="pd-stages-h">
        <div className="pd-card-head">
          <h2 id="pd-stages-h" className="pd-h2">{tx('Your purchase, step by step', 'Su compra, paso a paso')}</h2>
          <p className="pd-muted">{finished
            ? tx('All done: the property is registered in your name.', 'Todo listo: la propiedad está inscrita a su nombre.')
            : tx(`Step ${deal.stage + 1} of ${stages.length}: ${pick(stages[deal.stage].title, lang)}`, `Paso ${deal.stage + 1} de ${stages.length}: ${pick(stages[deal.stage].title, lang)}`)}</p>
        </div>
        <ol className="pd-steps" style={{ ['--done' as string]: Math.min(deal.stage, stages.length - 1) / (stages.length - 1) }}>
          {stages.map((st, i) => (
            <li key={st.id} className={`is-${state(i)}`}>
              <button type="button" aria-pressed={open === i} onClick={() => setOpen(i)} aria-label={`${pick(st.title, lang)}: ${state(i) === 'done' ? tx('done', 'completada') : state(i) === 'current' ? tx('in progress', 'en curso') : tx('pending', 'pendiente')}`}>
                <span className="pd-step-dot">{state(i) === 'done' ? <IconCheck size={14} /> : i + 1}</span>
                <span className="pd-step-name">{pick(st.title, lang)}</span>
                {deal.stageDates[i] && <span className="pd-step-date">{fmtDay(deal.stageDates[i], lang, { day: 'numeric', month: 'short' })}</span>}
              </button>
            </li>
          ))}
        </ol>
        {team?.stageEditor}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={open} className="pd-stage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="pd-stage-top">
              <h3>{pick(s.title, lang)}</h3>
              <span className={`pd-badge is-${state(open)}`}>
                {state(open) === 'done' ? tx('Done', 'Completada') : state(open) === 'current' ? tx('In progress', 'En curso') : tx('Coming up', 'Próxima')}
                {date && <> · {state(open) === 'done' ? fmtDay(date, lang) : `${tx('expected', 'estimada')} ${fmtDay(date, lang)}`}</>}
              </span>
            </div>
            <div className="pd-stage-cols">
              <div><p className="pd-label">{tx('What happens', 'Qué pasa')}</p><p>{pick(s.what, lang)}</p></div>
              <div><p className="pd-label">{tx('What you do', 'Qué hace usted')}</p><p>{pick(s.you, lang)}</p></div>
            </div>
            {stageDocs.length > 0 && (
              <ul className="pd-stage-docs">
                {stageDocs.map(d => <li key={d._id}><DocButton d={d} actions={actions} /></li>)}
              </ul>
            )}
            {s.id === 'escrow' && (
              <p className="pd-safe"><IconLock size={15} /> {tx(
                'We will never ask you to wire money to a personal account or change bank details by email. If in doubt, call your advisor.',
                'Nunca le pediremos transferir a una cuenta personal ni cambiaremos datos bancarios por correo. Ante cualquier duda, llame a su asesor(a).',
              )}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <Feed data={data} actions={actions} team={team} />
    </>
  );
}

// ---------------------------------------------------------------- managed property

const net = (r: { incomeUsd: number; feeUsd: number; maintenanceUsd: number; otherUsd: number }) => r.incomeUsd - r.feeUsd - r.maintenanceUsd - r.otherUsd;

function Managed({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { lang, tx } = useLang();
  const { reports } = data;
  const [showTable, setShowTable] = useState(false);
  const last = reports.slice(-12);
  const totals = last.reduce((t, r) => ({ income: t.income + r.incomeUsd, costs: t.costs + r.feeUsd + r.maintenanceUsd + r.otherUsd, net: t.net + net(r) }), { income: 0, costs: 0, net: 0 });

  return (
    <>
      <section className="pd-card" aria-labelledby="pd-rep-h">
        <div className="pd-card-head">
          <h2 id="pd-rep-h" className="pd-h2">{tx('Monthly reports', 'Reportes mensuales')}</h2>
          {last.length > 0 && <p className="pd-muted">{tx(`Last ${last.length} months`, `Últimos ${last.length} meses`)}</p>}
        </div>
        {last.length === 0 ? (
          <p className="pd-empty">{tx('The first report appears here at the end of the first month.', 'El primer reporte aparece aquí al cerrar el primer mes.')}</p>
        ) : (
          <>
            <div className="pd-kpis">
              <div><span>{tx('Rent collected', 'Alquiler cobrado')}</span><strong>{usd(totals.income)}</strong></div>
              <div><span>{tx('Costs', 'Gastos')}</span><strong>{usd(totals.costs)}</strong></div>
              <div className="is-key"><span>{tx('Net to you', 'Neto para usted')}</span><strong>{usd(totals.net)}</strong></div>
            </div>
            <ReportChart reports={last} />
            <button type="button" className="pd-link" aria-expanded={showTable} onClick={() => setShowTable(v => !v)}>
              {showTable ? tx('Hide the table', 'Ocultar la tabla') : tx('See the figures as a table', 'Ver las cifras en tabla')}
            </button>
            {showTable && <ReportTable reports={[...last].reverse()} lang={lang} />}
          </>
        )}
        {team?.reportEditor}
      </section>

      <Feed data={data} actions={actions} team={team} />
      <Tickets data={data} actions={actions} team={team} />
    </>
  );
}

function ReportTable({ reports, lang }: { reports: PortalData['reports']; lang: Lang }) {
  const { tx } = useLang();
  return (
    <div className="pd-table-wrap">
      <table className="pd-table">
        <thead>
          <tr>
            <th scope="col">{tx('Month', 'Mes')}</th>
            <th scope="col">{tx('Rent', 'Alquiler')}</th>
            <th scope="col">{tx('Management', 'Administración')}</th>
            <th scope="col">{tx('Maintenance', 'Mantenimiento')}</th>
            <th scope="col">{tx('HOA, utilities, other', 'Condominio, servicios y otros')}</th>
            <th scope="col">{tx('Net', 'Neto')}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r._id}>
              <th scope="row">{new Intl.DateTimeFormat(lang === 'es' ? 'es-CR' : 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(r.month + '-15T12:00:00Z'))}{r.note && <small>{r.note}</small>}</th>
              <td>{usd(r.incomeUsd)}</td>
              <td>{usd(r.feeUsd)}</td>
              <td>{usd(r.maintenanceUsd)}</td>
              <td>{usd(r.otherUsd)}</td>
              <td><strong>{usd(net(r))}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tickets({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { lang, tx } = useLang();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const order: Record<string, number> = { open: 0, scheduled: 1, done: 2 };
  const list = [...data.tickets].sort((a, b) => order[a.status] - order[b.status] || b._creationTime - a._creationTime);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await actions.openTicket(title, detail);
      setTitle('');
      setDetail('');
      setMsg({ ok: true, text: tx('Sent. We will tell you when it is scheduled.', 'Enviado. Le avisamos cuando esté programado.') });
    } catch (err) {
      setMsg({ ok: false, text: errorText(codeOf(err), tx) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="pd-card" aria-labelledby="pd-tk-h">
      <div className="pd-card-head">
        <h2 id="pd-tk-h" className="pd-h2">{tx('Maintenance', 'Mantenimiento')}</h2>
      </div>
      {list.length === 0 ? <p className="pd-empty">{tx('Nothing reported.', 'No hay nada reportado.')}</p> : (
        <ul className="pd-tickets">
          {list.map(tk => (
            <li key={tk._id} className={`is-${tk.status}`}>
              <div className="pd-ticket-main">
                <strong>{tk.title}</strong>
                {tk.detail && <p>{tk.detail}</p>}
                <span className="pd-meta">
                  {tk.byClient ? tx('Reported by you', 'Reportado por usted') : tx('Opened by the team', 'Abierto por el equipo')} · {ago(tk._creationTime, lang)}
                  {tk.status === 'scheduled' && tk.scheduledFor && <> · {tx('visit on', 'visita el')} {fmtDay(tk.scheduledFor, lang)}</>}
                  {tk.costUsd !== undefined && <> · {tx('cost', 'costo')} {usd(tk.costUsd)}</>}
                </span>
              </div>
              <span className={`pd-badge is-${tk.status}`}>{pick(ticketStatuses[tk.status], lang)}</span>
              {team?.ticketControls?.(tk)}
            </li>
          ))}
        </ul>
      )}
      <form className="pd-form" onSubmit={send}>
        <p className="pd-label">{tx('Report something that needs fixing', 'Reportar algo que necesita arreglo')}</p>
        <label className="sr-only" htmlFor="pd-tk-title">{tx('What happened', 'Qué pasó')}</label>
        <input id="pd-tk-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder={tx('E.g. The kitchen sink drips', 'Ej.: Gotea el fregadero de la cocina')} />
        <label className="sr-only" htmlFor="pd-tk-detail">{tx('Details', 'Detalles')}</label>
        <textarea id="pd-tk-detail" value={detail} onChange={e => setDetail(e.target.value)} maxLength={2000} rows={2} placeholder={tx('Details (optional)', 'Detalles (opcional)')} />
        <button type="submit" className="btn btn-ghost" disabled={!title.trim() || busy} aria-busy={busy}>{tx('Send report', 'Enviar reporte')}</button>
        {msg && <p className={msg.ok ? 'pd-ok' : 'field-error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
      </form>
    </section>
  );
}

// ---------------------------------------------------------------- messages

function Feed({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { lang, tx } = useLang();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const viewerIsClient = !data.team;
  const shown = all ? data.updates : data.updates.slice(0, 6);
  const isNew = (u: PortalUpdate) => u._creationTime > data.seenAt && u.byClient !== viewerIsClient;

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try { await actions.post(text); setText(''); }
    catch (err) { setError(errorText(codeOf(err), tx)); }
    finally { setBusy(false); }
  };

  return (
    <section className="pd-card pd-feed" aria-labelledby="pd-feed-h">
      <div className="pd-card-head">
        <h2 id="pd-feed-h" className="pd-h2">{tx('Updates and messages', 'Novedades y mensajes')}</h2>
      </div>
      <form className="pd-form pd-compose" onSubmit={send}>
        <label className="sr-only" htmlFor="pd-msg">{viewerIsClient ? tx('Write to the team', 'Escribirle al equipo') : tx('Write to the client', 'Escribirle al cliente')}</label>
        <textarea id="pd-msg" value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={2}
          placeholder={viewerIsClient ? tx('Write to the team…', 'Escríbale al equipo…') : tx('Update for the client…', 'Novedad para el cliente…')} />
        <button type="submit" className="btn btn-accent" disabled={!text.trim() || busy} aria-busy={busy}><IconMail size={16} /> {tx('Send', 'Enviar')}</button>
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>
      {data.updates.length === 0 ? <p className="pd-empty">{tx('No messages yet.', 'Todavía no hay mensajes.')}</p> : (
        <ol className="pd-updates">
          {shown.map(u => (
            <li key={u._id} className={u.byClient ? 'is-client' : 'is-team'}>
              <div className="pd-update-meta">
                <strong>{u.byClient ? (viewerIsClient ? tx('You', 'Usted') : u.author) : 'Soluciones Inmobiliarias CR'}</strong>
                <time dateTime={new Date(u._creationTime).toISOString()} title={fmtDate(u._creationTime, lang)}>{ago(u._creationTime, lang)}</time>
                {isNew(u) && <span className="pd-new">{tx('New', 'Nuevo')}</span>}
                {team?.updateControls?.(u)}
              </div>
              <p>{u.text}</p>
            </li>
          ))}
        </ol>
      )}
      {data.updates.length > 6 && (
        <button type="button" className="pd-link" onClick={() => setAll(v => !v)}>{all ? tx('Show fewer', 'Ver menos') : tx(`Show all ${data.updates.length}`, `Ver los ${data.updates.length}`)}</button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- documents

function DocButton({ d, actions }: { d: PortalDoc; actions: DealActions }) {
  const { tx } = useLang();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const ext = (d.name.split('.').pop() ?? '').slice(0, 4).toUpperCase();
  return (
    <button type="button" className="pd-doc" disabled={busy} aria-busy={busy} title={tx('Download', 'Descargar')} onClick={async () => {
      setBusy(true);
      setFailed(null);
      try { await actions.download(d); } catch (err) { setFailed(codeOf(err) === 'demo-file' ? errorText('demo-file', tx) : tx('Could not download', 'No se pudo descargar')); } finally { setBusy(false); }
    }}>
      <span className="pd-doc-ext" aria-hidden="true">{ext || 'DOC'}</span>
      <span className="pd-doc-name">{d.name}</span>
      <span className={`pd-doc-size ${failed ? 'is-error' : ''}`} role={failed ? 'status' : undefined}>{failed ?? fileSize(d.size)}</span>
    </button>
  );
}

function Documents({ data, actions, team }: { data: PortalData; actions: DealActions; team?: TeamTools }) {
  const { lang, tx } = useLang();
  const categories = team?.uploadCategories ?? clientDocCategories;
  const [category, setCategory] = useState<DocCategory>(categories[0]);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const viewerIsClient = !data.team;

  const groups = useMemo(() => {
    const order = Object.keys(docCategories) as DocCategory[];
    const by = new Map<DocCategory, PortalDoc[]>();
    for (const d of data.docs) by.set(d.category, [...(by.get(d.category) ?? []), d]);
    return order.filter(c => by.has(c)).map(c => ({ c, docs: by.get(c)! }));
  }, [data.docs]);

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || busy) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setMsg({ ok: false, text: errorText('too-big', tx) }); return; }
    if (!ACCEPT.split(',').some(ext => file.name.toLowerCase().endsWith(ext))) { setMsg({ ok: false, text: errorText('file-type', tx) }); return; }
    setBusy(true);
    setMsg(null);
    try {
      await actions.upload(file, category);
      setFile(null);
      setInputKey(k => k + 1);
      setMsg({ ok: true, text: viewerIsClient ? tx('Uploaded. The team can see it now.', 'Subido. El equipo ya lo puede ver.') : tx('Uploaded. The client can see it now.', 'Subido. El cliente ya lo puede ver.') });
    } catch (err) {
      setMsg({ ok: false, text: errorText(codeOf(err), tx) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="pd-card pd-docs" aria-labelledby="pd-docs-h">
      <div className="pd-card-head">
        <h2 id="pd-docs-h" className="pd-h2">{tx('Documents', 'Documentos')}</h2>
        <p className="pd-muted"><IconLock size={14} /> {tx('Only you and our team can open them.', 'Solo usted y nuestro equipo pueden abrirlos.')}</p>
      </div>
      {groups.length === 0 ? <p className="pd-empty">{tx('No documents yet.', 'Todavía no hay documentos.')}</p> : (
        <div className="pd-doc-groups">
          {groups.map(g => (
            <div key={g.c} className="pd-doc-group">
              <h3 className="pd-label">{pick(docCategories[g.c], lang)}</h3>
              <ul>
                {g.docs.map(d => (
                  <li key={d._id}>
                    <DocButton d={d} actions={actions} />
                    <span className="pd-meta">{d.byClient ? (viewerIsClient ? tx('You', 'Usted') : d.uploadedBy) : tx('Team', 'Equipo')} · {ago(d._creationTime, lang)}{d._creationTime > data.seenAt && d.byClient !== viewerIsClient && <span className="pd-new">{tx('New', 'Nuevo')}</span>}</span>
                    {team?.docControls?.(d)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <form className="pd-upload" onSubmit={upload}>
        <p className="pd-label">{viewerIsClient ? tx('Send us a document', 'Enviarnos un documento') : tx('Add a document', 'Agregar un documento')}</p>
        <div className="pd-upload-row">
          <select value={category} onChange={e => setCategory(e.target.value as DocCategory)} aria-label={tx('Type of document', 'Tipo de documento')}>
            {categories.map(c => <option key={c} value={c}>{pick(docCategories[c], lang)}</option>)}
          </select>
          <input key={inputKey} type="file" accept={ACCEPT} onChange={e => { setFile(e.target.files?.[0] ?? null); setMsg(null); }} aria-label={tx('File', 'Archivo')} />
          <button type="submit" className="btn btn-ghost" disabled={!file || busy} aria-busy={busy}>{busy ? tx('Uploading…', 'Subiendo…') : tx('Upload', 'Subir')}</button>
        </div>
        <p className="pd-fine">{tx(`PDF, photos, Word or Excel, up to ${MAX_FILE_MB} MB.`, `PDF, fotos, Word o Excel, hasta ${MAX_FILE_MB} MB.`)}</p>
        {msg && <p className={msg.ok ? 'pd-ok' : 'field-error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
      </form>
    </section>
  );
}
