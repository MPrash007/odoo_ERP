import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SalesDetailClient } from "./sales-detail-client";

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const formattedOrder = {
    ...order,
    orderNumber: `SO-${order.id.slice(-6).toUpperCase()}`,
    totalAmount: order.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0),
  };

  return <SalesDetailClient order={JSON.parse(JSON.stringify(formattedOrder))} />;
}
