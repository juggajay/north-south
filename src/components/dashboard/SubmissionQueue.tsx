"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SubmissionCard } from "./SubmissionCard";

export function SubmissionQueue() {
  // Real-time subscription - updates automatically when new submissions arrive
  // Query returns submissions in FIFO order (oldest first) for team workflow
  const submissions = useQuery(api.submissions.listAll);

  if (submissions === undefined) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No submissions yet
        </p>
        <p className="mt-2 text-sm">
          Submissions will appear here when customers submit designs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission: any) => (
        <SubmissionCard key={submission._id} submission={submission} />
      ))}
    </div>
  );
}
