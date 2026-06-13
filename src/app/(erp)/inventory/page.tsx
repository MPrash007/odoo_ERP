import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      sku: true,
      name: true,
      productType: true,
      onHandQty: true,
      reservedQty: true,
      costPrice: true,
    },
  });

  const inventoryData = products.map((p) => ({
    ...p,
    costPrice: Number(p.costPrice),
    freeQty: p.onHandQty - p.reservedQty,
    stockValue: Number(p.costPrice) * p.onHandQty,
  }));

  return <InventoryClient initialData={inventoryData} />;
}
