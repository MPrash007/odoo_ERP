import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManufacturingDetailClient } from "./manufacturing-detail-client";

export default async function ManufacturingOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.manufacturingOrder.findUnique({
    where: { id },
    include: {
      product: true,
      bom: {
        include: {
          items: {
            include: {
              component: true,
            },
          },
        },
      },
      workOrders: true,
    },
  });

  if (!order) {
    notFound();
  }

  let startDate = null;
  let endDate = null;

  if (order.workOrders && order.workOrders.length > 0) {
    const startedOrders = order.workOrders.filter((wo) => wo.startedAt);
    if (startedOrders.length > 0) {
      startDate = new Date(Math.min(...startedOrders.map((wo) => wo.startedAt!.getTime())));
    }

    const completedOrders = order.workOrders.filter((wo) => wo.completedAt);
    if (completedOrders.length > 0 && completedOrders.length === order.workOrders.length) {
      endDate = new Date(Math.max(...completedOrders.map((wo) => wo.completedAt!.getTime())));
    }
  }

  const formattedOrder = {
    ...order,
    orderNumber: `MO-${order.id.slice(-6).toUpperCase()}`,
    startDate,
    endDate,
  };

  return <ManufacturingDetailClient order={JSON.parse(JSON.stringify(formattedOrder))} />;
}
