import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { customerSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("customers", "read");
    const { id } = await params;
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id },
      include: { salesOrders: { orderBy: { createdAt: "desc" }, take: 10, include: { items: true } } },
    });
    return NextResponse.json({ data: customer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("customers", "update");
    const { id } = await params;
    const body = await req.json();
    const data = customerSchema.partial().parse(body);
    const customer = await prisma.customer.update({ where: { id }, data });
    await prisma.auditLog.create({ data: { userId: user.id, module: "CUSTOMER", action: "UPDATED", entityId: id, newValue: data as unknown as Record<string, unknown> } });
    return NextResponse.json({ data: customer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
