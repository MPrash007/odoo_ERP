import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  return <PurchaseDetailClient order={JSON.parse(JSON.stringify(order))} />;
}
