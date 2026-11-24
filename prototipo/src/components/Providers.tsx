'use client';
// Everything the views share in the browser: language (from the URL), listings (live from
// Convex, starting with what the server drew) and the app state (currency, saved, search).
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import type { Property } from '../data/properties';
import { DataProvider } from '../lib/data';
import { LangProvider } from '../lib/i18n';
import type { Lang } from '../lib/lang';
import { StoreProvider } from '../lib/store';

export function Providers({ lang, listings, children }: { lang: Lang; listings: { properties: Property[]; source: 'sample' | 'database' }; children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider lang={lang}>
        <DataProvider initial={listings}>
          <StoreProvider>{children}</StoreProvider>
        </DataProvider>
      </LangProvider>
    </MotionConfig>
  );
}
