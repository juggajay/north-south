"use client";

import * as React from "react";
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Snap points as percentages of viewport height (e.g., [0.25, 0.5, 0.85]) */
  snapPoints?: number[];
  /** Initial snap point index (default: 0, the smallest) */
  defaultSnapPoint?: number;
  /** Whether to show the drag handle indicator */
  showHandle?: boolean;
  /** Whether clicking the backdrop closes the sheet */
  closeOnBackdropClick?: boolean;
  className?: string;
}

const SNAP_THRESHOLD = 50; // pixels to trigger snap
const VELOCITY_THRESHOLD = 500; // px/s to trigger close

export function BottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints = [0.25, 0.5, 0.85],
  defaultSnapPoint = 0,
  showHandle = true,
  closeOnBackdropClick = true,
  className,
}: BottomSheetProps) {
  const controls = useAnimation();
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(defaultSnapPoint);

  // Calculate heights from snap points (relative to viewport)
  const getHeightFromSnap = (snapIndex: number) => {
    const snap = snapPoints[snapIndex];
    return `${snap * 100}vh`;
  };

  // Reset to default snap when opening
  React.useEffect(() => {
    if (open) {
      setCurrentSnapIndex(defaultSnapPoint);
      controls.start({
        y: 0,
        height: getHeightFromSnap(defaultSnapPoint),
      });
    }
  }, [open, defaultSnapPoint, controls]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { velocity, offset } = info;

    // Close if dragged down fast enough or past threshold
    if (velocity.y > VELOCITY_THRESHOLD || offset.y > window.innerHeight * 0.3) {
      onOpenChange(false);
      return;
    }

    // Determine which snap point to go to based on drag direction and position
    let newSnapIndex = currentSnapIndex;

    if (offset.y > SNAP_THRESHOLD) {
      // Dragged down - go to smaller snap point
      newSnapIndex = Math.max(0, currentSnapIndex - 1);
      if (newSnapIndex === 0 && offset.y > window.innerHeight * 0.15) {
        // Close if at smallest snap and dragged down significantly
        onOpenChange(false);
        return;
      }
    } else if (offset.y < -SNAP_THRESHOLD) {
      // Dragged up - go to larger snap point
      newSnapIndex = Math.min(snapPoints.length - 1, currentSnapIndex + 1);
    }

    setCurrentSnapIndex(newSnapIndex);
    controls.start({
      y: 0,
      height: getHeightFromSnap(newSnapIndex),
      transition: { type: "spring", damping: 25, stiffness: 400 },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => closeOnBackdropClick && onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%" }}
            animate={controls}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            style={{ height: getHeightFromSnap(currentSnapIndex) }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900",
              className
            )}
          >
            {/* Handle indicator */}
            {showHandle && (
              <div className="flex h-6 w-full cursor-grab items-center justify-center active:cursor-grabbing">
                <div className="h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Header component for consistent styling
export function BottomSheetHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 pb-4 text-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BottomSheetTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-zinc-900 dark:text-zinc-50",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function BottomSheetDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function BottomSheetFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
