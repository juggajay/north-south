// src/types/orders.ts
// Mirror of convex/lib/types.ts for frontend use

import type { Id } from "../../convex/_generated/dataModel";

export const ORDER_STATUSES = [
  "confirmed",
  "production",
  "qc",
  "ready_to_ship",
  "shipped",
  "delivered",
  "complete",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const SUBMISSION_STATUSES = [
  "pending",
  "in_review",
  "quoted",
  "ordered",
  "rejected",
] as const;

export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

export interface OrderTimeline {
  confirmed?: number;
  productionStart?: number;
  qcComplete?: number;
  readyToShip?: number;
  shipped?: number;
  delivered?: number;
  installed?: number;
}

export interface EnrichedOrder {
  _id: Id<"orders">;
  submissionId: Id<"submissions">;
  orderNumber: string;
  status: OrderStatus;
  depositPaid: boolean;
  depositAmount?: number;
  balanceDue?: number;
  totalAmount?: number;
  timeline?: OrderTimeline;
  createdAt: number;
  submission?: {
    _id: Id<"submissions">;
    name: string;
    email: string;
    phone?: string;
    status: SubmissionStatus;
  } | null;
  design?: {
    _id: Id<"designs">;
    productType: string;
    config: unknown;
  } | null;
}
