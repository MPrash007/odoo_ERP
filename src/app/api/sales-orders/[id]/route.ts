import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("sales-orders", "read");
    const { id } = await params;

    const order = await prisma.salesOrder.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        creator: true,
        items: { include: { product: true } },
        purchaseOrders: { include: { vendor: true, items: { include: { product: true } } } },
        manufacturingOrders: { include: { product: true, workOrders: true } },
      },
    });

    return NextResponse.json({ data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
