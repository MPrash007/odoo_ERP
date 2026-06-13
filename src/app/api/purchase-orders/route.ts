import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { purchaseOrderSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("purchase-orders", "read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    
    // Vendor Role Security Filter
    if (user.role === "VENDOR") {
      if (!user.vendorId) {
        return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
      where.vendorId = user.vendorId;
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { vendor: true, creator: true, items: { include: { product: true } }, salesOrder: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("purchase-orders", "create");
    const body = await req.json();
    const data = purchaseOrderSchema.parse(body);

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.purchaseOrder.create({
        data: {
          vendorId: data.vendorId,
          createdBy: user.id,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            })),
          },
        },
        include: { vendor: true, items: { include: { product: true } } },
      });

      await tx.auditLog.create({
        data: { userId: user.id, module: "PURCHASE", action: "ORDER_CREATED", entityId: o.id, newValue: { vendorId: data.vendorId, items: data.items.length } },
      });

      return o;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
