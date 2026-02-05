"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { OrderTimeline } from "./OrderTimeline";
import { DocumentList } from "./DocumentList";
import { ProductionGallery } from "./ProductionGallery";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [photosExpanded, setPhotosExpanded] = useState(false);

  // Fetch order data
  const order = useQuery(
    api.orders.get,
    orderId ? { id: orderId as Id<"orders"> } : "skip"
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/auth/login");
    }
  }, [authLoading, isLoggedIn, router]);

  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Order Not Found</h2>
          <p className="text-zinc-600 mb-4">This order doesn't exist or you don't have access to it.</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-zinc-900 hover:text-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">
            Order {order.orderNumber}
          </h1>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Order Status</h2>
          <OrderTimeline timeline={order.timeline as any} currentStatus={order.status} />
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setDocumentsExpanded(!documentsExpanded)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Documents</h2>
            {documentsExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-600" />
            )}
          </button>
          <div
            className={cn(
              "mt-4 transition-all duration-200",
              documentsExpanded ? "block" : "hidden"
            )}
          >
            <DocumentList orderId={orderId as Id<"orders">} />
          </div>
        </div>

        {/* Production Photos Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setPhotosExpanded(!photosExpanded)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Production Photos</h2>
            {photosExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-600" />
            )}
          </button>
          <div
            className={cn(
              "mt-4 transition-all duration-200",
              photosExpanded ? "block" : "hidden"
            )}
          >
            <ProductionGallery orderId={orderId as Id<"orders">} />
          </div>
        </div>

        {/* Support Button */}
        <div className="text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
