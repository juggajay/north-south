"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create a Convex client instance
// Note: In development/build, NEXT_PUBLIC_CONVEX_URL may be undefined
// We create a stub client with a fake URL to enable hooks during build
// The client will fail to connect but the app structure will render
const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : new ConvexReactClient("https://offline.convex.cloud");  // Stub URL for build/offline mode

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    console.warn(
      "NEXT_PUBLIC_CONVEX_URL is not set. Running in offline mode with stub client."
    );
  }

  return (
    <BaseConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        {children}
      </ConvexAuthProvider>
    </BaseConvexProvider>
  );
}
