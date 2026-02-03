"use client";

import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DesignPage() {
  const router = useRouter();

  const handleStartDesigning = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Empty state illustration */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Palette className="h-10 w-10 text-zinc-400" />
        </div>

        {/* Empty state message */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            No designs yet
          </h2>

          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Take a photo to start creating.
          </p>
        </div>

        {/* Optional CTA */}
        <button
          onClick={handleStartDesigning}
          className="mt-2 rounded-lg border border-zinc-300 bg-transparent px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:active:bg-zinc-800"
        >
          Start Designing
        </button>
      </div>
    </div>
  );
}
