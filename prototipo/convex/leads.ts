import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, internalQuery, mutation } from './_generated/server';

const clip = (s: string | undefined, max: number) => (s ?? '').trim().slice(0, max);

// Abuse limits for the public form endpoint.
const PER_EMAIL_PER_HOUR = 3;
const SITE_WIDE_PER_MINUTE = 20;

/**
 * Saves a request from any form on the site and schedules the email to the team.
 * Public on purpose (visitors are anonymous), so it validates and trims everything,
 * ignores submissions that fill the honeypot field and rate-limits repeated sends.
 * Leads are readable only by signed-in team members, through the panel functions in team.ts.
 */
export const create = mutation({
  args: {
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
    website: v.optional(v.string()), // honeypot: real visitors never fill it
  },
  handler: async (ctx, a) => {
    if (a.website) return null;
    const name = clip(a.name, 120).replace(/\s+/g, ' ');
    const email = clip(a.email, 200).toLowerCase();
    if (!name) throw new ConvexError('name');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ConvexError('email');

    const now = Date.now();
    const sameEmail = await ctx.db
      .query('leads')
      .withIndex('by_email', q => q.eq('email', email).gt('_creationTime', now - 60 * 60 * 1000))
      .take(PER_EMAIL_PER_HOUR);
    if (sameEmail.length >= PER_EMAIL_PER_HOUR) throw new ConvexError('rate');
    const recent = await ctx.db.query('leads').order('desc').take(SITE_WIDE_PER_MINUTE);
    if (recent.length >= SITE_WIDE_PER_MINUTE && recent[recent.length - 1]._creationTime > now - 60 * 1000) {
      throw new ConvexError('rate');
    }

    const id = await ctx.db.insert('leads', {
      name,
      email,
      phone: clip(a.phone, 40) || undefined,
      interest: clip(a.interest, 40),
      budget: clip(a.budget, 40) || undefined,
      message: clip(a.message, 4000) || undefined,
      via: clip(a.via, 20),
      context: clip(a.context, 300) || undefined,
      lang: a.lang,
      page: clip(a.page, 120),
      status: 'new',
    });
    await ctx.scheduler.runAfter(0, internal.notify.newLead, { leadId: id });
    return id;
  },
});

export const get = internalQuery({
  args: { id: v.id('leads') },
  handler: (ctx, { id }) => ctx.db.get(id),
});

export const markNotified = internalMutation({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { notifiedAt: Date.now() });
  },
});
