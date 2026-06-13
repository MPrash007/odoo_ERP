import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { customerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("customers", "read");
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

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { salesOrders: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ data: customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("customers", "create");
    const body = await req.json();
    const data = customerSchema.parse(body);

    const customer = await prisma.customer.create({ data });

    await prisma.auditLog.create({
      data: { userId: user.id, module: "CUSTOMER", action: "CREATED", entityId: customer.id, newValue: data as any },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
