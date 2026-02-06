"use client";

/**
 * DesignFlow — Orchestrator for the full guided design flow (Screens 2-11).
 *
 * Manages which screen component renders based on the current step in
 * useDesignFlowStore. Each screen component handles its own navigation
 * via the store's next()/back()/setStep() methods.
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import { useFullscreen } from "@/contexts/FullscreenContext";
import { AIIntroduction } from "./AIIntroduction";
import { PhotoCapture } from "./PhotoCapture";
import { WallDetection } from "./WallDetection";
import { Discovery } from "./Discovery";
import { DesignProcessing } from "./DesignProcessing";
import { DesignPresentation } from "./DesignPresentation";
import { BudgetQuestion } from "./BudgetQuestion";
import { FineTuning } from "./FineTuning";
import { DesignReview } from "./DesignReview";
import { QuoteRequest } from "./QuoteRequest";
import { Confirmation } from "./Confirmation";

interface DesignFlowProps {
  userName: string;
  userEmail?: string;
  isFirstTime?: boolean;
  onComplete?: () => void;
}

export function DesignFlow({
  userName,
  userEmail,
  isFirstTime = true,
  onComplete,
}: DesignFlowProps) {
  const step = useDesignFlowStore((s) => s.step);
  const setUserName = useDesignFlowStore((s) => s.setUserName);
  const setStep = useDesignFlowStore((s) => s.setStep);
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  // Enter fullscreen to hide tab header/nav during the guided flow
  useEffect(() => {
    enterFullscreen();
    return () => exitFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  // Set the user name on mount
  useEffect(() => {
    setUserName(userName);
  }, [userName, setUserName]);

  // Skip intro for returning users
  useEffect(() => {
    if (!isFirstTime && step === "intro") {
      setStep("photo");
    }
  }, [isFirstTime, step, setStep]);

  const renderStep = () => {
    switch (step) {
      case "intro":
        return <AIIntroduction key="intro" />;
      case "photo":
        return <PhotoCapture key="photo" />;
      case "walls":
      case "dimensions":
        return <WallDetection key="walls" />;
      case "discovery-purpose":
      case "discovery-style":
      case "discovery-priorities":
        return <Discovery key="discovery" />;
      case "processing":
        return <DesignProcessing key="processing" />;
      case "presentation":
        return <DesignPresentation key="presentation" />;
      case "budget":
        return <BudgetQuestion key="budget" />;
      case "fine-tuning":
        return <FineTuning key="fine-tuning" />;
      case "review":
        return <DesignReview key="review" />;
      case "quote":
        return <QuoteRequest key="quote" userEmail={userEmail} />;
      case "confirmation":
        return <Confirmation key="confirmation" onViewDashboard={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[100dvh]"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
