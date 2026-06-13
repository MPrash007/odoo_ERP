import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { salesOrders: true },
      },
    },
  });

  return <CustomersClient initialData={JSON.parse(JSON.stringify(customers))} />;
}
