"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about materials, hardware, or design...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");

      // Refocus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-full bg-zinc-100 px-4 py-3 pr-12 text-sm outline-none transition-colors",
            "placeholder:text-zinc-500",
            "focus:bg-zinc-200 focus:ring-2 focus:ring-zinc-300",
            "dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-400",
            "dark:focus:bg-zinc-700 dark:focus:ring-zinc-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[48px]"
          )}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          "bg-zinc-900 text-white transition-all",
          "dark:bg-zinc-100 dark:text-zinc-900",
          "hover:scale-105 active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        )}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
