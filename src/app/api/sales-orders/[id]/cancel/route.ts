import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryService, AuditService } from "@/services/inventory.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("sales-orders", "manage");
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // Validate current status
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Sales order not found");
      }

      if (order.status !== "DRAFT" && order.status !== "CONFIRMED") {
        throw new Error(`Cannot cancel order in ${order.status} status`);
      }

      // Release reservations if order was CONFIRMED
      if (order.status === "CONFIRMED") {
        for (const item of order.items) {
          const unreservedQty = item.quantity - item.deliveredQty;
          if (unreservedQty > 0) {
            await InventoryService.releaseReservation(
              item.productId,
              unreservedQty,
              user.id,
              tx
            );
          }
        }
      }

      // Cancel the order
      await tx.salesOrder.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // Log the action
      await AuditService.log(
        user.id,
        "SALES",
        "ORDER_CANCELLED",
        id,
        { status: order.status },
        { status: "CANCELLED" },
        tx
      );
    });

    return NextResponse.json({
      success: true,
      message: "Sales order cancelled successfully.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cancellation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
