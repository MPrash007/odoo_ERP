import { prisma } from "@/lib/prisma";
import { SalesClient } from "./sales-client";

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  return <SalesClient initialData={JSON.parse(JSON.stringify(salesOrders))} />;
}
