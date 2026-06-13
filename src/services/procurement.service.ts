import { prisma } from "@/lib/prisma";
import { InventoryService, AuditService } from "@/services/inventory.service";

export class ProcurementService {
  /**
   * Process Sales Order Confirmation (Strict Manual Mode)
   *
   * For each item in the sales order:
   * 1. Checks the available (free) inventory for the product.
   * 2. If ANY item has insufficient stock, the entire confirmation is BLOCKED
   *    with a clear error message telling the user exactly what is missing.
   * 3. If ALL items have sufficient stock, reserves inventory and confirms the order.
   */
  static async processSalesOrderConfirmation(
    salesOrderId: string,
    userId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const salesOrder = await tx.salesOrder.findUniqueOrThrow({
        where: { id: salesOrderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (salesOrder.status !== "DRAFT") {
        throw new Error("Sales order must be in DRAFT status to confirm");
      }

      // ── Step 1: Pre-flight inventory check ──────────────────────
      // Check ALL items BEFORE reserving anything. If any item fails,
      // we block the entire confirmation with a helpful error.
      const shortages: Array<{
        productName: string;
        required: number;
        available: number;
      }> = [];

      for (const item of salesOrder.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        const freeQty = InventoryService.getFreeQty(
          product.onHandQty,
          product.reservedQty
        );

        if (freeQty < item.quantity) {
          shortages.push({
            productName: product.name,
            required: item.quantity,
            available: freeQty,
          });
        }
      }

      // If there are ANY shortages, block confirmation entirely
      if (shortages.length > 0) {
        const details = shortages
          .map(
            (s) =>
              `${s.productName}: Required ${s.required}, Available ${s.available}`
          )
          .join("; ");

        throw new Error(
          `Cannot confirm order: Insufficient stock. ${details}. Please create the necessary Purchase Orders or Manufacturing Orders first.`
        );
      }

      // ── Step 2: Reserve stock for all items ─────────────────────
      // We only reach here if every item passed the check above.
      for (const item of salesOrder.items) {
        await InventoryService.reserveStock(
          item.productId,
          item.quantity,
          userId,
          tx
        );
      }

      // ── Step 3: Update sales order status to CONFIRMED ──────────
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: "CONFIRMED" },
      });

      // ── Step 4: Audit log ───────────────────────────────────────
      await AuditService.log(
        userId,
        "SALES",
        "ORDER_CONFIRMED",
        salesOrderId,
        { status: "DRAFT" },
        { status: "CONFIRMED" },
        tx
      );

      return {
        success: true,
        message: "Sales order confirmed. All items have been reserved.",
      };
    });
  }
}
