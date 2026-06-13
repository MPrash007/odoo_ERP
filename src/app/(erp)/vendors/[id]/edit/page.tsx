import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VendorForm } from "@/components/forms/vendor-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({ where: { id } });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="Edit Vendor"
        description={`Modifying ${vendor.name}`}
        breadcrumbs={[
          { label: "Vendors", href: "/vendors" },
          { label: "Edit" },
        ]}
      />

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <VendorForm
          initialData={{
            id: vendor.id,
            name: vendor.name,
            email: vendor.email || "",
            phone: vendor.phone || "",
            address: vendor.address || "",
          }}
        />
      </div>
    </div>
  );
}
