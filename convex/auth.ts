import { query, mutation } from "./_generated/server";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { v } from "convex/values";

// Configure authentication with Password provider
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: "password",
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? undefined,
        };
      },
    }),
  ],
});

/**
 * Get the currently authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Try multiple sources for email (Convex Auth stores it differently depending on provider)
    const email = identity.email ||
                  (identity.subject?.includes("@") ? identity.subject : null) ||
                  identity.tokenIdentifier?.split("|")[1];

    if (!email) {
      return null;
    }

    // Try to find existing user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    return user;
  },
});

/**
 * Get or create a user record from the authenticated identity
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Try multiple sources for email (Convex Auth stores it differently depending on provider)
    // For Password provider, email is often in the subject field
    const email = identity.email ||
                  (identity.subject?.includes("@") ? identity.subject : null) ||
                  identity.tokenIdentifier?.split("|")[1]; // Format: "provider|email"

    if (!email) {
      console.error("Identity fields:", Object.keys(identity), "subject:", identity.subject);
      throw new Error("No email in authentication identity");
    }

    // Try to find existing user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email,
      name: identity.name || email.split("@")[0],
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email || ""))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<{
      name: string;
      phone: string;
      address: string;
    }> = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;

    await ctx.db.patch(user._id, updates);

    return await ctx.db.get(user._id);
  },
});

/**
 * Check if a user is authenticated
 */
export const isLoggedIn = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity !== null;
  },
});
