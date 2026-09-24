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

function Page() {
  const { route } = useRouter();
  switch (route.name) {
    case 'search': return <Search />;
    case 'property': return <Property slug={route.slug} />;
    case 'calculator': return <Calculator slug={route.slug} key={route.slug ?? 'calc'} />;
    case 'build': return <Build />;
    case 'contact': return <Contact topic={route.topic} />;
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

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <DataProvider>
        <StoreProvider>
          <RouterProvider>
            <SkipLink />
            <Header />
            <main id="main" tabIndex={-1}>
              <Page />
            </main>
            <Footer />
            <Toast />
            <Cursor />
          </RouterProvider>
        </StoreProvider>
        </DataProvider>
      </LangProvider>
    </MotionConfig>
  );
}
