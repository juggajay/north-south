"use client";

import { OrderList } from "@/components/admin/OrderList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Order Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Track and manage production orders
          </p>
        </header>

        <OrderList />
      </div>
    </div>
  );
}
