/**
 * SubmissionFlow component
 * Phase 06-02: Customer-facing submission flow
 *
 * Features:
 * - Orchestrates multi-step submission flow (options -> review -> confirmation)
 * - Auto-populates name/email from logged-in account when available
 * - Falls back to manual entry if user data unavailable
 * - Uses React Hook Form + Zod for form validation
 * - Calls Convex submissions.create mutation
 * - Shows toast notifications on success/error
 * - State machine: "options" -> "review" -> "confirmation"
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PreSubmitOptions } from "./PreSubmitOptions";
import { ReviewSummary } from "./ReviewSummary";
import { ConfirmationScreen } from "./ConfirmationScreen";

// ============================================================================
// ZOD SCHEMA & TYPES
// ============================================================================

// Schema includes name/email as fallback if auto-population fails
const submissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user from auth
  const { user, getOrCreateUser, isLoading } = useAuth();

  // Convex mutation
  const createSubmission = useMutation(api.submissions.create);

  // Form setup - will be populated once we have user data
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      email: "",
      siteMeasure: false,
      installQuote: false,
      notes: "",
    },
  });

  // Populate form fields when user data arrives (only if fields are still empty)
  useEffect(() => {
    if (user?.name && !form.getValues("name")) {
      form.setValue("name", user.name);
    }
    if (user?.email && !form.getValues("email")) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  // Mark initialized once auth loading settles
  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  // Watch form values for review display
  const formValues = form.watch();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = () => {
    if (step === "options") {
      // Validate name and email before proceeding
      const name = form.getValues("name");
      const email = form.getValues("email");

      if (!name || name.trim() === "") {
        toast.error("Please enter your name");
        return;
      }
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email");
        return;
      }

      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "review") {
      setStep("options");
    }
  };

  const handleSubmit = async () => {
    // Get form data
    const formData = form.getValues();

    // Validate
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      // Get or create user to link submission to account
      let currentUser = user;
      if (!currentUser?._id) {
        try {
          currentUser = await getOrCreateUser();
        } catch (e) {
          console.error("Could not get user for submission:", e);
        }
      }

      // Call Convex mutation
      const id = await createSubmission({
        designId,
        userId: currentUser?._id,
        name: formData.name,
        email: formData.email,
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

  // Brief loading while initializing (max 500ms due to timeout)
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px]">
      <Form {...form}>
        {/* Options Step */}
        {step === "options" && (
          <div>
            {/* Contact Info - shown if not auto-populated or editable */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
