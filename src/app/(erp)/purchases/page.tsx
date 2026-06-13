import { prisma } from "@/lib/prisma";
import { PurchasesClient } from "./purchases-client";

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { name: true } },
      items: { select: { quantity: true, unitCost: true } },
    },
  });

  const formattedOrders = purchaseOrders.map((po) => ({
    ...po,
    orderNumber: `PO-${po.id.slice(-6).toUpperCase()}`,
    totalAmount: po.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitCost), 0),
  }));

  return <PurchasesClient initialData={JSON.parse(JSON.stringify(formattedOrders))} />;
}
