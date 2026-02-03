import { Camera } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Camera icon - primary action */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Camera className="h-12 w-12" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          North South Carpentry
        </h1>

        <p className="max-w-xs text-lg text-zinc-600 dark:text-zinc-400">
          Take a photo of your space to start designing your custom cabinetry.
        </p>

        <button className="mt-4 flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-lg font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Camera className="h-5 w-5" />
          Take Photo
        </button>

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
          Coming soon: AI-powered design suggestions
        </p>
      </div>
    </div>
  );
}
