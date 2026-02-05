// src/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Only log info and above in production
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (!shouldLog("debug")) return;
    console.debug(formatMessage("debug", message, context));
  },

  info(message: string, context?: LogContext): void {
    if (!shouldLog("info")) return;
    console.info(formatMessage("info", message, context));
  },

  warn(message: string, context?: LogContext): void {
    if (!shouldLog("warn")) return;
    console.warn(formatMessage("warn", message, context));
  },

  error(message: string, error?: Error, context?: LogContext): void {
    if (!shouldLog("error")) return;
    const errorContext = error
      ? { ...context, errorMessage: error.message, errorStack: error.stack }
      : context;
    console.error(formatMessage("error", message, errorContext));
  },
};
