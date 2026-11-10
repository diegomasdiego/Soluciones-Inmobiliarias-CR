// Team panel (#panel): read and follow up on requests. Every function that touches leads checks
// the signed-in user against ADMIN_EMAILS (requireTeam), so leads stay unreadable without signing in.
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireTeam, teamMember } from './access';
import { emailEnabled } from './mail';
import { leadStatus } from './schema';

const LIST_LIMIT = 500;
const COUNT_CAP = 999;

/** Which sign-in methods this deployment has configured, so the sign-in screen can explain the missing ones. */
export const methods = query({
  args: {},
  handler: async () => ({
    email: emailEnabled(),
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  }),
});

/** The signed-in person and whether they are on the team list. Null when signed out. */
export const me = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const member = await teamMember(ctx);
    if (member) return { allowed: true, email: member.email, name: member.name };
    const user = await ctx.db.get(userId);
    return { allowed: false, email: user?.email ?? null, name: null };
  },
});

/** Requests, newest first, optionally by status and received since a date (ms). */
export const leads = query({
  args: { status: v.optional(leadStatus), since: v.optional(v.number()) },
  handler: async (ctx, { status, since = 0 }) => {
    await requireTeam(ctx);
    const rows = status
      ? await ctx.db
          .query('leads')
          .withIndex('by_status', q => q.eq('status', status).gte('_creationTime', since))
          .order('desc')
          .take(LIST_LIMIT + 1)
      : await ctx.db
          .query('leads')
          .withIndex('by_creation_time', q => q.gte('_creationTime', since))
          .order('desc')
          .take(LIST_LIMIT + 1);
    return { leads: rows.slice(0, LIST_LIMIT), more: rows.length > LIST_LIMIT };
  },
});

/** How many requests are in each status (capped at 999 each). */
export const counts = query({
  args: {},
  handler: async ctx => {
    await requireTeam(ctx);
    const count = async (status: 'new' | 'contacted' | 'closed') =>
      (await ctx.db.query('leads').withIndex('by_status', q => q.eq('status', status)).take(COUNT_CAP)).length;
    const [n, contacted, closed] = await Promise.all([count('new'), count('contacted'), count('closed')]);
    return { new: n, contacted, closed, cap: COUNT_CAP };
  },
});

/** One request with its notes (newest first). */
export const lead = query({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await requireTeam(ctx);
    const lead = await ctx.db.get(id);
    if (!lead) return null;
    const notes = await ctx.db
      .query('leadNotes')
      .withIndex('by_lead', q => q.eq('leadId', id))
      .order('desc')
      .take(200);
    return { lead, notes };
  },
});

export const setStatus = mutation({
  args: { id: v.id('leads'), status: leadStatus },
  handler: async (ctx, { id, status }) => {
    const member = await requireTeam(ctx);
    const lead = await ctx.db.get(id);
    if (!lead) throw new ConvexError('not-found');
    if (lead.status === status) return;
    await ctx.db.patch(id, { status, statusAt: Date.now(), statusBy: member.email });
  },
});

export const addNote = mutation({
  args: { id: v.id('leads'), text: v.string() },
  handler: async (ctx, { id, text }) => {
    const member = await requireTeam(ctx);
    const clean = text.trim().slice(0, 2000);
    if (!clean) throw new ConvexError('empty');
    if (!(await ctx.db.get(id))) throw new ConvexError('not-found');
    await ctx.db.insert('leadNotes', { leadId: id, author: member.email, text: clean });
  },
});
