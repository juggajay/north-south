"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create a Convex client instance
// Note: In development, NEXT_PUBLIC_CONVEX_URL may be undefined
// The app will work in offline mode until Convex is configured
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Return children without Convex wrapper if not configured
    // This allows the app to run in development without Convex
    console.warn(
      "NEXT_PUBLIC_CONVEX_URL is not set. Running in offline mode."
    );
    return <>{children}</>;
  }

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
