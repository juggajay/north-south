/**
 * ConfirmationScreen component
 * Phase 06-02: Customer-facing submission flow
 *
 * Features:
 * - Success message with timeline (2-3 business days)
 * - Critical clarification: NO confirmation email will be sent now
 * - Auto-redirect to Orders tab after 2.5 seconds
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Info } from "lucide-react";

interface ConfirmationScreenProps {
  submissionId: string;
}

export function ConfirmationScreen({ submissionId }: ConfirmationScreenProps) {
  const router = useRouter();

  // Auto-redirect to Orders tab after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/orders");
    }, 2500);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      {/* Success Icon */}
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-500" />
      </div>

      {/* Success Heading */}
      <h1 className="text-2xl font-bold text-zinc-900 mb-2 text-center">
        Quote request submitted!
      </h1>

      {/* Timeline Message */}
      <p className="text-base text-zinc-600 mb-6 text-center max-w-md">
        We'll email you when your quote is ready (2-3 business days)
      </p>

      {/* No Email Clarification - CRITICAL */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mb-8">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-900 font-medium mb-1">
            No confirmation email
          </p>
          <p className="text-sm text-blue-700">
            No confirmation email will be sent now. You'll hear from us when your quote is ready.
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4 bg-zinc-50 rounded-lg max-w-md w-full">
        <p className="text-sm text-zinc-600 mb-2">Submission ID</p>
        <p className="text-xs font-mono text-zinc-900 bg-white px-3 py-2 rounded border border-zinc-200">
          {submissionId}
        </p>
      </div>

      {/* Redirect Message */}
      <p className="text-sm text-zinc-500 mt-6">
        Redirecting to Orders...
      </p>
    </div>
  );
}
