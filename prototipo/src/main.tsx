import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/projects.css';
import './styles/sell.css';
import './styles/about.css';
import './styles/saved.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
