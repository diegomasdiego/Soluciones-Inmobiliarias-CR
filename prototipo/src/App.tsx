import { lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import { DataProvider } from './lib/data';
import { LangProvider, useLang } from './lib/i18n';
import { RouterProvider, useRouter } from './lib/router';
import { StoreProvider } from './lib/store';
import { Cursor, Footer, Header, Toast } from './components/Chrome';
import Home from './pages/Home';
import Search from './pages/Search';
import Property from './pages/Property';
import Calculator from './pages/Calculator';
import Build from './pages/Build';
import Contact from './pages/Contact';
import Projects from './pages/Projects';
import Project from './pages/Project';
import Sell from './pages/Sell';
import About from './pages/About';

// Team panel: its own chunk, so visitors never download it.
const Panel = lazy(() => import('./pages/Panel'));

function Page() {
  const { route } = useRouter();
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
    default: return <Home />;
  }
}

function SkipLink() {
  const { tx } = useLang();
  return (
    <a href="#main" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
      {tx('Skip to content', 'Saltar al contenido')}
    </a>
  );
}

function Layout() {
  const { route } = useRouter();
  if (route.name === 'panel') {
    return (
      <Suspense fallback={<div className="panel-loading" aria-busy="true" />}>
        <Panel />
      </Suspense>
    );
  }
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1}>
        <Page />
      </main>
      <Footer />
      <Toast />
      <Cursor />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <DataProvider>
        <StoreProvider>
          <RouterProvider>
            <Layout />
          </RouterProvider>
        </StoreProvider>
        </DataProvider>
      </LangProvider>
    </MotionConfig>
  );
}
