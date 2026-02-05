"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Package, Clock, CheckCircle, FileText, ArrowRight } from "lucide-react";
import { ReferralTracker } from "@/components/portal/ReferralTracker";
import { useRouter } from "next/navigation";

// Status display configuration
const statusConfig = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-800", icon: FileText },
  quoted: { label: "Quote Ready", color: "bg-green-100 text-green-800", icon: CheckCircle },
  ordered: { label: "Ordered", color: "bg-purple-100 text-purple-800", icon: Package },
  rejected: { label: "Declined", color: "bg-red-100 text-red-800", icon: FileText },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, getOrCreateUser, isLoggedIn } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [userCheckDone, setUserCheckDone] = useState(false);

  // Ensure user record exists and get userId
  useEffect(() => {
    const ensureUser = async () => {
      // Already have user ID from user record
      if (user?._id) {
        setUserId(user._id);
        setUserCheckDone(true);
        return;
      }

      // Still loading auth
      if (authLoading) {
        return;
      }

      // Not logged in
      if (!isLoggedIn) {
        setUserCheckDone(true);
        return;
      }

      // User is logged in but no users table record - create one
      try {
        const createdUser = await getOrCreateUser();
        if (createdUser?._id) {
          setUserId(createdUser._id);
        }
      } catch (error) {
        console.error("Failed to get user:", error);
      }
      setUserCheckDone(true);
    };
    ensureUser();
  }, [user, isLoggedIn, authLoading, getOrCreateUser]);

  // Query submissions by user's ID (more reliable than email)
  const submissions = useQuery(
    api.submissions.listByUserId,
    userId ? { userId: userId as any } : "skip"
  );

  // Query orders by user's ID
  const orders = useQuery(
    api.orders.listByUserId,
    userId ? { userId: userId as any } : "skip"
  );

  // Debug: log what we're querying with
  console.log("[Orders] userId:", userId, "user:", user, "isLoggedIn:", isLoggedIn, "userCheckDone:", userCheckDone);

  // Loading: still checking auth or waiting for query result
  const isQueryLoading = userId && submissions === undefined;
  const isStillChecking = !userCheckDone;

  if (isStillChecking || isQueryLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-zinc-500">Loading orders...</p>
      </div>
    );
  }

  // If not logged in, show message
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <Package className="h-12 w-12 text-zinc-400" />
          <p className="text-zinc-600">Please log in to view your orders.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Empty state illustration */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Package className="h-10 w-10 text-zinc-400" />
          </div>

          {/* Empty state message */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              No orders yet
            </h2>

            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Submit a design to get a quote.
            </p>
          </div>

          {/* Process explanation */}
          <div className="mt-2 max-w-sm rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Once you create a design and submit it, you&apos;ll receive a detailed
              quote. After approval and payment, you can track your order here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Your Orders
        </h1>

        {/* Active Orders */}
        {orders && orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Active Orders
            </h2>
            {orders.map((order: any) => {
              const date = new Date(order.createdAt).toLocaleDateString();
              const getStatusLabel = (status: string) => {
                return status.replace(/_/g, " ").toUpperCase();
              };
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
                <button
                  key={order._id}
                  onClick={() => router.push(`/portal/${order._id}`)}
                  className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  {/* Header with status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <Package className="w-3.5 h-3.5" />
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500">{date}</span>
                  </div>

                  {/* Order number */}
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {order.orderNumber}
                  </p>

                  {/* Design info */}
                  {order.design && (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Dimensions</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.design.config?.dimensions?.width || '—'}mm × {order.design.config?.dimensions?.height || '—'}mm
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Product</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                          {order.design.productType || 'Kitchen'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* View Details */}
                  <div className="flex items-center justify-end gap-1 text-sm font-medium text-blue-600 mt-3">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Submissions (Quotes pending) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Submissions
          </h2>
          {submissions.map((submission: any) => {
            const status = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = status.icon;
            const date = new Date(submission.createdAt).toLocaleDateString();

            return (
              <div
                key={submission._id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm"
              >
                {/* Header with status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">{date}</span>
                </div>

                {/* Design info */}
                {submission.design && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Dimensions</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {submission.design.config?.dimensions?.width || '—'}mm × {submission.design.config?.dimensions?.height || '—'}mm
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Product</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                        {submission.design.productType || 'Kitchen'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Options requested */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 text-xs text-zinc-500">
                  {submission.siteMeasure && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Site measure
                    </span>
                  )}
                  {submission.installQuote && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Installation
                    </span>
                  )}
                </div>

                {/* Timeline info based on status */}
                {submission.status === "pending" && (
                  <p className="mt-3 text-xs text-zinc-500 italic">
                    We'll email you when your quote is ready (2-3 business days)
                  </p>
                )}
                {submission.status === "quoted" && (
                  <p className="mt-3 text-xs text-green-600 font-medium">
                    Your quote is ready! Check your email for details.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Referral Tracker */}
        <div className="pt-4">
          <ReferralTracker />
        </div>
      </div>
    </div>
  );
}
