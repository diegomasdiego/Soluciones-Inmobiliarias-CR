// Root layout, one per language (/ is English, /es is Spanish; see src/proxy.ts).
// Draws <html lang>, loads the fonts and global styles, and hands the listings read from Convex
// to the browser so the first paint already has them.
import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Providers } from '../../components/Providers';
import { company } from '../../data/company';
import { htmlLang, isLang, LANGS, ogLocale } from '../../lib/lang';
import { loadListings, SITE_URL } from '../../lib/listings';
import '../../styles/base.css';
import '../../styles/components.css';
import '../../styles/pages.css';
import '../../styles/projects.css';
import '../../styles/sell.css';
import '../../styles/about.css';
import '../../styles/saved.css';
import '../../styles/guides.css';

const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const sans = Hanken_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const revalidate = 300;
// Only 'en' and 'es' ever reach this layout (src/proxy.ts); anything else gets a 404 below.
export const generateStaticParams = () => LANGS.map(lang => ({ lang }));

export const viewport: Viewport = { themeColor: '#151B18', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const es = lang === 'es';
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: company.name, template: `%s · ${company.name}` },
    applicationName: company.name,
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' }],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      siteName: company.name,
      locale: ogLocale(es ? 'es' : 'en'),
      images: [{
        url: '/og-image.jpg', width: 1200, height: 630,
        alt: es
          ? 'Vista aérea del Valle Central de Costa Rica con el logo de Soluciones Inmobiliarias C.R. y el texto Terreno firme en Costa Rica'
          : 'Aerial view of Costa Rica’s Central Valley with the Soluciones Inmobiliarias C.R. logo and the words Solid ground in Costa Rica',
      }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const listings = await loadListings();
  return (
    <html lang={htmlLang(lang)} className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers lang={lang} listings={listings}>{children}</Providers>
      </body>
    </html>
  );
}
