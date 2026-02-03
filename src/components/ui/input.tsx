import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input (replaces helperText when present) */
  error?: string;
}

function Input({
  className,
  type,
  label,
  helperText,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id || React.useId();
  const hasError = !!error;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        data-slot="input"
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        className={cn(
          // Base styles
          "flex h-11 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-base shadow-sm transition-all dark:bg-zinc-900",
          // Placeholder and selection
          "placeholder:text-zinc-400 selection:bg-primary selection:text-primary-foreground",
          // Focus states
          "outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-800",
          // Error states
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-400 dark:focus:ring-red-900/30"
            : "border-zinc-200 dark:border-zinc-700",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-900 dark:file:text-zinc-50",
          // 44px touch target
          "min-h-[44px]",
          className
        )}
        {...props}
      />
      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          id={hasError ? `${inputId}-error` : `${inputId}-helper`}
          className={cn(
            "text-sm",
            hasError
              ? "text-red-500 dark:text-red-400"
              : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
