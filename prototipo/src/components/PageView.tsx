'use client';
// The view for a public route. The server page (app/[lang]/(site)/[[...path]]) decides the route
// and draws this with it, so the HTML that reaches search engines already has the content.
import type { Route } from '../lib/routes';
import Home from '../views/Home';
import Search from '../views/Search';
import Property from '../views/Property';
import Calculator from '../views/Calculator';
import Build from '../views/Build';
import Contact from '../views/Contact';
import Projects from '../views/Projects';
import Project from '../views/Project';
import Sell from '../views/Sell';
import About from '../views/About';
import Saved from '../views/Saved';
import Guides from '../views/Guides';
import Guide from '../views/Guide';

export function PageView({ route }: { route: Route }) {
  switch (route.name) {
    case 'search': return <Search />;
    case 'property': return <Property slug={route.slug} />;
    case 'calculator': return <Calculator slug={route.slug} key={route.slug ?? 'calc'} />;
    case 'build': return <Build />;
    case 'contact': return <Contact topic={route.topic} />;
    case 'projects': return <Projects />;
    case 'project': return <Project slug={route.slug} />;
    case 'sell': return <Sell />;
    case 'about': return <About />;
    case 'saved': return <Saved shared={route.shared} key={route.shared?.join(',') ?? 'mine'} />;
    case 'guides': return <Guides />;
    case 'guide': return <Guide slug={route.slug} />;
    default: return <Home />;
  }
}
