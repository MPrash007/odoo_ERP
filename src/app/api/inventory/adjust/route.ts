import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { InventoryService } from "@/services/inventory.service";
import { inventoryAdjustmentSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("inventory", "manage");
    const body = await req.json();
    const data = inventoryAdjustmentSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await InventoryService.adjustStock(
        data.productId,
        data.newQuantity,
        data.reason,
        user.id,
        tx
      );
    });

    return NextResponse.json({ success: true, message: "Stock adjusted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Adjustment failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
