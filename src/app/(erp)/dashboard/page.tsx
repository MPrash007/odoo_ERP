import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData() {
  const [
    totalProducts,
    totalSalesOrders,
    pendingDeliveries,
    totalPurchaseOrders,
    activeMfgOrders,
    lowStockCount,
    lowStockProducts,
    recentSalesOrders,
    recentAuditLogs,
    mfgByStatus,
    salesByStatus,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.salesOrder.count(),
    prisma.salesOrder.count({
      where: { status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
    }),
    prisma.purchaseOrder.count(),
    prisma.manufacturingOrder.count({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
    }),
    prisma.product.count({
      where: { onHandQty: { lte: LOW_STOCK_THRESHOLD } },
    }),
    prisma.product.findMany({
      where: { onHandQty: { lte: LOW_STOCK_THRESHOLD } },
      select: { id: true, name: true, sku: true, onHandQty: true, reservedQty: true, productType: true },
      take: 10,
      orderBy: { onHandQty: "asc" },
    }),
    prisma.salesOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true, profileImage: true } } },
    }),
    prisma.manufacturingOrder.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.salesOrder.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  // Calculate delayed orders
  const delayedOrders = await prisma.salesOrder.count({
    where: {
      status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] },
      updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  return {
    kpis: {
      totalProducts,
      totalSalesOrders,
      pendingDeliveries,
      totalPurchaseOrders,
      activeMfgOrders,
      lowStockCount,
      delayedOrders,
    },
    lowStockProducts: lowStockProducts.map((p) => ({
      ...p,
      freeQty: p.onHandQty - p.reservedQty,
    })),
    recentSalesOrders: JSON.parse(JSON.stringify(recentSalesOrders)),
    recentAuditLogs: JSON.parse(JSON.stringify(recentAuditLogs)),
    charts: {
      mfgByStatus: mfgByStatus.map((s) => ({ status: s.status, count: s._count })),
      salesByStatus: salesByStatus.map((s) => ({ status: s.status, count: s._count })),
    },
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}
