import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { BomForm } from "@/components/forms/bom-form";

export default async function NewBomPage() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      productType: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Create Bill of Materials"
        description="Define the recipe for a manufactured product."
        breadcrumbs={[
          { label: "Bills of Materials", href: "/bom" },
          { label: "New BoM" },
        ]}
      />
      <div className="mt-6 max-w-4xl border border-[#E0E0E0] rounded-xl bg-white p-6 shadow-sm">
        <BomForm products={products} />
      </div>
    </div>
  );
}
