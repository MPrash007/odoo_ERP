import { prisma } from "@/lib/prisma";
import { PurchaseOrderForm } from "@/components/forms/purchase-order-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewPurchaseOrderPage() {
  const [vendors, products] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ 
      orderBy: { name: "asc" } 
    }),
  ]);

  return (
    <div className="erp-page max-w-4xl">
      <PageHeader
        title="New Purchase Order"
        description="Create a new supplier order for products or raw materials."
        breadcrumbs={[
          { label: "Purchase Orders", href: "/purchases" },
          { label: "New Order" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <PurchaseOrderForm 
          vendors={JSON.parse(JSON.stringify(vendors))} 
          products={JSON.parse(JSON.stringify(products))} 
        />
      </div>
    </div>
  );
}
