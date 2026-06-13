"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { StockAdjustModal } from "@/components/forms/stock-adjust-form";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  productType: string;
  onHandQty: number;
  reservedQty: number;
  freeQty: number;
  costPrice: number;
  stockValue: number;
}

export function InventoryClient({ initialData }: { initialData: InventoryItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const filteredData = initialData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="erp-page">
      <PageHeader
        title="Inventory Overview"
        description="Monitor stock levels, value, and make manual adjustments."
      />

      <div className="mt-6 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search inventory by name or SKU..."
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
                <th className="px-4 py-3">SKU & Product</th>
                <th className="px-4 py-3 text-right">Cost Price</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Available (Free)</th>
                <th className="px-4 py-3 text-right">Stock Value</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1A1A1A]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#8C8C8C] mt-0.5">
                        {item.sku}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[#595959]">
                      {formatCurrency(item.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-[#1A1A1A]">
                        {item.onHandQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[#E08600] font-medium">
                        {item.reservedQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant="secondary"
                        className={
                          item.freeQty <= 0
                            ? "bg-[#E53935]/10 text-[#E53935] hover:bg-[#E53935]/20"
                            : "bg-[#00A868]/10 text-[#00A868] hover:bg-[#00A868]/20"
                        }
                      >
                        {item.freeQty}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">
                      {formatCurrency(item.stockValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#820AD1] border-[#EBE3F2] hover:bg-[#F5F2F8]"
                        onClick={() => setSelectedProduct(item)}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No inventory records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-[#F5F2F8] border-t border-[#E0E0E0] font-medium text-[#1A1A1A]">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-[#595959]">
                    Total Inventory Value:
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      filteredData.reduce((acc, item) => acc + item.stockValue, 0)
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <StockAdjustModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
