import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Empty state illustration */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Package className="h-10 w-10 text-zinc-400" />
        </div>

        {/* Empty state message */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            No orders yet
          </h2>

          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Submit a design to get a quote.
          </p>
        </div>

        {/* Process explanation */}
        <div className="mt-2 max-w-sm rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Once you create a design and submit it, you&apos;ll receive a detailed
            quote. After approval and payment, you can track your order here.
          </p>
        </div>
      </div>
    </div>
  );
}
