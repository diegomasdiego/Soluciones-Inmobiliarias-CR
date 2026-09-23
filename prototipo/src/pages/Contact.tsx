import { useState, type ReactNode } from 'react';
import { advisors, company } from '../data/company';
import { Img } from '../components/Basics';
import { ContactForm } from '../components/ContactForm';
import { IconCheck, IconMail, IconPhone, IconPin } from '../components/Icons';

function CopyLine({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
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
      <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy ${label}`}>{copied ? <><IconCheck size={14} /> Copied</> : 'Copy'}</button>
    </li>
  );
}

const topics: Record<string, string> = { build: 'Land & Build (machinery)', sell: 'Selling my property', invest: 'Investing / rentals' };

export default function Contact({ topic }: { topic?: string }) {
  return (
    <div className="contact-page">
      <div className="wrap contact-grid">
        <div className="contact-info">
          <p className="eyebrow">Contact</p>
          <h1 className="h1">Let’s talk about your ground.</h1>
          <p className="lead">Buying, selling, investing or preparing a lot: write to us and the right advisor replies within one business day, in English or Spanish.</p>
          <ul className="contact-lines">
            <CopyLine icon={<IconMail size={18} />} value={company.email} label="email" />
            <CopyLine icon={<IconPhone size={18} />} value={company.phone} label="phone" />
            <li className="copy-line"><IconPin size={18} /><span>{company.office}</span></li>
          </ul>
          <p className="mono fine">{company.hours}</p>
          <div className="advisor-list">
            {Object.values(advisors).map(a => (
              <div key={a.id} className="advisor">
                <span className="avatar">{a.initials}</span>
                <div><strong>{a.name}</strong><span>{a.role}</span><span className="mono">{a.languages}</span></div>
              </div>
            ))}
          </div>
          <div className="contact-img"><Img name="coffee" alt="Coffee cherries on the branch, Heredia" /></div>
        </div>
        <div className="contact-form-col">
          <ContactForm defaultInterest={topic ? topics[topic] : undefined} />
        </div>
      </div>
    </div>
  );
}
