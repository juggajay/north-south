"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, Package, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Design",
    href: "/design",
    icon: Palette,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: Package,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      {/* Safe area padding for devices with home indicator */}
      <div className="pb-safe">
        <div className="flex h-16 items-center justify-around">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                <tab.icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-xs transition-all",
                    isActive ? "font-medium" : "font-normal"
                  )}
                >
                  {tab.name}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-50" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
