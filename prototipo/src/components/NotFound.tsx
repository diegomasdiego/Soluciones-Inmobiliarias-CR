'use client';
import { useLang } from '../lib/i18n';
import { Link } from '../lib/router';
import { IconArrow } from './Icons';

/** "Page not found", in the visitor's language, with the way back. */
export function NotFound() {
  const { tx } = useLang();
  return (
    <section className="section not-found">
      <div className="wrap">
        <p className="eyebrow">404</p>
        <h1 className="h2">{tx('We could not find that page.', 'No encontramos esa página.')}</h1>
        <p className="lead">{tx('It may have moved, or the property is no longer listed.', 'Puede que se haya movido, o que la propiedad ya no esté publicada.')}</p>
        <div className="not-found-links">
          <Link to={{ name: 'search' }} className="btn btn-accent">{tx('See properties for sale', 'Ver propiedades en venta')} <IconArrow size={18} /></Link>
          <Link to={{ name: 'home' }} className="btn btn-ghost">{tx('Go to the home page', 'Ir al inicio')}</Link>
        </div>
      </div>
    </section>
  );
}
