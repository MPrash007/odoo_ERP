import { prisma } from "@/lib/prisma";
import { ManufacturingOrderForm } from "@/components/forms/manufacturing-order-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewManufacturingOrderPage() {
  const [products, boms] = await Promise.all([
    prisma.product.findMany({ 
      where: { 
        productType: { in: ["FINISHED_GOOD", "SEMI_FINISHED"] }
      },
      orderBy: { name: "asc" } 
    }),
    prisma.bom.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="erp-page max-w-4xl">
      <PageHeader
        title="New Manufacturing Order"
        description="Create an order to build finished goods from raw materials."
        breadcrumbs={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "New Order" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
        <ManufacturingOrderForm 
          products={JSON.parse(JSON.stringify(products))} 
          boms={JSON.parse(JSON.stringify(boms))} 
        />
      </div>
    </div>
  );
}
