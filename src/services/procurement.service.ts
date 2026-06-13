import { prisma } from "@/lib/prisma";
import { InventoryService, AuditService } from "@/services/inventory.service";
import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

export class ProcurementService {
  /**
   * Process Sales Order Confirmation
   * 
   * For each item:
   * 1. Check freeQty
   * 2. Reserve available stock
   * 3. If shortage exists, trigger procurement (Purchase Order or Manufacturing Order)
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

      const procurementResults: Array<{
        productName: string;
        ordered: number;
        reserved: number;
        shortage: number;
        action: string;
        referenceId?: string;
      }> = [];

      for (const item of salesOrder.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        const freeQty = InventoryService.getFreeQty(
          product.onHandQty,
          product.reservedQty
        );
        const availableToReserve = Math.min(freeQty, item.quantity);
        const shortage = item.quantity - availableToReserve;

        // Reserve available stock
        if (availableToReserve > 0) {
          await InventoryService.reserveStock(
            product.id,
            availableToReserve,
            userId,
            tx
          );
        }

        if (shortage > 0) {
          // Trigger procurement based on product configuration
          if (product.procurementType === "PURCHASE") {
            const po = await this.createAutoPurchaseOrder(
              product,
              shortage,
              salesOrderId,
              userId,
              tx
            );
            procurementResults.push({
              productName: product.name,
              ordered: item.quantity,
              reserved: availableToReserve,
              shortage,
              action: "Purchase Order Created",
              referenceId: po.id,
            });
          } else if (product.procurementType === "MANUFACTURING") {
            const mo = await this.createAutoManufacturingOrder(
              product,
              shortage,
              salesOrderId,
              userId,
              tx
            );
            procurementResults.push({
              productName: product.name,
              ordered: item.quantity,
              reserved: availableToReserve,
              shortage,
              action: "Manufacturing Order Created",
              referenceId: mo.id,
            });
          }
        } else {
          procurementResults.push({
            productName: product.name,
            ordered: item.quantity,
            reserved: availableToReserve,
            shortage: 0,
            action: "Fully Reserved",
          });
        }
      }

      // Update sales order status to CONFIRMED
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: "CONFIRMED" },
      });

      // Audit log
      await AuditService.log(
        userId,
        "SALES",
        "ORDER_CONFIRMED",
        salesOrderId,
        { status: "DRAFT" },
        { status: "CONFIRMED", procurement: procurementResults },
        tx
      );

      await AuditService.log(
        userId,
        "PROCUREMENT",
        "TRIGGERED",
        salesOrderId,
        null,
        { results: procurementResults },
        tx
      );

      return procurementResults;
    });
  }

  /**
   * Auto-create Purchase Order for shortage
   */
  private static async createAutoPurchaseOrder(
    product: { id: string; name: string; vendorId: string | null; costPrice: Prisma.Decimal },
    quantity: number,
    salesOrderId: string,
    userId: string,
    tx: TxClient
  ) {
    if (!product.vendorId) {
      throw new Error(
        `Cannot create auto Purchase Order for ${product.name}: No default vendor assigned`
      );
    }

    const po = await tx.purchaseOrder.create({
      data: {
        vendorId: product.vendorId,
        status: "CONFIRMED",
        salesOrderId,
        createdBy: userId,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitCost: product.costPrice,
          },
        },
      },
    });

    await AuditService.log(
      userId,
      "PROCUREMENT",
      "PO_AUTO_CREATED",
      po.id,
      null,
      {
        productName: product.name,
        quantity,
        salesOrderId,
        vendorId: product.vendorId,
      },
      tx
    );

    return po;
  }

  /**
   * Auto-create Manufacturing Order for shortage
   */
  private static async createAutoManufacturingOrder(
    product: { id: string; name: string },
    quantity: number,
    salesOrderId: string,
    userId: string,
    tx: TxClient
  ) {
    // Find active BoM for this product
    const bom = await tx.bom.findFirst({
      where: {
        productId: product.id,
        isActive: true,
      },
    });

    if (!bom) {
      throw new Error(
        `Cannot create Manufacturing Order for ${product.name}: No active Bill of Materials found`
      );
    }

    const mo = await tx.manufacturingOrder.create({
      data: {
        productId: product.id,
        bomId: bom.id,
        salesOrderId,
        quantity,
        status: "DRAFT",
        createdBy: userId,
      },
    });

    await AuditService.log(
      userId,
      "PROCUREMENT",
      "MO_AUTO_CREATED",
      mo.id,
      null,
      {
        productName: product.name,
        quantity,
        salesOrderId,
        bomId: bom.id,
      },
      tx
    );

    return mo;
  }
}
