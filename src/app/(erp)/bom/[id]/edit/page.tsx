import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BomForm } from "@/components/forms/bom-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditBomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [bom, products] = await Promise.all([
    prisma.bom.findUnique({
      where: { id },
      include: { items: true },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!bom) {
    notFound();
  }

  const initialData = {
    id: bom.id,
    name: bom.name,
    productId: bom.productId,
    items: bom.items.map((item) => ({
      componentId: item.componentId,
      quantity: item.quantity,
    })),
  };

  return (
    <div className="erp-page max-w-4xl">
      <PageHeader
        title="Edit Bill of Materials"
        description="Modify an existing recipe."
        breadcrumbs={[
          { label: "Bills of Materials", href: "/bom" },
          { label: "Edit" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
        <BomForm 
          products={JSON.parse(JSON.stringify(products))} 
          initialData={JSON.parse(JSON.stringify(initialData))}
        />
      </div>
    </div>
  );
}
