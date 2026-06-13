import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) {
    notFound();
  }

  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="Edit Customer"
        description={`Modifying ${customer.name}`}
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: "Edit" },
        ]}
      />

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <CustomerForm
          initialData={{
            id: customer.id,
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
          }}
        />
      </div>
    </div>
  );
}
