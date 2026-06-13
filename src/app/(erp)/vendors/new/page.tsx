import { VendorForm } from "@/components/forms/vendor-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewVendorPage() {
  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="New Vendor"
        description="Add a new supplier to your database."
        breadcrumbs={[
          { label: "Vendors", href: "/vendors" },
          { label: "New Vendor" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <VendorForm />
      </div>
    </div>
  );
}
