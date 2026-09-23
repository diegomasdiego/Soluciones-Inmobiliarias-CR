import { useId, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconCheck } from './Icons';

type Props = {
  context?: string;
  defaultInterest?: string;
  defaultMessage?: string;
  compact?: boolean;
  dark?: boolean;
  submitLabel?: string;
};

const interests = ['Buying a home', 'Buying land or a farm', 'Investing / rentals', 'Selling my property', 'Land & Build (machinery)', 'Something else'];
const contactWays = ['Email', 'WhatsApp', 'Video call'];

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function ContactForm({ context, defaultInterest, defaultMessage = '', compact, dark, submitLabel = 'Send request' }: Props) {
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '', phone: '', interest: defaultInterest ?? interests[0], budget: '', message: defaultMessage, via: 'Email' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof values, v: string) => {
    setValues(s => ({ ...s, [k]: v }));
    if (k in errors) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (!values.name.trim()) err.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) err.email = 'Enter an email like name@example.com.';
    if (!compact && values.message.trim().length < 10) err.message = 'Tell us a little more (at least 10 characters).';
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`${uid}-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setDone(true);
  };

  const field = (k: 'name' | 'email' | 'phone', label: string, type = 'text', optional = false) => (
    <div className={`field ${errors[k as keyof Errors] ? 'has-error' : ''}`}>
      <label htmlFor={`${uid}-${k}`}>{label}{optional && <span className="optional"> · optional</span>}</label>
      <input id={`${uid}-${k}`} type={type} value={values[k]} onChange={e => set(k, e.target.value)} autoComplete={k === 'phone' ? 'tel' : k} aria-invalid={!!errors[k as keyof Errors]} aria-describedby={errors[k as keyof Errors] ? `${uid}-${k}-err` : undefined} />
      {errors[k as keyof Errors] && <span className="field-error" id={`${uid}-${k}-err`}>{errors[k as keyof Errors]}</span>}
    </div>
  );

  return (
    <div className={`cform ${dark ? 'cform-dark' : ''}`}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" className="cform-done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span className="cform-done-icon"><IconCheck size={22} /></span>
            <h3>Request ready, {values.name.split(' ')[0]}.</h3>
            <p>On the live site this goes straight to an advisor, who replies by {values.via.toLowerCase()} within one business day. This prototype doesn’t send any data.</p>
            <button type="button" className="btn btn-ghost" onClick={() => { setDone(false); setValues(v => ({ ...v, message: '' })); }}>Write another request</button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {context && <p className="cform-context">About: <strong>{context}</strong></p>}
            <div className="field-row">
              {field('name', 'Your name')}
              {field('email', 'Email', 'email')}
            </div>
            {!compact && (
              <div className="field-row">
                {field('phone', 'Phone or WhatsApp', 'tel', true)}
                <div className="field">
                  <label htmlFor={`${uid}-interest`}>I’m interested in</label>
                  <select id={`${uid}-interest`} value={values.interest} onChange={e => set('interest', e.target.value)}>
                    {interests.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            )}
            {!compact && (
              <div className="field">
                <label htmlFor={`${uid}-budget`}>Budget <span className="optional">· optional</span></label>
                <select id={`${uid}-budget`} value={values.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option>Under $150,000</option>
                  <option>$150,000 – $300,000</option>
                  <option>$300,000 – $500,000</option>
                  <option>Over $500,000</option>
                </select>
              </div>
            )}
            <div className={`field ${errors.message ? 'has-error' : ''}`}>
              <label htmlFor={`${uid}-message`}>Message{compact && <span className="optional"> · optional</span>}</label>
              <textarea id={`${uid}-message`} rows={compact ? 3 : 5} value={values.message} onChange={e => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? `${uid}-message-err` : undefined} placeholder="Dates you can visit, questions about the property, your timeline…" />
              {errors.message && <span className="field-error" id={`${uid}-message-err`}>{errors.message}</span>}
            </div>
            <fieldset className="field">
              <legend>Best way to reach you</legend>
              <div className="radio-row">
                {contactWays.map(w => (
                  <label key={w} className={`radio ${values.via === w ? 'is-on' : ''}`}>
                    <input type="radio" name={`${uid}-via`} value={w} checked={values.via === w} onChange={() => set('via', w)} />
                    {w}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="btn btn-accent btn-block">{submitLabel}</button>
            <p className="cform-fine">We reply within one business day. Your details are used only to answer this request.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
