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
        await ctx.db.delete(id);
        deleted++;
      }
    }
    return { deleted, notFound: ids.length - deleted };
  },
});
