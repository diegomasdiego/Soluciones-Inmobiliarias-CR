import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { advisors } from '../data/company';
import { bySlug, grossYield, isResidencyEligible, properties, type Property as P } from '../data/properties';
import { localize, typeLabel } from '../data/properties.es';
import { closingCosts, rentalYield, sum, yearlyHolding } from '../lib/costs';
import { m2, money, pct } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { mediaUrl } from '../lib/media';
import { Link, useRouter } from '../lib/router';
import { useStore } from '../lib/store';
import { Img, Price, SaveButton } from '../components/Basics';
import { Reveal } from '../components/Chrome';
import { ContactForm } from '../components/ContactForm';
import { IconArrow, IconCalc, IconCube, IconExcavator, IconPhotos, IconPlan, IconVideo } from '../components/Icons';
import { MapView } from '../components/MapView';
import { Pano360 } from '../components/Pano360';
import { Badges, Facts, PropertyCard } from '../components/PropertyCard';
import { FloorPlan, Lightbox, VerifiedPanel } from '../components/PropertyParts';

function NotFound() {
  const { tx } = useLang();
  return (
    <div className="wrap notfound">
      <h1 className="h2">{tx('This property is no longer listed.', 'Esta propiedad ya no está publicada.')}</h1>
      <p className="lead">{tx('It may have sold. Browse what’s available now.', 'Es posible que se haya vendido. Vea lo que está disponible ahora.')}</p>
      <Link to={{ name: 'search' }} className="btn btn-accent">{tx('See properties', 'Ver propiedades')}</Link>
    </div>
  );
}

export default function Property({ slug }: { slug: string }) {
  const p = bySlug(slug);
  if (!p) return <NotFound />;
  return <PropertyView raw={p} key={p.slug} />;
}

function PropertyView({ raw }: { raw: P }) {
  const { currency, rate } = useStore();
  const { navigate } = useRouter();
  const { lang, tx } = useLang();
  const p = localize(raw, lang);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const refs = {
    overview: useRef<HTMLElement>(null),
    tour: useRef<HTMLElement>(null),
    plan: useRef<HTMLElement>(null),
    location: useRef<HTMLElement>(null),
    costs: useRef<HTMLElement>(null),
    legal: useRef<HTMLElement>(null),
    visit: useRef<HTMLElement>(null),
  };
  const go = (k: keyof typeof refs) => refs[k].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const panoRooms = useMemo(() => [
    { name: tx('Living and dining', 'Sala y comedor'), media: 'pano-living', yaw: 0.6 },
    { name: tx('Terrace', 'Terraza'), media: 'pano-terrace', yaw: 3.1 },
  ], [tx]);

  const advisor = advisors[p.advisor];
  const { propertyTax, insurance } = yearlyHolding(p.priceUsd);
  const monthly = p.hoaUsd + propertyTax / 12 + insurance / 12;
  const closing = sum(closingCosts(p.priceUsd, { residency: isResidencyEligible(p), split: false }, lang));
  const yieldInfo = p.rentUsd ? rentalYield(p.priceUsd, p.rentUsd, p.hoaUsd) : null;
  const similar = useMemo(
    () => properties.filter(o => o.slug !== p.slug).sort((a, b) => Number(b.area === p.area) - Number(a.area === p.area) || Math.abs(a.priceUsd - p.priceUsd) - Math.abs(b.priceUsd - p.priceUsd)).slice(0, 3),
    [p.slug, p.area, p.priceUsd],
  );
  const tabs: [keyof typeof refs, string][] = [
    ['overview', tx('Overview', 'Resumen')],
    ...(p.tour ? [['tour', tx('360° tour', 'Recorrido 360°')] as [keyof typeof refs, string]] : []),
    ...(p.plan ? [['plan', tx('Floor plan', 'Plano')] as [keyof typeof refs, string]] : []),
    ['location', tx('Location', 'Ubicación')],
    ['costs', tx('Costs', 'Costos')],
    ['legal', tx('Legal', 'Legal')],
  ];
  const isLand = p.type === 'Lot' || p.type === 'Farm';
  const decimal = (s: string) => (lang === 'es' ? s.replace('.', ',') : s);
  const land = p.lotM2 != null ? (p.lotM2 >= 10000 ? `${decimal((p.lotM2 / 10000).toFixed(1))} ha (${m2(p.lotM2)})` : m2(p.lotM2)) : '';

  return (
    <article className="property">
      <div className="wrap-wide prop-gallery">
        <button type="button" className="prop-main vt-hero" onClick={() => setLightbox(0)} data-cursor={tx('View', 'Ver')} aria-label={tx('Open photo gallery', 'Abrir la galería de fotos')}>
          <Img name={p.photos[0]} alt={tx(`${p.title}, main photo`, `${p.title}, foto principal`)} eager />
        </button>
        <div className="prop-side">
          {p.photos.slice(1, 3).map((ph, i) => (
            <motion.button key={ph} type="button" onClick={() => setLightbox(i + 1)} data-cursor={tx('View', 'Ver')} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.1, duration: 0.6 }} aria-label={tx(`Open photo ${i + 2}`, `Abrir la foto ${i + 2}`)}>
              <Img name={ph} alt="" />
            </motion.button>
          ))}
          {p.photos.length < 3 && <div className="prop-side-fill"><Img name="hills-sunset" alt="" /></div>}
        </div>
        <div className="prop-gallery-tools">
          <button type="button" className="pill-btn" onClick={() => setLightbox(0)}><IconPhotos size={16} /> {p.photos.length} {tx('photos', 'fotos')}</button>
          {p.tour && <button type="button" className="pill-btn" onClick={() => go('tour')}><IconCube size={16} /> {tx('360° tour', 'Recorrido 360°')}</button>}
          {p.plan && <button type="button" className="pill-btn" onClick={() => go('plan')}><IconPlan size={16} /> {tx('Floor plan', 'Plano')}</button>}
          <button type="button" className="pill-btn" onClick={() => go('overview')}><IconVideo size={16} /> Video</button>
        </div>
      </div>

      <div className="wrap-wide prop-head">
        <nav className="crumbs" aria-label={tx('Breadcrumb', 'Ruta de navegación')}>
          <Link to={{ name: 'search' }}>{tx('Buy', 'Comprar')}</Link><span>/</span><span>{p.area}</span><span>/</span><span aria-current="page">{p.title}</span>
        </nav>
        <motion.h1 className="prop-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>{p.title}</motion.h1>
        <p className="prop-loc">{p.district}, {p.canton} · {p.province} · <span className="mono">{p.lat.toFixed(4)}° N {Math.abs(p.lng).toFixed(4)}° {tx('W', 'O')}</span></p>
        <Badges p={p} />
      </div>

      <div className="prop-tabs" role="navigation" aria-label={tx('Sections', 'Secciones')}>
        <div className="wrap-wide">
          {tabs.map(([k, label]) => <button key={k} type="button" onClick={() => go(k)}>{label}</button>)}
          <button type="button" className="prop-tabs-cta" onClick={() => go('visit')}>{tx('Request a visit', 'Solicitar una visita')}</button>
        </div>
      </div>

      <div className="wrap-wide prop-layout">
        <div className="prop-main-col">
          <section ref={refs.overview} className="prop-sec">
            <h2 className="prop-headline">{p.headline}</h2>
            <p className="prop-desc">{p.description}</p>
            <ul className="feature-list">
              {p.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <dl className="spec-table">
              <div><dt>{tx('Type', 'Tipo')}</dt><dd>{typeLabel(p.type, lang)}</dd></div>
              {p.beds != null && <div><dt>{tx('Bedrooms', 'Habitaciones')}</dt><dd>{p.beds}</dd></div>}
              {p.baths != null && <div><dt>{tx('Bathrooms', 'Baños')}</dt><dd>{decimal(String(p.baths))}</dd></div>}
              {p.builtM2 != null && <div><dt>{p.type === 'Farm' ? tx('Farmhouse', 'Casa de campo') : tx('Built area', 'Área construida')}</dt><dd>{m2(p.builtM2)}</dd></div>}
              {p.lotM2 != null && <div><dt>{tx('Land', 'Terreno')}</dt><dd>{land}</dd></div>}
              {p.parking != null && <div><dt>{tx('Parking', 'Parqueos')}</dt><dd>{p.parking}</dd></div>}
              {p.yearBuilt != null && <div><dt>{p.type === 'Pre-sale' ? tx('Delivery', 'Entrega') : tx('Year built', 'Año de construcción')}</dt><dd>{p.yearBuilt}</dd></div>}
              {p.builtM2 != null && p.type !== 'Farm' && <div><dt>{tx('Price per m²', 'Precio por m²')}</dt><dd>{money(p.priceUsd / p.builtM2, currency, rate)}</dd></div>}
            </dl>
            <figure className="prop-video">
              <video src={mediaUrl('heroVideo')} poster={mediaUrl('hero-poster')} muted loop playsInline controls preload="none" />
              <figcaption>{tx(
                'Drone footage of the Central Valley. A property-specific drone video is filmed when a home is listed.',
                'Toma de drone del Valle Central. Al publicar cada propiedad se graba su propio video con drone.',
              )}</figcaption>
            </figure>
          </section>

          {p.tour && (
            <section ref={refs.tour} className="prop-sec">
              <p className="eyebrow">{tx('360° tour', 'Recorrido 360°')}</p>
              <h2 className="h3">{tx('Walk through it from anywhere', 'Recórrala desde donde esté')}</h2>
              <Pano360 rooms={panoRooms} />
              <p className="fine">{tx(
                'Sample 360° interiors (Poly Haven, CC0) stand in for this property’s own tour.',
                'Interiores 360° de ejemplo (Poly Haven, CC0) en lugar del recorrido propio de esta propiedad.',
              )}</p>
            </section>
          )}

          {p.plan && (
            <section ref={refs.plan} className="prop-sec">
              <p className="eyebrow">{tx('Floor plan', 'Plano')}</p>
              <h2 className="h3">{tx('Tap a point to see the room', 'Toque un punto para ver el espacio')}</h2>
              <FloorPlan p={p} onOpenPhoto={setLightbox} />
            </section>
          )}

          <section ref={refs.location} className="prop-sec">
            <p className="eyebrow">{tx('Location', 'Ubicación')}</p>
            <h2 className="h3">{p.district}, {p.canton}</h2>
            <div className="loc-grid">
              <MapView items={[raw]} active={p.slug} mini />
              <ul className="nearby">
                {p.nearby.map(n => (
                  <li key={n.name}><span>{n.name}</span><span className="mono">{n.minutes} min</span></li>
                ))}
                <li className="fine">{tx('Typical drive times, outside rush hour.', 'Tiempos de manejo típicos, fuera de hora pico.')}</li>
              </ul>
            </div>
          </section>

          <section ref={refs.costs} className="prop-sec">
            <p className="eyebrow">{tx('Costs of ownership', 'Costos de mantener la propiedad')}</p>
            <h2 className="h3">{tx('What this home costs to hold', 'Lo que cuesta tener esta propiedad')}</h2>
            <div className="cost-cards">
              <div className="cost-card">
                <span>{tx('Monthly, before any mortgage', 'Al mes, sin contar hipoteca')}</span>
                <strong>{money(monthly, currency, rate)}</strong>
                <ul>
                  <li><span>{tx('HOA / condominium fee', 'Cuota de condominio')}</span><span>{money(p.hoaUsd, currency, rate)}</span></li>
                  <li><span>{tx('Property tax (0.25% a year)', 'Impuesto de bienes inmuebles (0,25% al año)')}</span><span>{money(propertyTax / 12, currency, rate)}</span></li>
                  <li><span>{tx('Home insurance (est.)', 'Seguro de la vivienda (est.)')}</span><span>{money(insurance / 12, currency, rate)}</span></li>
                </ul>
              </div>
              <div className="cost-card">
                <span>{tx('One-time closing costs (est.)', 'Gastos de cierre, una sola vez (est.)')}</span>
                <strong>{money(closing, currency, rate)}</strong>
                <p>{tx(
                  `${pct(closing / p.priceUsd)} of the price: transfer tax, registry, notary, escrow and title study${isResidencyEligible(p) ? ', with the Law 9996 transfer-tax discount if you apply for residency' : ''}.`,
                  `${pct(closing / p.priceUsd).replace('.', ',')} del precio: impuesto de traspaso, registro, notario, escrow y estudio registral${isResidencyEligible(p) ? ', con el descuento de la Ley 9996 en el traspaso si solicita la residencia' : ''}.`,
                )}</p>
                <button type="button" className="link-btn" onClick={() => navigate({ name: 'calculator', slug: p.slug })}><IconCalc size={18} /> {tx('Run the numbers', 'Hacer los cálculos')} <IconArrow size={16} /></button>
              </div>
              {yieldInfo && (
                <div className="cost-card">
                  <span>{tx('Estimated rental yield', 'Rentabilidad estimada por alquiler')}</span>
                  <strong>{decimal(pct(yieldInfo.gross))} <small>{tx('gross', 'bruta')}</small></strong>
                  <div className="yield-bar" aria-hidden="true"><motion.span initial={{ width: 0 }} whileInView={{ width: `${Math.min(yieldInfo.gross / 0.1, 1) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} /></div>
                  <p>{tx(
                    `${pct(yieldInfo.net)} net after HOA, tax, insurance, 10% management and 8% vacancy, at ${money(p.rentUsd!, currency, rate)} a month.`,
                    `${decimal(pct(yieldInfo.net))} neta después de cuota de condominio, impuestos, seguro, 10% de administración y 8% de desocupación, con un alquiler de ${money(p.rentUsd!, currency, rate)} al mes.`,
                  )}</p>
                </div>
              )}
            </div>
          </section>

          {isLand && p.buildReady && (
            <section className="prop-sec build-callout">
              <IconExcavator size={28} />
              <div>
                <h2 className="h3">{tx('Make it build-ready with our machines', 'Déjelo listo para construir con nuestra maquinaria')}</h2>
                <p>{p.buildReady} {tx(
                  'Our Land & Build team can quote clearing, terracing and compaction before you close.',
                  'Nuestro equipo de Land & Build puede cotizarle la limpieza, las terrazas y la compactación antes del cierre.',
                )}</p>
                <Link to={{ name: 'build' }} className="link-btn">{tx('See Land & Build', 'Ver Land & Build')} <IconArrow size={16} /></Link>
              </div>
            </section>
          )}

          <section ref={refs.legal} className="prop-sec">
            <p className="eyebrow">{tx('Legal status', 'Estado legal')}</p>
            <h2 className="h3">{p.legal.title}</h2>
            <div className="legal-grid">
              <dl className="spec-table spec-mono">
                <div><dt>{tx('Folio Real', 'Folio real')}</dt><dd>{p.legal.folio}</dd></div>
                <div><dt>{tx('Cadastral plan', 'Plano catastrado')}</dt><dd>{p.legal.plano}</dd></div>
                <div><dt>{tx('Zoning', 'Uso de suelo')}</dt><dd>{p.legal.zoning}</dd></div>
                <div><dt>{tx('Maritime zone (ZMT)', 'Zona marítimo terrestre (ZMT)')}</dt><dd>{tx('Not applicable — inland property', 'No aplica: propiedad en el Valle Central')}</dd></div>
              </dl>
              <VerifiedPanel p={p} />
            </div>
          </section>

          <section ref={refs.visit} className="prop-sec visit">
            <p className="eyebrow">{tx('Request a visit', 'Solicitar una visita')}</p>
            <h2 className="h3">{tx('See it in person or by video call', 'Conózcala en persona o por videollamada')}</h2>
            <ContactForm context={`${p.title} · ${p.district}, ${p.canton}`} defaultInterest={isLand ? 'land' : 'home'} submitLabel={tx('Request a visit', 'Solicitar la visita')} />
          </section>
        </div>

        <aside className="prop-aside">
          <div className="aside-card">
            <p className="aside-type">{typeLabel(p.type, lang)}{p.type !== 'Pre-sale' ? tx(' for sale', ' en venta') : ''}</p>
            <Price usd={p.priceUsd} className="aside-price" prefix={p.priceNote} />
            {p.builtM2 && p.type !== 'Farm' ? <p className="aside-sub mono">{money(p.priceUsd / p.builtM2, currency, rate)} / m²{grossYield(p) ? ` · ${decimal(pct(grossYield(p)!))} ${tx('gross yield', 'rentabilidad bruta')}` : ''}</p> : null}
            <Facts p={p} />
            <button type="button" className="btn btn-accent btn-block" onClick={() => go('visit')}>{tx('Request a visit', 'Solicitar una visita')}</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate({ name: 'calculator', slug: p.slug })}><IconCalc size={18} /> {tx('Estimate true cost', 'Calcular el costo real')}</button>
            <SaveButton slug={p.slug} label className="btn btn-ghost btn-block" />
          </div>
          {advisor && (
            <div className="aside-card advisor">
              <span className="avatar">{advisor.initials}</span>
              <div>
                <strong>{advisor.name}</strong>
                <span>{pick(advisor.role, lang)}</span>
                <span className="mono">{advisor.languages}</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="section similar">
        <div className="wrap-wide">
          <p className="eyebrow">{tx('You may also like', 'También le puede interesar')}</p>
          <div className="card-grid">
            {similar.map((s, i) => <Reveal key={s.slug} delay={i * 0.08}><PropertyCard p={s} /></Reveal>)}
          </div>
        </div>
      </section>

      <Lightbox photos={p.photos} title={p.title} index={lightbox} onClose={() => setLightbox(null)} />
    </article>
  );
}
