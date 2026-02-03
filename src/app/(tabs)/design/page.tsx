import { Palette } from "lucide-react";

export default function DesignPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Palette className="h-10 w-10 text-zinc-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Design Studio
        </h1>

        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Configure your cabinetry with our interactive 3D designer.
        </p>

        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">
            Coming soon: 3D configurator with real-time pricing
          </p>
        </div>
      </div>
    </div>
  );
}
