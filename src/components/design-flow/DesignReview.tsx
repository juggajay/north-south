"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// DESIGN REVIEW (Screen 9)
// ============================================================================

export function DesignReview() {
  const back = useDesignFlowStore((s) => s.back);
  const next = useDesignFlowStore((s) => s.next);
  const designResult = useDesignFlowStore((s) => s.designResult);
  const roomShape = useDesignFlowStore((s) => s.roomShape);
  const walls = useDesignFlowStore((s) => s.walls);

  const cabinets = designResult?.cabinets ?? [];
  const priceRange = designResult?.priceRange;
  const renderUrl = designResult?.renders?.[0];

  // Build dimensions string from walls
  const dimensionsStr =
    walls.length > 0
      ? walls.map((w) => `${w.label}: ${w.length}m`).join(" / ")
      : "Not specified";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium text-[#616161] min-h-[44px] min-w-[44px] justify-center"
          aria-label="Edit design"
        >
          <ArrowLeft className="size-4" />
          Edit
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* AI message */}
        <div className="mt-2 bg-[#77BC40]/5 border border-[#77BC40]/15 rounded-xl px-4 py-3">
          <p className="text-sm text-[#616161] leading-relaxed">
            Here&apos;s your final design &mdash; take a look and make sure
            you&apos;re happy.
          </p>
        </div>

        {/* Render image */}
        <div className="mt-5">
          {renderUrl ? (
            <img
              src={renderUrl}
              alt="Kitchen design render"
              className="w-full aspect-[16/10] object-cover rounded-xl bg-[#F7F7F7]"
            />
          ) : (
            <div className="w-full aspect-[16/10] bg-[#F7F7F7] rounded-xl flex items-center justify-center">
              <p className="text-sm text-[#616161]">Render not available</p>
            </div>
          )}
        </div>

        {/* Design summary card */}
        <div className="mt-5 bg-[#F7F7F7] rounded-xl p-5">
          <h2
            className="text-xl font-semibold text-[#232323]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Kitchen
          </h2>

          <div className="mt-4 space-y-3">
            {/* Room shape and dimensions */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Room Shape
              </p>
              <p className="text-sm text-[#232323] mt-0.5">
                {roomShape
                  ? roomShape.charAt(0).toUpperCase() + roomShape.slice(1)
                  : "Not specified"}{" "}
                &middot; {dimensionsStr}
              </p>
            </div>

            {/* Lower cabinets */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Lower Cabinets
              </p>
              {cabinets.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {cabinets.map((cab) => (
                    <li key={cab.position} className="text-sm text-[#232323]">
                      {cab.label}{" "}
                      <span className="text-[#616161]">({cab.width}mm)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#616161] mt-0.5">None specified</p>
              )}
            </div>

            {/* Wall cabinets */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                Wall Cabinets
              </p>
              <p className="text-sm text-[#232323] mt-0.5">
                {designResult?.wallCabinets ?? 0} units
              </p>
            </div>

            {/* Door style and handles */}
            <div className="flex gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                  Door Style
                </p>
                <p className="text-sm text-[#232323] mt-0.5">
                  {designResult?.doorStyle ?? "---"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#616161]/70 font-medium">
                  Handles
                </p>
                <p className="text-sm text-[#232323] mt-0.5">
                  {designResult?.handleStyle ?? "---"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Price range */}
        <div className="mt-5">
          {priceRange ? (
            <div>
              <p className="text-2xl font-semibold text-[#232323]">
                ${priceRange[0].toLocaleString()} &ndash; $
                {priceRange[1].toLocaleString()}
              </p>
              <p className="text-xs text-[#616161] mt-1.5 leading-relaxed">
                Cabinets and doors only. Final quote after site measure &mdash;
                we&apos;ll send someone to check measurements (free). The final
                price is usually within 10% of this estimate.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#616161]">Price estimate pending</p>
          )}
        </div>

        {/* Share button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "My Kitchen Design",
                text: "Check out my new kitchen design from North South Carpentry!",
              });
            } else {
              alert("Share feature coming soon");
            }
          }}
          className="mt-5 w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-[#232323] border border-zinc-200 rounded-xl hover:bg-zinc-50 active:scale-[0.98] transition-all"
        >
          <Share2 className="size-4" />
          Share with someone
        </button>

        {/* CTA */}
        <motion.button
          onClick={next}
          whileTap={{ scale: 0.98 }}
          className="mt-3 w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#77BC40] rounded-xl shadow-lg shadow-[#77BC40]/20 hover:bg-[#6AAD35] active:scale-[0.98] transition-all"
        >
          Get My Quote
          <ArrowRight className="size-4" />
        </motion.button>
      </div>
    </div>
  );
}
