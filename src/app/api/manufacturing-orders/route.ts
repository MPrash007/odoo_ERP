import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { manufacturingOrderSchema } from "@/lib/validations";
import { ManufacturingService } from "@/services/manufacturing.service";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("manufacturing", "read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.manufacturingOrder.findMany({
        where,
        include: {
          product: true,
          bom: { include: { items: { include: { component: true } } } },
          assignee: true,
          creator: true,
          salesOrder: true,
          workOrders: { orderBy: { sequence: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manufacturingOrder.count({ where }),
    ]);

    return NextResponse.json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("manufacturing", "create");
    const body = await req.json();
    const data = manufacturingOrderSchema.parse(body);

    const order = await prisma.manufacturingOrder.create({
      data: {
        ...data,
        createdBy: user.id,
      },
      include: { product: true, bom: true },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, module: "MANUFACTURING", action: "ORDER_CREATED", entityId: order.id, newValue: data as any },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
