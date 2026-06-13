import { prisma } from "@/lib/prisma";
import { ManufacturingClient } from "./manufacturing-client";

export default async function ManufacturingOrdersPage() {
  const manufacturingOrders = await prisma.manufacturingOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, sku: true } },
      bom: { select: { name: true } },
    },
  });

  const formattedOrders = manufacturingOrders.map((mo) => ({
    ...mo,
    orderNumber: `MO-${mo.id.slice(-6).toUpperCase()}`,
  }));

  return <ManufacturingClient initialData={JSON.parse(JSON.stringify(formattedOrders))} />;
}
