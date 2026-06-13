import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { bomSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("manufacturing", "manage");
    const { id } = await params;
    const body = await req.json();
    const data = bomSchema.parse(body);

    const bom = await prisma.$transaction(async (tx) => {
      // Find existing BoM
      const existing = await tx.bom.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Bill of Materials not found");
      }

      // First delete all existing items
      await tx.bomItem.deleteMany({
        where: { bomId: id },
      });

      // Update the BoM and recreate items
      const updated = await tx.bom.update({
        where: { id },
        data: {
          name: data.name,
          productId: data.productId,
          items: {
            create: data.items.map((item) => ({
              componentId: item.componentId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          module: "MANUFACTURING",
          action: "UPDATED",
          entityId: updated.id,
          newValue: { name: updated.name, itemsCount: updated.items.length },
        },
      });

      return updated;
    });

    return NextResponse.json({ data: bom }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
