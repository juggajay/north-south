"use client";

import { SubmissionQueue } from "@/components/dashboard/SubmissionQueue";
import { AdminGuard } from "@/components/auth/AdminGuard";
import Link from "next/link";
import { Package } from "lucide-react";

export default function AdminSubmissionsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Submission Queue
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Review customer submissions and create quotes
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Package className="w-4 h-4" />
                View Orders
              </Link>
            </div>
          </header>

          <SubmissionQueue />
        </div>
      </div>
    </AdminGuard>
  );
}
