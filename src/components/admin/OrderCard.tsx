"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, User, Mail, Phone } from "lucide-react";
import { OrderStatusActions } from "./OrderStatusActions";
import { PhotoUploader } from "./PhotoUploader";
import { NotificationTrigger } from "./NotificationTrigger";
import type { Id } from "../../../convex/_generated/dataModel";

interface OrderCardProps {
  order: {
    _id: Id<"orders">;
    orderNumber: string;
    status: string;
    depositPaid?: boolean;
    depositAmount?: number;
    totalAmount?: number;
    balanceDue?: number;
    timeline?: {
      confirmed?: number;
      productionStart?: number;
      qcComplete?: number;
      readyToShip?: number;
      shipped?: number;
      delivered?: number;
    };
    createdAt: number;
    submission?: {
      name: string;
      email: string;
      phone?: string;
      notes?: string;
      internalNotes?: string;
    } | null;
    design?: {
      config: any;
      productType: string;
    } | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Order Confirmed",
  production: "In Production",
  qc: "Quality Check",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  complete: "Complete",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  production: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  qc: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  ready_to_ship: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  complete: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
};

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date as relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (days < 7) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Format date for timeline
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const statusColor = STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-800";
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              {order.orderNumber}
            </CardTitle>
            {order.submission && (
              <CardDescription className="mt-1">{order.submission.name}</CardDescription>
            )}
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
              <span>{formatRelativeTime(order.createdAt)}</span>
              {order.totalAmount !== undefined && (
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatCurrency(order.totalAmount)}
                </span>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </CardHeader>

      {!isExpanded && order.design && (
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium capitalize">{order.design.productType}</span>
            {order.design.config?.dimensions && (
              <span className="ml-2">
                • {order.design.config.dimensions.width}mm × {order.design.config.dimensions.height}mm × {order.design.config.dimensions.depth}mm
              </span>
            )}
            {order.design.config?.slots && (
              <span className="ml-2">
                • {Object.values(order.design.config.slots).filter((slot: any) => slot.module).length} modules
              </span>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex-col gap-3 items-stretch">
        {/* Status Action Buttons */}
        <OrderStatusActions orderId={order._id} currentStatus={order.status} />

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="mr-2" />
              View Full Details
            </>
          )}
        </Button>
      </CardFooter>

      {/* Expanded Detail View */}
      {isExpanded && (
        <CardContent className="border-t pt-6 space-y-6">
          {/* Customer Info */}
          {order.submission && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <User className="w-4 h-4" />
                  <span>{order.submission.name}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span>{order.submission.email}</span>
                </div>
                {order.submission.phone && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Phone className="w-4 h-4" />
                    <span>{order.submission.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Payment Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zinc-500">Total Amount:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div>
                <span className="text-zinc-500">Deposit:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(order.depositAmount)}
                  {order.depositPaid && <span className="ml-1 text-green-600">✓ Paid</span>}
                </p>
              </div>
              <div>
                <span className="text-zinc-500">Balance Due:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.balanceDue)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Production Timeline</h3>
            <div className="space-y-2 text-sm">
              {order.timeline?.confirmed && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Order Confirmed:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.confirmed)}</span>
                </div>
              )}
              {order.timeline?.productionStart && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Production Started:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.productionStart)}</span>
                </div>
              )}
              {order.timeline?.qcComplete && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">QC Complete:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.qcComplete)}</span>
                </div>
              )}
              {order.timeline?.readyToShip && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Ready to Ship:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.readyToShip)}</span>
                </div>
              )}
              {order.timeline?.shipped && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Shipped:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.shipped)}</span>
                </div>
              )}
              {order.timeline?.delivered && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Delivered:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatDate(order.timeline.delivered)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.submission?.notes || order.submission?.internalNotes) && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Notes</h3>
              {order.submission.notes && (
                <div className="mb-3">
                  <span className="text-xs text-zinc-500">Customer Notes:</span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{order.submission.notes}</p>
                </div>
              )}
              {order.submission.internalNotes && (
                <div>
                  <span className="text-xs text-zinc-500">Internal Notes:</span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{order.submission.internalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Photo Upload section */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Upload Photos
                </p>
                <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4">
                <PhotoUploader orderId={order._id} />
              </div>
            </details>
          </div>

          {/* Notification Trigger section */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Send Notification
                </p>
                <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4">
                <NotificationTrigger
                  orderId={order._id}
                  customerEmail={order.submission?.email}
                />
              </div>
            </details>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
