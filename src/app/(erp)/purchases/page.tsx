import { prisma } from "@/lib/prisma";
import { PurchasesClient } from "./purchases-client";

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  return <PurchasesClient initialData={JSON.parse(JSON.stringify(purchaseOrders))} />;
}
