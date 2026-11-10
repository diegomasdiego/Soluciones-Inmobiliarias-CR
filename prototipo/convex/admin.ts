// Maintenance functions. Internal: they run only from the CLI or the Convex dashboard, never from the site.
import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

/**
 * Permanently deletes the given requests (for example, test submissions).
 * Usage: npx convex run admin:deleteLeads '{"ids":["<id>","<id>"]}'   (add --prod for production)
 */
export const deleteLeads = internalMutation({
  args: { ids: v.array(v.id('leads')) },
  handler: async (ctx, { ids }) => {
    let deleted = 0;
    for (const id of ids) {
      if (await ctx.db.get(id)) {
        const notes = await ctx.db.query('leadNotes').withIndex('by_lead', q => q.eq('leadId', id)).collect();
        for (const note of notes) await ctx.db.delete(note._id);
        await ctx.db.delete(id);
        deleted++;
      }
    }
    return { deleted, notFound: ids.length - deleted };
  },
});

/**
 * Removes a person's panel sign-in data (user, accounts, codes, sessions). Taking the email off
 * ADMIN_EMAILS already blocks them; this also clears what is stored. Their notes on requests stay.
 * Usage: npx convex run admin:deleteUser '{"email":"persona@ejemplo.com"}'   (add --prod for production)
 */
export const deleteUser = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const users = await ctx.db.query('users').withIndex('email', q => q.eq('email', email.trim().toLowerCase())).collect();
    let removed = 0;
    for (const user of users) {
      for (const account of await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', user._id)).collect()) {
        for (const code of await ctx.db.query('authVerificationCodes').withIndex('accountId', q => q.eq('accountId', account._id)).collect()) {
          await ctx.db.delete(code._id);
        }
        await ctx.db.delete(account._id);
      }
      for (const session of await ctx.db.query('authSessions').withIndex('userId', q => q.eq('userId', user._id)).collect()) {
        for (const token of await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', session._id)).collect()) {
          await ctx.db.delete(token._id);
        }
        await ctx.db.delete(session._id);
      }
      await ctx.db.delete(user._id);
      removed++;
    }
    return { removed };
  },
});
