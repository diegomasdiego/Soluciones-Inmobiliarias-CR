'use client';
// Client portal (/portal): private area where clients follow their purchase or the property the
// company manages for them. Sign-in is shared with the team panel; the server only lets in emails
// the team added to a deal, and shows each person only their own deals (convex/portal.ts).
// /portal/demo shows the same screens with fictitious data, without signing in.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { LangToggle } from '../components/Chrome';
import { LogoBadge, LogoLockup } from '../components/Logo';
import { DealView, type DealActions } from '../components/portal/DealView';
import { useLiveDeal } from '../components/portal/useLiveDeal';
import { googleFlag, SignIn } from '../components/SignIn';
import { demoDeals, stages, type DealKind, type PortalDoc, type PortalTicket, type PortalUpdate } from '../data/portal';
import { hasDatabase } from '../lib/data';
import { pick, useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import '../styles/panel.css';
import '../styles/portal.css';

type DealTab = { _id: string; kind: DealKind; title: string; place: string; stage: number; status: 'active' | 'closed'; isNew?: boolean };

export default function Portal({ demo }: { demo?: boolean }) {
  const { tx } = useLang();

  if (demo) return <Demo />;
  if (!hasDatabase) {
    return (
      <Centered>
        <h1 className="pn-title">{tx('Client portal', 'Portal de clientes')}</h1>
        <p className="pn-muted">{tx('The portal needs the live database. Open it on the published site, or see the demo.', 'El portal necesita la base de datos en línea. Ábralo en el sitio publicado, o vea la demostración.')}</p>
        <Link to={{ name: 'portal', demo: true }} className="btn btn-accent">{tx('See the demo', 'Ver la demostración')}</Link>
      </Centered>
    );
  }
  return <Gate />;
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

function DemoLink() {
  const { tx } = useLang();
  return <p className="pt-alt">{tx('Want to see how it works first?', '¿Quiere ver primero cómo funciona?')} <Link to={{ name: 'portal', demo: true }}>{tx('See a demo', 'Ver una demostración')}</Link></p>;
}

function Gate() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return <div className="panel-loading" aria-busy="true" />;
  return isAuthenticated ? <Live /> : <SignIn audience="client"><DemoLink /></SignIn>;
}

// ---------------------------------------------------------------- shell

function Shell({ email, demo, deals, selected, onSelect, onSignOut, children }: {
  email?: string; demo?: boolean; deals: DealTab[]; selected: string; onSelect: (id: string) => void; onSignOut?: () => void; children: ReactNode;
}) {
  const { lang, tx } = useLang();
  return (
    <div className="pt">
      <header className="pn-bar">
        <Link to={{ name: 'home' }} className="pn-bar-logo" aria-label={tx('Go to the website', 'Ir al sitio web')}><LogoLockup /></Link>
        <span className="pn-bar-title">{tx('Client portal', 'Portal de clientes')}</span>
        <div className="pn-bar-tools">
          <LangToggle />
          {email && <span className="pn-bar-user" title={email}>{email}</span>}
          {demo
            ? <Link to={{ name: 'portal' }} className="btn btn-ghost pn-bar-out">{tx('Exit demo', 'Salir de la demo')}</Link>
            : <button type="button" className="btn btn-ghost pn-bar-out" onClick={onSignOut}>{tx('Sign out', 'Salir')}</button>}
        </div>
      </header>
      {demo && (
        <p className="pt-demo" role="note">
          <strong>{tx('Demo with fictitious data.', 'Demostración con datos ficticios.')}</strong> {tx(
            'What you write or upload stays on this page and is not sent.',
            'Lo que escriba o suba se queda en esta página y no se envía.',
          )}
        </p>
      )}
      <div className="pt-body">
        {deals.length > 1 && (
          <nav className="pt-deals" aria-label={tx('Your files', 'Sus expedientes')}>
            {deals.map(d => (
              <button key={d._id} type="button" aria-pressed={selected === d._id} onClick={() => { onSelect(d._id); window.scrollTo({ top: 0 }); }}>
                <span className="pt-deal-kind">{d.kind === 'purchase' ? tx('Purchase', 'Compra') : tx('Managed property', 'Propiedad administrada')}{d.status === 'closed' ? ` · ${tx('closed', 'cerrado')}` : ''}</span>
                <strong>{d.title}</strong>
                <span className="pt-deal-sub">
                  {d.kind === 'purchase'
                    ? (d.stage >= stages.length ? tx('Registered', 'Inscrita') : pick(stages[d.stage].title, lang))
                    : d.place}
                </span>
                {d.isNew && <span className="pt-deal-dot" aria-label={tx('New', 'Nuevo')} />}
              </button>
            ))}
          </nav>
        )}
        <main className="pt-main" id="main">{children}</main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- live

function Live() {
  const { tx } = useLang();
  const { signOut } = useAuthActions();
  const me = useQuery(api.portal.me);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { googleFlag('client').take(); }, []);

  if (me === undefined) return <div className="panel-loading" aria-busy="true" />;
  if (me === null) return <SignIn audience="client"><DemoLink /></SignIn>;
  if (me.deals.length === 0) {
    return (
      <Centered>
        <h1 className="pn-title">{tx('Nothing here yet', 'Todavía no hay nada aquí')}</h1>
        <p className="pn-muted">
          {me.team
            ? tx('This is the client portal. Clients appear here once you add their email to a deal in the panel.', 'Este es el portal de clientes. Los clientes lo ven cuando usted agrega su correo a un expediente en el panel.')
            : <>{tx('There are no files for', 'No hay expedientes para')} <strong>{me.email}</strong>. {tx('If you think this is a mistake, write to your advisor.', 'Si cree que es un error, escríbale a su asesor(a).')}</>}
        </p>
        {me.team && <Link to={{ name: 'panel' }} className="btn btn-accent">{tx('Open the panel', 'Abrir el panel')}</Link>}
        <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>{tx('Sign out', 'Salir')}</button>
      </Centered>
    );
  }
  const id = (selected && me.deals.some(d => d._id === selected) ? selected : me.deals[0]._id) as Id<'deals'>;
  return (
    <Shell email={me.email} deals={me.deals} selected={id} onSelect={setSelected} onSignOut={() => void signOut()}>
      <LiveDeal key={id} id={id} />
    </Shell>
  );
}

function LiveDeal({ id }: { id: Id<'deals'> }) {
  const { tx } = useLang();
  const { data, actions } = useLiveDeal(id);
  if (data === undefined) return <div className="pt-loading" aria-busy="true">{tx('Loading…', 'Cargando…')}</div>;
  if (data === null) return <p className="pd-empty">{tx('This file is no longer available.', 'Este expediente ya no está disponible.')}</p>;
  return <DealView data={data} actions={actions} />;
}

// ---------------------------------------------------------------- demo

type Added = { updates: PortalUpdate[]; docs: PortalDoc[]; tickets: PortalTicket[] };
const DEMO_CLIENT = 'laura@ejemplo.com';

function Demo() {
  const { lang } = useLang();
  const base = useMemo(() => demoDeals(lang), [lang]);
  const [selected, setSelected] = useState(base[0].deal._id);
  const [added, setAdded] = useState<Record<string, Added>>({});
  const current = base.find(d => d.deal._id === selected) ?? base[0];
  const mine = added[current.deal._id] ?? { updates: [], docs: [], tickets: [] };
  const data = {
    ...current,
    updates: [...mine.updates, ...current.updates],
    docs: [...mine.docs, ...current.docs],
    tickets: [...mine.tickets, ...current.tickets],
  };

  const add = (patch: Partial<Added>) => setAdded(prev => {
    const was = prev[current.deal._id] ?? { updates: [], docs: [], tickets: [] };
    return { ...prev, [current.deal._id]: { updates: [...(patch.updates ?? []), ...was.updates], docs: [...(patch.docs ?? []), ...was.docs], tickets: [...(patch.tickets ?? []), ...was.tickets] } };
  });
  const id = () => `local-${Date.now()}`;
  const pause = () => new Promise(r => setTimeout(r, 500));
  const actions: DealActions = {
    post: async text => { await pause(); add({ updates: [{ _id: id(), _creationTime: Date.now(), author: DEMO_CLIENT, byClient: true, text: text.trim() }] }); },
    upload: async (file, category) => { await pause(); add({ docs: [{ _id: id(), _creationTime: Date.now(), name: file.name, category, size: file.size, contentType: file.type, uploadedBy: DEMO_CLIENT, byClient: true }] }); },
    openTicket: async (title, detail) => { await pause(); add({ tickets: [{ _id: id(), _creationTime: Date.now(), title: title.trim(), detail: detail.trim() || undefined, status: 'open', openedBy: DEMO_CLIENT, byClient: true }] }); },
    download: async () => { throw new Error('demo-file'); },
  };

  const tabs: DealTab[] = base.map(d => ({ ...d.deal, isNew: d.updates.some(u => u._creationTime > d.seenAt && !u.byClient) }));
  return (
    <Shell demo email={DEMO_CLIENT} deals={tabs} selected={current.deal._id} onSelect={setSelected}>
      <DealView key={current.deal._id} data={data} actions={actions} />
    </Shell>
  );
}
