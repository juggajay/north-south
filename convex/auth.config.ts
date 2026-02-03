import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + Password authentication
    Password({
      id: "password",
      // Profile callback to customize user data
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? undefined,
        };
      },
    }),

    // Magic link via Resend
    Resend({
      id: "resend",
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "North South Carpentry <noreply@nscarpentry.com.au>",
    }),
  ],
});
