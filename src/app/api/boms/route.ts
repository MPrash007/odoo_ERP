import { NextRequest, NextResponse } from "next/server"; // Force Turbopack rebuild
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { bomSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("boms", "read");
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [boms, total] = await Promise.all([
      prisma.bom.findMany({
        include: {
          product: true,
          items: { include: { component: true } },
          operations: { orderBy: { sequence: "asc" } },
          _count: { select: { items: true, operations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bom.count(),
    ]);

    return NextResponse.json({ data: boms, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("boms", "create");
    const body = await req.json();
    const data = bomSchema.parse(body);

    const existingBom = await prisma.bom.findUnique({
      where: { productId: data.productId },
    });

    if (existingBom) {
      return NextResponse.json(
        { error: "A Bill of Materials already exists for this product. Please use the Edit button on the BoM list to modify it." },
        { status: 400 }
      );
    }

    const bom = await prisma.$transaction(async (tx) => {
      const b = await tx.bom.create({
        data: {
          productId: data.productId,
          name: data.name,
          items: { create: data.items },
          operations: {
            create: data.operations?.map((op, i) => ({
              ...op,
              sequence: op.sequence || i + 1,
            })) || [],
          },
        },
        include: { product: true, items: { include: { component: true } }, operations: true },
      });

      await tx.auditLog.create({
        data: { userId: user.id, module: "BOM", action: "CREATED", entityId: b.id, newValue: { productId: data.productId, components: data.items.length } },
      });

      return b;
    });

    return NextResponse.json({ data: bom }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
