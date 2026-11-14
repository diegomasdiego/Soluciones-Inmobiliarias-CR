// Buyer guides index (#guides): the four guides and a searchable glossary.
import { useMemo, useState } from 'react';
import { company } from '../data/company';
import { glossary, guides, GUIDES_UPDATED } from '../data/guides';
import { formatDate } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { useSeo } from '../lib/seo';
import { Reveal } from '../components/Chrome';
import { GuideCard } from '../components/GuideParts';
import { IconArrow, IconSearch } from '../components/Icons';
import { Topo, type TopoCenter } from '../components/Topo';

const topo: TopoCenter[] = [{ x: 0.92, y: 0.15, rings: 18, spacing: 26, seed: 2.4 }];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Guides() {
  const { lang, tx } = useLang();
  const [q, setQ] = useState('');
  useSeo(
    tx(`Guides to buying property in Costa Rica · ${company.name}`, `Guías para comprar propiedad en Costa Rica · ${company.name}`),
    tx(
      'Plain-language guides for foreign and local buyers: the purchase step by step, the maritime zone, investor residency and property taxes, updated for 2026.',
      'Guías en lenguaje claro para compradores extranjeros y locales: la compra paso a paso, la zona marítimo terrestre, la residencia de inversionista y los impuestos, actualizadas a 2026.',
    ),
  );
  const terms = useMemo(() => {
    const f = fold(q.trim());
    return glossary.filter(g => !f || fold(g.term).includes(f) || fold(pick(g.def, lang)).includes(f));
  }, [q, lang]);

  return (
    <div className="guides-page">
      <section className="guides-hero">
        <Topo className="guides-topo" centers={topo} color="rgba(30,74,59,.16)" />
        <div className="wrap guides-hero-inner">
          <p className="eyebrow">{tx('Guides', 'Guías')}</p>
          <h1 className="h1">{tx('Buying in Costa Rica, explained', 'Comprar en Costa Rica, explicado')}</h1>
          <p className="lead">{tx(
            'What foreign and local buyers ask us most, in plain language: how a purchase works, what you can own on the coast, how a property supports residency and which taxes you will pay.',
            'Lo que más nos preguntan los compradores extranjeros y locales, en lenguaje claro: cómo funciona una compra, qué se puede tener en la costa, cómo una propiedad respalda la residencia y qué impuestos va a pagar.',
          )}</p>
          <p className="mono guides-updated">{tx('Updated', 'Actualizadas el')} {formatDate(GUIDES_UPDATED, lang)} · {tx('General information, not legal advice', 'Información general, no asesoría legal')}</p>
        </div>
      </section>

      <section className="guides-list">
        <div className="wrap guides-grid">
          {guides.map((g, i) => <Reveal key={g.slug} delay={i * 0.06}><GuideCard g={g} index={i} /></Reveal>)}
        </div>
      </section>

      <section className="section guides-glossary">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <p className="eyebrow">{tx('Glossary', 'Glosario')}</p>
              <h2 className="h2">{tx('The words you will hear', 'Las palabras que va a escuchar')}</h2>
            </div>
            <label className="glossary-search">
              <IconSearch size={18} />
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={tx('Search a term', 'Buscar un término')} aria-label={tx('Search the glossary', 'Buscar en el glosario')} />
            </label>
          </div>
          {terms.length ? (
            <dl className="glossary">
              {terms.map(g => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{pick(g.def, lang)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="fine">{tx('No term matches. Ask us and we will add it.', 'Ningún término coincide. Pregúntenos y lo agregamos.')}</p>
          )}
        </div>
      </section>

      <section className="guides-ask">
        <div className="wrap guides-ask-inner">
          <div>
            <h2 className="h3">{tx('A question about your own case?', '¿Una pregunta sobre su caso?')}</h2>
            <p>{tx('An advisor replies within one business day, in English or Spanish, and brings in our notary or lawyer partners when needed.', 'Un asesor le responde en menos de un día hábil, en español o en inglés, y suma a nuestros notarios o abogados aliados cuando hace falta.')}</p>
          </div>
          <Link to={{ name: 'contact' }} className="btn btn-accent">{tx('Ask an advisor', 'Consultar a un asesor')} <IconArrow size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
