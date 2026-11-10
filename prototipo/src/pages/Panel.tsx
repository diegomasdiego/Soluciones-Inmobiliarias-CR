// Team panel (#panel): private page where the team signs in and follows up on requests.
// Sign-in: email code, email + password, or Google. Only emails in ADMIN_EMAILS (Convex) get in;
// the server checks it on every call (convex/access.ts), this page only reflects it.
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import { LangToggle } from '../components/Chrome';
import { IconArrowLeft, IconMail, IconPhone, IconSearch } from '../components/Icons';
import { LogoBadge, LogoLockup } from '../components/Logo';
import { Topo, type TopoCenter } from '../components/Topo';
import { budgets, interests, ways } from '../data/leadOptions';
import { hasDatabase } from '../lib/data';
import { useLang, type Lang } from '../lib/i18n';
import '../styles/panel.css';

type Lead = Doc<'leads'>;
type Status = Lead['status'];

const GOOGLE_FLAG = 'sicr.panel.google';
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
const signInTopo: TopoCenter[] = [{ x: 0.85, y: 0.2, rings: 22, spacing: 26, seed: 1.2 }, { x: 0.1, y: 1, rings: 14, spacing: 30, seed: 3.4 }];

const label = (list: { id: string; en: string; es: string }[], id: string | undefined, lang: Lang) => {
  if (!id) return undefined;
  const item = list.find(x => x.id === id);
  return item ? item[lang] : id;
};
const flag = {
  set: () => { try { sessionStorage.setItem(GOOGLE_FLAG, '1'); } catch { /* storage unavailable */ } },
  take: () => { try { const v = sessionStorage.getItem(GOOGLE_FLAG); sessionStorage.removeItem(GOOGLE_FLAG); return v === '1'; } catch { return false; } },
};

function fmtDate(ts: number, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Costa_Rica' }).format(ts);
}
function ago(ts: number, lang: Lang) {
  const rtf = new Intl.RelativeTimeFormat(lang === 'es' ? 'es' : 'en', { numeric: 'auto' });
  const min = Math.round((ts - Date.now()) / 60000);
  if (Math.abs(min) < 60) return rtf.format(min, 'minute');
  const h = Math.round(min / 60);
  if (Math.abs(h) < 24) return rtf.format(h, 'hour');
  const d = Math.round(h / 24);
  if (Math.abs(d) < 30) return rtf.format(d, 'day');
  return fmtDate(ts, lang);
}
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
  return isAuthenticated ? <SignedIn /> : <SignIn />;
}

function SignedIn() {
  const me = useQuery(api.team.me);
  useEffect(() => { flag.take(); }, []);
  if (me === undefined) return <div className="panel-loading" aria-busy="true" />;
  if (me === null) return <SignIn />;
  if (!me.allowed) return <NoAccess email={me.email} />;
  return <Board email={me.email} />;
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

// ---------------------------------------------------------------- sign-in

type Step =
  | { kind: 'code' }
  | { kind: 'code-verify'; email: string }
  | { kind: 'password' }
  | { kind: 'signup' }
  | { kind: 'verify'; email: string }
  | { kind: 'reset' }
  | { kind: 'reset-verify'; email: string };

function SignIn() {
  const { tx } = useLang();
  const { signIn } = useAuthActions();
  const methods = useQuery(api.team.methods);
  const [step, setStep] = useState<Step>({ kind: 'code' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleFailed] = useState(flag.take);
  const emailOff = methods !== undefined && !methods.email;
  const googleOff = methods !== undefined && !methods.google;
  const tab = step.kind === 'code' || step.kind === 'code-verify' ? 'code' : 'password';

  const go = (next: Step) => { setStep(next); setError(null); };

  const explain = (err: unknown, fallback: string) => {
    const code = err instanceof ConvexError ? String(err.data) : '';
    if (code === 'not-allowed') return tx('This email does not have access to the panel. Ask the administrator to add it.', 'Este correo no tiene acceso al panel. Pida al administrador que lo agregue.');
    if (code === 'weak-password') return tx('Use at least 10 characters.', 'Use al menos 10 caracteres.');
    if (code === 'email') return tx('Enter an email like name@example.com.', 'Escriba un correo como nombre@ejemplo.com.');
    return fallback;
  };

  const run = async (e: FormEvent<HTMLFormElement>, provider: string, after: (email: string, signedIn: boolean) => void, fallback: string) => {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    form.set('email', email);
    setBusy(true);
    setError(null);
    try {
      const { signingIn } = await signIn(provider, form);
      after(email, signingIn);
    } catch (err) {
      setError(explain(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    flag.set();
    try {
      await signIn('google', { redirectTo: '/#panel' });
    } catch {
      flag.take();
      setBusy(false);
      setError(tx('Could not start Google sign-in.', 'No se pudo iniciar la entrada con Google.'));
    }
  };

  const sendFail = emailOff
    ? tx('Email codes are not set up yet.', 'El envío de códigos por correo aún no está configurado.')
    : tx('We could not send the code. Try again in a minute.', 'No pudimos enviar el código. Intente de nuevo en un minuto.');
  const codeFail = tx('That code is wrong or expired. Check it or ask for a new one.', 'El código no es correcto o ya venció. Revíselo o pida uno nuevo.');

  const emailField = (autoComplete = 'username') => (
    <div className="field">
      <label htmlFor="pn-email">{tx('Email', 'Correo')}</label>
      <input id="pn-email" name="email" type="email" required autoComplete={autoComplete} placeholder="nombre@ejemplo.com" />
    </div>
  );
  const codeField = (
    <div className="field">
      <label htmlFor="pn-code">{tx('8-digit code', 'Código de 8 dígitos')}</label>
      <input id="pn-code" name="code" className="pn-code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} placeholder="12345678" autoFocus />
    </div>
  );
  const sentTo = (email: string) => (
    <p className="pn-muted pn-sent">{tx('We sent a code to', 'Enviamos un código a')} <strong>{email}</strong>. {tx('It expires in 15 minutes.', 'Vence en 15 minutos.')}</p>
  );
  const submit = (en: string, es: string) => (
    <button type="submit" className="btn btn-accent btn-block" disabled={busy} aria-busy={busy}>{busy ? tx('One moment…', 'Un momento…') : tx(en, es)}</button>
  );

  let body: ReactNode;
  switch (step.kind) {
    case 'code':
      body = (
        <form onSubmit={e => run(e, 'email-code', email => go({ kind: 'code-verify', email }), sendFail)}>
          {emailField()}
          {emailOff && <p className="pn-note">{tx('Not available yet: email sending (Resend) still needs to be set up.', 'Aún no disponible: falta configurar el envío de correos (Resend).')}</p>}
          {submit('Email me a code', 'Enviarme un código')}
        </form>
      );
      break;
    case 'code-verify':
      body = (
        <form onSubmit={e => run(e, 'email-code', () => undefined, codeFail)}>
          {sentTo(step.email)}
          <input type="hidden" name="email" value={step.email} />
          {codeField}
          {submit('Sign in', 'Entrar')}
          <button type="button" className="pn-link" onClick={() => go({ kind: 'code' })}>{tx('Use another email', 'Usar otro correo')}</button>
        </form>
      );
      break;
    case 'password':
      body = (
        <form onSubmit={e => run(e, 'password', (email, signedIn) => { if (!signedIn) go({ kind: 'verify', email }); }, tx('Wrong email or password.', 'Correo o contraseña incorrectos.'))}>
          <input type="hidden" name="flow" value="signIn" />
          {emailField()}
          <div className="field">
            <label htmlFor="pn-password">{tx('Password', 'Contraseña')}</label>
            <input id="pn-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {submit('Sign in', 'Entrar')}
          <div className="pn-links">
            <button type="button" className="pn-link" onClick={() => go({ kind: 'signup' })}>{tx('Create a password', 'Crear contraseña')}</button>
            <button type="button" className="pn-link" onClick={() => go({ kind: 'reset' })}>{tx('Forgot your password?', '¿Olvidó su contraseña?')}</button>
          </div>
        </form>
      );
      break;
    case 'signup':
      body = (
        <form onSubmit={e => run(e, 'password', (email, signedIn) => { if (!signedIn) go({ kind: 'verify', email }); }, tx(
          'Could not create the password. If you already have one, sign in or reset it.',
          'No se pudo crear la contraseña. Si ya tiene una, entre o cámbiela.',
        ))}>
          <input type="hidden" name="flow" value="signUp" />
          <p className="pn-muted">{tx('For team emails only. We will email you a code to confirm it is yours.', 'Solo para correos del equipo. Le enviaremos un código para confirmar que el correo es suyo.')}</p>
          {emailField()}
          <div className="field">
            <label htmlFor="pn-new-password">{tx('New password', 'Contraseña nueva')} <span className="optional">· {tx('at least 10 characters', 'al menos 10 caracteres')}</span></label>
            <input id="pn-new-password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          {emailOff && <p className="pn-note">{tx('Not available yet: email sending (Resend) still needs to be set up.', 'Aún no disponible: falta configurar el envío de correos (Resend).')}</p>}
          {submit('Create and confirm', 'Crear y confirmar')}
          <button type="button" className="pn-link" onClick={() => go({ kind: 'password' })}>{tx('I already have a password', 'Ya tengo contraseña')}</button>
        </form>
      );
      break;
    case 'verify':
      body = (
        <form onSubmit={e => run(e, 'password', () => undefined, codeFail)}>
          <input type="hidden" name="flow" value="email-verification" />
          <input type="hidden" name="email" value={step.email} />
          <p className="pn-muted">{tx('Confirm your email to finish.', 'Confirme su correo para terminar.')}</p>
          {sentTo(step.email)}
          {codeField}
          {submit('Confirm and sign in', 'Confirmar y entrar')}
        </form>
      );
      break;
    case 'reset':
      body = (
        <form onSubmit={e => run(e, 'password', email => go({ kind: 'reset-verify', email }), sendFail)}>
          <input type="hidden" name="flow" value="reset" />
          <p className="pn-muted">{tx('We will email you a code to choose a new password.', 'Le enviaremos un código para elegir una contraseña nueva.')}</p>
          {emailField()}
          {submit('Email me a code', 'Enviarme un código')}
          <button type="button" className="pn-link" onClick={() => go({ kind: 'password' })}>{tx('Back', 'Volver')}</button>
        </form>
      );
      break;
    case 'reset-verify':
      body = (
        <form onSubmit={e => run(e, 'password', () => undefined, codeFail)}>
          <input type="hidden" name="flow" value="reset-verification" />
          <input type="hidden" name="email" value={step.email} />
          {sentTo(step.email)}
          {codeField}
          <div className="field">
            <label htmlFor="pn-reset-password">{tx('New password', 'Contraseña nueva')} <span className="optional">· {tx('at least 10 characters', 'al menos 10 caracteres')}</span></label>
            <input id="pn-reset-password" name="newPassword" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          {submit('Save and sign in', 'Guardar y entrar')}
        </form>
      );
      break;
  }

  return (
    <div className="pn-signin">
      <aside className="pn-signin-brand">
        <Topo className="pn-signin-topo" centers={signInTopo} color="rgba(232,238,232,.16)" animate speed={0.5} />
        <a href="#home" className="pn-signin-logo" aria-label={tx('Go to the website', 'Ir al sitio web')}><LogoLockup /></a>
        <div className="pn-signin-copy">
          <p className="eyebrow eyebrow-light">{tx('Team only', 'Solo para el equipo')}</p>
          <h1>{tx('Requests panel', 'Panel de solicitudes')}</h1>
          <p>{tx('Every request from the website, in one place: who wrote, what they need and how the follow-up is going.', 'Todas las solicitudes del sitio en un solo lugar: quién escribió, qué necesita y cómo va el seguimiento.')}</p>
        </div>
      </aside>

      <main className="pn-signin-main">
        <div className="pn-signin-top"><LangToggle /></div>
        <div className="pn-signin-card">
          <h2>{tx('Sign in', 'Entrar')}</h2>
          {googleFailed && (
            <p className="field-error" role="alert">{tx(
              'Google sign-in did not work. Use a Google account that is on the team list.',
              'No se pudo entrar con Google. Use una cuenta de Google que esté en la lista del equipo.',
            )}</p>
          )}

          <button type="button" className="pn-google" onClick={google} disabled={busy || googleOff}>
            <GoogleMark />
            <span>{tx('Continue with Google', 'Continuar con Google')}</span>
          </button>
          {googleOff && <p className="pn-note">{tx('Not available yet: Google sign-in still needs to be set up.', 'Aún no disponible: falta configurar la entrada con Google.')}</p>}

          <div className="pn-or"><span>{tx('or with your email', 'o con su correo')}</span></div>

          <div className="seg seg-wide pn-tabs" role="group" aria-label={tx('Sign-in method', 'Forma de entrar')}>
            <button type="button" aria-pressed={tab === 'code'} onClick={() => go({ kind: 'code' })}><span className="seg-label">{tx('Email code', 'Código por correo')}</span></button>
            <button type="button" aria-pressed={tab === 'password'} onClick={() => go({ kind: 'password' })}><span className="seg-label">{tx('Password', 'Contraseña')}</span></button>
          </div>

          {body}
          {error && <p className="field-error" role="alert">{error}</p>}
        </div>
        <p className="pn-fine">{tx('Private area of Soluciones Inmobiliarias CR. Access is recorded.', 'Área privada de Soluciones Inmobiliarias CR. Los accesos quedan registrados.')}</p>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// ---------------------------------------------------------------- board

function Board({ email }: { email: string | null }) {
  const { lang, tx } = useLang();
  const { signOut } = useAuthActions();
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
    <div className="pn">
      <header className="pn-bar">
        <a href="#home" className="pn-bar-logo" aria-label={tx('Go to the website', 'Ir al sitio web')}><LogoLockup /></a>
        <span className="pn-bar-title">{tx('Team panel', 'Panel del equipo')}</span>
        <div className="pn-bar-tools">
          <LangToggle />
          <span className="pn-bar-user" title={email ?? ''}>{email}</span>
          <button type="button" className="btn btn-ghost pn-bar-out" onClick={() => void signOut()}>{tx('Sign out', 'Salir')}</button>
        </div>
      </header>

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
