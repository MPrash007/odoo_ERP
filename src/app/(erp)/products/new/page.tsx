import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewProductPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="New Product"
        description="Add a new raw material or finished good to the catalog."
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "New Product" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <ProductForm vendors={JSON.parse(JSON.stringify(vendors))} />
      </div>
    </div>
  );
}
