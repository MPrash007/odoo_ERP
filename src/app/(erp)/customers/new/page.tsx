import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewCustomerPage() {
  return (
    <div className="erp-page max-w-3xl">
      <PageHeader
        title="New Customer"
        description="Add a new customer to your database."
        breadcrumbs={[
          { label: "Customers", href: "/customers" },
          { label: "New Customer" },
        ]}
      />
      
      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-xl p-6">
        <CustomerForm />
      </div>
    </div>
  );
}
