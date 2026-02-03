import { BottomNav } from "@/components/navigation/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Main content area with bottom padding for nav */}
      <main className="pb-20">{children}</main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
