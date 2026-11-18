// Client portal (#portal): what a signed-in client may read and do on their own deals.
// Every function checks the deal against the signed-in email (access.ts: dealFor); team members
// may use these too (they see every deal). Team-only functions live in portalTeam.ts.
import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { internalQuery, mutation, query, type MutationCtx } from './_generated/server';
import { dealFor, portalUser, type PortalUser } from './access';
import { CLIENT_DOC_CATEGORIES, docCategory } from './schema';

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const FILE_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
// Abuse limits for what clients can add (the team has none).
const CLIENT_MESSAGES_PER_HOUR = 20;
const CLIENT_FILES_PER_DAY = 30;
const CLIENT_TICKETS_PER_DAY = 10;
const NOTICE_GAP_MS = 30 * 60 * 1000;

export const clip = (s: string | undefined, max: number) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const clipText = (s: string, max: number) => s.replace(/\r\n/g, '\n').trim().slice(0, max);
const HOUR = 60 * 60 * 1000;

/** Records activity on a deal and schedules the right email: clients' actions to the team, the team's to the clients. */
export async function touch(ctx: MutationCtx, deal: Doc<'deals'>, who: PortalUser, what: 'message' | 'file' | 'ticket' | 'stage' | 'report') {
  const now = Date.now();
  if (who.team) {
    // One email per half hour at most, so a burst of changes sends a single notice.
    const notice = !deal.clientNoticeAt || deal.clientNoticeAt < now - NOTICE_GAP_MS;
    await ctx.db.patch(deal._id, { updatedAt: now, teamSeenAt: now, ...(notice ? { clientNoticeAt: now } : null) });
    if (notice) await ctx.scheduler.runAfter(60_000, internal.portalNotify.toClients, { dealId: deal._id });
  } else {
    await ctx.db.patch(deal._id, { updatedAt: now, clientActivityAt: now });
    await ctx.scheduler.runAfter(0, internal.portalNotify.toTeam, { dealId: deal._id, what, by: who.email });
  }
}

/** How many messages, files or tickets clients added to a deal since a moment. */
async function clientCount(ctx: MutationCtx, table: 'dealUpdates' | 'dealDocs' | 'tickets', dealId: Id<'deals'>, since: number) {
  const rows: { byClient: boolean }[] =
    table === 'dealUpdates' ? await ctx.db.query('dealUpdates').withIndex('by_deal', q => q.eq('dealId', dealId).gt('_creationTime', since)).collect()
    : table === 'dealDocs' ? await ctx.db.query('dealDocs').withIndex('by_deal', q => q.eq('dealId', dealId).gt('_creationTime', since)).collect()
    : await ctx.db.query('tickets').withIndex('by_deal', q => q.eq('dealId', dealId).gt('_creationTime', since)).collect();
  return rows.filter(r => r.byClient).length;
}

/** The signed-in person and the deals they can open. Null when signed out. */
export const me = query({
  args: {},
  handler: async ctx => {
    const who = await portalUser(ctx);
    if (!who) return null;
    const access = await ctx.db.query('dealAccess').withIndex('by_email', q => q.eq('email', who.email)).take(50);
    const deals = [];
    for (const a of access) {
      const d = await ctx.db.get(a.dealId);
      if (!d) continue;
      deals.push({
        _id: d._id, kind: d.kind, title: d.title, place: d.place, propertySlug: d.propertySlug,
        stage: d.stage, status: d.status, updatedAt: d.updatedAt,
        isNew: !a.seenAt || d.updatedAt > a.seenAt,
      });
    }
    deals.sort((a, b) => (a.status === b.status ? b.updatedAt - a.updatedAt : a.status === 'active' ? -1 : 1));
    return { email: who.email, team: who.team, deals };
  },
});

/** Everything about one deal that the client sees. Null when it doesn't exist or isn't theirs. */
export const deal = query({
  args: { id: v.id('deals') },
  handler: async (ctx, { id }) => {
    const who = await portalUser(ctx);
    let found;
    try { found = await dealFor(ctx, who, id); } catch { return null; }
    const { deal, access } = found;
    const [updates, docs, reports, tickets] = await Promise.all([
      ctx.db.query('dealUpdates').withIndex('by_deal', q => q.eq('dealId', id)).order('desc').take(300),
      ctx.db.query('dealDocs').withIndex('by_deal', q => q.eq('dealId', id)).order('desc').take(300),
      ctx.db.query('ownerReports').withIndex('by_deal_month', q => q.eq('dealId', id)).order('asc').take(120),
      ctx.db.query('tickets').withIndex('by_deal', q => q.eq('dealId', id)).order('desc').take(200),
    ]);
    // Clients don't get the team's bookkeeping fields or the team members' emails.
    const { clientNoticeAt, teamSeenAt, clientActivityAt, ...shown } = deal;
    const team = who!.team;
    return {
      deal: team ? deal : shown,
      updates: team ? updates : updates.map(u => (u.byClient ? u : { ...u, author: '' })),
      docs: docs.map(({ storageId, ...d }) => (team || d.byClient ? d : { ...d, uploadedBy: '' })),
      reports,
      tickets: team ? tickets : tickets.map(t => (t.byClient ? t : { ...t, openedBy: '' })),
      seenAt: who!.team ? deal.teamSeenAt ?? 0 : access?.seenAt ?? 0,
      team: who!.team,
    };
  },
});

/** Marks the deal as read by this person (clients: their access row; team: the deal). */
export const markSeen = mutation({
  args: { id: v.id('deals') },
  handler: async (ctx, { id }) => {
    const who = await portalUser(ctx);
    const { deal, access } = await dealFor(ctx, who, id);
    const now = Date.now();
    if (access) await ctx.db.patch(access._id, { seenAt: now });
    else if (who!.team) await ctx.db.patch(deal._id, { teamSeenAt: now });
  },
});

export const postUpdate = mutation({
  args: { id: v.id('deals'), text: v.string() },
  handler: async (ctx, { id, text }) => {
    const who = await portalUser(ctx);
    const { deal } = await dealFor(ctx, who, id);
    const clean = clipText(text, 2000);
    if (!clean) throw new ConvexError('empty');
    if (!who!.team && (await clientCount(ctx, 'dealUpdates', id, Date.now() - HOUR)) >= CLIENT_MESSAGES_PER_HOUR) throw new ConvexError('rate');
    await ctx.db.insert('dealUpdates', { dealId: id, author: who!.email, byClient: !who!.team, text: clean });
    await touch(ctx, deal, who!, 'message');
  },
});

/** A one-time upload URL (valid about an hour). The file only counts once attachDoc records it. */
export const uploadUrl = mutation({
  args: { id: v.id('deals') },
  handler: async (ctx, { id }) => {
    const who = await portalUser(ctx);
    await dealFor(ctx, who, id);
    if (!who!.team && (await clientCount(ctx, 'dealDocs', id, Date.now() - 24 * HOUR)) >= CLIENT_FILES_PER_DAY) throw new ConvexError('rate');
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Records an uploaded file on a deal. A rejected file is deleted and the reason returned instead of
 * thrown, because throwing would roll the deletion back with the rest of the mutation.
 */
export const attachDoc = mutation({
  args: { id: v.id('deals'), storageId: v.id('_storage'), name: v.string(), category: docCategory },
  handler: async (ctx, { id, storageId, name, category }): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (await ctx.db.query('dealDocs').withIndex('by_storage', q => q.eq('storageId', storageId)).first()) return { ok: false, error: 'duplicate' };
    const meta = await ctx.db.system.get(storageId);
    if (!meta) return { ok: false, error: 'not-found' };
    const reject = async (error: string) => { await ctx.storage.delete(storageId); return { ok: false as const, error }; };
    const who = await portalUser(ctx);
    if (!who) return { ok: false, error: 'unauthorized' };
    let deal: Doc<'deals'>;
    try { ({ deal } = await dealFor(ctx, who, id)); } catch { return reject('not-found'); }
    if (meta.size > MAX_FILE_BYTES) return reject('too-big');
    if (!meta.contentType || !FILE_TYPES.includes(meta.contentType)) return reject('file-type');
    if (!who!.team && !(CLIENT_DOC_CATEGORIES as readonly string[]).includes(category)) return reject('category');
    const clean = clip(name.replace(/[\\/:*?"<>|]+/g, ' '), 120) || 'documento';
    await ctx.db.insert('dealDocs', {
      dealId: id, storageId, name: clean, category, size: meta.size, contentType: meta.contentType,
      uploadedBy: who!.email, byClient: !who!.team,
    });
    await touch(ctx, deal, who!, 'file');
    return { ok: true };
  },
});

/** Managed properties: report something that needs fixing. */
export const openTicket = mutation({
  args: { id: v.id('deals'), title: v.string(), detail: v.optional(v.string()) },
  handler: async (ctx, { id, title, detail }) => {
    const who = await portalUser(ctx);
    const { deal } = await dealFor(ctx, who, id);
    if (deal.kind !== 'managed') throw new ConvexError('not-managed');
    const t = clip(title, 120);
    if (!t) throw new ConvexError('empty');
    if (!who!.team && (await clientCount(ctx, 'tickets', id, Date.now() - 24 * HOUR)) >= CLIENT_TICKETS_PER_DAY) throw new ConvexError('rate');
    await ctx.db.insert('tickets', {
      dealId: id, title: t, detail: clipText(detail ?? '', 2000) || undefined, status: 'open', openedBy: who!.email, byClient: !who!.team,
    });
    await touch(ctx, deal, who!, 'ticket');
  },
});

/** For the file download route (http.ts): the stored file, if this user may see its deal. */
export const fileFor = internalQuery({
  args: { docId: v.string() },
  handler: async (ctx, { docId }) => {
    const id = ctx.db.normalizeId('dealDocs', docId);
    if (!id) return null;
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    try {
      await dealFor(ctx, await portalUser(ctx), doc.dealId);
    } catch {
      return null;
    }
    return { storageId: doc.storageId, name: doc.name, contentType: doc.contentType };
  },
});
