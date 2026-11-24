'use client';
// Sign-in screen shared by the team panel (/panel) and the client portal (/portal):
// email code, email + password, or Google. Who gets in is decided on the server (convex/auth.ts):
// team emails (ADMIN_EMAILS) and emails the team added to a deal.
import { useState, type FormEvent, type ReactNode } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api';
import { useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { toPath } from '../lib/routes';
import { LangToggle } from './Chrome';
import { LogoLockup } from './Logo';
import { Topo, type TopoCenter } from './Topo';

export type Audience = 'team' | 'client';

const topo: TopoCenter[] = [{ x: 0.85, y: 0.2, rings: 22, spacing: 26, seed: 1.2 }, { x: 0.1, y: 1, rings: 14, spacing: 30, seed: 3.4 }];

/** Remembers, across the Google redirect, that a Google sign-in was started (so a failure can be explained). */
export const googleFlag = (audience: Audience) => {
  const key = `sicr.${audience}.google`;
  return {
    set: () => { try { sessionStorage.setItem(key, '1'); } catch { /* storage unavailable */ } },
    take: () => { try { const v = sessionStorage.getItem(key); sessionStorage.removeItem(key); return v === '1'; } catch { return false; } },
  };
};

type Step =
  | { kind: 'code' }
  | { kind: 'code-verify'; email: string }
  | { kind: 'password' }
  | { kind: 'signup' }
  | { kind: 'verify'; email: string }
  | { kind: 'reset' }
  | { kind: 'reset-verify'; email: string };

export function SignIn({ audience, children }: { audience: Audience; children?: ReactNode }) {
  const { lang, tx } = useLang();
  const { signIn } = useAuthActions();
  const methods = useQuery(api.team.methods);
  const flag = googleFlag(audience);
  const [step, setStep] = useState<Step>({ kind: 'code' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleFailed] = useState(flag.take);
  const emailOff = methods !== undefined && !methods.email;
  const googleOff = methods !== undefined && !methods.google;
  const tab = step.kind === 'code' || step.kind === 'code-verify' ? 'code' : 'password';
  const client = audience === 'client';

  const go = (next: Step) => { setStep(next); setError(null); };

  const explain = (err: unknown, fallback: string) => {
    const code = err instanceof ConvexError ? String(err.data) : '';
    if (code === 'not-allowed') {
      return client
        ? tx('This email is not registered in the portal. Use the email you gave your advisor, or write to us.', 'Este correo no está registrado en el portal. Use el correo que le dio a su asesor, o escríbanos.')
        : tx('This email does not have access to the panel. Ask the administrator to add it.', 'Este correo no tiene acceso al panel. Pida al administrador que lo agregue.');
    }
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
      await signIn('google', { redirectTo: toPath({ name: client ? 'portal' : 'panel' }, lang) });
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
  const emailOffNote = emailOff && <p className="pn-note">{tx('Not available yet: email sending (Resend) still needs to be set up.', 'Aún no disponible: falta configurar el envío de correos (Resend).')}</p>;

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
          {emailOffNote}
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
          <p className="pn-muted">{client
            ? tx('Use the email you registered with your advisor. We will email you a code to confirm it is yours.', 'Use el correo que registró con su asesor. Le enviaremos un código para confirmar que es suyo.')
            : tx('For team emails only. We will email you a code to confirm it is yours.', 'Solo para correos del equipo. Le enviaremos un código para confirmar que el correo es suyo.')}</p>
          {emailField()}
          <div className="field">
            <label htmlFor="pn-new-password">{tx('New password', 'Contraseña nueva')} <span className="optional">· {tx('at least 10 characters', 'al menos 10 caracteres')}</span></label>
            <input id="pn-new-password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          {emailOffNote}
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
        <Topo className="pn-signin-topo" centers={topo} color="rgba(232,238,232,.16)" animate speed={0.5} />
        <Link to={{ name: 'home' }} className="pn-signin-logo" aria-label={tx('Go to the website', 'Ir al sitio web')}><LogoLockup /></Link>
        <div className="pn-signin-copy">
          {client ? (
            <>
              <p className="eyebrow eyebrow-light">{tx('For our clients', 'Para nuestros clientes')}</p>
              <h1>{tx('Client portal', 'Portal de clientes')}</h1>
              <p>{tx('Your purchase step by step, your documents, and the reports on the property we manage for you, in one place.', 'Su compra paso a paso, sus documentos y los reportes de la propiedad que le administramos, en un solo lugar.')}</p>
            </>
          ) : (
            <>
              <p className="eyebrow eyebrow-light">{tx('Team only', 'Solo para el equipo')}</p>
              <h1>{tx('Requests panel', 'Panel de solicitudes')}</h1>
              <p>{tx('Every request from the website, in one place: who wrote, what they need and how the follow-up is going.', 'Todas las solicitudes del sitio en un solo lugar: quién escribió, qué necesita y cómo va el seguimiento.')}</p>
            </>
          )}
        </div>
      </aside>

      <main className="pn-signin-main">
        <div className="pn-signin-top"><LangToggle /></div>
        <div className="pn-signin-card">
          <h2>{tx('Sign in', 'Entrar')}</h2>
          {client && <p className="pn-muted">{tx('Use the email you registered with your advisor.', 'Use el correo que registró con su asesor.')}</p>}
          {googleFailed && (
            <p className="field-error" role="alert">{client
              ? tx('Google sign-in did not work. Use the Google account of the email you registered with your advisor.', 'No se pudo entrar con Google. Use la cuenta de Google del correo que registró con su asesor.')
              : tx('Google sign-in did not work. Use a Google account that is on the team list.', 'No se pudo entrar con Google. Use una cuenta de Google que esté en la lista del equipo.')}</p>
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
        {children}
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
