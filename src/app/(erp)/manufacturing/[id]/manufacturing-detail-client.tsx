"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, PlayCircle, CheckCircle2, Factory, Package, Wrench, Loader2 } from "lucide-react";

interface BomItem {
  id: string;
  quantity: number;
  component: {
    name: string;
    sku: string;
    onHandQty: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  quantity: number;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  product: {
    name: string;
    sku: string;
  };
  bom: {
    name: string;
    items: BomItem[];
  } | null;
}

export function ManufacturingDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "confirm" | "start" | "complete") => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/manufacturing-orders/${order.id}/${action}`, {
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
          { label: "Manufacturing", href: "/manufacturing" },
          { label: order.orderNumber },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/manufacturing" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            {order.status === "DRAFT" && (
              <Button
                onClick={() => handleAction("confirm")}
                disabled={isLoading}
                className="bg-[#820AD1] hover:bg-[#9013D8]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Confirm Order
              </Button>
            )}
            {order.status === "CONFIRMED" && (
              <Button
                onClick={() => handleAction("start")}
                disabled={isLoading}
                className="bg-[#E08600] hover:bg-[#C87800] text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                Start Production
              </Button>
            )}
            {order.status === "IN_PROGRESS" && (
              <Button
                onClick={() => handleAction("complete")}
                disabled={isLoading}
                className="bg-[#00A868] hover:bg-[#009058] text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Complete Production
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
          
          <div className="relative z-10 flex flex-col items-center w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${order.status !== 'CANCELLED' ? 'bg-[#820AD1] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>1</div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Draft</span>
          </div>

          <div className="relative z-10 flex flex-col items-center w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(order.status) ? 'bg-[#820AD1] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>2</div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Confirmed</span>
          </div>

          <div className="relative z-10 flex flex-col items-center w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${['IN_PROGRESS', 'COMPLETED'].includes(order.status) ? 'bg-[#E08600] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>3</div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">In Progress</span>
          </div>

          <div className="relative z-10 flex flex-col items-center w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${order.status === 'COMPLETED' ? 'bg-[#00A868] text-white' : 'bg-[#E0E0E0] text-[#8C8C8C]'}`}>4</div>
            <span className="mt-2 text-xs font-semibold text-[#1A1A1A]">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Manufacturing Info
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
                      : order.status === "IN_PROGRESS"
                      ? "status-in-progress"
                      : order.status === "COMPLETED"
                      ? "status-completed"
                      : "status-cancelled"
                  }
                >
                  {order.status === "IN_PROGRESS" ? "IN PROGRESS" : order.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#8C8C8C] mb-1">Target Quantity</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {order.quantity}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#F5F2F8]">
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">Start Date</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {order.startDate ? formatDateTime(order.startDate) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1">End Date</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {order.endDate ? formatDateTime(order.endDate) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E0E0E0] bg-white">
            <CardHeader className="pb-3 border-b border-[#F5F2F8]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Product to Produce
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{order.product.name}</p>
                <p className="text-xs text-[#8C8C8C]">{order.product.sku}</p>
              </div>
              {order.bom && (
                <div className="pt-3 border-t border-[#F5F2F8]">
                  <p className="text-xs text-[#8C8C8C] mb-1">Bill of Materials</p>
                  <p className="text-sm text-[#1A1A1A]">
                    {order.bom.name}
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
                <Wrench className="w-4 h-4 text-[#820AD1]" />
                <CardTitle className="text-sm font-semibold">
                  Components to Consume
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
                    <tr>
                      <th className="px-6 py-3">Component</th>
                      <th className="px-6 py-3 text-right">Qty per Unit</th>
                      <th className="px-6 py-3 text-right">Total Needed</th>
                      <th className="px-6 py-3 text-right">Current Stock</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {order.bom ? (
                      order.bom.items.map((item) => {
                        const totalNeeded = item.quantity * order.quantity;
                        const isShortage = item.component.onHandQty < totalNeeded;

                        return (
                          <tr key={item.id} className="hover:bg-[#F5F2F8]/30">
                            <td className="px-6 py-4">
                              <div className="font-medium text-[#1A1A1A]">{item.component.name}</div>
                              <div className="text-xs text-[#8C8C8C]">{item.component.sku}</div>
                            </td>
                            <td className="px-6 py-4 text-right text-[#595959]">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-[#1A1A1A]">
                              {totalNeeded}
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              {item.component.onHandQty}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {['DRAFT', 'CONFIRMED'].includes(order.status) && isShortage ? (
                                <Badge variant="secondary" className="bg-[#E53935]/10 text-[#E53935]">
                                  Shortage
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-[#00A868]/10 text-[#00A868]">
                                  Available
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[#8C8C8C]">
                          No components found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
