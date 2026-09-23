import { useId, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '../lib/i18n';
import { IconCheck } from './Icons';

export type InterestId = 'home' | 'land' | 'invest' | 'sell' | 'build' | 'other';

type Props = {
  context?: string;
  defaultInterest?: InterestId;
  compact?: boolean;
  dark?: boolean;
  submitLabel?: string;
};

const interests: { id: InterestId; en: string; es: string }[] = [
  { id: 'home', en: 'Buying a home', es: 'Comprar una casa' },
  { id: 'land', en: 'Buying land or a farm', es: 'Comprar un lote o una finca' },
  { id: 'invest', en: 'Investing / rentals', es: 'Invertir / alquileres' },
  { id: 'sell', en: 'Selling my property', es: 'Vender mi propiedad' },
  { id: 'build', en: 'Land & Build (machinery)', es: 'Land & Build (maquinaria)' },
  { id: 'other', en: 'Something else', es: 'Otra consulta' },
];
const budgets = [
  { id: 'lt150', en: 'Under $150,000', es: 'Menos de $150.000' },
  { id: '150-300', en: '$150,000 – $300,000', es: '$150.000 – $300.000' },
  { id: '300-500', en: '$300,000 – $500,000', es: '$300.000 – $500.000' },
  { id: 'gt500', en: 'Over $500,000', es: 'Más de $500.000' },
];
const ways = [
  { id: 'email', en: 'Email', es: 'Correo' },
  { id: 'whatsapp', en: 'WhatsApp', es: 'WhatsApp' },
  { id: 'video', en: 'Video call', es: 'Videollamada' },
];

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function ContactForm({ context, defaultInterest = 'home', compact, dark, submitLabel }: Props) {
  const { lang, tx } = useLang();
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '', phone: '', interest: defaultInterest as string, budget: '', message: '', via: 'email' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof values, v: string) => {
    setValues(s => ({ ...s, [k]: v }));
    if (k in errors) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (!values.name.trim()) err.name = tx('Enter your name.', 'Escriba su nombre.');
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) err.email = tx('Enter an email like name@example.com.', 'Escriba un correo como nombre@ejemplo.com.');
    if (!compact && values.message.trim().length < 10) err.message = tx('Tell us a little more (at least 10 characters).', 'Cuéntenos un poco más (al menos 10 caracteres).');
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`${uid}-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setDone(true);
  };

  const field = (k: 'name' | 'email' | 'phone', label: string, type = 'text', optional = false) => {
    const error = errors[k as keyof Errors];
    return (
      <div className={`field ${error ? 'has-error' : ''}`}>
        <label htmlFor={`${uid}-${k}`}>{label}{optional && <span className="optional"> · {tx('optional', 'opcional')}</span>}</label>
        <input id={`${uid}-${k}`} type={type} value={values[k]} onChange={e => set(k, e.target.value)} autoComplete={k === 'phone' ? 'tel' : k} aria-invalid={!!error} aria-describedby={error ? `${uid}-${k}-err` : undefined} />
        {error && <span className="field-error" id={`${uid}-${k}-err`}>{error}</span>}
      </div>
    );
  };

  const via = ways.find(w => w.id === values.via)!;

  return (
    <div className={`cform ${dark ? 'cform-dark' : ''}`}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" className="cform-done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span className="cform-done-icon"><IconCheck size={22} /></span>
            <h3>{tx(`Request ready, ${values.name.split(' ')[0]}.`, `Solicitud lista, ${values.name.split(' ')[0]}.`)}</h3>
            <p>{tx(
              `On the live site this goes straight to an advisor, who replies by ${via.en.toLowerCase()} within one business day. This prototype doesn’t send any data.`,
              `En el sitio real esto le llega directo a un asesor, que le responde por ${via.es.toLowerCase()} en menos de un día hábil. Este prototipo no envía ningún dato.`,
            )}</p>
            <button type="button" className="btn btn-ghost" onClick={() => { setDone(false); setValues(v => ({ ...v, message: '' })); }}>{tx('Write another request', 'Escribir otra solicitud')}</button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {context && <p className="cform-context">{tx('About', 'Sobre')}: <strong>{context}</strong></p>}
            <div className="field-row">
              {field('name', tx('Your name', 'Su nombre'))}
              {field('email', tx('Email', 'Correo electrónico'), 'email')}
            </div>
            {!compact && (
              <div className="field-row">
                {field('phone', tx('Phone or WhatsApp', 'Teléfono o WhatsApp'), 'tel', true)}
                <div className="field">
                  <label htmlFor={`${uid}-interest`}>{tx('I’m interested in', 'Me interesa')}</label>
                  <select id={`${uid}-interest`} value={values.interest} onChange={e => set('interest', e.target.value)}>
                    {interests.map(i => <option key={i.id} value={i.id}>{i[lang]}</option>)}
                  </select>
                </div>
              </div>
            )}
            {!compact && (
              <div className="field">
                <label htmlFor={`${uid}-budget`}>{tx('Budget', 'Presupuesto')} <span className="optional">· {tx('optional', 'opcional')}</span></label>
                <select id={`${uid}-budget`} value={values.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="">{tx('Prefer not to say', 'Prefiero no decirlo')}</option>
                  {budgets.map(b => <option key={b.id} value={b.id}>{b[lang]}</option>)}
                </select>
              </div>
            )}
            <div className={`field ${errors.message ? 'has-error' : ''}`}>
              <label htmlFor={`${uid}-message`}>{tx('Message', 'Mensaje')}{compact && <span className="optional"> · {tx('optional', 'opcional')}</span>}</label>
              <textarea
                id={`${uid}-message`}
                rows={compact ? 3 : 5}
                value={values.message}
                onChange={e => set('message', e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? `${uid}-message-err` : undefined}
                placeholder={tx('Dates you can visit, questions about the property, your timeline…', 'Fechas en que puede visitar, preguntas sobre la propiedad, sus plazos…')}
              />
              {errors.message && <span className="field-error" id={`${uid}-message-err`}>{errors.message}</span>}
            </div>
            <fieldset className="field">
              <legend>{tx('Best way to reach you', 'Medio de contacto preferido')}</legend>
              <div className="radio-row">
                {ways.map(w => (
                  <label key={w.id} className={`radio ${values.via === w.id ? 'is-on' : ''}`}>
                    <input type="radio" name={`${uid}-via`} value={w.id} checked={values.via === w.id} onChange={() => set('via', w.id)} />
                    {w[lang]}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="btn btn-accent btn-block">{submitLabel ?? tx('Send request', 'Enviar solicitud')}</button>
            <p className="cform-fine">{tx('We reply within one business day. Your details are used only to answer this request.', 'Respondemos en menos de un día hábil. Sus datos se usan solo para responder esta solicitud.')}</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
