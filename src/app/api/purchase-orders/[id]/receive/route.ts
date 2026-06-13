import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { InventoryService, AuditService } from "@/services/inventory.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("purchase-orders", "manage");
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (order.status !== "CONFIRMED" && order.status !== "PARTIALLY_RECEIVED") {
        throw new Error("Purchase order must be CONFIRMED or PARTIALLY_RECEIVED to receive");
      }

      for (const item of order.items) {
        const remainingQty = item.quantity - item.receivedQty;
        if (remainingQty <= 0) continue;

        // Increase inventory
        await InventoryService.increaseStock(
          item.productId,
          remainingQty,
          "PURCHASE_RECEIPT",
          "PurchaseOrder",
          id,
          user.id,
          tx
        );

        // Update received qty
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQty: item.quantity },
        });
      }

      const updatedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: id } });
      const allReceived = updatedItems.every((i) => i.receivedQty >= i.quantity);

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED" },
      });

      await AuditService.log(
        user.id,
        "PURCHASE",
        allReceived ? "ORDER_RECEIVED" : "ORDER_PARTIALLY_RECEIVED",
        id,
        { status: order.status },
        { status: allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED" },
        tx
      );
    });

    return NextResponse.json({ success: true, message: "Receipt processed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Receipt failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
