import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/services/inventory.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("purchase-orders", "update");
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUniqueOrThrow({ where: { id } });
      
      // Vendor Role Security Filter
      if (user.role === "VENDOR" && order.vendorId !== user.vendorId) {
        throw new Error("Unauthorized to confirm this order");
      }

      if (order.status !== "DRAFT") {
        throw new Error("Purchase order must be in DRAFT status to confirm");
      }
      
      await tx.purchaseOrder.update({ where: { id }, data: { status: "CONFIRMED" } });
      
      await AuditService.log(
        user.id,
        "PURCHASE",
        "ORDER_CONFIRMED",
        id,
        { status: "DRAFT" },
        { status: "CONFIRMED" },
        tx
      );
    });

    return NextResponse.json({ success: true, message: "Purchase order confirmed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Confirmation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
