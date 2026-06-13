import { prisma } from "@/lib/prisma";
import { SalesClient } from "./sales-client";

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  });

  const formattedOrders = salesOrders.map((so) => ({
    ...so,
    orderNumber: `SO-${so.id.slice(-6).toUpperCase()}`,
    totalAmount: so.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0),
  }));

  return <SalesClient initialData={JSON.parse(JSON.stringify(formattedOrders))} />;
}
