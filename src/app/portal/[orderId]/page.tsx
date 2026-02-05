"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { OrderTimeline } from "@/components/portal/OrderTimeline";
import { DocumentList } from "@/components/portal/DocumentList";
import { ProductionGallery } from "@/components/portal/ProductionGallery";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [photosExpanded, setPhotosExpanded] = useState(false);

  // Fetch order data
  const order = useQuery(
    api.orders.get,
    params.orderId ? { id: params.orderId as Id<"orders"> } : "skip"
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, router]);

  // Loading state
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-zinc-500">Loading order...</p>
      </div>
    );
  }

  // Order not found
  if (order === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Order Not Found</h1>
        <p className="text-zinc-600 mb-6">
          This order doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => router.push("/orders")}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // Still loading order data
  if (order === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-zinc-500">Loading order details...</p>
      </div>
    );
  }

  // Status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-800",
      production: "bg-purple-100 text-purple-800",
      qc: "bg-indigo-100 text-indigo-800",
      ready_to_ship: "bg-cyan-100 text-cyan-800",
      shipped: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      complete: "bg-zinc-100 text-zinc-800",
    };
    return colors[status] || "bg-zinc-100 text-zinc-800";
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/orders")}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{order.orderNumber}</p>
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                  getStatusColor(order.status)
                )}
              >
                {order.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Order Timeline Section */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">Order Status</h2>
          <OrderTimeline currentStatus={order.status} timeline={order.timeline} />
        </section>

        {/* Documents Section - Collapsible */}
        <section className="bg-white rounded-xl border border-zinc-200">
          <button
            onClick={() => setDocumentsExpanded(!documentsExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Documents</h2>
            {documentsExpanded ? (
              <ChevronUp className="h-5 w-5 text-zinc-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-500" />
            )}
          </button>
          {documentsExpanded && (
            <div className="px-6 pb-6 border-t border-zinc-100">
              <DocumentList orderId={order._id} />
            </div>
          )}
        </section>

        {/* Production Photos Section - Collapsible */}
        <section className="bg-white rounded-xl border border-zinc-200">
          <button
            onClick={() => setPhotosExpanded(!photosExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Production Photos</h2>
            {photosExpanded ? (
              <ChevronUp className="h-5 w-5 text-zinc-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-500" />
            )}
          </button>
          {photosExpanded && (
            <div className="px-6 pb-6 border-t border-zinc-100">
              <ProductionGallery orderId={order._id} />
            </div>
          )}
        </section>

        {/* Installation Guides Placeholder */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Installation Guides</h2>
          <div className="text-center py-8 bg-zinc-50 rounded-lg">
            <p className="text-sm text-zinc-500">
              Installation guide videos coming soon
            </p>
          </div>
        </section>

        {/* Need Help Section */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Need Help?</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Have questions about your order? Our team is here to help.
          </p>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Start a Chat</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
