"use client";

import {
  Package,
  ShoppingCart,
  Truck,
  Factory,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface DashboardData {
  kpis: {
    totalProducts: number;
    totalSalesOrders: number;
    pendingDeliveries: number;
    totalPurchaseOrders: number;
    activeMfgOrders: number;
    lowStockCount: number;
    delayedOrders: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    onHandQty: number;
    reservedQty: number;
    freeQty: number;
    productType: string;
  }>;
  recentSalesOrders: Array<{
    id: string;
    status: string;
    createdAt: string;
    customer: { name: string };
    items: Array<{ quantity: number; unitPrice: string; product: { name: string } }>;
  }>;
  recentAuditLogs: Array<{
    id: string;
    module: string;
    action: string;
    createdAt: string;
    user: { name: string; role: string };
  }>;
  charts: {
    mfgByStatus: Array<{ status: string; count: number }>;
    salesByStatus: Array<{ status: string; count: number }>;
  };
}

const KPI_CARDS = [
  { key: "totalProducts", label: "Total Products", icon: Package, color: "text-[#820AD1]", bgColor: "bg-[#820AD1]/10" },
  { key: "totalSalesOrders", label: "Sales Orders", icon: ShoppingCart, color: "text-[#820AD1]", bgColor: "bg-[#820AD1]/10" },
  { key: "pendingDeliveries", label: "Pending Deliveries", icon: Truck, color: "text-[#E08600]", bgColor: "bg-[#E08600]/10" },
  { key: "totalPurchaseOrders", label: "Purchase Orders", icon: TrendingUp, color: "text-[#820AD1]", bgColor: "bg-[#820AD1]/10" },
  { key: "activeMfgOrders", label: "Active Manufacturing", icon: Factory, color: "text-[#00A868]", bgColor: "bg-[#00A868]/10" },
  { key: "lowStockCount", label: "Low Stock Products", icon: AlertTriangle, color: "text-[#E53935]", bgColor: "bg-[#E53935]/10" },
] as const;

const PIE_COLORS = ["#820AD1", "#00A868", "#E08600", "#9013D8", "#E53935"];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PARTIALLY_DELIVERED: "Partial",
  DELIVERED: "Delivered",
};

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="erp-page">
      {/* Page Title */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
          Dashboard
        </h2>
        <p className="text-sm text-[#595959] mt-1">
          Welcome back. Here&apos;s your business overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const value = data.kpis[kpi.key as keyof typeof data.kpis];
          return (
            <Card
              key={kpi.key}
              className="erp-card-hover border-[#E0E0E0] bg-white"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#595959] uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts Section */}
      {(data.kpis.lowStockCount > 0 || data.kpis.delayedOrders > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          {data.kpis.lowStockCount > 0 && (
            <Card className="border-[#E08600]/30 bg-[#E08600]/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E08600]" />
                  <CardTitle className="text-sm font-semibold text-[#E08600]">
                    Low Stock Alert
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {data.kpis.lowStockCount} products require attention
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {data.lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-1.5 border-b border-[#E08600]/10 last:border-0"
                    >
                      <div>
                        <Link
                          href={`/products/${product.id}`}
                          className="text-sm font-medium text-[#1A1A1A] hover:text-[#820AD1] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-[#8C8C8C]">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${product.freeQty <= 0 ? "text-[#E53935]" : "text-[#E08600]"}`}>
                          {product.freeQty} free
                        </p>
                        <p className="text-xs text-[#8C8C8C]">
                          {product.onHandQty} on hand
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.kpis.delayedOrders > 0 && (
            <Card className="border-[#E53935]/30 bg-[#E53935]/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E53935]" />
                  <CardTitle className="text-sm font-semibold text-[#E53935]">
                    Delayed Orders
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {data.kpis.delayedOrders} orders overdue by more than 7 days
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
        {/* Manufacturing Status Pie */}
        <Card className="border-[#E0E0E0] bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Manufacturing Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.charts.mfgByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.charts.mfgByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.charts.mfgByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, STATUS_LABELS[name] || name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[#8C8C8C]">
                No manufacturing data yet
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {data.charts.mfgByStatus.map((item, i) => (
                <div key={item.status} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-[#595959]">{STATUS_LABELS[item.status] || item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Status Bar */}
        <Card className="border-[#E0E0E0] bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.charts.salesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.charts.salesByStatus}>
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => STATUS_LABELS[v]?.slice(0, 6) || v.slice(0, 6)}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, "Orders"]}
                    labelFormatter={(label) => STATUS_LABELS[label] || label}
                  />
                  <Bar dataKey="count" fill="#820AD1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[#8C8C8C]">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales Orders */}
        <Card className="border-[#E0E0E0] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Sales Orders</CardTitle>
              <Link
                href="/sales-orders"
                className="text-xs font-medium text-[#820AD1] hover:text-[#9013D8] flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSalesOrders.length > 0 ? (
                data.recentSalesOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/sales-orders/${order.id}`}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#F5F2F8] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-[#8C8C8C]">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <StatusBadge status={order.status as "DRAFT" | "CONFIRMED" | "DELIVERED" | "CANCELLED"} />
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[#8C8C8C] text-center py-4">
                  No sales orders yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-[#E0E0E0] bg-white animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <Link
              href="/audit-logs"
              className="text-xs font-medium text-[#820AD1] hover:text-[#9013D8] flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentAuditLogs.length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-2 border-b border-[#F5F2F8] last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[#820AD1]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#820AD1]">
                      {log.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A1A]">
                      <span className="font-medium">{log.user.name}</span>{" "}
                      <span className="text-[#595959]">
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {log.module}
                      </Badge>
                      <span className="text-[10px] text-[#8C8C8C]">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8C8C8C] text-center py-4">
                No activity yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
