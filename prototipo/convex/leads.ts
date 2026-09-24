import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';

const clip = (s: string | undefined, max: number) => (s ?? '').trim().slice(0, max);

/**
 * Saves a request from any form on the site. Public on purpose (visitors are anonymous),
 * so it validates and trims everything and ignores submissions that fill the honeypot field.
 * Leads are never readable from the site; the team reviews them in the Convex dashboard.
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
    const name = clip(a.name, 120);
    const email = clip(a.email, 200).toLowerCase();
    if (!name) throw new ConvexError('name');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ConvexError('email');
    return ctx.db.insert('leads', {
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
  },
});
