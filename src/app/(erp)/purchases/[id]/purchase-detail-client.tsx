"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Package, Truck, FileText, Loader2, Factory } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  product: {
    name: string;
    sku: string;
    productType: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  vendor: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: OrderItem[];
}

export function PurchaseDetailClient({ order, currentUserRole }: { order: Order, currentUserRole?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "confirm" | "receive") => {
    setIsLoading(true);
    setError("");

    try {
      // In a real scenario, you might have separate endpoints or a single state machine endpoint.
      // Currently, procurement.service handles auto PO creation, but we need generic PO endpoints.
      // Let's assume we have /api/purchase-orders/[id]/receive similar to sales-orders.
      const res = await fetch(`/api/purchase-orders/${order.id}/${action}`, {
        method: "POST",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || `Failed to ${action} order`);
      }

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="erp-page">
      <PageHeader
        title={order.orderNumber}
        description={`Created on ${formatDateTime(order.createdAt)}`}
        breadcrumbs={[
          { label: "Purchase Orders", href: "/purchases" },
          { label: order.orderNumber },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/purchases" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            {order.status === "DRAFT" && ["ADMIN", "OWNER", "VENDOR"].includes(currentUserRole || "") && (
              <Button
                onClick={() => handleAction("confirm")}
                disabled={isLoading}
                className="bg-[#820AD1] hover:bg-[#9013D8]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {currentUserRole === "VENDOR" ? "Acknowledge Order" : "Confirm Order"}
              </Button>
            )}
            {order.status === "CONFIRMED" && currentUserRole !== "VENDOR" && (
              <Button
                onClick={() => handleAction("receive")}
                disabled={isLoading}
                className="bg-[#00A868] hover:bg-[#009058] text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                Receive Items
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="p-4 mb-6 text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg border border-[#E53935]/20 flex items-center">
          <span className="font-semibold mr-2">Error:</span> {error}
        </div>
      )}

      {/* State Machine Progress Bar */}
      <div className="mb-6 p-6 bg-white border border-[#E0E0E0] rounded-xl shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#F5F2F8] z-0 rounded-full" />
          
          {/* Draft */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${order.status !== 'CANCELLED' ? 'bg-[#820AD1] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>
              1
            </div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Draft</span>
          </div>

          {/* Confirmed */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${['CONFIRMED', 'RECEIVED'].includes(order.status) ? 'bg-[#820AD1] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>
              2
            </div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Confirmed</span>
          </div>

          {/* Received */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${order.status === 'RECEIVED' ? 'bg-[#00A868] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>
              3
            </div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Received</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Order Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-[#8C8C8C] mb-1">Status</p>
                <Badge
                  variant="secondary"
                  className={
                    order.status === "DRAFT"
                      ? "status-draft"
                      : order.status === "CONFIRMED"
                      ? "status-confirmed"
                      : order.status === "RECEIVED"
                      ? "status-completed"
                      : "status-cancelled"
                  }
                >
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#8C8C8C] mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#820AD1]">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Vendor Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{order.vendor.name}</p>
                {order.vendor.email && (
                  <p className="text-xs text-[#595959]">{order.vendor.email}</p>
                )}
                {order.vendor.phone && (
                  <p className="text-xs text-[#595959]">{order.vendor.phone}</p>
                )}
              </div>
              {order.vendor.address && (
                <div className="pt-3 border-t border-[#F5F2F8]">
                  <p className="text-xs text-[#8C8C8C] mb-1">Billing Address</p>
                  <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">
                    {order.vendor.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Order Lines
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
                    <tr>
                      <th className="px-6 py-3">Raw Material</th>
                      <th className="px-6 py-3 text-right">Quantity</th>
                      <th className="px-6 py-3 text-right">Unit Price</th>
                      <th className="px-6 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F5F2F8]/30">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#1A1A1A]">{item.product.name}</div>
                          <div className="text-xs text-[#8C8C8C]">{item.product.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-[#595959]">
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-[#1A1A1A]">
                          {formatCurrency(item.quantity * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F5F2F8] border-t border-[#E0E0E0]">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right font-medium text-[#595959]">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-[#820AD1]">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
