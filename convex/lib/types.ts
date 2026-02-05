// convex/lib/types.ts
import type { Id } from "../_generated/dataModel";

/**
 * Order status values
 */
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

/**
 * Submission status values
 */
export const SUBMISSION_STATUSES = [
  "pending",
  "in_review",
  "quoted",
  "ordered",
  "rejected",
] as const;

export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = [
  "order_confirmed",
  "production_started",
  "qc_complete",
  "ready_to_ship",
  "delivered",
  "post_install",
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

/**
 * Production photo milestones
 */
export const PHOTO_MILESTONES = [
  "production",
  "qc",
  "packaging",
  "delivery",
] as const;

export type PhotoMilestone = typeof PHOTO_MILESTONES[number];

/**
 * Valid image MIME types
 * Includes HEIC/HEIF for Apple device compatibility
 */
export const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/**
 * Order timeline structure
 */
export interface OrderTimeline {
  confirmed?: number;
  productionStart?: number;
  qcComplete?: number;
  readyToShip?: number;
  shipped?: number;
  delivered?: number;
  installed?: number;
}

/**
 * Timeline mapping from order status to OrderTimeline field name
 */
export const STATUS_TO_TIMELINE: Record<OrderStatus, keyof OrderTimeline | null> = {
  confirmed: "confirmed",
  production: "productionStart",
  qc: "qcComplete",
  ready_to_ship: "readyToShip",
  shipped: "shipped",
  delivered: "delivered",
  complete: null,
};

/**
 * Status to notification type mapping
 * Note: "shipped" and "complete" statuses don't trigger customer notifications
 */
export const STATUS_TO_NOTIFICATION: Partial<Record<OrderStatus, NotificationType>> = {
  confirmed: "order_confirmed",
  production: "production_started",
  qc: "qc_complete",
  ready_to_ship: "ready_to_ship",
  delivered: "delivered",
};

/**
 * Time constants (in milliseconds)
 */
export const MS_PER_DAY = 86400000;
export const MS_PER_HOUR = 3600000;
export const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Image processing limits
 */
export const IMAGE_LIMITS = {
  MAX_DIMENSION_PX: 1568,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  COMPRESSION_QUALITY: 0.8,
} as const;

/**
 * Email sender configuration
 */
export const EMAIL_CONFIG = {
  FROM_ADDRESS: "North South Carpentry <orders@northsouthcarpentry.com>",
  ADMIN_DOMAIN: "@northsouthcarpentry.com",
} as const;
