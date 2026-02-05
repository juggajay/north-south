// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { EMAIL_CONFIG } from "./types";

/**
 * Get the current authenticated user identity
 * Returns null if not authenticated
 */
export async function getAuthIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Get the current authenticated user ID (subject)
 * Returns null if not authenticated
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

/**
 * Require authentication - throws if not authenticated
 * Returns the user identity
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
}

/**
 * Check if user is admin
 * Admin check: email domain matches configured admin domain
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const email = identity.email;
  if (!email) return false;

  return email.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN);
}

/**
 * Require admin access - throws if not admin
 * Returns the user identity
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const email = identity.email;

  if (!email || !email.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN)) {
    throw new Error("Admin access required");
  }

  return identity;
}

/**
 * Check if the authenticated user owns a resource
 * Compares the resource's userId/email with the authenticated user
 */
export async function requireOwnershipOrAdmin(
  ctx: QueryCtx | MutationCtx,
  resourceEmail: string | undefined
): Promise<void> {
  const identity = await requireAuth(ctx);

  // Admins can access any resource
  if (identity.email?.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN)) {
    return;
  }

  // Check ownership by email (case-insensitive comparison)
  if (resourceEmail && identity.email?.toLowerCase() === resourceEmail.toLowerCase()) {
    return;
  }

  throw new Error("Access denied: you don't own this resource");
}
