import { cn } from "@/lib/utils";

interface TabBadgeProps {
  count?: number; // For number badges (Orders)
  showDot?: boolean; // For red dot (Chat unread)
}

export function TabBadge({ count, showDot }: TabBadgeProps) {
  // Don't render anything if neither count nor showDot is provided
  if (!showDot && !count) {
    return null;
  }

  // Red dot for unread messages (Chat)
  if (showDot) {
    return (
      <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
    );
  }

  // Number badge for order updates (Orders)
  if (count) {
    const displayCount = count > 99 ? "99+" : count.toString();

    return (
      <span
        className={cn(
          "absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white"
        )}
      >
        {displayCount}
      </span>
    );
  }

  return null;
}
