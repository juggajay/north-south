import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <MessageCircle className="h-10 w-10 text-zinc-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Design Assistant
        </h1>

        <p className="max-w-xs text-zinc-600 dark:text-zinc-400">
          Get instant answers about materials, finishes, and design options.
        </p>

        <div className="mt-4 w-full max-w-sm">
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">
              Coming soon: AI chat powered by Gemini
            </p>
          </div>
        </div>

        <div className="mt-8 text-xs text-zinc-400">
          For complex questions, our team will respond within 24 hours
        </div>
      </div>
    </div>
  );
}
