import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PurchaseDetailClient } from "./purchase-detail-client";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
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

  const currentUser = await getCurrentUser();

  if (currentUser.role === "VENDOR" && order.vendorId !== currentUser.vendorId) {
    notFound(); // Hide the existence of the order
  }

  const formattedOrder = {
    ...order,
    orderNumber: `PO-${order.id.slice(-6).toUpperCase()}`,
    totalAmount: order.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitCost), 0),
  };

  return <PurchaseDetailClient order={JSON.parse(JSON.stringify(formattedOrder))} currentUserRole={currentUser.role} />;
}
