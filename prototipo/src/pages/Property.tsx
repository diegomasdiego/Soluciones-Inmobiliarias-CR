import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { advisors } from '../data/company';
import { bySlug, grossYield, isResidencyEligible, properties, type Property as P } from '../data/properties';
import { closingCosts, rentalYield, sum, yearlyHolding } from '../lib/costs';
import { m2, money, pct } from '../lib/format';
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

const panoRooms = [
  { name: 'Living and dining', media: 'pano-living', yaw: 0.6 },
  { name: 'Terrace', media: 'pano-terrace', yaw: 3.1 },
];

function NotFound() {
  return (
    <div className="wrap notfound">
      <h1 className="h2">This property is no longer listed.</h1>
      <p className="lead">It may have sold. Browse what’s available now.</p>
      <Link to={{ name: 'search' }} className="btn btn-accent">See properties</Link>
    </div>
  );
}

export default function Property({ slug }: { slug: string }) {
  const p = bySlug(slug);
  if (!p) return <NotFound />;
  return <PropertyView p={p} key={p.slug} />;
}

function PropertyView({ p }: { p: P }) {
  const { currency, rate } = useStore();
  const { navigate } = useRouter();
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

  const advisor = advisors[p.advisor];
  const { propertyTax, insurance } = yearlyHolding(p.priceUsd);
  const monthly = p.hoaUsd + propertyTax / 12 + insurance / 12;
  const closing = sum(closingCosts(p.priceUsd, { residency: isResidencyEligible(p), split: false }));
  const yieldInfo = p.rentUsd ? rentalYield(p.priceUsd, p.rentUsd, p.hoaUsd) : null;
  const similar = useMemo(
    () => properties.filter(o => o.slug !== p.slug).sort((a, b) => Number(b.area === p.area) - Number(a.area === p.area) || Math.abs(a.priceUsd - p.priceUsd) - Math.abs(b.priceUsd - p.priceUsd)).slice(0, 3),
    [p],
  );
  const tabs: [keyof typeof refs, string][] = [
    ['overview', 'Overview'],
    ...(p.tour ? [['tour', '360° tour'] as [keyof typeof refs, string]] : []),
    ...(p.plan ? [['plan', 'Floor plan'] as [keyof typeof refs, string]] : []),
    ['location', 'Location'],
    ['costs', 'Costs'],
    ['legal', 'Legal'],
  ];
  const isLand = p.type === 'Lot' || p.type === 'Farm';

  return (
    <article className="property">
      <div className="wrap-wide prop-gallery">
        <button type="button" className="prop-main vt-hero" onClick={() => setLightbox(0)} data-cursor="View" aria-label="Open photo gallery">
          <Img name={p.photos[0]} alt={`${p.title}, main photo`} eager />
        </button>
        <div className="prop-side">
          {p.photos.slice(1, 3).map((ph, i) => (
            <motion.button key={ph} type="button" onClick={() => setLightbox(i + 1)} data-cursor="View" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.1, duration: 0.6 }} aria-label={`Open photo ${i + 2}`}>
              <Img name={ph} alt="" />
            </motion.button>
          ))}
          {p.photos.length < 3 && <div className="prop-side-fill"><Img name="hills-sunset" alt="" /></div>}
        </div>
        <div className="prop-gallery-tools">
          <button type="button" className="pill-btn" onClick={() => setLightbox(0)}><IconPhotos size={16} /> {p.photos.length} photos</button>
          {p.tour && <button type="button" className="pill-btn" onClick={() => go('tour')}><IconCube size={16} /> 360° tour</button>}
          {p.plan && <button type="button" className="pill-btn" onClick={() => go('plan')}><IconPlan size={16} /> Floor plan</button>}
          <button type="button" className="pill-btn" onClick={() => go('overview')}><IconVideo size={16} /> Video</button>
        </div>
      </div>

      <div className="wrap-wide prop-head">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to={{ name: 'search' }}>Buy</Link><span>/</span><span>{p.area}</span><span>/</span><span aria-current="page">{p.title}</span>
        </nav>
        <motion.h1 className="prop-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>{p.title}</motion.h1>
        <p className="prop-loc">{p.district}, {p.canton} · {p.province} · <span className="mono">{p.lat.toFixed(4)}° N {Math.abs(p.lng).toFixed(4)}° W</span></p>
        <Badges p={p} />
      </div>

      <div className="prop-tabs" role="navigation" aria-label="Sections">
        <div className="wrap-wide">
          {tabs.map(([k, label]) => <button key={k} type="button" onClick={() => go(k)}>{label}</button>)}
          <button type="button" className="prop-tabs-cta" onClick={() => go('visit')}>Request a visit</button>
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
              <div><dt>Type</dt><dd>{p.type}</dd></div>
              {p.beds != null && <div><dt>Bedrooms</dt><dd>{p.beds}</dd></div>}
              {p.baths != null && <div><dt>Bathrooms</dt><dd>{p.baths}</dd></div>}
              {p.builtM2 != null && <div><dt>{p.type === 'Farm' ? 'Farmhouse' : 'Built area'}</dt><dd>{m2(p.builtM2)}</dd></div>}
              {p.lotM2 != null && <div><dt>Land</dt><dd>{p.lotM2 >= 10000 ? `${(p.lotM2 / 10000).toFixed(1)} ha (${m2(p.lotM2)})` : m2(p.lotM2)}</dd></div>}
              {p.parking != null && <div><dt>Parking</dt><dd>{p.parking}</dd></div>}
              {p.yearBuilt != null && <div><dt>{p.type === 'Pre-sale' ? 'Delivery' : 'Year built'}</dt><dd>{p.yearBuilt}</dd></div>}
              {p.builtM2 != null && p.type !== 'Farm' && <div><dt>Price per m²</dt><dd>{money(p.priceUsd / p.builtM2, currency, rate)}</dd></div>}
            </dl>
            <figure className="prop-video">
              <video src={mediaUrl('heroVideo')} poster={mediaUrl('hero-poster')} muted loop playsInline controls preload="none" />
              <figcaption>Drone footage of the Central Valley. A property-specific drone video is filmed when a home is listed.</figcaption>
            </figure>
          </section>

          {p.tour && (
            <section ref={refs.tour} className="prop-sec">
              <p className="eyebrow">360° tour</p>
              <h2 className="h3">Walk through it from anywhere</h2>
              <Pano360 rooms={panoRooms} />
              <p className="fine">Sample 360° interiors (Poly Haven, CC0) stand in for this property’s own tour.</p>
            </section>
          )}

          {p.plan && (
            <section ref={refs.plan} className="prop-sec">
              <p className="eyebrow">Floor plan</p>
              <h2 className="h3">Tap a point to see the room</h2>
              <FloorPlan p={p} onOpenPhoto={setLightbox} />
            </section>
          )}

          <section ref={refs.location} className="prop-sec">
            <p className="eyebrow">Location</p>
            <h2 className="h3">{p.district}, {p.canton}</h2>
            <div className="loc-grid">
              <MapView items={[p]} active={p.slug} mini />
              <ul className="nearby">
                {p.nearby.map(n => (
                  <li key={n.name}><span>{n.name}</span><span className="mono">{n.minutes} min</span></li>
                ))}
                <li className="fine">Typical drive times, outside rush hour.</li>
              </ul>
            </div>
          </section>

          <section ref={refs.costs} className="prop-sec">
            <p className="eyebrow">Costs of ownership</p>
            <h2 className="h3">What this home costs to hold</h2>
            <div className="cost-cards">
              <div className="cost-card">
                <span>Monthly, before any mortgage</span>
                <strong>{money(monthly, currency, rate)}</strong>
                <ul>
                  <li><span>HOA / condominium fee</span><span>{money(p.hoaUsd, currency, rate)}</span></li>
                  <li><span>Property tax (0.25% a year)</span><span>{money(propertyTax / 12, currency, rate)}</span></li>
                  <li><span>Home insurance (est.)</span><span>{money(insurance / 12, currency, rate)}</span></li>
                </ul>
              </div>
              <div className="cost-card">
                <span>One-time closing costs (est.)</span>
                <strong>{money(closing, currency, rate)}</strong>
                <p>{pct(closing / p.priceUsd)} of the price: transfer tax, registry, notary, escrow and title study{isResidencyEligible(p) ? ', with the Law 9996 transfer-tax discount if you apply for residency' : ''}.</p>
                <button type="button" className="link-btn" onClick={() => navigate({ name: 'calculator', slug: p.slug })}><IconCalc size={18} /> Run the numbers <IconArrow size={16} /></button>
              </div>
              {yieldInfo && (
                <div className="cost-card">
                  <span>Estimated rental yield</span>
                  <strong>{pct(yieldInfo.gross)} <small>gross</small></strong>
                  <div className="yield-bar" aria-hidden="true"><motion.span initial={{ width: 0 }} whileInView={{ width: `${Math.min(yieldInfo.gross / 0.1, 1) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} /></div>
                  <p>{pct(yieldInfo.net)} net after HOA, tax, insurance, 10% management and 8% vacancy, at {money(p.rentUsd!, currency, rate)} a month.</p>
                </div>
              )}
            </div>
          </section>

          {isLand && p.buildReady && (
            <section className="prop-sec build-callout">
              <IconExcavator size={28} />
              <div>
                <h2 className="h3">Make it build-ready with our machines</h2>
                <p>{p.buildReady} Our Land &amp; Build team can quote clearing, terracing and compaction before you close.</p>
                <Link to={{ name: 'build' }} className="link-btn">See Land &amp; Build <IconArrow size={16} /></Link>
              </div>
            </section>
          )}

          <section ref={refs.legal} className="prop-sec">
            <p className="eyebrow">Legal status</p>
            <h2 className="h3">{p.legal.title}</h2>
            <div className="legal-grid">
              <dl className="spec-table spec-mono">
                <div><dt>Folio Real</dt><dd>{p.legal.folio}</dd></div>
                <div><dt>Cadastral plan</dt><dd>{p.legal.plano}</dd></div>
                <div><dt>Zoning</dt><dd>{p.legal.zoning}</dd></div>
                <div><dt>Maritime zone (ZMT)</dt><dd>Not applicable — inland property</dd></div>
              </dl>
              <VerifiedPanel p={p} />
            </div>
          </section>

          <section ref={refs.visit} className="prop-sec visit">
            <p className="eyebrow">Request a visit</p>
            <h2 className="h3">See it in person or by video call</h2>
            <ContactForm context={`${p.title} · ${p.district}, ${p.canton}`} defaultInterest={p.type === 'Lot' || p.type === 'Farm' ? 'Buying land or a farm' : 'Buying a home'} submitLabel="Request a visit" />
          </section>
        </div>

        <aside className="prop-aside">
          <div className="aside-card">
            <p className="aside-type">{p.type}{p.type !== 'Pre-sale' ? ' for sale' : ''}</p>
            <Price usd={p.priceUsd} className="aside-price" prefix={p.priceNote} />
            {p.builtM2 && p.type !== 'Farm' ? <p className="aside-sub mono">{money(p.priceUsd / p.builtM2, currency, rate)} / m²{grossYield(p) ? ` · ${pct(grossYield(p)!)} gross yield` : ''}</p> : null}
            <Facts p={p} />
            <button type="button" className="btn btn-accent btn-block" onClick={() => go('visit')}>Request a visit</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate({ name: 'calculator', slug: p.slug })}><IconCalc size={18} /> Estimate true cost</button>
            <SaveButton slug={p.slug} label className="btn btn-ghost btn-block" />
          </div>
          {advisor && (
            <div className="aside-card advisor">
              <span className="avatar">{advisor.initials}</span>
              <div>
                <strong>{advisor.name}</strong>
                <span>{advisor.role}</span>
                <span className="mono">{advisor.languages}</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="section similar">
        <div className="wrap-wide">
          <p className="eyebrow">You may also like</p>
          <div className="card-grid">
            {similar.map((s, i) => <Reveal key={s.slug} delay={i * 0.08}><PropertyCard p={s} /></Reveal>)}
          </div>
        </div>
      </section>

      <Lightbox photos={p.photos} title={p.title} index={lightbox} onClose={() => setLightbox(null)} />
    </article>
  );
}
