import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("inventory", "read");
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const stockStatus = searchParams.get("stockStatus") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        name: true,
        productType: true,
        onHandQty: true,
        reservedQty: true,
        costPrice: true,
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    const inventory = products.map((p) => ({
      ...p,
      freeQty: p.onHandQty - p.reservedQty,
      stockValue: Number(p.costPrice) * p.onHandQty,
    }));

    return NextResponse.json({ data: inventory, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
