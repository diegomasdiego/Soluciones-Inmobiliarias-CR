// Convex database schema for Soluciones Inmobiliarias CR.
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const propertyType = v.union(v.literal('House'), v.literal('Condo'), v.literal('Lot'), v.literal('Farm'), v.literal('Commercial'), v.literal('Pre-sale'));
export const area = v.union(v.literal('Escazú'), v.literal('Santa Ana'), v.literal('Mora'), v.literal('Belén'), v.literal('Heredia'), v.literal('Alajuela'));

const nearby = v.object({
  name: v.string(),
  minutes: v.number(),
  kind: v.union(v.literal('school'), v.literal('shopping'), v.literal('health'), v.literal('airport'), v.literal('road'), v.literal('nature'), v.literal('town'), v.literal('work')),
});
const room = v.object({ name: v.string(), x: v.number(), y: v.number(), w: v.number(), h: v.number(), dims: v.optional(v.string()) });
const hotspot = v.object({ x: v.number(), y: v.number(), photo: v.number(), label: v.string() });

/** Fields of a listing (mirrors the Property type in src/data/properties.ts). */
export const propertyFields = {
  slug: v.string(),
  title: v.string(),
  type: propertyType,
  area,
  district: v.string(),
  canton: v.string(),
  province: v.union(v.literal('San José'), v.literal('Heredia'), v.literal('Alajuela')),
  lat: v.number(),
  lng: v.number(),
  priceUsd: v.number(),
  priceNote: v.optional(v.string()),
  beds: v.optional(v.number()),
  baths: v.optional(v.number()),
  builtM2: v.optional(v.number()),
  lotM2: v.optional(v.number()),
  parking: v.optional(v.number()),
  yearBuilt: v.optional(v.number()),
  hoaUsd: v.number(),
  rentUsd: v.optional(v.number()),
  pool: v.optional(v.boolean()),
  view: v.optional(v.boolean()),
  headline: v.string(),
  description: v.string(),
  features: v.array(v.string()),
  photos: v.array(v.string()),
  tour: v.optional(v.boolean()),
  plan: v.optional(v.object({ rooms: v.array(room), hotspots: v.array(hotspot) })),
  legal: v.object({ title: v.string(), folio: v.string(), plano: v.string(), zoning: v.string(), checked: v.string() }),
  advisor: v.string(),
  nearby: v.array(nearby),
  buildReady: v.optional(v.string()),
  // Spanish text; English lives in the fields above.
  es: v.optional(v.object({
    headline: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    legalTitle: v.string(),
    zoning: v.string(),
    buildReady: v.optional(v.string()),
  })),
  // Display order on the site (lower first) and whether the listing is live.
  order: v.number(),
  published: v.boolean(),
};

export default defineSchema({
  properties: defineTable(propertyFields)
    .index('by_slug', ['slug'])
    .index('by_published_order', ['published', 'order']),

  // Requests from the contact, visit and Land & Build quote forms.
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    interest: v.string(),
    budget: v.optional(v.string()),
    message: v.optional(v.string()),
    via: v.string(),
    context: v.optional(v.string()),
    lang: v.union(v.literal('en'), v.literal('es')),
    page: v.string(),
    status: v.union(v.literal('new'), v.literal('contacted'), v.literal('closed')),
  }).index('by_status', ['status']),
});
