"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  sku: string;
  name: string;
  productType: string;
  salesPrice: number | null;
  costPrice: number;
  onHandQty: number;
  reservedQty: number;
  vendor?: { name: string } | null;
}

export function ProductsClient({ initialData }: { initialData: Product[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredData = initialData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "ALL" || product.productType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Products"
        description="Manage catalog, raw materials, and finished goods."
        actions={
          <Link href="/products/new" className={cn(buttonVariants(), "bg-[#820AD1] hover:bg-[#9013D8]")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={typeFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("ALL")}
            className={typeFilter === "ALL" ? "bg-[#820AD1]" : ""}
          >
            All
          </Button>
          <Button
            variant={typeFilter === "FINISHED_GOOD" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("FINISHED_GOOD")}
            className={typeFilter === "FINISHED_GOOD" ? "bg-[#820AD1]" : ""}
          >
            Finished Goods
          </Button>
          <Button
            variant={typeFilter === "RAW_MATERIAL" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("RAW_MATERIAL")}
            className={typeFilter === "RAW_MATERIAL" ? "bg-[#820AD1]" : ""}
          >
            Raw Materials
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Cost Price</th>
                <th className="px-4 py-3 text-right">Sales Price</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1A1A1A]">
                        {product.name}
                      </div>
                      {product.vendor && (
                        <div className="text-xs text-[#8C8C8C] mt-0.5">
                          Vendor: {product.vendor.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          product.productType === "FINISHED_GOOD"
                            ? "bg-[#820AD1]/10 text-[#820AD1]"
                            : "bg-[#E08600]/10 text-[#E08600]"
                        }
                      >
                        {product.productType.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(product.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {product.salesPrice
                        ? formatCurrency(product.salesPrice)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          product.onHandQty <= 10
                            ? "text-[#E53935] font-semibold"
                            : "text-[#1A1A1A]"
                        }
                      >
                        {product.onHandQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/products/${product.id}`} />}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/products/${product.id}/edit`} />}>
                            Edit Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[#8C8C8C]"
                  >
                    No products found.
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
