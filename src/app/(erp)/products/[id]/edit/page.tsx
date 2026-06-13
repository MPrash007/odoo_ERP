import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, vendors] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="Edit Product"
        description={`Modifying ${product.sku}`}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.name, href: `/products/${product.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <ProductForm
          vendors={JSON.parse(JSON.stringify(vendors))}
          initialData={{
            id: product.id,
            sku: product.sku,
            name: product.name,
            productType: product.productType as "FINISHED_GOOD" | "RAW_MATERIAL",
            procurementType: product.procurementType as "MANUFACTURING" | "PURCHASE",
            procurementStrategy: product.procurementStrategy as "MTS" | "MTO",
            costPrice: Number(product.costPrice),
            salesPrice: product.salesPrice ? Number(product.salesPrice) : null,
            vendorId: product.vendorId,
          }}
        />
      </div>
    </div>
  );
}
