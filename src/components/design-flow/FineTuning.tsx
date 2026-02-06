"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cuboid,
  ArrowRight,
  LayoutGrid,
  DoorOpen,
  CircleDot,
  Sparkles,
} from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// TYPES
// ============================================================================

type Mode = "browse" | "edit";

type EditCategory = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const EDIT_CATEGORIES: EditCategory[] = [
  {
    key: "layout",
    title: "Layout",
    subtitle: "Change what goes where",
    icon: <LayoutGrid className="size-5 text-[#77BC40]" />,
  },
  {
    key: "door-style",
    title: "Door Style",
    subtitle: "Change how the doors look",
    icon: <DoorOpen className="size-5 text-[#77BC40]" />,
  },
  {
    key: "handles",
    title: "Handles",
    subtitle: "Change the handle type and finish",
    icon: <CircleDot className="size-5 text-[#77BC40]" />,
  },
  {
    key: "extras",
    title: "Extras",
    subtitle: "Add or remove accessories",
    icon: <Sparkles className="size-5 text-[#77BC40]" />,
  },
];

// ============================================================================
// FLOOR PLAN (simple 2D schematic)
// ============================================================================

function FloorPlan() {
  const cabinets = useDesignFlowStore((s) => s.designResult?.cabinets ?? []);
  const roomShape = useDesignFlowStore((s) => s.roomShape);

  if (cabinets.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-[#F7F7F7] rounded-xl flex items-center justify-center">
        <p className="text-sm text-[#616161]">No cabinet data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F7F7F7] rounded-xl p-4">
      <p className="text-xs text-[#616161]/70 mb-3 uppercase tracking-wide font-medium">
        Floor Plan &middot; {roomShape ?? "Custom"}
      </p>
      <div className="flex flex-wrap gap-2">
        {cabinets.map((cab) => (
          <div
            key={cab.position}
            className="flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-lg px-3 py-2 min-w-[72px] shadow-sm"
            style={{
              flexBasis: `${Math.max(60, Math.min(cab.width / 10, 140))}px`,
            }}
          >
            <span className="text-[11px] font-semibold text-[#232323] leading-tight text-center">
              {cab.type}
            </span>
            <span className="text-[10px] text-[#616161] mt-0.5">
              {cab.width}mm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BROWSE MODE
// ============================================================================

function BrowseView({ onEdit }: { onEdit: () => void }) {
  const back = useDesignFlowStore((s) => s.back);
  const next = useDesignFlowStore((s) => s.next);
  const designResult = useDesignFlowStore((s) => s.designResult);
  const priceRange = designResult?.priceRange;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium text-[#616161] min-h-[44px] min-w-[44px] justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          onClick={() => alert("3D view coming soon")}
          className="flex items-center gap-1.5 text-sm font-medium text-[#77BC40] min-h-[44px] min-w-[44px] justify-center"
        >
          <Cuboid className="size-4" />
          3D View
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        {/* Floor plan */}
        <div className="mt-2">
          <FloorPlan />
        </div>

        {/* Design summary */}
        <div className="mt-5 space-y-2">
          <h3
            className="text-lg font-semibold text-[#232323]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Design Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F7F7F7] rounded-lg px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Door Style
              </p>
              <p className="text-sm font-medium text-[#232323] mt-0.5">
                {designResult?.doorStyle ?? "---"}
              </p>
            </div>
            <div className="bg-[#F7F7F7] rounded-lg px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Handles
              </p>
              <p className="text-sm font-medium text-[#232323] mt-0.5">
                {designResult?.handleStyle ?? "---"}
              </p>
            </div>
            <div className="bg-[#F7F7F7] rounded-lg px-3 py-2.5 col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Wall Cabinets
              </p>
              <p className="text-sm font-medium text-[#232323] mt-0.5">
                {designResult?.wallCabinets ?? 0} units
              </p>
            </div>
          </div>
        </div>

        {/* AI message */}
        <div className="mt-6 bg-[#77BC40]/5 border border-[#77BC40]/15 rounded-xl px-4 py-3">
          <p className="text-sm text-[#616161] leading-relaxed">
            Happy with everything? Tap{" "}
            <span className="font-semibold text-[#232323]">Done</span>. Want to
            change something? Tap{" "}
            <span className="font-semibold text-[#232323]">Change something</span>.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-3">
          {priceRange ? (
            <p className="text-lg font-semibold text-[#232323]">
              ${priceRange[0].toLocaleString()} &ndash; $
              {priceRange[1].toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-[#616161]">Price pending</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 h-[52px] flex items-center justify-center text-[15px] font-semibold text-[#232323] bg-zinc-100 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
          >
            Change something
          </button>
          <button
            onClick={next}
            className="flex-1 h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#232323] rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
          >
            Done
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EDIT MODE
// ============================================================================

function EditView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#616161] min-h-[44px] min-w-[44px] justify-center"
          aria-label="Back to design"
        >
          <ArrowLeft className="size-4" />
          Back to design
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4">
        <h2
          className="text-[1.5rem] leading-tight tracking-[-0.02em] text-[#232323]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What would you like to change?
        </h2>

        <div className="mt-6 space-y-3">
          {EDIT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                alert(`${cat.title} selector coming soon`);
                onBack();
              }}
              className="w-full flex items-center gap-4 bg-[#F7F7F7] hover:bg-zinc-100 rounded-xl px-4 py-4 text-left transition-colors active:scale-[0.98] min-h-[44px]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#77BC40]/10 shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#232323]">
                  {cat.title}
                </p>
                <p className="text-sm text-[#616161] mt-0.5">{cat.subtitle}</p>
              </div>
              <ArrowRight className="size-4 text-[#616161]/50 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FINE TUNING (Screen 8)
// ============================================================================

export function FineTuning() {
  const [mode, setMode] = useState<Mode>("browse");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {mode === "browse" ? (
        <BrowseView onEdit={() => setMode("edit")} />
      ) : (
        <EditView onBack={() => setMode("browse")} />
      )}
    </motion.div>
  );
}
