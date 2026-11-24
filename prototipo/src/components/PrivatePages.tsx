'use client';
// The team panel and the client portal run only in the browser: they depend on the signed-in
// session kept there, and search engines must not index them anyway.
import dynamic from 'next/dynamic';

const loading = () => <div className="panel-loading" aria-busy="true" />;
const Panel = dynamic(() => import('../views/Panel'), { ssr: false, loading });
const Portal = dynamic(() => import('../views/Portal'), { ssr: false, loading });

export function PanelPage() {
  return <Panel />;
}

export function PortalPage({ demo }: { demo?: boolean }) {
  return <Portal demo={demo} key={demo ? 'demo' : 'live'} />;
}
