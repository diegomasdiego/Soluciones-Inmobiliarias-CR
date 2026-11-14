// Per-page title, meta description and JSON-LD for content pages (guides).
// With hash routing, search engines still see one URL; this pays off fully after the move to real
// routes (COD-18), but the title and structured data already help sharing and crawlers that run JS.
import { useEffect } from 'react';

export function useSeo(title: string, description: string, jsonLd?: object) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content;
    document.title = title;
    if (meta) meta.content = description;
    let script: HTMLScriptElement | null = null;
    if (ld) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = ld;
      document.head.appendChild(script);
    }
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc != null) meta.content = prevDesc;
      script?.remove();
    };
  }, [title, description, ld]);
}
