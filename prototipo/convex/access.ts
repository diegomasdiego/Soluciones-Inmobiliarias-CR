// Who may use the team panel. Only emails on this list can sign in, per deployment:
//   npx convex env set ADMIN_EMAILS "ventas@ejemplo.com,otra.persona@ejemplo.com"   (add --prod for production)
// With the list empty nobody gets in, so a deployment is closed until it is set.
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
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
