// Data layer. With VITE_CONVEX_URL set, listings come live from Convex and form requests are saved there.
// Without it (local preview, the published artifact) the site uses the bundled sample listings.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { properties as samples, type Property } from '../data/properties';

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = url ? new ConvexReactClient(url) : null;

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
const loadingData = build(samples, 'loading');

const DataCtx = createContext<Data>(sampleData);

function LiveData({ children }: { children: ReactNode }) {
  const remote = useQuery(api.properties.list) as Property[] | undefined;
  const value = useMemo(() => {
    if (remote === undefined) return loadingData;
    return remote.length ? build(remote, 'database') : sampleData;
  }, [remote]);
  // Visible in dev tools as <html data-listings="database">, handy to confirm where listings come from.
  useEffect(() => { document.documentElement.dataset.listings = value.source; }, [value.source]);
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function DataProvider({ children }: { children: ReactNode }) {
  if (!convex) return <DataCtx.Provider value={sampleData}>{children}</DataCtx.Provider>;
  return (
    <ConvexProvider client={convex}>
      <LiveData>{children}</LiveData>
    </ConvexProvider>
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

/** Saves a form request. Returns 'offline' when the site runs without a database. */
export async function submitLead(lead: LeadInput): Promise<'saved' | 'offline'> {
  if (!convex) return 'offline';
  await convex.mutation(api.leads.create, lead);
  return 'saved';
}
