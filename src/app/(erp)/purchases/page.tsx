import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PurchasesClient } from "./purchases-client";

export default async function PurchaseOrdersPage() {
  const user = await getCurrentUser();
  const where = user.role === "VENDOR" ? { vendorId: user.vendorId || "invalid-vendor" } : {};

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where,
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
