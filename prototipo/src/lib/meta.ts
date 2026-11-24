// What search engines and link previews see for each public page: title, description, preview
// image, the same page in the other language, and structured data (JSON-LD). Server only.
import type { Metadata } from 'next';
import { company } from '../data/company';
import { guideBySlug, guides } from '../data/guides';
import { projects } from '../data/projects';
import type { Property } from '../data/properties';
import { localize, typeLabel } from '../data/properties.es';
import { LANGS, ogLocale, pick, type L, type Lang } from './lang';
import { SITE_URL } from './listings';
import { getMedia } from './media';
import { toPath, type Route } from './routes';

export type PageInfo = {
  title: string;
  /** Use the title as is, without " · Soluciones Inmobiliarias CR". */
  absoluteTitle?: boolean;
  description: string;
  image?: { url: string; width: number; height: number; alt: string };
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
};

const T = (l: L, lang: Lang) => pick(l, lang);
const usd = (n: number) => 'US$' + n.toLocaleString('en-US');
const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
const photo = (name: string, alt: string) => { const m = getMedia(name); return { url: m.src, width: m.w, height: m.h, alt }; };

const organization = (lang: Lang) => ({
  '@type': 'RealEstateAgent',
  '@id': `${SITE_URL}/#organization`,
  name: company.name,
  url: abs(toPath({ name: 'home' }, lang)),
  email: company.email,
  telephone: company.phone,
  logo: `${SITE_URL}/icon-512.png`,
  image: `${SITE_URL}/og-image.jpg`,
  address: { '@type': 'PostalAddress', addressLocality: 'San Rafael de Escazú', addressRegion: 'San José', addressCountry: 'CR' },
  areaServed: ['Escazú', 'Santa Ana', 'Mora', 'Belén', 'Heredia', 'Alajuela'].map(name => ({ '@type': 'City', name })),
});

/** The page for a public route, or null when it does not exist (unknown listing, project or guide). */
export function describePage(route: Route, lang: Lang, listings: Property[]): PageInfo | null {
  const tx = (en: string, es: string) => (lang === 'es' ? es : en);
  switch (route.name) {
    case 'home':
      return {
        title: tx('Soluciones Inmobiliarias CR · Homes, lots and farms in Costa Rica’s Central Valley', 'Soluciones Inmobiliarias CR · Casas, lotes y fincas en el Valle Central de Costa Rica'),
        absoluteTitle: true,
        description: tx(
          'Title-checked homes, lots and farms in Escazú, Santa Ana, Heredia and Alajuela, plus excavators, dump trucks and earthworks to prepare your land.',
          'Casas, lotes y fincas con estudio registral en Escazú, Santa Ana, Heredia y Alajuela, y excavadoras, vagonetas y movimiento de tierras para preparar su terreno.',
        ),
        jsonLd: { '@context': 'https://schema.org', ...organization(lang) },
      };
    case 'search':
      return {
        title: tx('Properties for sale in the Central Valley', 'Propiedades en venta en el Valle Central'),
        description: tx(
          `${listings.length} homes, condos, lots and farms in Escazú, Santa Ana, Heredia and Alajuela, each with its title study. Search in plain words, filter and see them on the map.`,
          `${listings.length} casas, apartamentos, lotes y fincas en Escazú, Santa Ana, Heredia y Alajuela, cada una con su estudio registral. Busque con sus palabras, filtre y véalas en el mapa.`,
        ),
      };
    case 'property': {
      const raw = listings.find(p => p.slug === route.slug);
      if (!raw) return null;
      const p = localize(raw, lang);
      const kind = typeLabel(p.type, lang);
      const facts = [
        p.beds ? tx(`${p.beds} bedrooms`, `${p.beds} habitaciones`) : null,
        p.builtM2 ? `${p.builtM2} m²` : p.lotM2 ? tx(`${p.lotM2.toLocaleString('en-US')} m² lot`, `lote de ${p.lotM2.toLocaleString('en-US')} m²`) : null,
        usd(p.priceUsd),
      ].filter(Boolean).join(' · ');
      const url = abs(toPath(route, lang));
      return {
        title: `${p.title}, ${kind} ${tx('in', 'en')} ${p.district}, ${p.canton}`,
        description: `${p.headline} ${facts}.`.slice(0, 300),
        image: photo(p.photos[0], `${p.title}, ${p.district}`),
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: p.title,
          description: p.description,
          url,
          image: p.photos.slice(0, 6).map(n => `${SITE_URL}${getMedia(n).src}`),
          offers: { '@type': 'Offer', price: p.priceUsd, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url, seller: { '@id': `${SITE_URL}/#organization` } },
          contentLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: p.district, addressRegion: p.province, addressCountry: 'CR' },
            geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
          },
          ...(p.beds ? { numberOfRooms: p.beds } : null),
          ...(p.builtM2 ? { floorSize: { '@type': 'QuantitativeValue', value: p.builtM2, unitCode: 'MTK' } } : null),
        },
      };
    }
    case 'calculator': {
      const p = route.slug ? listings.find(x => x.slug === route.slug) : undefined;
      if (route.slug && !p) return null;
      return {
        title: p ? tx(`True cost of buying ${p.title}`, `Costo real de comprar ${p.title}`) : tx('True cost of buying in Costa Rica', 'Costo real de comprar en Costa Rica'),
        description: tx(
          'Closing costs, transfer tax, notary, mortgage payment, yearly taxes and rental yield for a purchase in Costa Rica, step by step.',
          'Gastos de cierre, impuesto de traspaso, notario, cuota del préstamo, impuestos anuales y rentabilidad de una compra en Costa Rica, paso a paso.',
        ),
        noindex: !!p,
      };
    }
    case 'build':
      return {
        title: tx('Land & Build: excavators, dump trucks and earthworks', 'Land & Build: excavadoras, vagonetas y movimiento de tierras'),
        description: tx(
          'Our own machines to clear, level and prepare your lot in the Central Valley: excavators, dump trucks, compactors and a trip estimator for your quote.',
          'Maquinaria propia para limpiar, nivelar y preparar su lote en el Valle Central: excavadoras, vagonetas, compactadoras y un estimador de viajes para su cotización.',
        ),
        image: photo('build-hero', 'Land & Build'),
      };
    case 'contact':
      return {
        title: tx('Contact', 'Contacto'),
        description: tx(`Talk to an advisor by email, WhatsApp or video call. Office in San Rafael de Escazú. ${pick(company.hours, 'en')}.`, `Hable con un asesor por correo, WhatsApp o videollamada. Oficina en San Rafael de Escazú. ${pick(company.hours, 'es')}.`),
        noindex: !!route.topic,
      };
    case 'projects':
      return {
        title: tx('New projects and pre-sales', 'Proyectos nuevos y preventas'),
        description: tx(
          'Homes and condos in launch, under construction and delivered, with progress reports and payment plans tied to each construction milestone.',
          'Casas y apartamentos en lanzamiento, en construcción y entregados, con informes de avance y planes de pago ligados a cada etapa de la obra.',
        ),
      };
    case 'project': {
      const pr = projects.find(x => x.slug === route.slug);
      if (!pr) return null;
      return {
        title: `${pr.name} · ${tx('pre-sale', 'preventa')}`,
        description: T(pr.tagline, lang),
        image: photo(pr.hero, pr.name),
      };
    }
    case 'sell':
      return {
        title: tx('Sell your property', 'Venda su propiedad'),
        description: tx(
          'Estimate your property’s value by area and square meter, see what we include in every listing, and how the closing works.',
          'Estime el valor de su propiedad por zona y metro cuadrado, vea qué incluye cada ficha y cómo funciona el cierre.',
        ),
      };
    case 'about':
      return {
        title: tx('About us', 'Nosotros'),
        description: tx(
          'Our story, the team, our partners at each step of a purchase, and the credentials behind every closing in the Central Valley.',
          'Nuestra historia, el equipo, los aliados en cada etapa de la compra y el respaldo detrás de cada cierre en el Valle Central.',
        ),
      };
    case 'saved':
      return {
        title: route.shared?.length ? tx('Shared list of properties', 'Lista de propiedades compartida') : tx('Saved properties', 'Propiedades guardadas'),
        description: tx('Compare properties side by side: price, size, closing costs, monthly payment and rental yield.', 'Compare propiedades lado a lado: precio, tamaño, gastos de cierre, cuota y rentabilidad.'),
        noindex: true,
      };
    case 'guides':
      return {
        title: tx('Guides to buying property in Costa Rica', 'Guías para comprar propiedad en Costa Rica'),
        description: tx(
          'Plain-language guides for foreign and local buyers: the purchase step by step, the maritime zone, investor residency and property taxes, updated for 2026.',
          'Guías en lenguaje claro para compradores extranjeros y locales: la compra paso a paso, la zona marítimo terrestre, la residencia de inversionista y los impuestos, actualizadas a 2026.',
        ),
      };
    case 'guide': {
      const g = guideBySlug(route.slug);
      if (!g) return null;
      const title = T(g.title, lang);
      const description = T(g.description, lang);
      return {
        title,
        description,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: title,
              description,
              dateModified: g.updated,
              inLanguage: lang === 'es' ? 'es-CR' : 'en',
              mainEntityOfPage: abs(toPath(route, lang)),
              author: { '@type': 'Organization', name: company.name },
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
              '@type': 'FAQPage',
              mainEntity: g.faq.map(f => ({ '@type': 'Question', name: T(f.q, lang), acceptedAnswer: { '@type': 'Answer', text: T(f.a, lang) } })),
            },
            organization(lang),
          ],
        },
      };
    }
    default:
      return null;
  }
}

export function toMetadata(info: PageInfo, route: Route, lang: Lang): Metadata {
  const url = toPath(route, lang);
  const image = info.image ?? { url: '/og-image.jpg', width: 1200, height: 630, alt: company.name };
  const fullTitle = info.absoluteTitle ? info.title : `${info.title} · ${company.name}`;
  return {
    title: info.absoluteTitle ? { absolute: info.title } : info.title,
    description: info.description,
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(LANGS.map(l => [l === 'es' ? 'es-CR' : 'en', toPath(route, l)])), 'x-default': toPath(route, 'en') },
    },
    openGraph: {
      type: route.name === 'guide' ? 'article' : 'website',
      siteName: company.name,
      title: fullTitle,
      description: info.description,
      url,
      locale: ogLocale(lang),
      alternateLocale: [ogLocale(lang === 'es' ? 'en' : 'es')],
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: info.description, images: [image.url] },
    ...(info.noindex ? { robots: { index: false, follow: true } } : null),
  };
}

/** Every public page to draw at build time and list in the sitemap (both languages). */
export function publicRoutes(listings: Property[]): Route[] {
  return [
    { name: 'home' }, { name: 'search' }, { name: 'calculator' }, { name: 'build' }, { name: 'contact' },
    { name: 'projects' }, { name: 'sell' }, { name: 'about' }, { name: 'saved' }, { name: 'guides' },
    ...listings.map(p => ({ name: 'property' as const, slug: p.slug })),
    ...projects.map(p => ({ name: 'project' as const, slug: p.slug })),
    ...guides.map(g => ({ name: 'guide' as const, slug: g.slug })),
  ];
}
