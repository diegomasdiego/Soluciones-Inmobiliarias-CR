import { useRef } from 'react';
import { isResidencyEligible, type Property } from '../data/properties';
import { localize, typeLabel } from '../data/properties.es';
import { m2 } from '../lib/format';
import { useLang } from '../lib/i18n';
import { useRouter } from '../lib/router';
import { Img, Price, SaveButton } from './Basics';
import { IconArea, IconBath, IconBed, IconCheck, IconLot } from './Icons';

export function Badges({ p, compact }: { p: Property; compact?: boolean }) {
  const { tx } = useLang();
  return (
    <div className={`badges ${compact ? 'badges-compact' : ''}`}>
      <span className="badge badge-verified"><IconCheck size={13} />Solid Ground Verified</span>
      {isResidencyEligible(p) && <span className="badge badge-residency">{tx('Residency-eligible', 'Apta para residencia')}</span>}
      {p.type === 'Pre-sale' && <span className="badge badge-presale">{tx('Pre-sale', 'Preventa')}</span>}
    </div>
  );
}

export function Facts({ p }: { p: Property }) {
  const { tx } = useLang();
  return (
    <ul className="facts">
      {p.beds != null && <li><IconBed size={16} />{p.beds} {tx('bd', 'hab.')}</li>}
      {p.baths != null && <li><IconBath size={16} />{String(p.baths).replace('.', tx('.', ','))} {tx('ba', p.baths === 1 ? 'baño' : 'baños')}</li>}
      {p.builtM2 != null && <li><IconArea size={16} />{m2(p.builtM2)}</li>}
      {p.lotM2 != null && (p.type === 'Lot' || p.type === 'Farm' || !p.builtM2) && <li><IconLot size={16} />{p.lotM2 >= 10000 ? `${(p.lotM2 / 10000).toFixed(1).replace('.', tx('.', ','))} ha` : m2(p.lotM2)}</li>}
    </ul>
  );
}

type Props = {
  p: Property;
  active?: boolean;
  note?: string;
  onHover?: (slug: string | null) => void;
  eager?: boolean;
};

export function PropertyCard({ p: raw, active, note, onHover, eager }: Props) {
  const { navigate } = useRouter();
  const { lang, tx } = useLang();
  const p = localize(raw, lang);
  const imgRef = useRef<HTMLDivElement>(null);
  const open = () => navigate({ name: 'property', slug: p.slug }, { morph: imgRef.current });

  return (
    <article
      className={`pcard ${active ? 'is-active' : ''}`}
      onMouseEnter={() => onHover?.(p.slug)}
      onMouseLeave={() => onHover?.(null)}
    >
      <a
        href={`#property-${p.slug}`}
        className="pcard-link"
        onClick={e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); open(); }}
        data-cursor={tx('View', 'Ver')}
      >
        <div className="pcard-media" ref={imgRef}>
          <Img name={p.photos[0]} alt={`${p.title}, ${p.district}`} eager={eager} />
          <Badges p={p} compact />
          <span className="pcard-type">{typeLabel(p.type, lang)}</span>
        </div>
        <div className="pcard-body">
          <div className="pcard-top">
            <h3 className="pcard-title">{p.title}</h3>
            <Price usd={p.priceUsd} className="pcard-price" prefix={p.priceNote} />
          </div>
          <p className="pcard-loc">{p.district}, {p.canton} · {p.province}</p>
          <Facts p={p} />
          {note && <p className="pcard-note">{note}</p>}
        </div>
      </a>
      <SaveButton slug={p.slug} className="pcard-save" />
    </article>
  );
}
