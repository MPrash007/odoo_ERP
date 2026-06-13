import { prisma } from "@/lib/prisma";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { purchaseOrders: true, products: true },
      },
    },
  });

  return <VendorsClient initialData={JSON.parse(JSON.stringify(vendors))} />;
}
