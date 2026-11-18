// Team panel (#panel): private page where the team signs in, follows up on requests and keeps the
// client portal up to date (PanelClients). Sign-in: email code, email + password, or Google. Only
// emails in ADMIN_EMAILS (Convex) get in; the server checks it on every call (convex/access.ts).
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import { LangToggle } from '../components/Chrome';
import { IconArrowLeft, IconMail, IconPhone, IconSearch } from '../components/Icons';
import { LogoBadge, LogoLockup } from '../components/Logo';
import { googleFlag, SignIn } from '../components/SignIn';
import { budgets, interests, ways } from '../data/leadOptions';
import { hasDatabase } from '../lib/data';
import { useLang, type Lang } from '../lib/i18n';
import { ago, fmtDate } from '../lib/when';
import PanelClients from './PanelClients';
import '../styles/panel.css';

type Lead = Doc<'leads'>;
type Status = Lead['status'];

// es: one request ("Nueva"); esMany: the filter tab ("Nuevas").
const statuses: { id: Status; en: string; es: string; esMany: string }[] = [
  { id: 'new', en: 'New', es: 'Nueva', esMany: 'Nuevas' },
  { id: 'contacted', en: 'Contacted', es: 'Contactada', esMany: 'Contactadas' },
  { id: 'closed', en: 'Closed', es: 'Cerrada', esMany: 'Cerradas' },
];
const ranges = [
  { id: 'all', days: 0, en: 'All dates', es: 'Todas las fechas' },
  { id: '7', days: 7, en: 'Last 7 days', es: 'Últimos 7 días' },
  { id: '30', days: 30, en: 'Last 30 days', es: 'Últimos 30 días' },
  { id: '90', days: 90, en: 'Last 90 days', es: 'Últimos 90 días' },
];
const label = (list: { id: string; en: string; es: string }[], id: string | undefined, lang: Lang) => {
  if (!id) return undefined;
  const item = list.find(x => x.id === id);
  return item ? item[lang] : id;
};

/** WhatsApp link for a phone as typed in the form. Eight digits are taken as a Costa Rica number. */
function whatsapp(phone: string | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits.length === 8 ? '506' + digits : digits}`;
}

// ---------------------------------------------------------------- page

export default function Panel() {
  const { tx } = useLang();
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Panel · Soluciones Inmobiliarias CR';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    window.scrollTo(0, 0);
    return () => { document.title = prevTitle; robots.remove(); };
  }, []);

  if (!hasDatabase) {
    return (
      <Centered>
        <h1 className="pn-title">{tx('Team panel', 'Panel del equipo')}</h1>
        <p className="pn-muted">{tx(
          'The panel needs the live database. Open it on the published site.',
          'El panel necesita la base de datos en línea. Ábralo en el sitio publicado.',
        )}</p>
        <a className="btn btn-ghost" href="#home">{tx('Back to the site', 'Volver al sitio')}</a>
      </Centered>
    );
  }
  return <Gate />;
}

function Gate() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return <div className="panel-loading" aria-busy="true" />;
  return isAuthenticated ? <SignedIn /> : <SignIn audience="team" />;
}

function SignedIn() {
  const me = useQuery(api.team.me);
  useEffect(() => { googleFlag('team').take(); }, []);
  if (me === undefined) return <div className="panel-loading" aria-busy="true" />;
  if (me === null) return <SignIn audience="team" />;
  if (!me.allowed) return <NoAccess email={me.email} />;
  return <Workspace email={me.email} />;
}

type View = 'leads' | 'clients';
const VIEW_KEY = 'sicr.panel.view';

/** The panel's top bar and its two areas: website requests and the client portal. */
function Workspace({ email }: { email: string | null }) {
  const { tx } = useLang();
  const { signOut } = useAuthActions();
  const [view, setViewState] = useState<View>(() => { try { return sessionStorage.getItem(VIEW_KEY) === 'clients' ? 'clients' : 'leads'; } catch { return 'leads'; } });
  const setView = (v: View) => { setViewState(v); try { sessionStorage.setItem(VIEW_KEY, v); } catch { /* storage unavailable */ } };
  const deals = useQuery(api.portalTeam.list);
  const unread = deals?.filter(d => d.unread).length ?? 0;

  return (
    <div className="pn">
      <header className="pn-bar">
        <a href="#home" className="pn-bar-logo" aria-label={tx('Go to the website', 'Ir al sitio web')}><LogoLockup /></a>
        <nav className="pn-views" aria-label={tx('Panel sections', 'Secciones del panel')}>
          <button type="button" aria-pressed={view === 'leads'} onClick={() => setView('leads')}>{tx('Requests', 'Solicitudes')}</button>
          <button type="button" aria-pressed={view === 'clients'} onClick={() => setView('clients')}>
            {tx('Client portal', 'Portal de clientes')}
            {unread > 0 && <span className="pn-views-dot" aria-label={tx(`${unread} with news`, `${unread} con novedades`)}>{unread}</span>}
          </button>
        </nav>
        <div className="pn-bar-tools">
          <LangToggle />
          <span className="pn-bar-user" title={email ?? ''}>{email}</span>
          <button type="button" className="btn btn-ghost pn-bar-out" onClick={() => void signOut()}>{tx('Sign out', 'Salir')}</button>
        </div>
      </header>
      {view === 'leads' ? <Board /> : <PanelClients deals={deals} />}
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="pn-centered">
      <div className="pn-centered-card">
        <LogoBadge variant="cafetal" className="pn-centered-badge" />
        {children}
      </div>
    </div>
  );
}

function NoAccess({ email }: { email: string | null }) {
  const { tx } = useLang();
  const { signOut } = useAuthActions();
  return (
    <Centered>
      <h1 className="pn-title">{tx('No access', 'Sin acceso')}</h1>
      <p className="pn-muted">
        {tx('The account', 'La cuenta')} <strong>{email ?? '—'}</strong> {tx(
          'is not on the team list. Ask the administrator to add it.',
          'no está en la lista del equipo. Pida al administrador que la agregue.',
        )}
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>{tx('Sign out', 'Salir')}</button>
    </Centered>
  );
}

// ---------------------------------------------------------------- board

function Board() {
  const { lang, tx } = useLang();
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [interest, setInterest] = useState('all');
  const [range, setRange] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Id<'leads'> | null>(null);

  // Rounded to the start of the day so the query arguments stay stable between renders.
  const since = useMemo(() => {
    const days = ranges.find(r => r.id === range)?.days ?? 0;
    if (!days) return undefined;
    const d = new Date(Date.now() - days * 86_400_000);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [range]);

  const data = useQuery(api.team.leads, { status: status === 'all' ? undefined : status, since });
  const counts = useQuery(api.team.counts);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.leads ?? []).filter(l =>
      (interest === 'all' || l.interest === interest) &&
      (!q || [l.name, l.email, l.phone, l.message, l.context].some(f => f?.toLowerCase().includes(q))));
  }, [data, interest, search]);

  const countOf = (s: Status) => (counts ? (counts[s] >= counts.cap ? `${counts.cap}+` : String(counts[s])) : '·');
  const total = counts ? counts.new + counts.contacted + counts.closed : null;

  return (
      <div className={`pn-body ${selected ? 'has-selection' : ''}`}>
        <section className="pn-list" aria-labelledby="pn-list-title">
          <div className="pn-list-head">
            <h1 id="pn-list-title">{tx('Requests', 'Solicitudes')}</h1>
            {counts && counts.new > 0 && <span className="pn-badge-new">{countOf('new')} {counts.new === 1 ? tx('new', 'nueva') : tx('new', 'nuevas')}</span>}
          </div>

          <div className="pn-status" role="group" aria-label={tx('Status', 'Estado')}>
            <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
              {tx('All', 'Todas')} <span>{total ?? '·'}</span>
            </button>
            {statuses.map(s => (
              <button key={s.id} type="button" aria-pressed={status === s.id} onClick={() => setStatus(s.id)} data-status={s.id}>
                {lang === 'es' ? s.esMany : s.en} <span>{countOf(s.id)}</span>
              </button>
            ))}
          </div>

          <div className="pn-filters">
            <label className="pn-search">
              <IconSearch size={16} />
              <span className="sr-only">{tx('Search', 'Buscar')}</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={tx('Name, email, phone or message', 'Nombre, correo, teléfono o mensaje')} />
            </label>
            <select value={interest} onChange={e => setInterest(e.target.value)} aria-label={tx('Interest', 'Interés')}>
              <option value="all">{tx('Any interest', 'Cualquier interés')}</option>
              {interests.map(i => <option key={i.id} value={i.id}>{i[lang]}</option>)}
            </select>
            <select value={range} onChange={e => setRange(e.target.value)} aria-label={tx('Date', 'Fecha')}>
              {ranges.map(r => <option key={r.id} value={r.id}>{r[lang]}</option>)}
            </select>
          </div>

          {data === undefined ? (
            <div className="pn-empty" aria-busy="true">{tx('Loading…', 'Cargando…')}</div>
          ) : shown.length === 0 ? (
            <div className="pn-empty">
              {data.leads.length === 0
                ? tx('No requests here yet. New ones appear on their own, no need to refresh.', 'Todavía no hay solicitudes aquí. Las nuevas aparecen solas, sin recargar la página.')
                : tx('Nothing matches these filters.', 'Nada coincide con estos filtros.')}
            </div>
          ) : (
            <ul className="pn-rows">
              {shown.map(l => (
                <li key={l._id}>
                  <button type="button" className={`pn-row is-${l.status}`} aria-pressed={selected === l._id} onClick={() => { setSelected(l._id); window.scrollTo(0, 0); }}>
                    <span className="pn-row-dot" aria-hidden="true" />
                    <span className="pn-row-main">
                      <strong>{l.name}</strong>
                      <span>{label(interests, l.interest, lang)}{l.context ? ` · ${l.context}` : ''}</span>
                    </span>
                    <span className="pn-row-meta">
                      <time dateTime={new Date(l._creationTime).toISOString()}>{ago(l._creationTime, lang)}</time>
                      <span className="pn-row-status">{label(statuses, l.status, lang)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {data?.more && <p className="pn-muted pn-more">{tx('Showing the 500 most recent. Narrow the dates to see older ones.', 'Se muestran las 500 más recientes. Acote las fechas para ver las anteriores.')}</p>}
        </section>

        <section className="pn-detail" aria-label={tx('Request details', 'Detalle de la solicitud')}>
          {selected
            ? <LeadDetail key={selected} id={selected} onBack={() => setSelected(null)} />
            : <div className="pn-detail-empty"><LogoBadge variant="on-light" className="pn-detail-badge" /><p>{tx('Choose a request to see it here.', 'Elija una solicitud para verla aquí.')}</p></div>}
        </section>
      </div>
  );
}

function LeadDetail({ id, onBack }: { id: Id<'leads'>; onBack: () => void }) {
  const { lang, tx } = useLang();
  const data = useQuery(api.team.lead, { id });
  const setStatus = useMutation(api.team.setStatus);
  const addNote = useMutation(api.team.addNote);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = (
    <button type="button" className="pn-back" onClick={onBack}><IconArrowLeft size={16} /> {tx('All requests', 'Todas las solicitudes')}</button>
  );
  if (data === undefined) return <div className="pn-detail-in">{back}<p className="pn-muted" aria-busy="true">{tx('Loading…', 'Cargando…')}</p></div>;
  if (data === null) return <div className="pn-detail-in">{back}<p className="pn-muted">{tx('This request no longer exists.', 'Esta solicitud ya no existe.')}</p></div>;

  const { lead, notes } = data;
  const wa = whatsapp(lead.phone);
  const rows: [string, ReactNode][] = [
    [tx('Email', 'Correo'), <a href={`mailto:${lead.email}`}>{lead.email}</a>],
    [tx('Phone / WhatsApp', 'Teléfono / WhatsApp'), lead.phone ? <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}>{lead.phone}</a> : null],
    [tx('Interest', 'Interés'), label(interests, lead.interest, lang)],
    [tx('Budget', 'Presupuesto'), label(budgets, lead.budget, lang)],
    [tx('Prefers', 'Prefiere'), label(ways, lead.via, lang)],
    [tx('About', 'Sobre'), lead.context],
    [tx('Visitor language', 'Idioma del visitante'), lead.lang === 'es' ? tx('Spanish', 'Español') : tx('English', 'Inglés')],
    [tx('Sent from', 'Enviada desde'), `#${lead.page}`],
    [tx('Received', 'Recibida'), fmtDate(lead._creationTime, lang)],
  ];
  const subject = lead.lang === 'es' ? 'Su solicitud a Soluciones Inmobiliarias CR' : 'Your request to Soluciones Inmobiliarias CR';

  const changeStatus = async (s: Status) => {
    setError(null);
    try { await setStatus({ id, status: s }); } catch { setError(tx('Could not change the status. Try again.', 'No se pudo cambiar el estado. Intente de nuevo.')); }
  };
  const saveNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    setError(null);
    try { await addNote({ id, text: note }); setNote(''); }
    catch { setError(tx('Could not save the note. Try again.', 'No se pudo guardar la nota. Intente de nuevo.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="pn-detail-in">
      {back}
      <header className="pn-detail-head">
        <p className="eyebrow">{label(interests, lead.interest, lang)}</p>
        <h2>{lead.name}</h2>
        <div className="pn-actions">
          <a className="btn btn-accent" href={`mailto:${lead.email}?subject=${encodeURIComponent(subject)}`}><IconMail size={16} /> {tx('Reply by email', 'Responder por correo')}</a>
          {wa && <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener noreferrer"><IconPhone size={16} /> WhatsApp</a>}
        </div>
      </header>

      <div className="pn-block">
        <h3 className="pn-h3">{tx('Status', 'Estado')}</h3>
        <div className="pn-status pn-status-detail" role="group" aria-label={tx('Status', 'Estado')}>
          {statuses.map(s => (
            <button key={s.id} type="button" aria-pressed={lead.status === s.id} data-status={s.id} onClick={() => changeStatus(s.id)}>{s[lang]}</button>
          ))}
        </div>
        {lead.statusAt && <p className="pn-muted pn-small">{tx('Changed', 'Cambiado')} {ago(lead.statusAt, lang)}{lead.statusBy ? ` · ${lead.statusBy}` : ''}</p>}
      </div>

      <div className="pn-block">
        <h3 className="pn-h3">{tx('Message', 'Mensaje')}</h3>
        <p className="pn-message">{lead.message ?? tx('(no message)', '(sin mensaje)')}</p>
      </div>

      <dl className="pn-facts">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>

      <div className="pn-block">
        <h3 className="pn-h3">{tx('Follow-up notes', 'Notas de seguimiento')}</h3>
        <form className="pn-note-form" onSubmit={saveNote}>
          <label htmlFor="pn-note" className="sr-only">{tx('New note', 'Nota nueva')}</label>
          <textarea id="pn-note" value={note} onChange={e => setNote(e.target.value)} maxLength={2000} rows={3} placeholder={tx('E.g. Called on WhatsApp, visit on Thursday.', 'Ej.: Llamé por WhatsApp, visita el jueves.')} />
          <button type="submit" className="btn btn-ghost" disabled={!note.trim() || saving} aria-busy={saving}>{tx('Add note', 'Agregar nota')}</button>
        </form>
        {error && <p className="field-error" role="alert">{error}</p>}
        {notes.length > 0 && (
          <ol className="pn-notes">
            {notes.map(n => (
              <li key={n._id}>
                <p>{n.text}</p>
                <span>{n.author} · {fmtDate(n._creationTime, lang)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
