// ─── Product Types ──────────────────────────────────
export const PRODUCT_TYPE_LABELS = {
  RAW_MATERIAL: "Raw Material",
  SEMI_FINISHED: "Semi-Finished",
  FINISHED_GOOD: "Finished Good",
} as const;

export const PROCUREMENT_STRATEGY_LABELS = {
  MTS: "Make to Stock",
  MTO: "Make to Order",
} as const;

export const PROCUREMENT_TYPE_LABELS = {
  PURCHASE: "Purchase",
  MANUFACTURING: "Manufacturing",
} as const;

// ─── Order Status Labels ────────────────────────────
export const SALES_ORDER_STATUS_LABELS = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PARTIALLY_DELIVERED: "Partially Delivered",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const PURCHASE_ORDER_STATUS_LABELS = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
} as const;

export const MANUFACTURING_ORDER_STATUS_LABELS = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export const WORK_ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  READY: "Ready",
  IN_PROGRESS: "In Progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
} as const;

// ─── Movement Type Labels ───────────────────────────
export const MOVEMENT_TYPE_LABELS = {
  PURCHASE_RECEIPT: "Purchase Receipt",
  SALES_DELIVERY: "Sales Delivery",
  MANUFACTURING_CONSUMPTION: "Manufacturing Consumption",
  MANUFACTURING_PRODUCTION: "Manufacturing Production",
  MANUAL_ADJUSTMENT: "Manual Adjustment",
} as const;

// ─── User Positions ─────────────────────────────────
export const USER_POSITIONS = [
  "Sales Executive",
  "Sales Manager",
  "Purchase Executive",
  "Purchase Manager",
  "Manufacturing Manager",
  "Inventory Manager",
  "Business Owner",
  "System Administrator",
] as const;

// ─── Role Labels ────────────────────────────────────
export const ROLE_LABELS = {
  ADMIN: "Administrator",
  SALES: "Sales",
  PURCHASE: "Purchase",
  MANUFACTURING: "Manufacturing",
  INVENTORY: "Inventory",
  OWNER: "Owner",
} as const;

// ─── Status Color Map ───────────────────────────────
export const STATUS_VARIANT_MAP: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "outline",
  PARTIALLY_DELIVERED: "outline",
  PARTIALLY_RECEIVED: "outline",
  DELIVERED: "default",
  RECEIVED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
  PENDING: "secondary",
  READY: "outline",
  PAUSED: "outline",
} as const;

// ─── BoM Operations ─────────────────────────────────
export const DEFAULT_BOM_OPERATIONS = [
  "Assembly",
  "Painting",
  "Packing",
] as const;

// ─── Low Stock Threshold ────────────────────────────
export const LOW_STOCK_THRESHOLD = 5;
export const CRITICAL_STOCK_THRESHOLD = 0;

// ─── Pagination ─────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
