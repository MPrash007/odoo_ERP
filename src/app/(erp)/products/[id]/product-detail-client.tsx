"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Edit, Package, Truck, Layers, History, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  productType: string;
  procurementType: string;
  procurementStrategy: string;
  costPrice: number;
  salesPrice: number | null;
  onHandQty: number;
  reservedQty: number;
  vendor?: { name: string; email: string } | null;
  bom?: {
    id: string;
    name: string;
    items: Array<{ quantity: number; component: { name: string; sku: string } }>;
    operations: Array<{ operationName: string; duration: number; sequence: number }>;
  } | null;
  stockLedgerEntries: Array<{
    id: string;
    movementType: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    referenceType: string;
    createdAt: string;
    creator: { name: string };
  }>;
}

export function ProductDetailClient({ product }: { product: Product }) {
  const freeQty = product.onHandQty - product.reservedQty;

  return (
    <div className="erp-page">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}`}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/products" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <Link href={`/products/${product.id}/edit`} className={cn(buttonVariants(), "bg-[#820AD1] hover:bg-[#9013D8]")}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Info & Inventory */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Product Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-[#8C8C8C] mb-1">Type</p>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">Cost Price</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {formatCurrency(product.costPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">Sales Price</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {product.salesPrice ? formatCurrency(product.salesPrice) : "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">Strategy</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {product.procurementStrategy}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">Procurement</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {product.procurementType}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Inventory & Supplier
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-[#F5F2F8] rounded-lg">
                  <p className="text-xs text-[#8C8C8C] mb-1">On Hand</p>
                  <p className="text-lg font-bold text-[#1A1A1A]">
                    {product.onHandQty}
                  </p>
                </div>
                <div className="text-center p-2 bg-[#F5F2F8] rounded-lg">
                  <p className="text-xs text-[#8C8C8C] mb-1">Reserved</p>
                  <p className="text-lg font-bold text-[#E08600]">
                    {product.reservedQty}
                  </p>
                </div>
                <div className="text-center p-2 bg-[#F5F2F8] rounded-lg border border-[#820AD1]/20">
                  <p className="text-xs text-[#820AD1] font-medium mb-1">Free</p>
                  <p className="text-lg font-bold text-[#820AD1]">{freeQty}</p>
                </div>
              </div>

              {product.vendor && (
                <div className="mt-4 pt-4 border-t border-[#F5F2F8]">
                  <p className="text-xs text-[#8C8C8C] mb-1">Preferred Vendor</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {product.vendor.name}
                  </p>
                  <p className="text-xs text-[#595959]">{product.vendor.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: BoM & Stock Ledger */}
        <div className="md:col-span-2 space-y-6">
          {product.bom && (
            <Card className="border-[#E0E0E0] bg-white">
              <CardHeader className="pb-3 border-b border-[#F5F2F8]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#820AD1]" />
                  <CardTitle className="text-sm font-semibold">
                    Bill of Materials: {product.bom.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-[#595959] uppercase tracking-wider mb-2">
                      Components
                    </h4>
                    <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-[#F5F2F8]">
                          <tr>
                            <th className="px-3 py-2 font-medium text-[#595959]">Component</th>
                            <th className="px-3 py-2 font-medium text-[#595959] text-right">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E0E0]">
                          {product.bom.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 font-medium">
                                {item.component.name}{" "}
                                <span className="text-xs text-[#8C8C8C] font-normal">
                                  ({item.component.sku})
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {product.bom.operations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#595959] uppercase tracking-wider mb-2">
                        Operations
                      </h4>
                      <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-[#F5F2F8]">
                            <tr>
                              <th className="px-3 py-2 font-medium text-[#595959]">Seq</th>
                              <th className="px-3 py-2 font-medium text-[#595959]">Operation</th>
                              <th className="px-3 py-2 font-medium text-[#595959] text-right">Time (min)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E0E0E0]">
                            {product.bom.operations.map((op) => (
                              <tr key={op.sequence}>
                                <td className="px-3 py-2">{op.sequence}</td>
                                <td className="px-3 py-2">{op.operationName}</td>
                                <td className="px-3 py-2 text-right">{op.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Recent Stock Ledger
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              {product.stockLedgerEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2 text-right">Qty Change</th>
                        <th className="px-4 py-2 text-right">New Stock</th>
                        <th className="px-4 py-2">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {product.stockLedgerEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#F5F2F8]/30">
                          <td className="px-4 py-2 text-[#595959]">
                            {formatDateTime(entry.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-[10px]">
                              {entry.movementType}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span
                              className={
                                entry.quantity > 0
                                  ? "text-[#00A868] font-medium"
                                  : "text-[#E53935] font-medium"
                              }
                            >
                              {entry.quantity > 0 ? "+" : ""}
                              {entry.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {entry.newStock}
                          </td>
                          <td className="px-4 py-2 text-[#8C8C8C] text-xs">
                            {entry.referenceType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-[#8C8C8C] text-sm">
                  No stock movements recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
