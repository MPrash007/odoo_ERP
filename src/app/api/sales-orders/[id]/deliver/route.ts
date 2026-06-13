import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { InventoryService, AuditService } from "@/services/inventory.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("sales-orders", "manage");
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (order.status !== "CONFIRMED" && order.status !== "PARTIALLY_DELIVERED") {
        throw new Error("Order must be CONFIRMED or PARTIALLY_DELIVERED to deliver");
      }

      let allDelivered = true;

      for (const item of order.items) {
        const remainingQty = item.quantity - item.deliveredQty;
        if (remainingQty <= 0) continue;

        // Deliver stock (decrease onHand + release reservation)
        await InventoryService.deliverStock(
          item.productId,
          remainingQty,
          "SalesOrder",
          id,
          user.id,
          tx
        );

        // Update delivered quantity
        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { deliveredQty: item.quantity },
        });
      }

      // Check if all items are fully delivered
      const updatedItems = await tx.salesOrderItem.findMany({
        where: { salesOrderId: id },
      });

      allDelivered = updatedItems.every((i) => i.deliveredQty >= i.quantity);

      await tx.salesOrder.update({
        where: { id },
        data: { status: allDelivered ? "DELIVERED" : "PARTIALLY_DELIVERED" },
      });

      await AuditService.log(
        user.id,
        "SALES",
        allDelivered ? "ORDER_DELIVERED" : "ORDER_PARTIALLY_DELIVERED",
        id,
        { status: order.status },
        { status: allDelivered ? "DELIVERED" : "PARTIALLY_DELIVERED" },
        tx
      );
    });

    return NextResponse.json({ success: true, message: "Delivery processed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delivery failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
