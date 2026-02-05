"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OrderDetail } from "@/components/portal/OrderDetail";

/**
 * Order Portal Page - Inner Component
 *
 * Wrapped in Suspense for static export compatibility
 */
function OrderPortalContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First check query param
    const idParam = searchParams.get("id");
    if (idParam) {
      setOrderId(decodeURIComponent(idParam));
      setIsLoading(false);
      return;
    }

    // Then check path segment (for /portal/xxx URLs)
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/portal\/(.+?)\/?$/);
    if (match) {
      setOrderId(decodeURIComponent(match[1]));
      setIsLoading(false);
      return;
    }

    // No order ID found
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4">
          <div className="w-64 h-8 bg-zinc-200 rounded"></div>
          <div className="w-64 h-48 bg-zinc-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // No order ID provided - show instructions
  if (!orderId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Order Portal</h1>
          <p className="text-zinc-600">
            Select an order from the Orders tab to view details.
          </p>
        </div>
      </div>
    );
  }

  return <OrderDetail orderId={orderId} />;
}

/**
 * Order Portal Page
 *
 * Supports two URL patterns for static export compatibility:
 * 1. /portal?id=xxx (query param - preferred for static export)
 * 2. /portal/xxx (path segment - for deep linking)
 *
 * Uses client-side URL parsing for path segments since
 * dynamic routes don't work with output: "export"
 */
export default function OrderPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4">
          <div className="w-64 h-8 bg-zinc-200 rounded"></div>
          <div className="w-64 h-48 bg-zinc-200 rounded-lg"></div>
        </div>
      </div>
    }>
      <OrderPortalContent />
    </Suspense>
  );
}
