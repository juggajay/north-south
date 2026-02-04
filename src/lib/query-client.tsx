'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * Creates a QueryClient with configured retry logic.
 *
 * Retry policy:
 * - Only retry on 5xx server errors (not 4xx client errors)
 * - Maximum 3 retry attempts
 * - Exponential backoff: 1s, 2s, 4s (capped at 30s)
 * - 5 minute stale time for cached data
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time of 5 minutes for cached data
        staleTime: 5 * 60 * 1000,
        // Retry only on 5xx errors, not 4xx
        retry: (failureCount, error: unknown) => {
          const err = error as { status?: number };
          if (err?.status && err.status >= 400 && err.status < 500) return false;
          return failureCount < 3;
        },
        // Exponential backoff: 1s, 2s, 4s (capped at 30s)
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Same retry logic for mutations
        retry: (failureCount, error: unknown) => {
          const err = error as { status?: number };
          if (err?.status && err.status >= 400 && err.status < 500) return false;
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Gets or creates the QueryClient.
 * Server: always creates a new client (no shared state between requests)
 * Browser: singleton pattern (reuses existing client)
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query provider for the application.
 * Wraps children with QueryClientProvider configured for AI pipeline needs.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
