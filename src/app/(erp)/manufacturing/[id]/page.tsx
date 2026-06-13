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
    },
  });

  if (!order) {
    notFound();
  }

  return <ManufacturingDetailClient order={JSON.parse(JSON.stringify(order))} />;
}
