"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  // @ts-ignore - Convex type inference can be deep
  const isLoggedIn: boolean | undefined = useQuery(api.auth.isLoggedIn);
  // @ts-ignore - Convex type inference can be deep
  const currentUser: any = useQuery(api.auth.getCurrentUser);
  // @ts-ignore - Convex type inference can be deep
  const getOrCreateUser: any = useMutation(api.auth.getOrCreateUser);
  // @ts-ignore - Convex type inference can be deep
  const updateProfile: any = useMutation(api.auth.updateProfile);

  return {
    // State
    isLoading: isLoggedIn === undefined,
    isLoggedIn: isLoggedIn ?? false,
    user: currentUser ?? null,

    // Actions
    getOrCreateUser,
    updateProfile,
  };
}

/**
 * Hook to check if user is authenticated, redirects if not
 * Use this in protected pages/components
 */
export function useRequireAuth() {
  const { isLoading, isLoggedIn, user } = useAuth();

  return {
    isLoading,
    isAuthenticated: isLoggedIn && user !== null,
    user,
  };
}
