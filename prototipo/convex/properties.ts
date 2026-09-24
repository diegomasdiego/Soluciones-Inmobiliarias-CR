import { query } from './_generated/server';

/** Published listings in display order. */
export const list = query({
  args: {},
  handler: async ctx => {
    const docs = await ctx.db
      .query('properties')
      .withIndex('by_published_order', q => q.eq('published', true))
      .order('asc')
      .collect();
    return docs.map(({ _id, _creationTime, order, published, ...p }) => p);
  },
});
