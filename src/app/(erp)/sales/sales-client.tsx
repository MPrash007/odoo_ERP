"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: { name: string };
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ quantity: number }>;
}

export function SalesClient({ initialData }: { initialData: SalesOrder[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = initialData.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Sales Orders"
        description="Manage customer orders, billing, and deliveries."
        actions={
          <Link href="/sales/new" className={cn(buttonVariants(), "bg-[#820AD1] hover:bg-[#9013D8]")}>
              <Plus className="w-4 h-4 mr-2" />
              New Sales Order
            </Link>
        }
      />

      <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search by order number or customer..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-[#820AD1]" : ""}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((order) => {
                  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
                  
                  return (
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
                      <td className="px-4 py-3 font-medium">
                        {order.customer.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {totalItems}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            order.status === "DRAFT"
                              ? "status-draft"
                              : order.status === "CONFIRMED"
                              ? "status-confirmed"
                              : order.status === "DELIVERED"
                              ? "status-completed"
                              : "status-cancelled"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"  />}>
  <MoreHorizontal className="h-4 w-4 text-[#8C8C8C]" />
</DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem render={<Link href={`/sales/${order.id}`} />}>
  
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              
</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No sales orders found matching your search.
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
