import { prisma } from "@/lib/prisma";
import { SalesOrderForm } from "@/components/forms/sales-order-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewSalesOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ 
      where: { productType: "FINISHED_GOOD" },
      orderBy: { name: "asc" } 
    }),
  ]);

  return (
    <div className="erp-page max-w-4xl">
      <PageHeader
        title="New Sales Order"
        description="Create a new customer order."
        breadcrumbs={[
          { label: "Sales Orders", href: "/sales" },
          { label: "New Order" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <SalesOrderForm 
          customers={JSON.parse(JSON.stringify(customers))} 
          products={JSON.parse(JSON.stringify(products))} 
        />
      </div>
    </div>
  );
}
