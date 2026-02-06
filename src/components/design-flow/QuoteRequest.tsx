"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// QUOTE REQUEST (Screen 10)
// ============================================================================

interface QuoteRequestProps {
  userEmail?: string;
}

export function QuoteRequest({ userEmail }: QuoteRequestProps) {
  const back = useDesignFlowStore((s) => s.back);
  const next = useDesignFlowStore((s) => s.next);
  const userName = useDesignFlowStore((s) => s.userName);
  const quotePhone = useDesignFlowStore((s) => s.quotePhone);
  const setQuotePhone = useDesignFlowStore((s) => s.setQuotePhone);
  const quoteNotes = useDesignFlowStore((s) => s.quoteNotes);
  const setQuoteNotes = useDesignFlowStore((s) => s.setQuoteNotes);
  const setQuoteSubmitted = useDesignFlowStore((s) => s.setQuoteSubmitted);

  const handleSubmit = () => {
    setQuoteSubmitted(true);
    next();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium text-[#616161] min-h-[44px] min-w-[44px] justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* AI message */}
        <div className="mt-2 bg-[#77BC40]/5 border border-[#77BC40]/15 rounded-xl px-4 py-3">
          <p className="text-sm text-[#616161] leading-relaxed">
            Nearly there &mdash; just a few details so we can get your quote
            sorted.
          </p>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-5">
          {/* Name (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#232323]">Name</label>
            <div className="flex h-11 w-full items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-base text-[#616161]">
              {userName || "---"}
            </div>
          </div>

          {/* Email (read-only) */}
          {userEmail && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#232323]">
                Email
              </label>
              <div className="flex h-11 w-full items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-base text-[#616161]">
                {userEmail}
              </div>
            </div>
          )}

          {/* Phone (optional) */}
          <div className="space-y-1.5">
            <label
              htmlFor="quote-phone"
              className="text-sm font-medium text-[#232323]"
            >
              Phone{" "}
              <span className="text-[#616161] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#616161]/50" />
              <input
                id="quote-phone"
                type="tel"
                placeholder="04XX XXX XXX"
                value={quotePhone}
                onChange={(e) => setQuotePhone(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 py-2 text-base text-[#232323] placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all min-h-[44px]"
              />
            </div>
          </div>

          {/* Site measure info box */}
          <div className="bg-[#77BC40]/8 border border-[#77BC40]/15 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#77BC40]/15 shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-[#77BC40]">
                &#10003;
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#232323]">
                Includes a no-obligation site measure
              </p>
              <p className="text-xs text-[#616161] mt-0.5">
                We&apos;ll send someone to verify measurements &mdash;
                completely free.
              </p>
            </div>
          </div>

          {/* Notes textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="quote-notes"
              className="text-sm font-medium text-[#232323]"
            >
              Anything else?
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 size-4 text-[#616161]/50" />
              <textarea
                id="quote-notes"
                placeholder="Tell us about any specific requirements, timeline, or questions..."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 py-2.5 text-base text-[#232323] placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all resize-none min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleSubmit}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#77BC40] rounded-xl shadow-lg shadow-[#77BC40]/20 hover:bg-[#6AAD35] active:scale-[0.98] transition-all"
        >
          Request My Quote
          <ArrowRight className="size-4" />
        </motion.button>

        {/* Secondary link */}
        <button
          onClick={() => alert("Contact team feature coming soon")}
          className="mt-3 w-full h-[44px] flex items-center justify-center text-sm font-medium text-[#77BC40] hover:underline"
        >
          Talk to our team
        </button>

        {/* AI message */}
        <div className="mt-4 bg-[#77BC40]/5 border border-[#77BC40]/15 rounded-xl px-4 py-3">
          <p className="text-xs text-[#616161] leading-relaxed">
            Once submitted, we&apos;ll email you a formal quote within 2&ndash;3
            business days.
          </p>
        </div>
      </div>
    </div>
  );
}
