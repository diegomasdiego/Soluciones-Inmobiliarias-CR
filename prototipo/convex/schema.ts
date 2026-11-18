// Convex database schema for Soluciones Inmobiliarias CR.
import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const leadStatus = v.union(v.literal('new'), v.literal('contacted'), v.literal('closed'));

// Client portal. Labels live in src/data/portal.ts.
export const dealKind = v.union(v.literal('purchase'), v.literal('managed'));
export const DOC_CATEGORIES = ['offer', 'study', 'escrow', 'signing', 'registration', 'identity', 'funds', 'contract', 'report', 'invoice', 'other'] as const;
/** What a client may upload; the team may use any category. */
export const CLIENT_DOC_CATEGORIES = ['identity', 'funds', 'other'] as const;
export const docCategory = v.union(...DOC_CATEGORIES.map(c => v.literal(c)));
export const ticketStatus = v.union(v.literal('open'), v.literal('scheduled'), v.literal('done'));

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
  // Team sign-in (Convex Auth): users, accounts, sessions, codes. Only emails in ADMIN_EMAILS get in.
  ...authTables,

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
    status: leadStatus,
    // When the team was emailed about this request (unset if notifications are off or failed).
    notifiedAt: v.optional(v.number()),
    // Last status change from the team panel: when and by whom (email).
    statusAt: v.optional(v.number()),
    statusBy: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_email', ['email']),

  // Follow-up notes the team writes on a request in the panel.
  leadNotes: defineTable({
    leadId: v.id('leads'),
    author: v.string(),
    text: v.string(),
  }).index('by_lead', ['leadId']),

  // AI search answers (convex/ai.ts). `key` is a hash of the question, page language, model and
  // listings, so the visitor's text itself is not stored. Reused for 24 h; also counted for the limits.
  aiSearches: defineTable({
    key: v.string(),
    result: v.optional(v.string()), // JSON answer; unset while the model works or when it failed
  }).index('by_key', ['key']),

  // Model calls per Costa Rica calendar day, for the daily limit.
  aiUsage: defineTable({ day: v.string(), count: v.number() }).index('by_day', ['day']),

  // ---- Client portal (#portal). A "deal" is a purchase in progress or a property the company
  // manages for its owner. Clients see only the deals their email is on (dealAccess).
  deals: defineTable({
    kind: dealKind,
    title: v.string(),
    place: v.string(),
    propertySlug: v.optional(v.string()),
    clientName: v.string(),
    /** Language for the emails to the client. */
    lang: v.union(v.literal('en'), v.literal('es')),
    advisor: v.string(),
    priceUsd: v.optional(v.number()),
    /** Purchase: amount held in escrow. */
    depositUsd: v.optional(v.number()),
    /** Managed property: expected monthly rent. */
    rentUsd: v.optional(v.number()),
    /** Purchase: index of the current stage (0 offer … 4 registration, 5 = finished). */
    stage: v.number(),
    /** Purchase: one date per stage (YYYY-MM-DD, '' when unknown): done on, or expected by. */
    stageDates: v.array(v.string()),
    status: v.union(v.literal('active'), v.literal('closed')),
    updatedAt: v.number(),
    clientActivityAt: v.optional(v.number()),
    teamSeenAt: v.optional(v.number()),
    clientNoticeAt: v.optional(v.number()),
  }).index('by_updated', ['updatedAt']),

  dealAccess: defineTable({
    dealId: v.id('deals'),
    email: v.string(),
    /** When this person last opened the deal, to mark what is new. */
    seenAt: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_deal', ['dealId']),

  dealUpdates: defineTable({
    dealId: v.id('deals'),
    author: v.string(),
    byClient: v.boolean(),
    text: v.string(),
  }).index('by_deal', ['dealId']),

  dealDocs: defineTable({
    dealId: v.id('deals'),
    storageId: v.id('_storage'),
    name: v.string(),
    category: docCategory,
    size: v.number(),
    contentType: v.string(),
    uploadedBy: v.string(),
    byClient: v.boolean(),
  })
    .index('by_deal', ['dealId'])
    .index('by_storage', ['storageId']),

  ownerReports: defineTable({
    dealId: v.id('deals'),
    month: v.string(), // YYYY-MM
    incomeUsd: v.number(),
    feeUsd: v.number(),
    maintenanceUsd: v.number(),
    otherUsd: v.number(),
    nights: v.optional(v.number()),
    note: v.optional(v.string()),
  }).index('by_deal_month', ['dealId', 'month']),

  tickets: defineTable({
    dealId: v.id('deals'),
    title: v.string(),
    detail: v.optional(v.string()),
    status: ticketStatus,
    costUsd: v.optional(v.number()),
    scheduledFor: v.optional(v.string()), // YYYY-MM-DD
    openedBy: v.string(),
    byClient: v.boolean(),
    closedAt: v.optional(v.number()),
  }).index('by_deal', ['dealId']),
});
