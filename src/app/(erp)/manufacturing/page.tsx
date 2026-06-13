import { prisma } from "@/lib/prisma";
import { ManufacturingClient } from "./manufacturing-client";
import { getCurrentUser } from "@/lib/auth";

export default async function ManufacturingOrdersPage() {
  const manufacturingOrders = await prisma.manufacturingOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, sku: true } },
      bom: { select: { name: true } },
      assignee: { select: { name: true, profileImage: true } },
    },
  });

  const currentUser = await getCurrentUser();

  const formattedOrders = manufacturingOrders.map((mo) => ({
    ...mo,
    orderNumber: `MO-${mo.id.slice(-6).toUpperCase()}`,
  }));

  return <ManufacturingClient initialData={JSON.parse(JSON.stringify(formattedOrders))} currentUserId={currentUser.id} />;
}
