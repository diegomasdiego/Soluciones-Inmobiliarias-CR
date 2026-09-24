// Loads the sample listings (src/data) into the database. Safe to run again: it updates by slug.
// Run with:  npx convex run seed:properties        (add --prod for the production deployment)
import { internalMutation } from './_generated/server';
import { properties as samples } from '../src/data/properties';
import { esText } from '../src/data/properties.es';

export const properties = internalMutation({
  args: {},
  handler: async ctx => {
    let inserted = 0, updated = 0;
    for (const [order, p] of samples.entries()) {
      const doc = { ...p, es: esText(p.slug), order, published: true };
      const existing = await ctx.db.query('properties').withIndex('by_slug', q => q.eq('slug', p.slug)).unique();
      if (existing) { await ctx.db.replace(existing._id, doc); updated++; }
      else { await ctx.db.insert('properties', doc); inserted++; }
    }
    return { inserted, updated };
  },
});
