import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { salesOrderSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("sales-orders", "read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          creator: true,
          items: { include: { product: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return NextResponse.json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("sales-orders", "create");
    const body = await req.json();
    const data = salesOrderSchema.parse(body);

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.salesOrder.create({
        data: {
          customerId: data.customerId,
          orderDate: data.orderDate,
          createdBy: user.id,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { customer: true, items: { include: { product: true } } },
      });

      await tx.auditLog.create({
        data: { userId: user.id, module: "SALES", action: "ORDER_CREATED", entityId: o.id, newValue: { customerId: data.customerId, items: data.items.length } },
      });

      return o;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
