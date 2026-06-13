import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export async function GET() {
  try {
    await requirePermission("dashboard", "read");

    const [
      totalProducts,
      totalSalesOrders,
      pendingDeliveries,
      totalPurchaseOrders,
      partialReceipts,
      activeMfgOrders,
      lowStockProducts,
      inventoryValue,
      recentSalesOrders,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.salesOrder.count(),
      prisma.salesOrder.count({
        where: { status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
      }),
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({
        where: { status: "PARTIALLY_RECEIVED" },
      }),
      prisma.manufacturingOrder.count({
        where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      }),
      prisma.product.count({
        where: {
          onHandQty: { lte: LOW_STOCK_THRESHOLD },
        },
      }),
      prisma.product.aggregate({
        _sum: {
          onHandQty: true,
        },
      }),
      prisma.salesOrder.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true, _count: { select: { items: true } } },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

    // Dashboard alerts
    const alerts = [];

    if (lowStockProducts > 0) {
      const lowProducts = await prisma.product.findMany({
        where: { onHandQty: { lte: LOW_STOCK_THRESHOLD } },
        select: { id: true, name: true, sku: true, onHandQty: true, reservedQty: true },
        take: 10,
      });
      alerts.push({
        type: "LOW_STOCK",
        severity: "warning",
        title: `${lowStockProducts} products with low stock`,
        items: lowProducts,
      });
    }

    if (pendingDeliveries > 0) {
      alerts.push({
        type: "PENDING_DELIVERY",
        severity: "info",
        title: `${pendingDeliveries} orders pending delivery`,
      });
    }

    const delayedMfgOrders = await prisma.manufacturingOrder.count({
      where: {
        status: "IN_PROGRESS",
        updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    if (delayedMfgOrders > 0) {
      alerts.push({
        type: "MFG_DELAY",
        severity: "error",
        title: `${delayedMfgOrders} manufacturing orders delayed`,
      });
    }

    // Chart data: sales orders by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await prisma.salesOrder.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: sixMonthsAgo } },
    });

    const mfgByStatus = await prisma.manufacturingOrder.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      kpis: {
        totalProducts,
        totalSalesOrders,
        pendingDeliveries,
        totalPurchaseOrders,
        partialReceipts,
        activeMfgOrders,
        lowStockProducts,
        inventoryValue: inventoryValue._sum.onHandQty || 0,
      },
      alerts,
      recentSalesOrders,
      recentAuditLogs,
      charts: {
        salesByStatus: salesByMonth,
        mfgByStatus,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
