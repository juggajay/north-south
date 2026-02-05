"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_DOMAIN = "@northsouthcarpentry.com";

/**
 * Protects admin routes - redirects non-admins to home
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Get current user profile
  const currentUser = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin");
      return;
    }

    // Wait for user query
    if (currentUser === undefined) return;

    // User loaded - check admin status
    setIsChecking(false);

    // Not admin - redirect to home
    if (!currentUser?.email?.endsWith(ADMIN_DOMAIN)) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, currentUser, router]);

  // Loading state
  if (authLoading || isChecking || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // Not admin - show nothing while redirecting
  if (!currentUser?.email?.endsWith(ADMIN_DOMAIN)) {
    return null;
  }

  return <>{children}</>;
}
