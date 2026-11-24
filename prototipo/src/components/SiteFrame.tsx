'use client';
// Pieces around every public page: skip link, header, footer, toast, cursor, and the redirect
// for old links that still use the hash (#property-…, #compare-…).
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '../lib/i18n';
import { parseLegacyHash, toPath } from '../lib/routes';
import { Cursor, Footer, Header, Toast } from './Chrome';

function SkipLink() {
  const { tx } = useLang();
  return (
    <a href="#main" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
      {tx('Skip to content', 'Saltar al contenido')}
    </a>
  );
}

function LegacyHashRedirect() {
  const router = useRouter();
  const { lang } = useLang();
  useEffect(() => {
    const route = parseLegacyHash(window.location.hash);
    if (route) router.replace(toPath(route, lang));
  }, [router, lang]);
  return null;
}

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <LegacyHashRedirect />
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <Toast />
      <Cursor />
    </>
  );
}
