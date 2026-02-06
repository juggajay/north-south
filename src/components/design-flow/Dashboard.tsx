"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  MessageSquare,
  ChefHat,
} from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// TYPES
// ============================================================================

export interface DesignCard {
  id: string;
  type: string;
  shape: string;
  status: string;
  price?: number;
}

interface DashboardProps {
  onNewDesign?: () => void;
  designs?: DesignCard[];
}

// ============================================================================
// HELPERS
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getStatusBadge(status: string, price?: number) {
  switch (status) {
    case "Draft":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-[#616161]">
          Draft
        </span>
      );
    case "Quote requested":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
          Quote requested
        </span>
      );
    case "Quote ready":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#77BC40]/10 text-[#77BC40]">
          Quote ready{price != null ? ` \u2014 $${price.toLocaleString()}` : ""}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-[#616161]">
          {status}
        </span>
      );
  }
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({ onNewDesign }: { onNewDesign?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#77BC40]/10 mb-5">
        <ChefHat className="size-7 text-[#77BC40]" />
      </div>
      <h3
        className="text-lg font-semibold text-[#232323]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        No designs yet
      </h3>
      <p className="text-sm text-[#616161] mt-2 max-w-[260px]">
        Start your first kitchen design and see it come to life in minutes.
      </p>
      <button
        onClick={onNewDesign ?? (() => alert("New design flow coming soon"))}
        className="mt-6 h-[52px] px-8 flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#77BC40] rounded-xl shadow-lg shadow-[#77BC40]/20 hover:bg-[#6AAD35] active:scale-[0.98] transition-all"
      >
        <Plus className="size-4" />
        Start your first design
      </button>
    </div>
  );
}

// ============================================================================
// DESIGN CARD
// ============================================================================

function DesignCardItem({ design }: { design: DesignCard }) {
  return (
    <div className="bg-[#F7F7F7] rounded-xl overflow-hidden">
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-[16/9] bg-zinc-200 flex items-center justify-center">
        <ChefHat className="size-8 text-zinc-400" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[15px] font-semibold text-[#232323]">
              {design.type}
            </p>
            <p className="text-sm text-[#616161] mt-0.5">{design.shape}</p>
          </div>
          {getStatusBadge(design.status, design.price)}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => alert("View design coming soon")}
            className="flex-1 h-[44px] flex items-center justify-center gap-1.5 text-sm font-medium text-[#232323] bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 active:scale-[0.98] transition-all"
          >
            <Eye className="size-3.5" />
            View
          </button>
          <button
            onClick={() => alert("Edit design coming soon")}
            className="flex-1 h-[44px] flex items-center justify-center gap-1.5 text-sm font-medium text-[#232323] bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 active:scale-[0.98] transition-all"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD (Screen 12)
// ============================================================================

export function Dashboard({ onNewDesign, designs }: DashboardProps) {
  const userName = useDesignFlowStore((s) => s.userName);
  const greeting = useMemo(() => getGreeting(), []);
  const hasDesigns = designs && designs.length > 0;

  // Get initial for avatar
  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        {/* Logo */}
        <img
          src="/images/nsc-logo.png"
          alt="North South Carpentry"
          className="h-8 w-auto"
        />

        {/* Avatar */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#232323] text-white text-sm font-semibold">
          {initial}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-[1.5rem] leading-tight tracking-[-0.02em] text-[#232323]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {greeting}, {userName || "there"}
        </motion.h1>

        {/* Designs section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#616161]/70">
            Your Designs
          </h2>

          {hasDesigns ? (
            <div className="mt-3 space-y-4">
              {designs.map((design) => (
                <DesignCardItem key={design.id} design={design} />
              ))}
            </div>
          ) : (
            <EmptyState onNewDesign={onNewDesign} />
          )}
        </div>

        {/* New design CTA (only shown when there are existing designs) */}
        {hasDesigns && (
          <button
            onClick={
              onNewDesign ?? (() => alert("New design flow coming soon"))
            }
            className="mt-6 w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#77BC40] rounded-xl shadow-lg shadow-[#77BC40]/20 hover:bg-[#6AAD35] active:scale-[0.98] transition-all"
          >
            <Plus className="size-4" />
            New Design
          </button>
        )}

        {/* Talk to team */}
        <button
          onClick={() => alert("Contact team feature coming soon")}
          className="mt-4 w-full h-[44px] flex items-center justify-center gap-1.5 text-sm font-medium text-[#616161] hover:text-[#232323] transition-colors"
        >
          <MessageSquare className="size-3.5" />
          Talk to our team
        </button>
      </div>
    </div>
  );
}
