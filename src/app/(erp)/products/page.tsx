import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      vendor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ProductsClient initialData={JSON.parse(JSON.stringify(products))} />;
}
