"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const isLoggedIn = useQuery(api.auth.isLoggedIn);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser);
  const updateProfile = useMutation(api.auth.updateProfile);

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
