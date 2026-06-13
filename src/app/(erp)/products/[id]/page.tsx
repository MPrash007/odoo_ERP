import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: true,
      bom: {
        include: {
          items: { include: { component: true } },
          operations: { orderBy: { sequence: "asc" } },
        },
      },
      stockLedgerEntries: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { creator: { select: { name: true } } },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />;
}
