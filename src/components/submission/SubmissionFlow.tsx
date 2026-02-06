/**
 * SubmissionFlow component
 * Full-screen multi-step submission flow
 *
 * Renders at ConfiguratorPage level (replaces WizardShell when active).
 * State machine: "options" -> "review" -> "confirmation"
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
import { Button } from "@/components/ui/button";
import { PreSubmitOptions } from "./PreSubmitOptions";
import { ReviewSummary } from "./ReviewSummary";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { ChevronLeft } from "lucide-react";

// ============================================================================
// ZOD SCHEMA & TYPES
// ============================================================================

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
  designId: Id<"designs">;
  onCancel: () => void;
}

// ============================================================================
// SUBMISSION FLOW COMPONENT
// ============================================================================

export function SubmissionFlow({ designId, onCancel }: SubmissionFlowProps) {
  const [step, setStep] = useState<"options" | "review" | "confirmation">("options");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { user, getOrCreateUser, isLoading } = useAuth();
  const createSubmission = useMutation(api.submissions.create);

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

  // Ensure user record exists, then populate form
  useEffect(() => {
    if (isLoading) return;

    const ensureUser = async () => {
      let userData = user;
      if (!userData) {
        try {
          userData = await getOrCreateUser();
        } catch (error) {
          console.error("Could not get/create user:", error);
        }
      }

      if (userData?.name && !form.getValues("name")) {
        form.setValue("name", userData.name);
      }
      if (userData?.email && !form.getValues("email")) {
        form.setValue("email", userData.email);
      }

      setIsInitialized(true);
    };

    ensureUser();
  }, [user, isLoading, getOrCreateUser, form]);

  const formValues = form.watch();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = async () => {
    if (step === "options") {
      let name = form.getValues("name");
      let email = form.getValues("email");

      if (!name || !email) {
        let userData = user;
        if (!userData) {
          try {
            userData = await getOrCreateUser();
          } catch (e) {
            // fall through to validation
          }
        }
        if (userData?.name && !name) {
          name = userData.name;
          form.setValue("name", name);
        }
        if (userData?.email && !email) {
          email = userData.email;
          form.setValue("email", email);
        }
      }

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
    const formData = form.getValues();

    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      let currentUser = user;
      if (!currentUser?._id) {
        try {
          currentUser = await getOrCreateUser();
        } catch (e) {
          console.error("Could not get user for submission:", e);
        }
      }

      const id = await createSubmission({
        designId,
        userId: currentUser?._id,
        name: formData.name,
        email: formData.email,
        siteMeasure: formData.siteMeasure,
        installQuote: formData.installQuote,
        notes: formData.notes || undefined,
      });

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

  // Confirmation screen (page 3)
  if (step === "confirmation" && submissionId) {
    return <ConfirmationScreen submissionId={submissionId} />;
  }

  // Brief loading
  if (!isInitialized && isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mb-4" />
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Form {...form}>
        {/* Page 1: Contact & Options */}
        {step === "options" && (
          <>
            {/* Header */}
            <div className="h-14 px-4 flex items-center gap-3 border-b">
              <button type="button" onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100">
                <ChevronLeft className="w-5 h-5 text-zinc-700" />
              </button>
              <h1 className="text-lg font-semibold">Contact & Options</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Contact Info */}
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900">Contact Information</h2>
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

              <PreSubmitOptions form={form} />
            </div>

            {/* Bottom action */}
            <div className="px-4 py-3 border-t">
              <Button onClick={handleNext} variant="primary" size="md" className="w-full">
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Page 2: Final Review */}
        {step === "review" && (
          <>
            {/* Header */}
            <div className="h-14 px-4 flex items-center gap-3 border-b">
              <button type="button" onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100">
                <ChevronLeft className="w-5 h-5 text-zinc-700" />
              </button>
              <h1 className="text-lg font-semibold">Final Review</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ReviewSummary
                siteMeasure={formValues.siteMeasure}
                installQuote={formValues.installQuote}
                notes={formValues.notes}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={form.formState.isSubmitting}
              />
            </div>

            {/* Bottom action */}
            <div className="px-4 py-3 border-t">
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="md"
                className="w-full"
                loading={form.formState.isSubmitting}
              >
                Confirm & Submit
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
