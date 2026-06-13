"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count: {
    purchaseOrders: number;
    products: number;
  };
}

export function VendorsClient({ initialData }: { initialData: Vendor[] }) {
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      (vendor.email && vendor.email.toLowerCase().includes(search.toLowerCase())) ||
      (vendor.phone && vendor.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="erp-page">
      <PageHeader
        title="Vendors"
        description="Manage your suppliers and raw material sources."
        actions={
          <Button asChild className="bg-[#820AD1] hover:bg-[#9013D8]">
            <Link href="/vendors/new">
              <Plus className="w-4 h-4 mr-2" />
              New Vendor
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">Vendor Details</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Products Supplied</th>
                <th className="px-4 py-3 text-right">Purchase Orders</th>
                <th className="px-4 py-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1A1A1A] text-base">
                        {vendor.name}
                      </div>
                      {vendor.address && (
                        <div className="text-xs text-[#595959] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {vendor.address}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {vendor.email ? (
                        <div className="text-sm text-[#595959] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#8C8C8C]" />
                          {vendor.email}
                        </div>
                      ) : (
                        <span className="text-xs text-[#8C8C8C] italic">No email</span>
                      )}
                      {vendor.phone && (
                        <div className="text-sm text-[#595959] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#8C8C8C]" />
                          {vendor.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-center min-w-8 h-8 rounded-full bg-[#E08600]/10 text-[#E08600] font-semibold text-xs">
                        {vendor._count.products}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-center min-w-8 h-8 rounded-full bg-[#820AD1]/10 text-[#820AD1] font-semibold text-xs">
                        {vendor._count.purchaseOrders}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-[#8C8C8C]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/vendors/${vendor.id}/edit`}>
                              Edit Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No vendors found matching your search.
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
