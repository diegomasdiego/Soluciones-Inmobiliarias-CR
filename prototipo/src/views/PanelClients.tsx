'use client';
// Team panel → Client portal: create deals, decide which emails can see them, and keep each one up
// to date. The deal is shown with the same view the client sees (DealView) plus editing controls.
// The server checks the team list on every call (convex/portalTeam.ts).
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import { IconArrowLeft, IconClose, IconSearch } from '../components/Icons';
import { LogoBadge } from '../components/Logo';
import { DealView, type TeamTools } from '../components/portal/DealView';
import { useLiveDeal } from '../components/portal/useLiveDeal';
import { advisors } from '../data/company';
import { stages, teamDocCategories, ticketStatuses, type DealKind, type PortalData, type PortalTicket, type TicketStatus } from '../data/portal';
import { useProperties } from '../lib/data';
import { pick, useLang } from '../lib/i18n';
import { ago, fmtMonth, todayCR } from '../lib/when';
import '../styles/portal.css';

type Row = Doc<'deals'> & { emails: { email: string; seenAt?: number }[]; unread: boolean };

const errText = (err: unknown, tx: (en: string, es: string) => string) => {
  const code = err instanceof ConvexError ? String(err.data) : '';
  if (code === 'email') return tx('Check the emails: one of them is not valid.', 'Revise los correos: uno no es válido.');
  if (code === 'no-email') return tx('Add at least one client email.', 'Agregue al menos un correo del cliente.');
  if (code === 'too-many') return tx('Six emails at most per file.', 'Máximo seis correos por expediente.');
  if (code === 'empty') return tx('Fill in the title and the client name.', 'Complete el título y el nombre del cliente.');
  if (code === 'month') return tx('Choose the month.', 'Elija el mes.');
  return tx('Could not save. Try again.', 'No se pudo guardar. Intente de nuevo.');
};
const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/[^\d.-]/g, '')));

export default function PanelClients({ deals }: { deals: Row[] | undefined }) {
  const { lang, tx } = useLang();
  const [selected, setSelected] = useState<Id<'deals'> | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | DealKind>('all');

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (deals ?? []).filter(d =>
      (kind === 'all' || d.kind === kind) &&
      (!q || [d.title, d.clientName, d.place, ...d.emails.map(e => e.email)].some(f => f.toLowerCase().includes(q))));
  }, [deals, kind, search]);

  const row = selected && selected !== 'new' ? deals?.find(d => d._id === selected) : undefined;

  return (
    <div className={`pn-body ${selected ? 'has-selection' : ''}`}>
      <section className="pn-list" aria-labelledby="pc-title">
        <div className="pn-list-head">
          <h1 id="pc-title">{tx('Client portal', 'Portal de clientes')}</h1>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => { setSelected('new'); window.scrollTo(0, 0); }}>{tx('New file', 'Nuevo expediente')}</button>
        <div className="pn-status" role="group" aria-label={tx('Type', 'Tipo')}>
          {(['all', 'purchase', 'managed'] as const).map(k => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k === 'all' ? tx('All', 'Todos') : k === 'purchase' ? tx('Purchases', 'Compras') : tx('Managed', 'Administradas')}
            </button>
          ))}
        </div>
        <label className="pn-search">
          <IconSearch size={16} />
          <span className="sr-only">{tx('Search', 'Buscar')}</span>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={tx('Property, client or email', 'Propiedad, cliente o correo')} />
        </label>
        {deals === undefined ? <div className="pn-empty" aria-busy="true">{tx('Loading…', 'Cargando…')}</div>
          : shown.length === 0 ? (
            <div className="pn-empty">{deals.length === 0
              ? tx('No files yet. Create one for each purchase in progress or each property you manage.', 'Todavía no hay expedientes. Cree uno por cada compra en curso o propiedad que administran.')
              : tx('Nothing matches.', 'Nada coincide.')}</div>
          ) : (
            <ul className="pn-rows">
              {shown.map(d => (
                <li key={d._id}>
                  <button type="button" className={`pn-row ${d.unread ? 'is-new' : d.status === 'closed' ? 'is-closed' : 'is-contacted'}`} aria-pressed={selected === d._id} onClick={() => { setSelected(d._id); window.scrollTo(0, 0); }}>
                    <span className="pn-row-dot" aria-hidden="true" />
                    <span className="pn-row-main">
                      <strong>{d.title}</strong>
                      <span>{d.clientName} · {d.kind === 'purchase' ? (d.stage >= stages.length ? tx('Registered', 'Inscrita') : pick(stages[d.stage].title, lang)) : tx('Managed', 'Administrada')}</span>
                    </span>
                    <span className="pn-row-meta">
                      <time dateTime={new Date(d.updatedAt).toISOString()}>{ago(d.updatedAt, lang)}</time>
                      <span className="pn-row-status">{d.unread ? tx('Client wrote', 'Novedad del cliente') : d.status === 'closed' ? tx('Closed', 'Cerrado') : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section className="pn-detail" aria-label={tx('File', 'Expediente')}>
        {selected === 'new' ? (
          <div className="pn-detail-in">
            <button type="button" className="pn-back" onClick={() => setSelected(null)}><IconArrowLeft size={16} /> {tx('All files', 'Todos los expedientes')}</button>
            <DealForm onDone={id => setSelected(id ?? null)} />
          </div>
        ) : row ? (
          <TeamDeal key={row._id} row={row} onBack={() => setSelected(null)} onDeleted={() => setSelected(null)} />
        ) : (
          <div className="pn-detail-empty"><LogoBadge variant="on-light" className="pn-detail-badge" /><p>{tx('Choose a file, or create a new one.', 'Elija un expediente o cree uno nuevo.')}</p></div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- create / edit

function DealForm({ row, onDone }: { row?: Row; onDone: (id?: Id<'deals'>) => void }) {
  const { tx } = useLang();
  const { properties } = useProperties();
  const create = useMutation(api.portalTeam.create);
  const update = useMutation(api.portalTeam.update);
  const [kind, setKind] = useState<DealKind>(row?.kind ?? 'purchase');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? '');
    const args = {
      title: s('title'), place: s('place'), propertySlug: s('propertySlug') || undefined, clientName: s('clientName'),
      lang: s('lang') === 'en' ? 'en' as const : 'es' as const, advisor: s('advisor'),
      priceUsd: num(s('priceUsd')), depositUsd: num(s('depositUsd')), rentUsd: num(s('rentUsd')),
      emails: s('emails').split(/[\s,;]+/).filter(Boolean),
    };
    setBusy(true);
    setError(null);
    try {
      if (row) { await update({ id: row._id, ...args }); onDone(row._id); }
      else onDone(await create({ kind, ...args }));
    } catch (err) {
      setError(errText(err, tx));
    } finally {
      setBusy(false);
    }
  };

  const field = (name: string, label: ReactNode, input: ReactNode, wide = false) => (
    <div className={`field ${wide ? 'pc-wide' : ''}`}><label htmlFor={`pc-${name}`}>{label}</label>{input}</div>
  );
  return (
    <form className="pc-form" onSubmit={submit}>
      <h2 className="pc-h2">{row ? tx('Edit file', 'Editar expediente') : tx('New file', 'Nuevo expediente')}</h2>
      {!row && (
        <div className="pn-status pc-wide" role="group" aria-label={tx('Type', 'Tipo')}>
          <button type="button" aria-pressed={kind === 'purchase'} onClick={() => setKind('purchase')}>{tx('Purchase in progress', 'Compra en curso')}</button>
          <button type="button" aria-pressed={kind === 'managed'} onClick={() => setKind('managed')}>{tx('Managed property', 'Propiedad administrada')}</button>
        </div>
      )}
      {field('title', tx('Property', 'Propiedad'), <input id="pc-title" name="title" required maxLength={120} defaultValue={row?.title} placeholder="Casa Los Laureles" />)}
      {field('place', tx('Location', 'Ubicación'), <input id="pc-place" name="place" maxLength={120} defaultValue={row?.place} placeholder="San Rafael, Escazú" />)}
      {field('propertySlug', tx('Listing on the site (for the photo)', 'Ficha del sitio (para la foto)'), (
        <select id="pc-propertySlug" name="propertySlug" defaultValue={row?.propertySlug ?? ''}>
          <option value="">{tx('None', 'Ninguna')}</option>
          {properties.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
        </select>
      ))}
      {field('advisor', tx('Advisor', 'Asesor(a)'), (
        <input id="pc-advisor" name="advisor" list="pc-advisors" maxLength={120} defaultValue={row?.advisor} />
      ))}
      <datalist id="pc-advisors">{Object.values(advisors).map(a => <option key={a.id} value={a.name} />)}</datalist>
      {field('clientName', tx('Client name', 'Nombre del cliente'), <input id="pc-clientName" name="clientName" required maxLength={120} defaultValue={row?.clientName} />)}
      {field('lang', tx('Emails in', 'Correos en'), (
        <select id="pc-lang" name="lang" defaultValue={row?.lang ?? 'es'}>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      ))}
      {field('emails', <>{tx('Who can see it (emails)', 'Quién lo puede ver (correos)')} <span className="optional">· {tx('one per line, up to 6', 'uno por línea, hasta 6')}</span></>, (
        <textarea id="pc-emails" name="emails" required rows={2} defaultValue={row?.emails.map(e => e.email).join('\n')} placeholder="cliente@ejemplo.com" />
      ), true)}
      {kind === 'purchase' ? (
        <>
          {field('priceUsd', tx('Agreed price (US$)', 'Precio acordado (US$)'), <input id="pc-priceUsd" name="priceUsd" inputMode="decimal" defaultValue={row?.priceUsd} />)}
          {field('depositUsd', tx('Deposit in escrow (US$)', 'Depósito en escrow (US$)'), <input id="pc-depositUsd" name="depositUsd" inputMode="decimal" defaultValue={row?.depositUsd} />)}
        </>
      ) : field('rentUsd', tx('Monthly rent (US$)', 'Alquiler mensual (US$)'), <input id="pc-rentUsd" name="rentUsd" inputMode="decimal" defaultValue={row?.rentUsd} />)}
      <p className="pn-note pc-wide">{tx(
        'People you add get an email with the link to the portal (once email sending is set up). They sign in with that email and see only this file.',
        'Las personas que agregue reciben un correo con el enlace al portal (cuando el envío de correos esté configurado). Entran con ese correo y solo ven este expediente.',
      )}</p>
      <div className="pc-actions pc-wide">
        <button type="submit" className="btn btn-accent" disabled={busy} aria-busy={busy}>{row ? tx('Save changes', 'Guardar cambios') : tx('Create file', 'Crear expediente')}</button>
        <button type="button" className="btn btn-ghost" onClick={() => onDone(row?._id)}>{tx('Cancel', 'Cancelar')}</button>
      </div>
      {error && <p className="field-error pc-wide" role="alert">{error}</p>}
    </form>
  );
}

// ---------------------------------------------------------------- one deal, team view

function TeamDeal({ row, onBack, onDeleted }: { row: Row; onBack: () => void; onDeleted: () => void }) {
  const { lang, tx } = useLang();
  const { data, actions } = useLiveDeal(row._id);
  const [editing, setEditing] = useState(false);
  const setStatus = useMutation(api.portalTeam.setStatus);
  const remove = useMutation(api.portalTeam.remove);
  const removeDoc = useMutation(api.portalTeam.removeDoc);
  const removeUpdate = useMutation(api.portalTeam.removeUpdate);

  const back = <button type="button" className="pn-back" onClick={onBack}><IconArrowLeft size={16} /> {tx('All files', 'Todos los expedientes')}</button>;
  if (editing) return <div className="pn-detail-in">{back}<DealForm row={row} onDone={() => setEditing(false)} /></div>;
  if (data === undefined) return <div className="pn-detail-in">{back}<p className="pn-muted" aria-busy="true">{tx('Loading…', 'Cargando…')}</p></div>;
  if (data === null) return <div className="pn-detail-in">{back}<p className="pn-muted">{tx('This file no longer exists.', 'Este expediente ya no existe.')}</p></div>;

  const del = async () => {
    if (!window.confirm(tx(
      `Delete "${row.title}" with all its messages, documents, reports and maintenance? This cannot be undone.`,
      `¿Eliminar "${row.title}" con todos sus mensajes, documentos, reportes y mantenimiento? No se puede deshacer.`,
    ))) return;
    await remove({ id: row._id });
    onDeleted();
  };

  const tools: TeamTools = {
    header: (
      <div className="pc-bar">
        <div className="pc-people">
          <span className="pd-label">{tx('Can see it', 'Lo pueden ver')}</span>
          {row.emails.map(e => (
            <span key={e.email} className="pc-person" title={e.seenAt ? `${tx('Last visit', 'Última visita')}: ${ago(e.seenAt, lang)}` : tx('Has not visited yet', 'Aún no ha entrado')}>
              {e.email} <small>{e.seenAt ? ago(e.seenAt, lang) : tx('not yet', 'aún no')}</small>
            </span>
          ))}
        </div>
        <div className="pc-bar-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>{tx('Edit details and access', 'Editar datos y acceso')}</button>
          <button type="button" className="btn btn-ghost" onClick={() => void setStatus({ id: row._id, status: row.status === 'active' ? 'closed' : 'active' })}>
            {row.status === 'active' ? tx('Mark as closed', 'Marcar como cerrado') : tx('Reopen', 'Reabrir')}
          </button>
          <button type="button" className="btn btn-ghost pc-danger" onClick={() => void del()}>{tx('Delete', 'Eliminar')}</button>
        </div>
      </div>
    ),
    stageEditor: row.kind === 'purchase' ? <StageEditor row={row} /> : undefined,
    reportEditor: row.kind === 'managed' ? <ReportEditor id={row._id} data={data} /> : undefined,
    ticketControls: t => <TicketControls t={t} />,
    docControls: d => (
      <button type="button" className="pc-x" aria-label={tx(`Delete ${d.name}`, `Eliminar ${d.name}`)} onClick={() => {
        if (window.confirm(tx(`Delete "${d.name}"? The client will no longer see it.`, `¿Eliminar "${d.name}"? El cliente ya no lo verá.`))) void removeDoc({ docId: d._id as Id<'dealDocs'> });
      }}><IconClose size={14} /></button>
    ),
    updateControls: u => (
      <button type="button" className="pc-x" aria-label={tx('Delete message', 'Eliminar mensaje')} onClick={() => {
        if (window.confirm(tx('Delete this message?', '¿Eliminar este mensaje?'))) void removeUpdate({ updateId: u._id as Id<'dealUpdates'> });
      }}><IconClose size={14} /></button>
    ),
    uploadCategories: teamDocCategories(row.kind),
  };

  return (
    <div className="pn-detail-in pc-detail">
      {back}
      <p className="pn-note">{tx('This is what the client sees, plus your controls.', 'Esto es lo que ve el cliente, más sus controles.')} {tx('Client:', 'Cliente:')} <strong>{row.clientName}</strong></p>
      <DealView data={data} actions={actions} team={tools} />
    </div>
  );
}

function StageEditor({ row }: { row: Row }) {
  const { lang, tx } = useLang();
  const setStage = useMutation(api.portalTeam.setStage);
  const [stage, setStageValue] = useState(row.stage);
  const [dates, setDates] = useState<string[]>(() => Array.from({ length: stages.length }, (_, i) => row.stageDates[i] ?? ''));
  const [state, setState] = useState<'idle' | 'busy' | 'saved' | 'error'>('idle');
  const dirty = stage !== row.stage || dates.some((d, i) => d !== (row.stageDates[i] ?? ''));

  const save = async () => {
    setState('busy');
    try { await setStage({ id: row._id, stage, stageDates: dates }); setState('saved'); } catch { setState('error'); }
  };
  return (
    <div className="pc-editor">
      <p className="pd-label">{tx('Team: stage and dates', 'Equipo: etapa y fechas')}</p>
      <div className="pc-stage-grid">
        {stages.map((s, i) => (
          <label key={s.id} className={`pc-stage ${i === stage ? 'is-current' : ''}`}>
            <span><input type="radio" name="pc-stage" checked={stage === i} onChange={() => { setStageValue(i); setState('idle'); }} /> {pick(s.title, lang)}</span>
            <input type="date" value={dates[i]} onChange={e => { const next = [...dates]; next[i] = e.target.value; setDates(next); setState('idle'); }} aria-label={tx(`${pick(s.title, 'en')} date`, `Fecha de ${pick(s.title, 'es').toLowerCase()}`)} />
          </label>
        ))}
        <label className={`pc-stage ${stage === stages.length ? 'is-current' : ''}`}>
          <span><input type="radio" name="pc-stage" checked={stage === stages.length} onChange={() => { setStageValue(stages.length); setState('idle'); }} /> {tx('All done', 'Todo listo')}</span>
        </label>
      </div>
      <p className="pn-small">{tx('Dates: when a step was done, or when it is expected.', 'Fechas: cuándo se completó un paso, o cuándo se espera.')}</p>
      <div className="pc-actions">
        <button type="button" className="btn btn-accent" disabled={!dirty || state === 'busy'} aria-busy={state === 'busy'} onClick={() => void save()}>{tx('Save stage', 'Guardar etapa')}</button>
        {state === 'saved' && <span className="pd-ok" role="status">{tx('Saved. The client gets an email notice.', 'Guardado. El cliente recibe un aviso por correo.')}</span>}
        {state === 'error' && <span className="field-error" role="alert">{tx('Could not save.', 'No se pudo guardar.')}</span>}
      </div>
    </div>
  );
}

function ReportEditor({ id, data }: { id: Id<'deals'>; data: PortalData }) {
  const { lang, tx } = useLang();
  const save = useMutation(api.portalTeam.saveReport);
  const removeReport = useMutation(api.portalTeam.removeReport);
  const lastMonth = (() => { const d = new Date(todayCR() + 'T12:00:00Z'); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); })();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const rent = data.deal.rentUsd;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const n = (k: string) => num(String(f.get(k) ?? '')) ?? 0;
    setBusy(true);
    setMsg(null);
    try {
      await save({
        id, month: String(f.get('month') ?? ''), incomeUsd: n('income'), feeUsd: n('fee'), maintenanceUsd: n('maintenance'), otherUsd: n('other'),
        nights: num(String(f.get('nights') ?? '')), note: String(f.get('note') ?? '') || undefined,
      });
      setMsg({ ok: true, text: tx('Report saved.', 'Reporte guardado.') });
      setFormKey(k => k + 1);
    } catch (err) {
      setMsg({ ok: false, text: errText(err, tx) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pc-editor">
      <p className="pd-label">{tx('Team: add or replace a month', 'Equipo: agregar o reemplazar un mes')}</p>
      <form key={formKey} className="pc-report" onSubmit={submit}>
        <label>{tx('Month', 'Mes')}<input type="month" name="month" required defaultValue={lastMonth} /></label>
        <label>{tx('Rent collected', 'Alquiler cobrado')}<input name="income" inputMode="decimal" defaultValue={rent} /></label>
        <label>{tx('Management fee', 'Comisión de administración')}<input name="fee" inputMode="decimal" defaultValue={rent ? Math.round(rent * 0.1) : undefined} /></label>
        <label>{tx('Maintenance', 'Mantenimiento')}<input name="maintenance" inputMode="decimal" defaultValue={0} /></label>
        <label>{tx('HOA, utilities, other', 'Condominio, servicios, otros')}<input name="other" inputMode="decimal" defaultValue={0} /></label>
        <label>{tx('Nights rented (short stays)', 'Noches alquiladas (estadías cortas)')}<input name="nights" inputMode="numeric" /></label>
        <label className="pc-wide">{tx('Note for the owner', 'Nota para el propietario')}<input name="note" maxLength={300} /></label>
        <div className="pc-actions pc-wide">
          <button type="submit" className="btn btn-accent" disabled={busy} aria-busy={busy}>{tx('Save month', 'Guardar mes')}</button>
          {msg && <span className={msg.ok ? 'pd-ok' : 'field-error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</span>}
        </div>
      </form>
      {data.reports.length > 0 && (
        <ul className="pc-months">
          {[...data.reports].reverse().map(r => (
            <li key={r._id}>
              {fmtMonth(r.month, lang)}
              <button type="button" className="pc-x" aria-label={tx(`Delete ${r.month}`, `Eliminar ${r.month}`)} onClick={() => {
                if (window.confirm(tx(`Delete the report for ${fmtMonth(r.month, lang)}?`, `¿Eliminar el reporte de ${fmtMonth(r.month, lang)}?`))) void removeReport({ reportId: r._id as Id<'ownerReports'> });
              }}><IconClose size={12} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TicketControls({ t }: { t: PortalTicket }) {
  const { lang, tx } = useLang();
  const setTicket = useMutation(api.portalTeam.setTicket);
  const [status, setStatusValue] = useState<TicketStatus>(t.status);
  const [date, setDate] = useState(t.scheduledFor ?? '');
  const [cost, setCost] = useState(t.costUsd === undefined ? '' : String(t.costUsd));
  const [state, setState] = useState<'idle' | 'busy' | 'saved' | 'error'>('idle');
  const dirty = status !== t.status || date !== (t.scheduledFor ?? '') || cost !== (t.costUsd === undefined ? '' : String(t.costUsd));
  const save = async () => {
    setState('busy');
    try { await setTicket({ ticketId: t._id as Id<'tickets'>, status, scheduledFor: date || undefined, costUsd: num(cost) }); setState('saved'); }
    catch { setState('error'); }
  };
  return (
    <div className="pc-ticket">
      <select value={status} onChange={e => { setStatusValue(e.target.value as TicketStatus); setState('idle'); }} aria-label={tx('Status', 'Estado')}>
        {(Object.keys(ticketStatuses) as TicketStatus[]).map(s => <option key={s} value={s}>{pick(ticketStatuses[s], lang)}</option>)}
      </select>
      <input type="date" value={date} onChange={e => { setDate(e.target.value); setState('idle'); }} aria-label={tx('Visit date', 'Fecha de la visita')} />
      <input inputMode="decimal" value={cost} onChange={e => { setCost(e.target.value); setState('idle'); }} placeholder={tx('Cost US$', 'Costo US$')} aria-label={tx('Cost in US dollars', 'Costo en dólares')} />
      <button type="button" className="btn btn-ghost" disabled={!dirty || state === 'busy'} onClick={() => void save()}>{state === 'saved' ? tx('Saved', 'Guardado') : tx('Save', 'Guardar')}</button>
      {state === 'error' && <span className="field-error" role="alert">{tx('Could not save.', 'No se pudo guardar.')}</span>}
    </div>
  );
}
