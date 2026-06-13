import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("products", "read");
    const { id } = await params;

    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        vendor: true,
        creator: true,
        bom: {
          include: {
            items: { include: { component: true } },
            operations: { orderBy: { sequence: "asc" } },
          },
        },
        stockLedgerEntries: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { creator: true },
        },
      },
    });

    return NextResponse.json({ data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Product not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("products", "update");
    const { id } = await params;
    const body = await req.json();
    const data = productSchema.partial().parse(body);

    const existing = await prisma.product.findUniqueOrThrow({ where: { id } });

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { vendor: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        module: "PRODUCT",
        action: "UPDATED",
        entityId: id,
        oldValue: existing as any,
        newValue: data as any,
      },
    });

    return NextResponse.json({ data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("products", "delete");
    const { id } = await params;

    const product = await prisma.product.findUniqueOrThrow({ where: { id } });

    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        module: "PRODUCT",
        action: "DELETED",
        entityId: id,
        oldValue: product as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
