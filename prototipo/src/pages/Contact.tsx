import { useState, type ReactNode } from 'react';
import { advisors, company } from '../data/company';
import { pick, useLang } from '../lib/i18n';
import { Img } from '../components/Basics';
import { ContactForm, type InterestId } from '../components/ContactForm';
import { IconCheck, IconMail, IconPhone, IconPin } from '../components/Icons';

function CopyLine({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  const { tx } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const range = document.createRange();
      const el = document.getElementById(`copy-${label}`);
      if (el) { range.selectNodeContents(el); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
    }
  };
  return (
    <li className="copy-line">
      {icon}
      <span id={`copy-${label}`} className="mono">{value}</span>
      <button type="button" className="copy-btn" onClick={copy} aria-label={tx(`Copy ${label}`, `Copiar ${label}`)}>{copied ? <><IconCheck size={14} /> {tx('Copied', 'Copiado')}</> : tx('Copy', 'Copiar')}</button>
    </li>
  );
}

const topics: Record<string, InterestId> = { build: 'build', sell: 'sell', invest: 'invest' };

export default function Contact({ topic }: { topic?: string }) {
  const { lang, tx } = useLang();
  return (
    <div className="contact-page">
      <div className="wrap contact-grid">
        <div className="contact-info">
          <p className="eyebrow">{tx('Contact', 'Contacto')}</p>
          <h1 className="h1">{tx('Let’s talk about your ground.', 'Hablemos de su terreno.')}</h1>
          <p className="lead">{tx(
            'Buying, selling, investing or preparing a lot: write to us and the right advisor replies within one business day, in English or Spanish.',
            'Comprar, vender, invertir o preparar un lote: escríbanos y el asesor indicado le responde en menos de un día hábil, en español o en inglés.',
          )}</p>
          <ul className="contact-lines">
            <CopyLine icon={<IconMail size={18} />} value={company.email} label={tx('email', 'correo')} />
            <CopyLine icon={<IconPhone size={18} />} value={company.phone} label={tx('phone', 'teléfono')} />
            <li className="copy-line"><IconPin size={18} /><span>{pick(company.office, lang)}</span></li>
          </ul>
          <p className="mono fine">{pick(company.hours, lang)}</p>
          <div className="advisor-list">
            {Object.values(advisors).map(a => (
              <div key={a.id} className="advisor">
                <span className="avatar">{a.initials}</span>
                <div><strong>{a.name}</strong><span>{pick(a.role, lang)}</span><span className="mono">{a.languages}</span></div>
              </div>
            ))}
          </div>
          <div className="contact-img"><Img name="coffee" alt={tx('Coffee cherries on the branch, Heredia', 'Granos de café maduros en la rama, Heredia')} /></div>
        </div>
        <div className="contact-form-col">
          <ContactForm defaultInterest={topic ? topics[topic] : undefined} />
        </div>
      </div>
    </div>
  );
}
