// Team sign-in for the leads panel (Convex Auth), three ways:
//   1. A code sent by email                       (needs RESEND_API_KEY)
//   2. Email and password, email confirmed once   (needs RESEND_API_KEY for the confirmation and reset codes)
//   3. Google account                             (needs AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET)
// Plus, per deployment: JWT_PRIVATE_KEY, JWKS and SITE_URL (see README). Only ADMIN_EMAILS get in (access.ts).
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { isTeamEmail, normalizeEmail } from './access';
import { EmailCode, PasswordReset, PasswordVerify } from './authEmail';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    EmailCode,
    Password({
      profile(params) {
        const email = normalizeEmail(params.email);
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new ConvexError('email');
        return { email };
      },
      validatePasswordRequirements(password) {
        if (password.length < 10) throw new ConvexError('weak-password');
      },
      verify: PasswordVerify,
      reset: PasswordReset,
    }),
  ],
  callbacks: {
    // Runs in the same transaction that creates or links the user, before any session or code
    // exists. Throwing here leaves nothing behind and no code is emailed to an outside address.
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!isTeamEmail(user?.email)) throw new ConvexError('not-allowed');
    },
  },
});
