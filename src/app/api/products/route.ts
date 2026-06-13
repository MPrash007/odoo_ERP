import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("products", "read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) {
      where.productType = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { vendor: true, creator: true, bom: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("products", "create");
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          ...data,
          createdBy: user.id,
        },
        include: { vendor: true },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          module: "PRODUCT",
          action: "CREATED",
          entityId: p.id,
          newValue: data as any,
        },
      });

      return p;
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A product with this SKU already exists." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
