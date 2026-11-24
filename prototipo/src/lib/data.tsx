'use client';
// Data layer in the browser. The server draws each page with the listings it read from Convex
// (lib/listings.ts) and hands them over as `initial`; here they stay live through a Convex
// subscription. Without NEXT_PUBLIC_CONVEX_URL the site uses the bundled sample listings.
// ConvexAuthProvider carries the sign-in for the team panel and the client portal.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { AiSearchResult } from '../../convex/ai';
import { properties as samples, type Property } from '../data/properties';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;
export const hasDatabase = convex !== null;
/** Base URL of the deployment's HTTP routes (convex/http.ts), e.g. portal file downloads. */
export const convexSiteUrl = url ? url.replace(/\.convex\.cloud\/?$/, '.convex.site') : '';

type Data = {
  properties: Property[];
  bySlug: (slug: string) => Property | undefined;
  source: 'sample' | 'loading' | 'database';
};

function build(list: Property[], source: Data['source']): Data {
  const map = new Map(list.map(p => [p.slug, p]));
  return { properties: list, bySlug: slug => map.get(slug), source };
}
const sampleData = build(samples, 'sample');

const DataCtx = createContext<Data>(sampleData);

function LiveData({ initial, children }: { initial: Data; children: ReactNode }) {
  const remote = useQuery(api.properties.list) as Property[] | undefined;
  const value = useMemo(() => {
    if (remote === undefined) return initial;
    return remote.length ? build(remote, 'database') : sampleData;
  }, [remote, initial]);
  // Visible in dev tools as <html data-listings="database">, handy to confirm where listings come from.
  useEffect(() => { document.documentElement.dataset.listings = value.source; }, [value.source]);
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function DataProvider({ initial, children }: { initial?: { properties: Property[]; source: 'sample' | 'database' }; children: ReactNode }) {
  const first = useMemo(() => (initial ? build(initial.properties, initial.source) : sampleData), [initial]);
  if (!convex) return <DataCtx.Provider value={first}>{children}</DataCtx.Provider>;
  return (
    <ConvexAuthProvider client={convex}>
      <LiveData initial={first}>{children}</LiveData>
    </ConvexAuthProvider>
  );
}

export const useProperties = () => useContext(DataCtx);

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  interest: string;
  budget?: string;
  message?: string;
  via: string;
  context?: string;
  lang: 'en' | 'es';
  page: string;
  website?: string;
};

/** Asks the AI search (convex/ai.ts) to read a query. 'off' without a database or a model key. */
export async function aiSearch(q: string, lang: 'en' | 'es'): Promise<AiSearchResult> {
  if (!convex) return { status: 'off' };
  return convex.action(api.ai.search, { q, lang });
}

/** Saves a form request. Returns 'offline' when the site runs without a database. */
export async function submitLead(lead: LeadInput): Promise<'saved' | 'offline'> {
  if (!convex) return 'offline';
  await convex.mutation(api.leads.create, lead);
  return 'saved';
}
