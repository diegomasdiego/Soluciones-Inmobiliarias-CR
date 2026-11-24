import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortalPage } from '../../../../components/PrivatePages';
import { LANGS } from '../../../../lib/lang';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.flatMap(lang => [{ lang, rest: [] }, { lang, rest: ['demo'] }]);

export async function generateMetadata({ params }: { params: Promise<{ lang: string; rest?: string[] }> }): Promise<Metadata> {
  const { lang, rest } = await params;
  const title = lang === 'es' ? 'Portal de clientes' : 'Client portal';
  return { title: rest?.[0] === 'demo' ? `Demo · ${title}` : title, robots: { index: false, follow: false } };
}

/** Client portal (/portal) and its demo with fictitious data (/portal/demo); see views/Portal.tsx. */
export default async function Page({ params }: { params: Promise<{ lang: string; rest?: string[] }> }) {
  const { rest = [] } = await params;
  if (rest.length > 1 || (rest[0] && rest[0] !== 'demo')) notFound();
  return <PortalPage demo={rest[0] === 'demo'} />;
}
