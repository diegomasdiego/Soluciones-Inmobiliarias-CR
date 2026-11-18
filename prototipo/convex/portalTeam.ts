// Client portal, team side (#panel → Clients): create deals, give clients access, move a purchase
// through its stages, and keep owners' monthly reports and maintenance up to date.
// Every function requires a team member (ADMIN_EMAILS).
import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { mutation, query, type MutationCtx } from './_generated/server';
import { normalizeEmail, requireTeam } from './access';
import { clip, touch } from './portal';
import { dealKind, ticketStatus } from './schema';

const STAGES = 5;
const MAX_PEOPLE = 6;

const money = (n: number | undefined) => (n === undefined || !Number.isFinite(n) || n < 0 ? undefined : Math.round(n * 100) / 100);
const isoDate = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '');

function cleanEmails(list: string[]) {
  const out = [...new Set(list.map(normalizeEmail).filter(Boolean))];
  for (const e of out) if (!/^\S+@\S+\.\S+$/.test(e) || e.length > 200) throw new ConvexError('email');
  if (out.length === 0) throw new ConvexError('no-email');
  if (out.length > MAX_PEOPLE) throw new ConvexError('too-many');
  return out;
}

/** Replaces who can see a deal; newly added people get an invitation email. */
async function writeAccess(ctx: MutationCtx, dealId: Id<'deals'>, emails: string[]) {
  const current = await ctx.db.query('dealAccess').withIndex('by_deal', q => q.eq('dealId', dealId)).collect();
  for (const row of current) if (!emails.includes(row.email)) await ctx.db.delete(row._id);
  const added = emails.filter(e => !current.some(r => r.email === e));
  for (const email of added) await ctx.db.insert('dealAccess', { dealId, email });
  if (added.length) await ctx.scheduler.runAfter(0, internal.portalNotify.invite, { dealId, emails: added });
}

const details = {
  title: v.string(),
  place: v.string(),
  propertySlug: v.optional(v.string()),
  clientName: v.string(),
  lang: v.union(v.literal('en'), v.literal('es')),
  advisor: v.string(),
  priceUsd: v.optional(v.number()),
  depositUsd: v.optional(v.number()),
  rentUsd: v.optional(v.number()),
};

function cleanDetails(a: { title: string; place: string; propertySlug?: string; clientName: string; lang: 'en' | 'es'; advisor: string; priceUsd?: number; depositUsd?: number; rentUsd?: number }) {
  const title = clip(a.title, 120);
  const clientName = clip(a.clientName, 120);
  if (!title || !clientName) throw new ConvexError('empty');
  return {
    title,
    place: clip(a.place, 120),
    propertySlug: clip(a.propertySlug, 120) || undefined,
    clientName,
    lang: a.lang,
    advisor: clip(a.advisor, 120),
    priceUsd: money(a.priceUsd),
    depositUsd: money(a.depositUsd),
    rentUsd: money(a.rentUsd),
  };
}

/** Every deal, most recently changed first, with who can see it and whether the client did something new. */
export const list = query({
  args: {},
  handler: async ctx => {
    await requireTeam(ctx);
    const deals = await ctx.db.query('deals').withIndex('by_updated').order('desc').take(300);
    return Promise.all(deals.map(async d => ({
      ...d,
      emails: (await ctx.db.query('dealAccess').withIndex('by_deal', q => q.eq('dealId', d._id)).collect()).map(a => ({ email: a.email, seenAt: a.seenAt })),
      unread: !!d.clientActivityAt && d.clientActivityAt > (d.teamSeenAt ?? 0),
    })));
  },
});

export const create = mutation({
  args: { kind: dealKind, emails: v.array(v.string()), ...details },
  handler: async (ctx, a) => {
    await requireTeam(ctx);
    const emails = cleanEmails(a.emails);
    const now = Date.now();
    const id = await ctx.db.insert('deals', {
      kind: a.kind,
      ...cleanDetails(a),
      stage: 0,
      stageDates: Array(STAGES).fill(''),
      status: 'active',
      updatedAt: now,
      teamSeenAt: now,
    });
    await writeAccess(ctx, id, emails);
    return id;
  },
});

export const update = mutation({
  args: { id: v.id('deals'), emails: v.array(v.string()), ...details },
  handler: async (ctx, { id, emails, ...a }) => {
    await requireTeam(ctx);
    if (!(await ctx.db.get(id))) throw new ConvexError('not-found');
    const clean = cleanEmails(emails);
    await ctx.db.patch(id, { ...cleanDetails(a), updatedAt: Date.now() });
    await writeAccess(ctx, id, clean);
  },
});

/** Purchase: the current stage (0–4, or 5 when finished) and one date per stage. */
export const setStage = mutation({
  args: { id: v.id('deals'), stage: v.number(), stageDates: v.array(v.string()) },
  handler: async (ctx, { id, stage, stageDates }) => {
    const member = await requireTeam(ctx);
    const deal = await ctx.db.get(id);
    if (!deal) throw new ConvexError('not-found');
    if (!Number.isInteger(stage) || stage < 0 || stage > STAGES) throw new ConvexError('stage');
    const dates = Array.from({ length: STAGES }, (_, i) => isoDate(stageDates[i] ?? ''));
    await ctx.db.patch(id, { stage, stageDates: dates });
    await touch(ctx, deal, { ...member, team: true }, 'stage');
  },
});

export const setStatus = mutation({
  args: { id: v.id('deals'), status: v.union(v.literal('active'), v.literal('closed')) },
  handler: async (ctx, { id, status }) => {
    await requireTeam(ctx);
    if (!(await ctx.db.get(id))) throw new ConvexError('not-found');
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

/** Managed property: adds or replaces the report for a month. */
export const saveReport = mutation({
  args: {
    id: v.id('deals'), month: v.string(),
    incomeUsd: v.number(), feeUsd: v.number(), maintenanceUsd: v.number(), otherUsd: v.number(),
    nights: v.optional(v.number()), note: v.optional(v.string()),
  },
  handler: async (ctx, { id, month, ...r }) => {
    const member = await requireTeam(ctx);
    const deal = await ctx.db.get(id);
    if (!deal || deal.kind !== 'managed') throw new ConvexError('not-found');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new ConvexError('month');
    const row = {
      incomeUsd: money(r.incomeUsd) ?? 0,
      feeUsd: money(r.feeUsd) ?? 0,
      maintenanceUsd: money(r.maintenanceUsd) ?? 0,
      otherUsd: money(r.otherUsd) ?? 0,
      nights: r.nights !== undefined && Number.isInteger(r.nights) && r.nights >= 0 && r.nights <= 31 ? r.nights : undefined,
      note: clip(r.note, 300) || undefined,
    };
    const existing = await ctx.db.query('ownerReports').withIndex('by_deal_month', q => q.eq('dealId', id).eq('month', month)).unique();
    if (existing) await ctx.db.replace(existing._id, { dealId: id, month, ...row });
    else await ctx.db.insert('ownerReports', { dealId: id, month, ...row });
    await touch(ctx, deal, { ...member, team: true }, 'report');
  },
});

export const removeReport = mutation({
  args: { reportId: v.id('ownerReports') },
  handler: async (ctx, { reportId }) => {
    await requireTeam(ctx);
    if (await ctx.db.get(reportId)) await ctx.db.delete(reportId);
  },
});

export const setTicket = mutation({
  args: { ticketId: v.id('tickets'), status: ticketStatus, costUsd: v.optional(v.number()), scheduledFor: v.optional(v.string()) },
  handler: async (ctx, { ticketId, status, costUsd, scheduledFor }) => {
    const member = await requireTeam(ctx);
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new ConvexError('not-found');
    const deal = await ctx.db.get(ticket.dealId);
    if (!deal) throw new ConvexError('not-found');
    await ctx.db.patch(ticketId, {
      status,
      costUsd: money(costUsd),
      scheduledFor: scheduledFor ? isoDate(scheduledFor) || undefined : undefined,
      closedAt: status === 'done' ? ticket.closedAt ?? Date.now() : undefined,
    });
    await touch(ctx, deal, { ...member, team: true }, 'ticket');
  },
});

export const removeDoc = mutation({
  args: { docId: v.id('dealDocs') },
  handler: async (ctx, { docId }) => {
    await requireTeam(ctx);
    const doc = await ctx.db.get(docId);
    if (!doc) return;
    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(docId);
  },
});

export const removeUpdate = mutation({
  args: { updateId: v.id('dealUpdates') },
  handler: async (ctx, { updateId }) => {
    await requireTeam(ctx);
    if (await ctx.db.get(updateId)) await ctx.db.delete(updateId);
  },
});

/** Deletes a deal with its access, messages, files (and stored files), reports and tickets. */
export const remove = mutation({
  args: { id: v.id('deals') },
  handler: async (ctx, { id }) => {
    await requireTeam(ctx);
    if (!(await ctx.db.get(id))) return;
    for (const r of await ctx.db.query('dealAccess').withIndex('by_deal', q => q.eq('dealId', id)).collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query('dealUpdates').withIndex('by_deal', q => q.eq('dealId', id)).collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query('dealDocs').withIndex('by_deal', q => q.eq('dealId', id)).collect()) {
      await ctx.storage.delete(r.storageId);
      await ctx.db.delete(r._id);
    }
    for (const r of await ctx.db.query('ownerReports').withIndex('by_deal_month', q => q.eq('dealId', id)).collect()) await ctx.db.delete(r._id);
    for (const r of await ctx.db.query('tickets').withIndex('by_deal', q => q.eq('dealId', id)).collect()) await ctx.db.delete(r._id);
    await ctx.db.delete(id);
  },
});
