import { prisma } from "@/lib/prisma";
import { InventoryService, AuditService } from "@/services/inventory.service";

export class ManufacturingService {
  /**
   * Confirm Manufacturing Order
   * - Validates BoM exists
   * - Calculates required components
   * - Checks component availability
   */
  static async confirmOrder(moId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUniqueOrThrow({
        where: { id: moId },
        include: {
          bom: {
            include: {
              items: { include: { component: true } },
              operations: { orderBy: { sequence: "asc" } },
            },
          },
          product: true,
        },
      });

      if (mo.status !== "DRAFT") {
        throw new Error("Manufacturing order must be in DRAFT status to confirm");
      }

      // Calculate required components
      const componentRequirements = mo.bom.items.map((item) => ({
        componentId: item.componentId,
        componentName: item.component.name,
        requiredQty: item.quantity * mo.quantity,
        availableQty: InventoryService.getFreeQty(
          item.component.onHandQty,
          item.component.reservedQty
        ),
      }));

      // Check for shortages (warning only, don't block confirmation)
      const shortages = componentRequirements.filter(
        (c) => c.availableQty < c.requiredQty
      );

      // Update MO status
      await tx.manufacturingOrder.update({
        where: { id: moId },
        data: { status: "CONFIRMED" },
      });

      // Generate work orders from BoM operations
      if (mo.bom.operations.length > 0) {
        await tx.workOrder.createMany({
          data: mo.bom.operations.map((op) => ({
            manufacturingOrderId: moId,
            operation: op.operationName,
            duration: op.duration,
            sequence: op.sequence,
            status: "PENDING",
          })),
        });
      } else {
        // Default operations if none defined
        const defaultOps = [
          { operation: "Assembly", duration: 60, sequence: 1 },
          { operation: "Painting", duration: 30, sequence: 2 },
          { operation: "Packing", duration: 15, sequence: 3 },
        ];
        await tx.workOrder.createMany({
          data: defaultOps.map((op) => ({
            manufacturingOrderId: moId,
            ...op,
            status: "PENDING",
          })),
        });
      }

      await AuditService.log(
        userId,
        "MANUFACTURING",
        "ORDER_CONFIRMED",
        moId,
        { status: "DRAFT" },
        {
          status: "CONFIRMED",
          components: componentRequirements,
          shortages: shortages.length > 0 ? shortages : null,
        },
        tx
      );

      return { componentRequirements, shortages };
    });
  }

  /**
   * Start Manufacturing Order
   * - Reserves all required components
   * - Validates availability
   */
  static async startOrder(moId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUniqueOrThrow({
        where: { id: moId },
        include: {
          bom: {
            include: {
              items: { include: { component: true } },
            },
          },
        },
      });

      if (mo.status !== "CONFIRMED") {
        throw new Error("Manufacturing order must be CONFIRMED to start");
      }

      // Reserve all components
      for (const bomItem of mo.bom.items) {
        const requiredQty = bomItem.quantity * mo.quantity;
        const freeQty = InventoryService.getFreeQty(
          bomItem.component.onHandQty,
          bomItem.component.reservedQty
        );

        if (freeQty < requiredQty) {
          throw new Error(
            `Insufficient ${bomItem.component.name}: Required ${requiredQty}, Available ${freeQty}`
          );
        }

        await InventoryService.reserveStock(
          bomItem.componentId,
          requiredQty,
          userId,
          tx
        );
      }

      // Update MO status
      await tx.manufacturingOrder.update({
        where: { id: moId },
        data: { status: "IN_PROGRESS" },
      });

      // Set first work order to READY
      const firstWO = await tx.workOrder.findFirst({
        where: { manufacturingOrderId: moId },
        orderBy: { sequence: "asc" },
      });
      if (firstWO) {
        await tx.workOrder.update({
          where: { id: firstWO.id },
          data: { status: "READY" },
        });
      }

      await AuditService.log(
        userId,
        "MANUFACTURING",
        "ORDER_STARTED",
        moId,
        { status: "CONFIRMED" },
        { status: "IN_PROGRESS" },
        tx
      );
    });
  }

  /**
   * Complete Manufacturing Order
   * - Consume all reserved components (decrease onHand)
   * - Release component reservations
   * - Produce finished goods (increase onHand)
   * - Create stock ledger entries
   */
  static async completeOrder(moId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUniqueOrThrow({
        where: { id: moId },
        include: {
          bom: {
            include: {
              items: { include: { component: true } },
            },
          },
          product: true,
        },
      });

      if (mo.status !== "IN_PROGRESS") {
        throw new Error("Manufacturing order must be IN_PROGRESS to complete");
      }

      // Step 1: Consume all components
      for (const bomItem of mo.bom.items) {
        const consumeQty = bomItem.quantity * mo.quantity;

        // Decrease stock
        await InventoryService.decreaseStock(
          bomItem.componentId,
          consumeQty,
          "MANUFACTURING_CONSUMPTION",
          "ManufacturingOrder",
          moId,
          userId,
          tx
        );

        // Release reservation
        await InventoryService.releaseReservation(
          bomItem.componentId,
          consumeQty,
          userId,
          tx
        );
      }

      // Step 2: Produce finished goods
      await InventoryService.increaseStock(
        mo.productId,
        mo.quantity,
        "MANUFACTURING_PRODUCTION",
        "ManufacturingOrder",
        moId,
        userId,
        tx
      );

      // Step 3: Update MO status
      await tx.manufacturingOrder.update({
        where: { id: moId },
        data: { status: "COMPLETED" },
      });

      // Step 4: Complete all remaining work orders
      await tx.workOrder.updateMany({
        where: {
          manufacturingOrderId: moId,
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await AuditService.log(
        userId,
        "MANUFACTURING",
        "ORDER_COMPLETED",
        moId,
        { status: "IN_PROGRESS" },
        {
          status: "COMPLETED",
          produced: { product: mo.product.name, quantity: mo.quantity },
        },
        tx
      );
    });
  }
}
