"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import { matchStylePreset } from "@/lib/constants/style-presets";
import { useDesignSession } from "@/lib/hooks/useDesignSession";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type DiscoveryStep = "q1" | "q2" | "q3";

const PHASE_LABELS = ["Your Space", "Your Style", "Your Design"];

const PURPOSE_ALTERNATIVES = [
  { label: "Pantry & Storage", icon: "pantry", value: "pantry" },
  { label: "Laundry", icon: "laundry", value: "laundry" },
  { label: "Bathroom Vanity", icon: "vanity", value: "vanity" },
  { label: "Something Else", icon: "other", value: "other" },
] as const;

const PRIORITY_OPTIONS = [
  "Lots of storage",
  "Clean, minimal look",
  "Easy to keep clean",
  "Best value for money",
  "Wow factor",
] as const;

const SUGGESTION_CHIPS = [
  "Wine rack",
  "Soft-close",
  "Recycling bin",
  "Spice drawer",
  "Appliance cupboard",
] as const;

// ============================================================================
// PURPOSE ICON
// ============================================================================

function PurposeIcon({ type }: { type: string }) {
  switch (type) {
    case "pantry":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
          <rect x="8" y="4" width="16" height="24" rx="2" fill="none" stroke="#616161" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="24" y2="12" stroke="#616161" strokeWidth="1.5" />
          <line x1="8" y1="20" x2="24" y2="20" stroke="#616161" strokeWidth="1.5" />
          <circle cx="20" cy="8" r="1" fill="#77BC40" />
          <circle cx="20" cy="16" r="1" fill="#77BC40" />
          <circle cx="20" cy="24" r="1" fill="#77BC40" />
        </svg>
      );
    case "laundry":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
          <rect x="6" y="4" width="20" height="24" rx="3" fill="none" stroke="#616161" strokeWidth="1.5" />
          <circle cx="16" cy="18" r="6" fill="none" stroke="#616161" strokeWidth="1.5" />
          <circle cx="16" cy="18" r="2.5" fill="#77BC40" opacity="0.3" />
          <circle cx="11" cy="8" r="1" fill="#77BC40" />
          <circle cx="14" cy="8" r="1" fill="#616161" />
        </svg>
      );
    case "vanity":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
          <rect x="4" y="14" width="24" height="14" rx="2" fill="none" stroke="#616161" strokeWidth="1.5" />
          <rect x="8" y="4" width="16" height="10" rx="2" fill="none" stroke="#616161" strokeWidth="1.5" />
          <line x1="16" y1="4" x2="16" y2="14" stroke="#77BC40" strokeWidth="1" opacity="0.4" />
          <circle cx="16" cy="21" r="1.5" fill="#77BC40" />
        </svg>
      );
    case "other":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
          <circle cx="16" cy="16" r="10" fill="none" stroke="#616161" strokeWidth="1.5" />
          <text x="16" y="21" textAnchor="middle" fill="#616161" fontSize="14" fontWeight="500">
            ?
          </text>
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================================
// STYLE ROUND DATA
// ============================================================================

interface StyleRound {
  round: number;
  optionA: { label: string; gradient: string };
  optionB: { label: string; gradient: string };
}

const STYLE_ROUNDS: StyleRound[] = [
  {
    round: 1,
    optionA: {
      label: "Light & airy",
      gradient: "linear-gradient(135deg, #F5F0EB 0%, #E8E3DC 50%, #D4CFC8 100%)",
    },
    optionB: {
      label: "Warm & rich",
      gradient: "linear-gradient(135deg, #5C4033 0%, #8B6914 50%, #A0522D 100%)",
    },
  },
  {
    round: 2,
    optionA: {
      label: "Sleek & modern",
      gradient: "linear-gradient(135deg, #E0E0E0 0%, #B0BEC5 50%, #78909C 100%)",
    },
    optionB: {
      label: "Classic & timeless",
      gradient: "linear-gradient(135deg, #F5F5DC 0%, #D2B48C 50%, #C4A882 100%)",
    },
  },
];

// Style signals mapped to presets in style-presets.ts
// These signals drive matchStylePreset() to resolve the right Polytec materials
const STYLE_ROUND_SIGNALS: Record<number, { a: string[]; b: string[] }> = {
  1: {
    a: ['light', 'clean', 'bright', 'natural'],        // "Light & airy"
    b: ['warm', 'rich', 'heritage', 'dramatic'],        // "Warm & rich"
  },
  2: {
    a: ['modern', 'minimal', 'clean', 'sleek'],         // "Sleek & modern"
    b: ['classic', 'traditional', 'warm', 'country'],   // "Classic & timeless"
  },
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

function ProgressBar({
  currentStep,
  questionNumber,
}: {
  currentStep: DiscoveryStep;
  questionNumber: number;
}) {
  const phaseIndex =
    currentStep === "q1" ? 0 : currentStep === "q2" ? 1 : 2;

  return (
    <div className="w-full">
      {/* Phase labels */}
      <div className="flex justify-between mb-2">
        {PHASE_LABELS.map((label, i) => (
          <span
            key={label}
            className={`text-[10px] font-medium uppercase tracking-wider ${
              i <= phaseIndex ? "text-[#77BC40]" : "text-[#D5D5D5]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Progress track */}
      <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#77BC40] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((phaseIndex + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Question counter */}
      <p className="text-xs text-[#616161] mt-2">
        Question {questionNumber} of 3
      </p>
    </div>
  );
}

// ============================================================================
// DISCOVERY (Screen 5)
// ============================================================================

export function Discovery() {
  const back = useDesignFlowStore((s) => s.back);
  const setStep = useDesignFlowStore((s) => s.setStep);
  const setPurpose = useDesignFlowStore((s) => s.setPurpose);
  const addStyleChoice = useDesignFlowStore((s) => s.addStyleChoice);
  const setStyleSummary = useDesignFlowStore((s) => s.setStyleSummary);
  const setStylePreset = useDesignFlowStore((s) => s.setStylePreset);
  const setPriorities = useDesignFlowStore((s) => s.setPriorities);
  const setSpecificRequests = useDesignFlowStore((s) => s.setSpecificRequests);
  const setFreeText = useDesignFlowStore((s) => s.setFreeText);
  const { saveUserContext } = useDesignSession();

  const [discoveryStep, setDiscoveryStep] = useState<DiscoveryStep>("q1");
  const [styleRound, setStyleRound] = useState(0);
  const [showStyleSummary, setShowStyleSummary] = useState(false);
  const [localChoices, setLocalChoices] = useState<
    Array<{ round: number; choice: "a" | "b" }>
  >([]);
  const [accumulatedSignals, setAccumulatedSignals] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [localFreeText, setLocalFreeText] = useState("");

  // ── Navigation helpers ──

  const handleBackFromQ1 = useCallback(() => {
    back();
  }, [back]);

  const handleBackFromQ2 = useCallback(() => {
    setDiscoveryStep("q1");
    setStyleRound(0);
    setShowStyleSummary(false);
    setLocalChoices([]);
    setAccumulatedSignals([]);
  }, []);

  const handleBackFromQ3 = useCallback(() => {
    setDiscoveryStep("q2");
    setStyleRound(0);
    setShowStyleSummary(false);
    setLocalChoices([]);
    setAccumulatedSignals([]);
  }, []);

  // ── Q1: Purpose selection ──

  const handlePurposeSelect = useCallback(
    (purpose: string) => {
      setPurpose(purpose);
      saveUserContext({ purpose });
      setDiscoveryStep("q2");
    },
    [setPurpose, saveUserContext]
  );

  // ── Q2: Style selection ──

  const handleStyleChoice = useCallback(
    (choice: "a" | "b") => {
      const round = styleRound + 1;
      const newChoice = { round, choice };
      const updatedChoices = [...localChoices, newChoice];
      setLocalChoices(updatedChoices);
      addStyleChoice({ ...newChoice });

      // Accumulate style signals for preset matching
      const roundSignals = STYLE_ROUND_SIGNALS[round]?.[choice] ?? [];
      const newSignals = [...accumulatedSignals, ...roundSignals];
      setAccumulatedSignals(newSignals);

      if (round >= STYLE_ROUNDS.length) {
        // Done with rounds, show summary
        const summaryParts = updatedChoices.map((c) => {
          const roundData = STYLE_ROUNDS[c.round - 1];
          return c.choice === "a" ? roundData.optionA.label : roundData.optionB.label;
        });
        const summary = summaryParts.join(", ").toLowerCase();
        setStyleSummary(summary);

        // Resolve style preset from accumulated signals
        const preset = matchStylePreset(newSignals, "unknown");
        setStylePreset(preset);

        // Save style context to Convex
        saveUserContext({
          styleSignals: newSignals,
          stylePresetId: preset.id,
        });

        setShowStyleSummary(true);
      } else {
        setStyleRound(round);
      }
    },
    [styleRound, localChoices, accumulatedSignals, addStyleChoice, setStyleSummary, setStylePreset, saveUserContext]
  );

  const handleStyleConfirm = useCallback(() => {
    setDiscoveryStep("q3");
  }, []);

  // ── Q3: Priorities + requests ──

  const togglePriority = useCallback((priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  }, []);

  const toggleChip = useCallback((chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }, []);

  const handleComplete = useCallback(() => {
    setPriorities(selectedPriorities);
    setSpecificRequests(selectedChips);
    setFreeText(localFreeText);
    saveUserContext({
      priorities: selectedPriorities,
      specificRequests: selectedChips,
    });
    setStep("processing");
  }, [
    selectedPriorities,
    selectedChips,
    localFreeText,
    setPriorities,
    setSpecificRequests,
    setFreeText,
    saveUserContext,
    setStep,
  ]);

  // ── Derive question number ──
  const questionNumber = discoveryStep === "q1" ? 1 : discoveryStep === "q2" ? 2 : 3;

  // ============================================================================
  // RENDER Q1: PURPOSE
  // ============================================================================

  if (discoveryStep === "q1") {
    return (
      <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
        {/* Back */}
        <button
          onClick={handleBackFromQ1}
          className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="mt-4 max-w-sm mx-auto">
          <ProgressBar currentStep="q1" questionNumber={1} />

          {/* AI message */}
          <div className="mt-6 bg-[#F9FBF7] border border-[#77BC40]/20 rounded-xl p-4">
            <p className="text-sm text-[#232323] leading-relaxed">
              Looks like this is a kitchen &mdash; is that right?
            </p>
          </div>

          {/* Primary confirmation */}
          <button
            onClick={() => handlePurposeSelect("kitchen")}
            className="mt-6 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
          >
            Yes, it&apos;s a kitchen
          </button>

          {/* Alternatives grid */}
          <p className="text-xs text-[#616161] mt-6 mb-3 text-center">
            Or select a different type:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PURPOSE_ALTERNATIVES.map(({ label, icon, value }) => (
              <button
                key={value}
                onClick={() => handlePurposeSelect(value)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#77BC40] hover:bg-[#77BC40]/5 active:scale-[0.97] transition-all min-h-[100px]"
              >
                <PurposeIcon type={icon} />
                <span className="text-sm font-medium text-[#232323]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER Q2: STYLE A/B
  // ============================================================================

  if (discoveryStep === "q2") {
    // Show summary confirmation after all rounds
    if (showStyleSummary) {
      const summaryParts = localChoices.map((c) => {
        const roundData = STYLE_ROUNDS[c.round - 1];
        return c.choice === "a" ? roundData.optionA.label : roundData.optionB.label;
      });

      return (
        <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
          {/* Back */}
          <button
            onClick={handleBackFromQ2}
            className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <div className="mt-4 max-w-sm mx-auto">
            <ProgressBar currentStep="q2" questionNumber={2} />

            {/* AI summary */}
            <div className="mt-6 bg-[#F9FBF7] border border-[#77BC40]/20 rounded-xl p-4">
              <p className="text-sm text-[#232323] leading-relaxed">
                Great choices! So you&apos;re drawn to a{" "}
                <span className="font-semibold">
                  {summaryParts.join(", ").toLowerCase()}
                </span>{" "}
                style. I&apos;ll use this to guide your design.
              </p>
            </div>

            {/* Selected styles recap */}
            <div className="mt-4 flex flex-wrap gap-2">
              {summaryParts.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#77BC40]/10 text-xs font-medium text-[#77BC40]"
                >
                  <Check className="size-3" />
                  {label}
                </span>
              ))}
            </div>

            {/* Continue */}
            <button
              onClick={handleStyleConfirm}
              className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
            >
              That sounds right
            </button>
          </div>
        </div>
      );
    }

    // Show current style round
    const currentRound = STYLE_ROUNDS[styleRound];

    return (
      <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
        {/* Back */}
        <button
          onClick={styleRound === 0 ? handleBackFromQ2 : () => {
            setStyleRound(styleRound - 1);
            setLocalChoices((prev) => prev.slice(0, -1));
          }}
          className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="mt-4 max-w-sm mx-auto">
          <ProgressBar currentStep="q2" questionNumber={2} />

          {/* AI message */}
          <div className="mt-6 bg-[#F9FBF7] border border-[#77BC40]/20 rounded-xl p-4">
            <p className="text-sm text-[#232323] leading-relaxed">
              Which of these feels more like you?
            </p>
          </div>

          {/* Style cards side by side */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Option A */}
            <button
              onClick={() => handleStyleChoice("a")}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] hover:border-[#77BC40] active:scale-[0.97] transition-all"
            >
              <div
                className="w-full aspect-[4/3]"
                style={{ background: currentRound.optionA.gradient }}
              />
              <div className="py-3 px-3 text-center">
                <span className="text-sm font-medium text-[#232323]">
                  {currentRound.optionA.label}
                </span>
              </div>
            </button>

            {/* Option B */}
            <button
              onClick={() => handleStyleChoice("b")}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] hover:border-[#77BC40] active:scale-[0.97] transition-all"
            >
              <div
                className="w-full aspect-[4/3]"
                style={{ background: currentRound.optionB.gradient }}
              />
              <div className="py-3 px-3 text-center">
                <span className="text-sm font-medium text-[#232323]">
                  {currentRound.optionB.label}
                </span>
              </div>
            </button>
          </div>

          {/* Round indicator */}
          <div className="mt-4 flex justify-center gap-1.5">
            {STYLE_ROUNDS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= styleRound ? "bg-[#77BC40]" : "bg-[#E5E5E5]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER Q3: PRIORITIES + REQUESTS
  // ============================================================================

  return (
    <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
      {/* Back */}
      <button
        onClick={handleBackFromQ3}
        className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-4 max-w-sm mx-auto">
        <ProgressBar currentStep="q3" questionNumber={3} />

        {/* AI message */}
        <div className="mt-6 bg-[#F9FBF7] border border-[#77BC40]/20 rounded-xl p-4">
          <p className="text-sm text-[#232323] leading-relaxed">
            Last one! What matters most to you?
          </p>
        </div>

        {/* Priority checkboxes */}
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Priorities
          </h3>
          {PRIORITY_OPTIONS.map((priority) => {
            const selected = selectedPriorities.includes(priority);
            return (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-h-[44px] text-left ${
                  selected
                    ? "border-[#77BC40] bg-[#77BC40]/5"
                    : "border-[#E5E5E5] bg-white hover:border-[#C5C5C5]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                    selected ? "bg-[#77BC40]" : "border-2 border-[#D5D5D5]"
                  }`}
                >
                  {selected && <Check className="size-3 text-white" />}
                </div>
                <span className="text-sm text-[#232323]">{priority}</span>
              </button>
            );
          })}
        </div>

        {/* Suggestion chips */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Specific requests
          </h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => {
              const selected = selectedChips.includes(chip);
              return (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    selected
                      ? "bg-[#77BC40] text-white"
                      : "bg-[#F5F5F5] text-[#616161] hover:bg-[#EBEBEB]"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free text input */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Anything else?
          </h3>
          <textarea
            value={localFreeText}
            onChange={(e) => setLocalFreeText(e.target.value)}
            placeholder="Tell us anything else about what you need..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white text-sm text-[#232323] placeholder:text-[#C5C5C5] focus:outline-none focus:border-[#77BC40] focus:ring-1 focus:ring-[#77BC40]/30 resize-none transition-colors"
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleComplete}
          className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
        >
          That&apos;s Everything
        </button>
      </div>
    </div>
  );
}
