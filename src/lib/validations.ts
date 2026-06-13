import { z } from "zod";

// ─── Product Validation ─────────────────────────────
export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  productType: z.enum(["RAW_MATERIAL", "SEMI_FINISHED", "FINISHED_GOOD"]),
  salesPrice: z.coerce.number().min(0, "Sales price must be non-negative"),
  costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
  procurementStrategy: z.enum(["MTS", "MTO"]),
  procurementType: z.enum(["PURCHASE", "MANUFACTURING"]),
  vendorId: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Customer Validation ────────────────────────────
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// ─── Vendor Validation ──────────────────────────────
export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// ─── Sales Order Validation ─────────────────────────
export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
});

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.coerce.date(),
  items: z.array(salesOrderItemSchema).min(1, "At least one item is required"),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

// ─── Purchase Order Validation ──────────────────────
export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitCost: z.coerce.number().min(0, "Unit cost must be non-negative"),
});

export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

// ─── BoM Validation ────────────────────────────────
export const bomItemSchema = z.object({
  componentId: z.string().min(1, "Component is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const bomOperationSchema = z.object({
  operationName: z.string().min(1, "Operation name is required"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  sequence: z.coerce.number().int().min(1),
});

export const bomSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "BoM name is required"),
  items: z.array(bomItemSchema).min(1, "At least one component is required"),
  operations: z.array(bomOperationSchema).optional(),
});

export type BomFormData = z.infer<typeof bomSchema>;

// ─── Manufacturing Order Validation ─────────────────
export const manufacturingOrderSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  bomId: z.string().min(1, "BoM is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  assignedTo: z.string().optional().nullable(),
});

export type ManufacturingOrderFormData = z.infer<typeof manufacturingOrderSchema>;

// ─── Inventory Adjustment Validation ────────────────
export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  newQuantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  reason: z.string().min(1, "Reason is required"),
});

export type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>;

// ─── User Validation ────────────────────────────────
export const userUpdateSchema = z.object({
  role: z.enum(["ADMIN", "SALES", "PURCHASE", "MANUFACTURING", "INVENTORY", "OWNER"]),
  position: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
