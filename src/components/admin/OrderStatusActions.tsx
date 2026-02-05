"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

interface OrderStatusActionsProps {
  orderId: Id<"orders">;
  currentStatus: string;
}

type OrderStatus = "confirmed" | "production" | "qc" | "ready_to_ship" | "shipped" | "delivered" | "complete";

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const updateStatus = useMutation(api.orders.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus({ id: orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine available status transitions based on current status
  const getStatusActions = (status: string) => {
    const orderStatus = status as OrderStatus;
    switch (orderStatus) {
      case "confirmed":
        return [
          { label: "Start Production", status: "production", variant: "default" as const },
        ];
      case "production":
        return [
          { label: "Move to QC", status: "qc", variant: "default" as const },
        ];
      case "qc":
        return [
          { label: "Ready to Ship", status: "ready_to_ship", variant: "default" as const },
          { label: "Back to Production", status: "production", variant: "outline" as const },
        ];
      case "ready_to_ship":
        return [
          { label: "Mark as Shipped", status: "shipped", variant: "default" as const },
        ];
      case "shipped":
        return [
          { label: "Mark as Delivered", status: "delivered", variant: "default" as const },
        ];
      case "delivered":
        return [
          { label: "Mark Complete", status: "complete", variant: "default" as const },
        ];
      case "complete":
        return [];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions(currentStatus);

  if (statusActions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {statusActions.map((action) => (
        <Button
          key={action.status}
          size="sm"
          variant={action.variant}
          onClick={() => handleStatusUpdate(action.status)}
          disabled={isUpdating}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
