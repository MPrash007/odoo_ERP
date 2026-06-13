import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { vendorSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("vendors", "read");
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where = search
      ? { OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ] }
      : {};

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { purchaseOrders: true, products: true } } },
      }),
      prisma.vendor.count({ where }),
    ]);

    return NextResponse.json({ data: vendors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("vendors", "create");
    const body = await req.json();
    const data = vendorSchema.parse(body);
    const vendor = await prisma.vendor.create({ data });
    await prisma.auditLog.create({ data: { userId: user.id, module: "VENDOR", action: "CREATED", entityId: vendor.id, newValue: data as unknown as Record<string, unknown> } });
    return NextResponse.json({ data: vendor }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
