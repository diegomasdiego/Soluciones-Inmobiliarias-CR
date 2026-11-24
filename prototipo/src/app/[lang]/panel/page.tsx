import type { Metadata } from 'next';
import { PanelPage } from '../../../components/PrivatePages';
import { LANGS } from '../../../lib/lang';

export const generateStaticParams = () => LANGS.map(lang => ({ lang }));
export const metadata: Metadata = { title: 'Panel', robots: { index: false, follow: false } };

/** Team panel: website requests and the client portal's files (views/Panel.tsx). */
export default function Page() {
  return <PanelPage />;
}
