import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default async function WorkOrdersPage() {
  const workOrders = await prisma.workOrder.findMany({
    include: {
      manufacturingOrder: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      id: "desc"
    }
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Work Orders"
        description="Track specific manufacturing operations and worker assignments."
      />
      <div className="mt-6 border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">Manufacturing Order</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Duration (mins)</th>
                <th className="px-4 py-3">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {workOrders.length > 0 ? (
                workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-[#F5F2F8]/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-[#1A1A1A]">
                      {wo.operation}
                    </td>
                    <td className="px-4 py-4 text-[#595959]">
                      MO-{wo.manufacturingOrder.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                      {wo.manufacturingOrder.product.name}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          wo.status === "PENDING"
                            ? "status-draft"
                            : wo.status === "IN_PROGRESS"
                            ? "status-in-progress"
                            : "status-completed"
                        }
                      >
                        {wo.status === "IN_PROGRESS" ? "IN PROGRESS" : wo.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-[#1A1A1A]">
                      {wo.duration ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-[#595959]">
                      {wo.startedAt ? formatDateTime(wo.startedAt) : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#8C8C8C]">
                    No work orders found. Confirm a Manufacturing Order to generate work operations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
