"use client";

import { Camera } from "lucide-react";

export default function HomePage() {
  const handleTakePhoto = () => {
    console.log("Take Photo clicked - will be wired to camera capture in Plan 04");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Large camera icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Camera className="h-12 w-12" />
        </div>

        {/* Welcome message */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to North South
          </h1>

          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            AI-powered custom cabinetry for Sydney homes
          </p>

          <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
            Take a photo of your space and we&apos;ll create styled design renders in
            seconds. Configure your exact requirements with live pricing.
          </p>
        </div>

        {/* Primary CTA - thumb zone optimized */}
        <button
          onClick={handleTakePhoto}
          className="mt-6 flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-lg font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
        >
          <Camera className="h-5 w-5" />
          Take Photo
        </button>

        {/* Secondary action hint */}
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Or browse your gallery
        </p>
      </div>
    </div>
  );
}
