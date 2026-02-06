"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/landing/LandingPage";
import { DesignFlow } from "@/components/design-flow/DesignFlow";
import { Dashboard } from "@/components/design-flow/Dashboard";

/**
 * Home page — routes between:
 * - Landing page (unauthenticated)
 * - Design flow (authenticated, creating a new design)
 * - Dashboard (authenticated, returning user with designs)
 */

type AppView = "dashboard" | "design-flow";

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, user, getOrCreateUser } = useAuth();
  const [view, setView] = useState<AppView>("design-flow");
  const ensuredUser = useRef(false);

  // Ensure user record exists and name is correct
  useEffect(() => {
    if (isLoggedIn && !ensuredUser.current) {
      ensuredUser.current = true;
      getOrCreateUser();
    }
  }, [isLoggedIn, getOrCreateUser]);

  // Show nothing while loading auth state
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E5E5E5] border-t-[#232323] rounded-full animate-spin" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isLoggedIn) {
    return (
      <LandingPage
        onGetStarted={() => router.push("/login")}
        onTryDemo={() => {
          // TODO: Start demo mode session
          router.push("/login");
        }}
      />
    );
  }

  // Authenticated user — Convex Auth may store subject ID as both name and email
  const rawName = user?.name || "";
  const rawEmail = user?.email || "";
  const isHashLike = (s: string) => /^[a-z0-9]{20,}$/i.test(s);
  const hasValidEmail = rawEmail.includes("@");
  const userName = (!isHashLike(rawName) && rawName) ? rawName : (hasValidEmail ? rawEmail.split("@")[0] : "there");
  const userEmail = user?.email || "";

  if (view === "dashboard") {
    return (
      <Dashboard
        onNewDesign={() => setView("design-flow")}
      />
    );
  }

  return (
    <DesignFlow
      userName={userName}
      userEmail={userEmail}
      isFirstTime={true}
      onComplete={() => setView("dashboard")}
    />
  );
}
