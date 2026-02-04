/**
 * SubmissionFlow component
 * Phase 06-02: Customer-facing submission flow
 *
 * Features:
 * - Orchestrates multi-step submission flow (options -> review -> confirmation)
 * - Auto-populates name/email from logged-in account (NO form fields for these)
 * - Uses React Hook Form + Zod for form validation
 * - Calls Convex submissions.create mutation
 * - Shows toast notifications on success/error
 * - State machine: "options" -> "review" -> "confirmation"
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { useCabinetStore } from "@/stores/useCabinetStore";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { PreSubmitOptions } from "./PreSubmitOptions";
import { ReviewSummary } from "./ReviewSummary";
import { ConfirmationScreen } from "./ConfirmationScreen";

// ============================================================================
// ZOD SCHEMA & TYPES
// ============================================================================

// IMPORTANT: Schema only has siteMeasure, installQuote, notes
// NO name/email fields - these come from useAuth() automatically
const submissionSchema = z.object({
  siteMeasure: z.boolean(),
  installQuote: z.boolean(),
  notes: z.string().optional(),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface SubmissionFlowProps {
  designId: Id<"designs">; // REQUIRED - passed from existing auto-saved design
  onCancel: () => void;
}

// ============================================================================
// SUBMISSION FLOW COMPONENT
// ============================================================================

export function SubmissionFlow({ designId, onCancel }: SubmissionFlowProps) {
  // State machine: "options" -> "review" -> "confirmation"
  const [step, setStep] = useState<"options" | "review" | "confirmation">("options");
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Get user from auth (MUST have name and email)
  const { user } = useAuth();

  // Convex mutation
  const createSubmission = useMutation(api.submissions.create);

  // Form setup with default values
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      siteMeasure: false,
      installQuote: false,
      notes: "",
    },
  });

  // Watch form values for review display
  const formValues = form.watch();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = () => {
    if (step === "options") {
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "review") {
      setStep("options");
    }
  };

  const handleSubmit = async () => {
    // Validate user is logged in
    if (!user || !user.name || !user.email) {
      toast.error("User information missing. Please log in again.");
      return;
    }

    // Get form data
    const formData = form.getValues();

    try {
      // Call Convex mutation
      const id = await createSubmission({
        designId,
        name: user.name, // Auto-populated from logged-in account
        email: user.email, // Auto-populated from logged-in account
        siteMeasure: formData.siteMeasure,
        installQuote: formData.installQuote,
        notes: formData.notes || undefined,
      });

      // Success!
      setSubmissionId(id);
      setStep("confirmation");
      toast.success("Quote request submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit quote request. Please try again.");
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Confirmation screen
  if (step === "confirmation" && submissionId) {
    return <ConfirmationScreen submissionId={submissionId} />;
  }

  return (
    <div className="min-h-[600px]">
      <Form {...form}>
        {/* Options Step */}
        {step === "options" && (
          <div>
            <PreSubmitOptions form={form} />

            {/* Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
              <button
                type="button"
                onClick={onCancel}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && (
          <ReviewSummary
            siteMeasure={formValues.siteMeasure}
            installQuote={formValues.installQuote}
            notes={formValues.notes}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={form.formState.isSubmitting}
          />
        )}
      </Form>
    </div>
  );
}
