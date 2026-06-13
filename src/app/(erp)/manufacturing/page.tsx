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

  return <ManufacturingClient initialData={JSON.parse(JSON.stringify(manufacturingOrders))} />;
}
