"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";

interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  product: { name: string; sku: string };
  bom: { name: string } | null;
  status: string;
  quantity: number;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
}

export function ManufacturingClient({ initialData }: { initialData: ManufacturingOrder[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = initialData.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.product.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Manufacturing Orders"
        description="Track production, consume raw materials, and output finished goods."
      />

      <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search by MO number or product..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-[#820AD1]" : ""}
            >
              {status === "IN_PROGRESS" ? "In Progress" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">MO Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">BoM</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.product.name}</div>
                      <div className="text-xs text-[#8C8C8C]">{order.product.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {order.bom?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          order.status === "DRAFT"
                            ? "status-draft"
                            : order.status === "CONFIRMED"
                            ? "status-confirmed"
                            : order.status === "IN_PROGRESS"
                            ? "status-in-progress"
                            : order.status === "COMPLETED"
                            ? "status-completed"
                            : "status-cancelled"
                        }
                      >
                        {order.status === "IN_PROGRESS" ? "IN PROGRESS" : order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/manufacturing/${order.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-[#820AD1]")}>
  <Eye className="w-4 h-4 mr-1.5" />
                          View
</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No manufacturing orders found matching your search.
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
