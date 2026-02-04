"use client";

import { SubmissionQueue } from "@/components/dashboard/SubmissionQueue";

export default function AdminSubmissionsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Submission Queue
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Review customer submissions and create quotes
          </p>
        </header>

        <SubmissionQueue />
      </div>
    </div>
  );
}
