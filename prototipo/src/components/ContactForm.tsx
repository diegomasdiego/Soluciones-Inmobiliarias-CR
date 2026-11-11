import { useId, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ConvexError } from 'convex/values';
import { budgets, interests, ways, type InterestId } from '../data/leadOptions';
import { submitLead } from '../lib/data';
import { useLang } from '../lib/i18n';
import { IconCheck } from './Icons';

export type { InterestId };

type Props = {
  context?: string;
  defaultInterest?: InterestId;
  compact?: boolean;
  dark?: boolean;
  submitLabel?: string;
};

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function ContactForm({ context, defaultInterest = 'home', compact, dark, submitLabel }: Props) {
  const { lang, tx } = useLang();
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '', phone: '', interest: defaultInterest as string, budget: '', message: '', via: 'email' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'saved' | 'offline' | 'error' | 'rate'>('idle');
  const honeypot = useRef<HTMLInputElement>(null);
  const done = status === 'saved' || status === 'offline';
  // Sellers don't have a budget; they tell us about the property instead.
  const selling = values.interest === 'sell';

  const set = (k: keyof typeof values, v: string) => {
    setValues(s => ({ ...s, [k]: v }));
    if (k in errors) setErrors(e => ({ ...e, [k]: undefined }));
    if (status === 'error' || status === 'rate') setStatus('idle');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const err: Errors = {};
    if (!values.name.trim()) err.name = tx('Enter your name.', 'Escriba su nombre.');
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) err.email = tx('Enter an email like name@example.com.', 'Escriba un correo como nombre@ejemplo.com.');
    if (!compact && values.message.trim().length < 10) err.message = tx('Tell us a little more (at least 10 characters).', 'Cuéntenos un poco más (al menos 10 caracteres).');
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`${uid}-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const result = await submitLead({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        interest: values.interest,
        budget: selling ? undefined : values.budget || undefined,
        message: values.message || undefined,
        via: values.via,
        context,
        lang,
        page: window.location.hash || '#home',
        website: honeypot.current?.value || undefined,
      });
      setStatus(result);
    } catch (err) {
      setStatus(err instanceof ConvexError && err.data === 'rate' ? 'rate' : 'error');
    }
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
            {status === 'saved' ? (
              <>
                <h3>{tx(`Thank you, ${values.name.split(' ')[0]}. We received your request.`, `Gracias, ${values.name.split(' ')[0]}. Recibimos su solicitud.`)}</h3>
                <p>{tx(
                  `An advisor will reply by ${via.en.toLowerCase()} within one business day.`,
                  `Un asesor le responderá por ${via.es.toLowerCase()} en menos de un día hábil.`,
                )}</p>
              </>
            ) : (
              <>
                <h3>{tx(`Request ready, ${values.name.split(' ')[0]}.`, `Solicitud lista, ${values.name.split(' ')[0]}.`)}</h3>
                <p>{tx(
                  `On the live site this goes straight to an advisor, who replies by ${via.en.toLowerCase()} within one business day. This preview doesn’t send any data.`,
                  `En el sitio real esto le llega directo a un asesor, que le responde por ${via.es.toLowerCase()} en menos de un día hábil. Esta vista previa no envía ningún dato.`,
                )}</p>
              </>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => { setStatus('idle'); setValues(v => ({ ...v, message: '' })); }}>{tx('Write another request', 'Escribir otra solicitud')}</button>
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
            {!compact && !selling && (
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
                placeholder={selling
                  ? tx('Where the property is, its size, and when you would like to sell…', 'Dónde está la propiedad, su tamaño y cuándo le gustaría vender…')
                  : tx('Dates you can visit, questions about the property, your timeline…', 'Fechas en que puede visitar, preguntas sobre la propiedad, sus plazos…')}
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
            <div className="hp" aria-hidden="true">
              <label htmlFor={`${uid}-website`}>Website</label>
              <input ref={honeypot} id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {status === 'error' && (
              <p className="field-error" role="alert">{tx(
                'We couldn’t send your request. Check your connection and try again.',
                'No pudimos enviar su solicitud. Revise su conexión e intente de nuevo.',
              )}</p>
            )}
            {status === 'rate' && (
              <p className="field-error" role="alert">{tx(
                'We already received several requests from you. An advisor will contact you soon; you can also try again in an hour.',
                'Ya recibimos varias solicitudes suyas. Un asesor le contactará pronto; también puede intentarlo de nuevo en una hora.',
              )}</p>
            )}
            <button type="submit" className="btn btn-accent btn-block" disabled={status === 'sending'} aria-busy={status === 'sending'}>
              {status === 'sending' ? tx('Sending…', 'Enviando…') : submitLabel ?? tx('Send request', 'Enviar solicitud')}
            </button>
            <p className="cform-fine">{tx('We reply within one business day. Your details are used only to answer this request.', 'Respondemos en menos de un día hábil. Sus datos se usan solo para responder esta solicitud.')}</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
