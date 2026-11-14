// One buyer guide (#guide-<slug>): table of contents with scroll spy, reading progress,
// interactive widgets, FAQ, sources, related guides and a question form.
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { company } from '../data/company';
import { guideBySlug, guides, type Block, type Guide as GuideT } from '../data/guides';
import { formatDate } from '../lib/format';
import { pick, useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { useSeo } from '../lib/seo';
import { ContactForm } from '../components/ContactForm';
import { BuyTimeline, CalculatorCta, HoldingTaxes, ResidencyCheck, ZmtDiagram } from '../components/GuideWidgets';
import { GuideCard, GuideIconView, rich } from '../components/GuideParts';
import { IconArrowLeft } from '../components/Icons';

const secId = (id: string) => `sec-${id}`;
const jump = (id: string) => document.getElementById(secId(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function BlockView({ b }: { b: Block }) {
  const { lang } = useLang();
  switch (b.t) {
    case 'p': return <p>{rich(pick(b.text, lang))}</p>;
    case 'list': {
      const items = b.items.map((it, i) => <li key={i}>{rich(pick(it, lang))}</li>);
      return b.ordered ? <ol className="gd-list gd-ol">{items}</ol> : <ul className="gd-list">{items}</ul>;
    }
    case 'callout': return (
      <aside className={`gd-callout is-${b.tone}`}>
        <strong>{pick(b.title, lang)}</strong>
        <p>{rich(pick(b.text, lang))}</p>
      </aside>
    );
    case 'table': return (
      <div className="gd-table-wrap">
        <table className="gd-table">
          <caption>{pick(b.caption, lang)}</caption>
          <thead><tr>{b.head.map((h, i) => <th key={i} scope="col">{pick(h, lang)}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{pick(c, lang)}</th> : <td key={j}>{pick(c, lang)}</td>))}</tr>)}</tbody>
        </table>
      </div>
    );
    case 'widget':
      switch (b.id) {
        case 'timeline': return <BuyTimeline onJump={jump} />;
        case 'zmt': return <ZmtDiagram />;
        case 'residency': return <ResidencyCheck />;
        case 'holding': return <HoldingTaxes />;
        case 'calculator': return <CalculatorCta />;
      }
  }
}

function Article({ g }: { g: GuideT }) {
  const { lang, tx } = useLang();
  const ref = useRef<HTMLElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  const toc = [...g.sections.map(s => ({ id: s.id, title: pick(s.title, lang) })), { id: 'faq', title: tx('Questions', 'Preguntas') }, { id: 'sources', title: tx('Sources', 'Fuentes') }];
  const [active, setActive] = useState(toc[0].id);
  const title = pick(g.title, lang);
  const description = pick(g.description, lang);
  const index = guides.indexOf(g);

  useSeo(`${title} · ${company.name}`, description, {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        dateModified: g.updated,
        inLanguage: lang === 'es' ? 'es-CR' : 'en',
        author: { '@type': 'Organization', name: company.name },
        publisher: { '@type': 'Organization', name: company.name },
      },
      {
        '@type': 'FAQPage',
        mainEntity: g.faq.map(f => ({ '@type': 'Question', name: pick(f.q, lang), acceptedAnswer: { '@type': 'Answer', text: pick(f.a, lang) } })),
      },
    ],
  });

  // Scroll spy: the last section whose top has passed a line under the header is the active one.
  useEffect(() => {
    const ids = toc.map(t => t.id);
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(secId(id));
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [g.slug, lang]);

  // On phones the contents are a sideways row of chips: keep the active one in view.
  useEffect(() => {
    const nav = tocRef.current;
    const btn = nav?.querySelector<HTMLElement>('button.is-active');
    if (!nav || !btn || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: btn.offsetLeft - nav.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <article className="guide-page" ref={ref}>
      <motion.div className="gd-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <header className="wrap gd-head">
        <Link to={{ name: 'guides' }} className="gd-back"><IconArrowLeft size={16} /> {tx('All guides', 'Todas las guías')}</Link>
        <div className="gd-head-row">
          <span className="gd-head-icon"><GuideIconView icon={g.icon} size={26} /></span>
          <p className="eyebrow">{tx(`Guide ${index + 1} of ${guides.length}`, `Guía ${index + 1} de ${guides.length}`)} · {tx(`${g.minutes} min read`, `${g.minutes} min de lectura`)}</p>
        </div>
        <h1 className="h1 gd-title">{title}</h1>
        <p className="lead">{description}</p>
        <p className="mono gd-meta">{tx('Updated', 'Actualizada el')} {formatDate(g.updated, lang)} · {tx('General information, not legal or tax advice', 'Información general, no asesoría legal ni tributaria')}</p>
      </header>

      <div className="wrap gd-layout">
        <nav className="gd-toc" ref={tocRef} aria-label={tx('On this page', 'En esta página')}>
          <p className="gd-toc-label mono">{tx('On this page', 'En esta página')}</p>
          <ol>
            {toc.map(t => (
              <li key={t.id}>
                <button type="button" className={active === t.id ? 'is-active' : ''} aria-current={active === t.id ? 'location' : undefined} onClick={() => jump(t.id)}>{t.title}</button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="gd-body">
          {g.sections.map(s => (
            <section key={s.id} id={secId(s.id)} className="gd-sec" aria-labelledby={`${secId(s.id)}-h`}>
              <h2 className="h3" id={`${secId(s.id)}-h`}>{pick(s.title, lang)}</h2>
              {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
            </section>
          ))}

          <section id={secId('faq')} className="gd-sec" aria-labelledby="gd-faq-h">
            <h2 className="h3" id="gd-faq-h">{tx('Frequent questions', 'Preguntas frecuentes')}</h2>
            <div className="gd-faq">
              {g.faq.map((f, i) => (
                <details key={i} open={i === 0}>
                  <summary>{pick(f.q, lang)}</summary>
                  <p>{pick(f.a, lang)}</p>
                </details>
              ))}
            </div>
          </section>

          <section id={secId('sources')} className="gd-sec gd-sources" aria-labelledby="gd-src-h">
            <h2 className="h4" id="gd-src-h">{tx('Sources', 'Fuentes')}</h2>
            <ul>
              {g.sources.map((s, i) => (
                <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}</li>
              ))}
            </ul>
            <p className="fine">{tx(
              'Figures checked against official sources on the date above. Rules change: your notary, lawyer or accountant confirms what applies to your case.',
              'Cifras revisadas con fuentes oficiales en la fecha indicada. Las reglas cambian: su notario, abogado o contador confirma lo que aplica a su caso.',
            )}</p>
          </section>
        </div>
      </div>

      <section className="section gd-more">
        <div className="wrap">
          <p className="eyebrow">{tx('Keep reading', 'Siga leyendo')}</p>
          <div className="guides-grid is-three">
            {guides.filter(o => o.slug !== g.slug).map(o => <GuideCard key={o.slug} g={o} index={guides.indexOf(o)} compact />)}
          </div>
        </div>
      </section>

      <section className="section quote">
        <div className="wrap cta-grid">
          <div>
            <p className="eyebrow">{tx('Your case', 'Su caso')}</p>
            <h2 className="h2">{tx('Ask us about your purchase.', 'Pregúntenos por su compra.')}</h2>
            <p className="lead">{tx(
              'An advisor replies within one business day, and brings in a notary or lawyer from our network when your question needs one.',
              'Un asesor le responde en menos de un día hábil, y suma a un notario o abogado de nuestra red cuando su pregunta lo necesita.',
            )}</p>
          </div>
          <ContactForm context={`${tx('Guide', 'Guía')}: ${pick(g.short, lang)}`} submitLabel={tx('Send my question', 'Enviar mi pregunta')} />
        </div>
      </section>
    </article>
  );
}

export default function Guide({ slug }: { slug: string }) {
  const { tx } = useLang();
  const g = guideBySlug(slug);
  if (!g) {
    return (
      <div className="wrap guide-missing">
        <h1 className="h2">{tx('Guide not found', 'No encontramos esa guía')}</h1>
        <Link to={{ name: 'guides' }} className="link-btn"><IconArrowLeft size={16} /> {tx('All guides', 'Todas las guías')}</Link>
      </div>
    );
  }
  return <Article g={g} key={g.slug} />;
}
