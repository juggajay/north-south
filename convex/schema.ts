import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Include auth tables (authAccounts, authSessions, authRefreshTokens, etc.)
  ...authTables,
  // ===================
  // USERS
  // ===================
  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.optional(v.number()), // Unix timestamp
  }).index("by_email", ["email"]),

  // ===================
  // DESIGNS
  // ===================
  designs: defineTable({
    userId: v.optional(v.id("users")), // Optional for anonymous designs
    productType: v.string(), // "kitchen", "laundry", "vanity", "wardrobe"
    config: v.any(), // Flexible configuration object
    status: v.string(), // "draft", "submitted", "quoted", "ordered"
    renders: v.array(v.string()), // Storage IDs of rendered images
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // ===================
  // DESIGN VERSIONS (for history/restore)
  // ===================
  designVersions: defineTable({
    designId: v.id("designs"),
    version: v.number(), // Auto-incrementing per design
    config: v.any(), // Full config snapshot (dimensions, slots, finishes)
    thumbnail: v.optional(v.string()), // Optional screenshot storage ID
    label: v.optional(v.string()), // Optional user label ("Before adding pantry")
    createdAt: v.number(),
  })
    .index("by_designId", ["designId"])
    .index("by_designId_version", ["designId", "version"]),

  // ===================
  // SUBMISSIONS
  // ===================
  submissions: defineTable({
    designId: v.id("designs"),
    userId: v.optional(v.id("users")), // Link to user account (optional for backwards compat)
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    siteMeasure: v.boolean(),
    installQuote: v.boolean(),
    status: v.string(), // "pending", "quoted", "ordered", "rejected"
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()), // Team-only notes, not visible to customer
    createdAt: v.number(),
  })
    .index("by_designId", ["designId"])
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  // ===================
  // ORDERS
  // ===================
  orders: defineTable({
    submissionId: v.id("submissions"),
    orderNumber: v.string(), // Human-readable order number
    status: v.string(), // "confirmed", "production", "qc", "shipping", "delivered", "installed"
    depositPaid: v.boolean(),
    depositAmount: v.optional(v.number()),
    balanceDue: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    timeline: v.optional(
      v.object({
        confirmed: v.optional(v.number()),
        productionStart: v.optional(v.number()),
        qcComplete: v.optional(v.number()),
        readyToShip: v.optional(v.number()),
        shipped: v.optional(v.number()),
        delivered: v.optional(v.number()),
        installed: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"]),

  // ===================
  // DOCUMENTS (quotes, invoices)
  // ===================
  documents: defineTable({
    orderId: v.id("orders"),
    type: v.union(v.literal("quote"), v.literal("invoice")),
    version: v.number(), // Auto-increment per type
    fileName: v.string(),
    storageId: v.string(), // Convex storage ID
    createdAt: v.number(),
  }).index("by_orderId", ["orderId"]),

  // ===================
  // PRODUCTION PHOTOS
  // ===================
  productionPhotos: defineTable({
    orderId: v.id("orders"),
    storageId: v.string(), // Convex storage ID
    milestone: v.string(), // "production", "qc", "packaging", "delivery"
    caption: v.optional(v.string()),
    uploadedAt: v.number(),
  }).index("by_orderId", ["orderId"]),

  // ===================
  // NOTIFICATIONS
  // ===================
  notifications: defineTable({
    orderId: v.id("orders"),
    type: v.string(), // "order_confirmed", "production_started", "qc_complete", "ready_to_ship", "delivered", "post_install"
    channel: v.string(), // "email", "sms", "push"
    recipient: v.string(), // Email or phone number
    sentAt: v.number(),
    status: v.string(), // "pending", "sent", "delivered", "failed"
    errorMessage: v.optional(v.string()),
  })
    .index("by_orderId", ["orderId"])
    .index("by_status", ["status"]),

  // ===================
  // CHAT
  // ===================
  conversations: defineTable({
    userId: v.optional(v.id("users")), // Optional for anonymous users
    title: v.optional(v.string()),     // Auto-generated from first message
    lastMessageAt: v.number(),         // Unix timestamp for sorting
    unreadCount: v.number(),           // Track unread for badge
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.string(),                  // "user" | "assistant"
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_createdAt", ["createdAt"]),

  // ===================
  // PRODUCT CATALOG: STYLES
  // ===================
  styles: defineTable({
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "modern", "traditional", "transitional"
    active: v.boolean(),
    sortOrder: v.number(),
  }).index("by_code", ["code"]),

  // ===================
  // PRODUCT CATALOG: MATERIALS
  // ===================
  materials: defineTable({
    code: v.string(), // e.g., "POL-NOWM"
    name: v.string(), // e.g., "Natural Oak Woodmatt"
    supplier: v.string(), // e.g., "Polytec"
    category: v.string(), // "woodmatt", "satin", "gloss"
    colorFamily: v.string(), // "oak", "white", "grey", "black"
    pricePerUnit: v.number(), // Price per square meter or unit
    swatchUrl: v.optional(v.string()), // Image URL for material swatch
    textureUrl: v.optional(v.string()), // 3D texture URL
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_category", ["category"])
    .index("by_colorFamily", ["colorFamily"]),

  // ===================
  // PRODUCT CATALOG: HARDWARE
  // ===================
  hardware: defineTable({
    code: v.string(), // e.g., "BLUM-CLIP-110"
    name: v.string(), // e.g., "Blum CLIP top 110"
    supplier: v.string(), // e.g., "Blum"
    category: v.string(), // "hinge", "drawer", "lift", "organizer"
    specs: v.optional(v.any()), // Flexible specs object
    pricePerUnit: v.number(),
    priceVariance: v.optional(v.number()), // Percentage variance for estimates
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_category", ["category"]),

  // ===================
  // PRODUCT CATALOG: DOOR PROFILES
  // ===================
  doorProfiles: defineTable({
    code: v.string(),
    name: v.string(), // e.g., "Flat Panel", "Slimline Shaker"
    description: v.optional(v.string()),
    pricePerDoor: v.number(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    sortOrder: v.number(),
  }).index("by_code", ["code"]),

  // ===================
  // PRODUCT CATALOG: PRODUCTS
  // ===================
  products: defineTable({
    code: v.string(),
    name: v.string(), // e.g., "Kitchen", "Laundry", "Vanity", "Wardrobe"
    description: v.optional(v.string()),
    basePrice: v.number(), // Starting price
    active: v.boolean(),
    sortOrder: v.number(),
  }).index("by_code", ["code"]),

  // ===================
  // PRODUCT CATALOG: MODULES
  // ===================
  modules: defineTable({
    code: v.string(),
    name: v.string(), // e.g., "Base Cabinet 600mm"
    productCode: v.string(), // Links to product
    category: v.string(), // "base", "overhead", "tall", "corner"
    defaultWidth: v.number(), // mm
    defaultHeight: v.number(), // mm
    defaultDepth: v.number(), // mm
    minWidth: v.optional(v.number()),
    maxWidth: v.optional(v.number()),
    pricePerUnit: v.number(),
    modelUrl: v.optional(v.string()), // 3D model URL
    thumbnailUrl: v.optional(v.string()),
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_productCode", ["productCode"])
    .index("by_category", ["category"]),

  // ===================
  // PRODUCT CATALOG: ADD-ONS
  // ===================
  addons: defineTable({
    code: v.string(),
    name: v.string(), // e.g., "LED Strip", "Scribe Filler", "Wine Rack"
    description: v.optional(v.string()),
    category: v.string(), // "lighting", "filler", "storage", "organizer"
    pricePerUnit: v.number(),
    compatibleWith: v.array(v.string()), // Array of product/module codes
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_category", ["category"]),

  // ===================
  // QR CODES / PANEL TRACKING
  // ===================
  panelQrCodes: defineTable({
    orderId: v.id("orders"),
    panelId: v.string(), // Unique panel identifier
    qrCode: v.string(), // QR code value
    moduleInfo: v.any(), // Panel details
    assemblyNotes: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    scannedAt: v.optional(v.number()), // Last scan timestamp
  })
    .index("by_orderId", ["orderId"])
    .index("by_qrCode", ["qrCode"]),

  // ===================
  // REFERRALS
  // ===================
  referrals: defineTable({
    referrerId: v.id("users"),
    referredEmail: v.string(),
    status: v.string(), // "pending", "signed_up", "ordered", "rewarded"
    rewardAmount: v.optional(v.number()),
    orderId: v.optional(v.id("orders")),
    createdAt: v.number(),
  })
    .index("by_referrerId", ["referrerId"])
    .index("by_referredEmail", ["referredEmail"]),
});
