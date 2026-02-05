"use client";

import { Authenticated } from "convex/react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { FullscreenProvider, useFullscreen } from "@/contexts/FullscreenContext";

function TabsLayoutContent({ children }: { children: React.ReactNode }) {
  const { isFullscreen } = useFullscreen();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header with logout button for authenticated users */}
      {!isFullscreen && (
        <Authenticated>
          <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 safe-area-inset-top">
            <div className="flex items-center justify-between px-4 h-14">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                North South
              </h1>
              <LogoutButton variant="ghost" size="sm" />
            </div>
          </header>
        </Authenticated>
      )}

      {/* Main content area with padding for header and bottom nav */}
      <main className={isFullscreen ? "" : "pt-14 pb-20"}>{children}</main>

      {/* Bottom navigation - hidden in fullscreen mode */}
      {!isFullscreen && <BottomNav />}
    </div>
  );
}

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FullscreenProvider>
      <TabsLayoutContent>{children}</TabsLayoutContent>
    </FullscreenProvider>
  );
}
