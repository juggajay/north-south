import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Package className="h-10 w-10 text-zinc-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your Orders
        </h1>

        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Track your orders, view production photos, and access documents.
        </p>

        <div className="mt-4 w-full max-w-sm space-y-3">
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">No orders yet</p>
            <p className="mt-2 text-xs text-zinc-400">
              Submit a design to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
