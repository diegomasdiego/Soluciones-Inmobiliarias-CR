// Who may sign in, and to what:
// - The team panel: emails on ADMIN_EMAILS, per deployment:
//     npx convex env set ADMIN_EMAILS "ventas@ejemplo.com,otra.persona@ejemplo.com"   (add --prod for production)
//   With the list empty nobody gets in, so a deployment is closed until it is set.
// - The client portal: emails the team added to a deal (dealAccess). They see only those deals.
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';

export const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

export function isTeamEmail(value: unknown) {
  const email = normalizeEmail(value);
  if (!email) return false;
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(normalizeEmail).includes(email);
}

/**
 * The signed-in team member, or null. Checked on every panel call, not only at sign-in, so taking
 * an email off ADMIN_EMAILS cuts access right away, even for sessions that are already open.
 */
export async function teamMember(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const user = await ctx.db.get(userId);
  if (!user || user.emailVerificationTime === undefined || !isTeamEmail(user.email)) return null;
  return { userId, email: normalizeEmail(user.email), name: user.name ?? null };
}

export async function requireTeam(ctx: QueryCtx) {
  const member = await teamMember(ctx);
  if (!member) throw new ConvexError('unauthorized');
  return member;
}

/** Whether an email was added to at least one deal, so it may sign in to the portal. */
export async function hasPortalAccess(ctx: QueryCtx, value: unknown) {
  const email = normalizeEmail(value);
  if (!email) return false;
  return (await ctx.db.query('dealAccess').withIndex('by_email', q => q.eq('email', email)).first()) !== null;
}

/** The signed-in person with a confirmed email, and whether they are on the team. Null otherwise. */
export async function portalUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const user = await ctx.db.get(userId);
  if (!user || user.emailVerificationTime === undefined) return null;
  const email = normalizeEmail(user.email);
  if (!email) return null;
  return { userId, email, team: isTeamEmail(email) };
}
export type PortalUser = NonNullable<Awaited<ReturnType<typeof portalUser>>>;

/**
 * The deal, if this person may see it: team members see every deal, clients only the ones their
 * email is on. Checked on every call, so removing an email cuts access at once.
 */
export async function dealFor(ctx: QueryCtx, who: PortalUser | null, dealId: Id<'deals'>) {
  if (!who) throw new ConvexError('unauthorized');
  const deal = await ctx.db.get(dealId);
  if (!deal) throw new ConvexError('not-found');
  if (who.team) return { deal, access: null };
  const access = await ctx.db
    .query('dealAccess')
    .withIndex('by_deal', q => q.eq('dealId', dealId))
    .filter(q => q.eq(q.field('email'), who.email))
    .first();
  // Same answer as a missing deal, so ids can't be probed.
  if (!access) throw new ConvexError('not-found');
  return { deal, access };
}
