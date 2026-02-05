"use client";

import { TimelineStep } from "./TimelineStep";

interface OrderTimelineProps {
  currentStatus: string;
  timeline?: {
    confirmed?: number;
    productionStart?: number;
    qcComplete?: number;
    readyToShip?: number;
    shipped?: number;
    delivered?: number;
  };
}

const ORDER_STEPS = [
  {
    id: "confirmed",
    name: "Order Confirmed",
    description: "Deposit received, production scheduled",
  },
  {
    id: "production",
    name: "In Production",
    description: "Your panels are being manufactured",
  },
  {
    id: "qc",
    name: "QC Complete",
    description: "Quality check passed",
  },
  {
    id: "ready_to_ship",
    name: "Ready to Ship",
    description: "Packed and awaiting dispatch",
  },
  {
    id: "shipped",
    name: "Shipped",
    description: "On the way to you",
  },
  {
    id: "delivered",
    name: "Delivered",
    description: "Your order has arrived",
  },
  {
    id: "complete",
    name: "Complete",
    description: "Project finished",
  },
];

// Map status strings to timeline field names
const STATUS_TO_TIMELINE_MAP: Record<string, string> = {
  confirmed: "confirmed",
  production: "productionStart",
  qc: "qcComplete",
  ready_to_ship: "readyToShip",
  shipped: "shipped",
  delivered: "delivered",
};

export function OrderTimeline({ currentStatus, timeline = {} }: OrderTimelineProps) {
  // Find current step index
  const currentIndex = ORDER_STEPS.findIndex((step) => step.id === currentStatus);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="space-y-0">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < effectiveIndex;
        const isCurrent = index === effectiveIndex;
        const isLast = index === ORDER_STEPS.length - 1;

        // Get timestamp from timeline object
        const timelineField = STATUS_TO_TIMELINE_MAP[step.id];
        const timestamp = timelineField
          ? (timeline as any)[timelineField]
          : undefined;

        return (
          <TimelineStep
            key={step.id}
            step={step}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            timestamp={timestamp}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}
