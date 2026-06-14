import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────

export interface ERPContext {
  type: string;
  data: Record<string, unknown>;
  summary: string;
}

// ─── Helper: Format order ID for display ────────────────

function formatId(id: string, prefix: string): string {
  return `${prefix}-${id.slice(-6).toUpperCase()}`;
}

// ─── Sales Order Context ────────────────────────────────

export async function buildSalesOrderContext(orderId: string): Promise<ERPContext> {
  // Try matching by full ID or by the short suffix
  let order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: { include: { product: true } },
      purchaseOrders: {
        include: {
          vendor: true,
          items: { include: { product: true } },
        },
      },
      manufacturingOrders: {
        include: {
          product: true,
          bom: { include: { items: { include: { component: true } } } },
          workOrders: true,
        },
      },
    },
  });

  // If not found by full ID, try matching by suffix
  if (!order) {
    const allOrders = await prisma.salesOrder.findMany({
      where: {},
      select: { id: true },
    });
    const match = allOrders.find(
      (o) => o.id.slice(-6).toUpperCase() === orderId.toUpperCase() ||
             o.id.slice(-7).toUpperCase() === orderId.toUpperCase()
    );
    if (match) {
      order = await prisma.salesOrder.findUnique({
        where: { id: match.id },
        include: {
          customer: true,
          items: { include: { product: true } },
          purchaseOrders: {
            include: {
              vendor: true,
              items: { include: { product: true } },
            },
          },
          manufacturingOrders: {
            include: {
              product: true,
              bom: { include: { items: { include: { component: true } } } },
              workOrders: true,
            },
          },
        },
      });
    }
  }

  if (!order) {
    return {
      type: "sales-order",
      data: {},
      summary: `Sales Order "${orderId}" was not found in the system.`,
    };
  }

  // Build inventory status for each item
  const itemsWithStock = order.items.map((item) => ({
    product: item.product.name,
    sku: item.product.sku,
    ordered: item.quantity,
    delivered: item.deliveredQty,
    remaining: item.quantity - item.deliveredQty,
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.unitPrice) * item.quantity,
    currentStock: item.product.onHandQty,
    reservedStock: item.product.reservedQty,
    freeStock: item.product.onHandQty - item.product.reservedQty,
    isLowStock: item.product.onHandQty <= LOW_STOCK_THRESHOLD,
  }));

  const linkedPOs = order.purchaseOrders.map((po) => ({
    id: formatId(po.id, "PO"),
    vendor: po.vendor.name,
    status: po.status,
    items: po.items.map((i) => ({
      product: i.product.name,
      ordered: i.quantity,
      received: i.receivedQty,
    })),
  }));

  const linkedMOs = order.manufacturingOrders.map((mo) => ({
    id: formatId(mo.id, "MO"),
    product: mo.product.name,
    quantity: mo.quantity,
    status: mo.status,
    componentsNeeded: mo.bom.items.map((bi) => ({
      component: bi.component.name,
      required: bi.quantity * mo.quantity,
      inStock: bi.component.onHandQty,
      sufficient: bi.component.onHandQty >= bi.quantity * mo.quantity,
    })),
    workOrders: mo.workOrders.map((wo) => ({
      operation: wo.operation,
      status: wo.status,
      duration: wo.duration,
    })),
  }));

  const totalValue = itemsWithStock.reduce((sum, i) => sum + i.lineTotal, 0);

  return {
    type: "sales-order",
    data: {
      orderId: formatId(order.id, "SO"),
      rawId: order.id,
      status: order.status,
      customer: order.customer.name,
      customerEmail: order.customer.email,
      orderDate: order.orderDate.toISOString(),
      createdAt: order.createdAt.toISOString(),
      totalValue,
      items: itemsWithStock,
      linkedPurchaseOrders: linkedPOs,
      linkedManufacturingOrders: linkedMOs,
    },
    summary: `Sales Order ${formatId(order.id, "SO")} for customer ${order.customer.name}, status: ${order.status}, ${order.items.length} line items, total value: ₹${totalValue.toLocaleString()}`,
  };
}

// ─── Purchase Order Context ─────────────────────────────

export async function buildPurchaseOrderContext(orderId: string): Promise<ERPContext> {
  let order = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: {
      vendor: true,
      items: { include: { product: true } },
      salesOrder: {
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      },
    },
  });

  if (!order) {
    const allOrders = await prisma.purchaseOrder.findMany({
      where: {},
      select: { id: true },
    });
    const match = allOrders.find(
      (o) => o.id.slice(-6).toUpperCase() === orderId.toUpperCase() ||
             o.id.slice(-7).toUpperCase() === orderId.toUpperCase()
    );
    if (match) {
      order = await prisma.purchaseOrder.findUnique({
        where: { id: match.id },
        include: {
          vendor: true,
          items: { include: { product: true } },
          salesOrder: {
            include: {
              customer: true,
              items: { include: { product: true } },
            },
          },
        },
      });
    }
  }

  if (!order) {
    return {
      type: "purchase-order",
      data: {},
      summary: `Purchase Order "${orderId}" was not found in the system.`,
    };
  }

  const items = order.items.map((item) => ({
    product: item.product.name,
    sku: item.product.sku,
    ordered: item.quantity,
    received: item.receivedQty,
    pending: item.quantity - item.receivedQty,
    unitCost: Number(item.unitCost),
    lineCost: Number(item.unitCost) * item.quantity,
    currentStock: item.product.onHandQty,
  }));

  const totalCost = items.reduce((sum, i) => sum + i.lineCost, 0);

  return {
    type: "purchase-order",
    data: {
      orderId: formatId(order.id, "PO"),
      rawId: order.id,
      status: order.status,
      vendor: order.vendor.name,
      vendorEmail: order.vendor.email,
      createdAt: order.createdAt.toISOString(),
      totalCost,
      items,
      linkedSalesOrder: order.salesOrder
        ? {
            id: formatId(order.salesOrder.id, "SO"),
            customer: order.salesOrder.customer.name,
            status: order.salesOrder.status,
          }
        : null,
    },
    summary: `Purchase Order ${formatId(order.id, "PO")} from vendor ${order.vendor.name}, status: ${order.status}, ${items.length} items, total: ₹${totalCost.toLocaleString()}`,
  };
}

// ─── Manufacturing Order Context ────────────────────────

export async function buildManufacturingContext(moId: string): Promise<ERPContext> {
  let mo = await prisma.manufacturingOrder.findUnique({
    where: { id: moId },
    include: {
      product: true,
      bom: {
        include: {
          items: { include: { component: true } },
          operations: { orderBy: { sequence: "asc" } },
        },
      },
      salesOrder: { include: { customer: true } },
      workOrders: { orderBy: { sequence: "asc" } },
      assignee: true,
    },
  });

  if (!mo) {
    const allMOs = await prisma.manufacturingOrder.findMany({
      where: {},
      select: { id: true },
    });
    const match = allMOs.find(
      (o) => o.id.slice(-6).toUpperCase() === moId.toUpperCase() ||
             o.id.slice(-7).toUpperCase() === moId.toUpperCase()
    );
    if (match) {
      mo = await prisma.manufacturingOrder.findUnique({
        where: { id: match.id },
        include: {
          product: true,
          bom: {
            include: {
              items: { include: { component: true } },
              operations: { orderBy: { sequence: "asc" } },
            },
          },
          salesOrder: { include: { customer: true } },
          workOrders: { orderBy: { sequence: "asc" } },
          assignee: true,
        },
      });
    }
  }

  if (!mo) {
    return {
      type: "manufacturing-order",
      data: {},
      summary: `Manufacturing Order "${moId}" was not found in the system.`,
    };
  }

  const components = mo.bom.items.map((bi) => {
    const requiredTotal = bi.quantity * mo!.quantity;
    return {
      component: bi.component.name,
      sku: bi.component.sku,
      requiredPerUnit: bi.quantity,
      totalRequired: requiredTotal,
      inStock: bi.component.onHandQty,
      reserved: bi.component.reservedQty,
      free: bi.component.onHandQty - bi.component.reservedQty,
      sufficient: bi.component.onHandQty >= requiredTotal,
      shortfall: Math.max(0, requiredTotal - bi.component.onHandQty),
    };
  });

  const workOrders = mo.workOrders.map((wo) => ({
    operation: wo.operation,
    status: wo.status,
    duration: wo.duration,
    sequence: wo.sequence,
    startedAt: wo.startedAt?.toISOString() || null,
    completedAt: wo.completedAt?.toISOString() || null,
  }));

  const isBlocked = components.some((c) => !c.sufficient);

  return {
    type: "manufacturing-order",
    data: {
      orderId: formatId(mo.id, "MO"),
      rawId: mo.id,
      status: mo.status,
      product: mo.product.name,
      productSku: mo.product.sku,
      quantity: mo.quantity,
      assignee: mo.assignee?.name || "Unassigned",
      createdAt: mo.createdAt.toISOString(),
      isBlocked,
      components,
      workOrders,
      linkedSalesOrder: mo.salesOrder
        ? {
            id: formatId(mo.salesOrder.id, "SO"),
            customer: mo.salesOrder.customer.name,
            status: mo.salesOrder.status,
          }
        : null,
    },
    summary: `Manufacturing Order ${formatId(mo.id, "MO")} for ${mo.quantity}x ${mo.product.name}, status: ${mo.status}, ${isBlocked ? "BLOCKED (missing components)" : "components available"}`,
  };
}

// ─── Product Context ────────────────────────────────────

export async function buildProductContext(productId: string): Promise<ERPContext> {
  // Try by ID first, then by SKU, then by name
  let product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: true,
      bom: { include: { items: { include: { component: true } } } },
      salesOrderItems: {
        take: 5,
        orderBy: { salesOrder: { createdAt: "desc" } },
        include: { salesOrder: { include: { customer: true } } },
      },
      purchaseOrderItems: {
        take: 5,
        orderBy: { purchaseOrder: { createdAt: "desc" } },
        include: { purchaseOrder: { include: { vendor: true } } },
      },
      manufacturingOrders: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      stockLedgerEntries: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Try by SKU
  if (!product) {
    product = await prisma.product.findUnique({
      where: { sku: productId.toUpperCase() },
      include: {
        vendor: true,
        bom: { include: { items: { include: { component: true } } } },
        salesOrderItems: {
          take: 5,
          orderBy: { salesOrder: { createdAt: "desc" } },
          include: { salesOrder: { include: { customer: true } } },
        },
        purchaseOrderItems: {
          take: 5,
          orderBy: { purchaseOrder: { createdAt: "desc" } },
          include: { purchaseOrder: { include: { vendor: true } } },
        },
        manufacturingOrders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        stockLedgerEntries: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  // Try by name (partial match)
  if (!product) {
    const byName = await prisma.product.findFirst({
      where: { name: { contains: productId, mode: "insensitive" } },
      include: {
        vendor: true,
        bom: { include: { items: { include: { component: true } } } },
        salesOrderItems: {
          take: 5,
          orderBy: { salesOrder: { createdAt: "desc" } },
          include: { salesOrder: { include: { customer: true } } },
        },
        purchaseOrderItems: {
          take: 5,
          orderBy: { purchaseOrder: { createdAt: "desc" } },
          include: { purchaseOrder: { include: { vendor: true } } },
        },
        manufacturingOrders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        stockLedgerEntries: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (byName) product = byName;
  }

  if (!product) {
    return {
      type: "product",
      data: {},
      summary: `Product "${productId}" was not found in the system.`,
    };
  }

  const recentMovements = product.stockLedgerEntries.map((entry) => ({
    type: entry.movementType,
    quantity: entry.quantity,
    previousStock: entry.previousStock,
    newStock: entry.newStock,
    referenceType: entry.referenceType,
    date: entry.createdAt.toISOString(),
  }));

  return {
    type: "product",
    data: {
      name: product.name,
      sku: product.sku,
      productType: product.productType,
      salesPrice: Number(product.salesPrice),
      costPrice: Number(product.costPrice),
      onHandQty: product.onHandQty,
      reservedQty: product.reservedQty,
      freeQty: product.onHandQty - product.reservedQty,
      isLowStock: product.onHandQty <= LOW_STOCK_THRESHOLD,
      isCritical: product.onHandQty <= 0,
      procurementStrategy: product.procurementStrategy,
      procurementType: product.procurementType,
      vendor: product.vendor?.name || "No vendor assigned",
      hasBom: !!product.bom,
      bomComponents: product.bom?.items.map((bi) => ({
        component: bi.component.name,
        quantity: bi.quantity,
        inStock: bi.component.onHandQty,
      })) || [],
      recentSalesOrders: product.salesOrderItems.map((soi) => ({
        orderId: formatId(soi.salesOrder.id, "SO"),
        customer: soi.salesOrder.customer.name,
        quantity: soi.quantity,
        status: soi.salesOrder.status,
      })),
      recentPurchaseOrders: product.purchaseOrderItems.map((poi) => ({
        orderId: formatId(poi.purchaseOrder.id, "PO"),
        vendor: poi.purchaseOrder.vendor.name,
        ordered: poi.quantity,
        received: poi.receivedQty,
        status: poi.purchaseOrder.status,
      })),
      recentManufacturing: product.manufacturingOrders.map((mo) => ({
        orderId: formatId(mo.id, "MO"),
        quantity: mo.quantity,
        status: mo.status,
      })),
      recentStockMovements: recentMovements,
    },
    summary: `Product: ${product.name} (${product.sku}), Type: ${product.productType}, Stock: ${product.onHandQty} (${product.onHandQty - product.reservedQty} free), Price: ₹${Number(product.salesPrice)}`,
  };
}

// ─── Inventory Analysis Context ─────────────────────────

export async function buildInventoryContext(): Promise<ERPContext> {
  const products = await prisma.product.findMany({
    include: { vendor: true },
    orderBy: { onHandQty: "asc" },
  });

  const lowStock = products.filter((p) => p.onHandQty <= LOW_STOCK_THRESHOLD && p.onHandQty > 0);
  const criticalStock = products.filter((p) => p.onHandQty <= 0);
  const overReserved = products.filter((p) => p.reservedQty > p.onHandQty);

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.onHandQty * Number(p.costPrice),
    0
  );

  const productSummaries = products.map((p) => ({
    name: p.name,
    sku: p.sku,
    type: p.productType,
    onHand: p.onHandQty,
    reserved: p.reservedQty,
    free: p.onHandQty - p.reservedQty,
    costPrice: Number(p.costPrice),
    vendor: p.vendor?.name || "None",
    isLow: p.onHandQty <= LOW_STOCK_THRESHOLD,
    isCritical: p.onHandQty <= 0,
  }));

  return {
    type: "inventory-analysis",
    data: {
      totalProducts: products.length,
      totalInventoryValue,
      lowStockCount: lowStock.length,
      criticalStockCount: criticalStock.length,
      overReservedCount: overReserved.length,
      products: productSummaries,
      lowStockProducts: lowStock.map((p) => ({
        name: p.name,
        sku: p.sku,
        onHand: p.onHandQty,
        vendor: p.vendor?.name || "None",
      })),
      criticalStockProducts: criticalStock.map((p) => ({
        name: p.name,
        sku: p.sku,
        onHand: p.onHandQty,
        vendor: p.vendor?.name || "None",
      })),
    },
    summary: `Inventory: ${products.length} products, ${lowStock.length} low stock, ${criticalStock.length} critical, total value: ₹${totalInventoryValue.toLocaleString()}`,
  };
}

// ─── Procurement Advisor Context ────────────────────────

export async function buildProcurementContext(): Promise<ERPContext> {
  const [lowStockProducts, pendingPOs, pendingMOs, confirmedSOs] = await Promise.all([
    prisma.product.findMany({
      where: { onHandQty: { lte: LOW_STOCK_THRESHOLD } },
      include: { vendor: true },
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["DRAFT", "CONFIRMED"] } },
      include: { vendor: true, items: { include: { product: true } } },
    }),
    prisma.manufacturingOrder.findMany({
      where: { status: { in: ["DRAFT", "CONFIRMED", "IN_PROGRESS"] } },
      include: { product: true, bom: { include: { items: { include: { component: true } } } } },
    }),
    prisma.salesOrder.findMany({
      where: { status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
      include: { items: { include: { product: true } } },
    }),
  ]);

  // Calculate demand from confirmed sales orders
  const demandMap: Record<string, { name: string; totalDemand: number; currentStock: number }> = {};
  for (const so of confirmedSOs) {
    for (const item of so.items) {
      const remaining = item.quantity - item.deliveredQty;
      if (remaining > 0) {
        if (!demandMap[item.productId]) {
          demandMap[item.productId] = {
            name: item.product.name,
            totalDemand: 0,
            currentStock: item.product.onHandQty,
          };
        }
        demandMap[item.productId].totalDemand += remaining;
      }
    }
  }

  return {
    type: "procurement-advisor",
    data: {
      productsNeedingProcurement: lowStockProducts.map((p) => ({
        name: p.name,
        sku: p.sku,
        currentStock: p.onHandQty,
        type: p.procurementType,
        vendor: p.vendor?.name || "None",
      })),
      pendingPurchaseOrders: pendingPOs.map((po) => ({
        id: formatId(po.id, "PO"),
        vendor: po.vendor.name,
        status: po.status,
        items: po.items.map((i) => ({
          product: i.product.name,
          ordered: i.quantity,
          received: i.receivedQty,
        })),
      })),
      pendingManufacturing: pendingMOs.map((mo) => ({
        id: formatId(mo.id, "MO"),
        product: mo.product.name,
        quantity: mo.quantity,
        status: mo.status,
        missingComponents: mo.bom.items
          .filter((bi) => bi.component.onHandQty < bi.quantity * mo.quantity)
          .map((bi) => ({
            component: bi.component.name,
            required: bi.quantity * mo.quantity,
            inStock: bi.component.onHandQty,
            shortfall: bi.quantity * mo.quantity - bi.component.onHandQty,
          })),
      })),
      outstandingDemand: Object.values(demandMap),
    },
    summary: `Procurement: ${lowStockProducts.length} products need restocking, ${pendingPOs.length} pending POs, ${pendingMOs.length} active MOs`,
  };
}

// ─── Risk Detection Context ─────────────────────────────

export async function buildRiskContext(): Promise<ERPContext> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    criticalStock,
    lowStock,
    blockedMOs,
    delayedSOs,
    overduePOs,
    staleWorkOrders,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { onHandQty: { lte: 0 } },
      select: { name: true, sku: true, onHandQty: true },
    }),
    prisma.product.findMany({
      where: { onHandQty: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
      select: { name: true, sku: true, onHandQty: true },
    }),
    prisma.manufacturingOrder.findMany({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      include: {
        product: true,
        bom: { include: { items: { include: { component: true } } } },
      },
    }),
    prisma.salesOrder.findMany({
      where: {
        status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] },
        updatedAt: { lt: sevenDaysAgo },
      },
      include: { customer: true },
    }),
    prisma.purchaseOrder.findMany({
      where: {
        status: { in: ["DRAFT", "CONFIRMED"] },
        createdAt: { lt: sevenDaysAgo },
      },
      include: { vendor: true },
    }),
    prisma.workOrder.findMany({
      where: {
        status: "IN_PROGRESS",
        startedAt: { lt: sevenDaysAgo },
      },
    }),
  ]);

  // Check which MOs are actually blocked
  const actuallyBlockedMOs = blockedMOs.filter((mo) =>
    mo.bom.items.some((bi) => bi.component.onHandQty < bi.quantity * mo.quantity)
  );

  const risks = [];

  if (criticalStock.length > 0) {
    risks.push({
      severity: "HIGH",
      category: "Inventory",
      description: `${criticalStock.length} products have ZERO stock`,
      items: criticalStock.map((p) => p.name),
    });
  }

  if (actuallyBlockedMOs.length > 0) {
    risks.push({
      severity: "HIGH",
      category: "Manufacturing",
      description: `${actuallyBlockedMOs.length} manufacturing orders are blocked due to missing components`,
      items: actuallyBlockedMOs.map((mo) => `${formatId(mo.id, "MO")} - ${mo.product.name}`),
    });
  }

  if (delayedSOs.length > 0) {
    risks.push({
      severity: "MEDIUM",
      category: "Sales",
      description: `${delayedSOs.length} sales orders appear delayed (no update in 7+ days)`,
      items: delayedSOs.map((so) => `${formatId(so.id, "SO")} - ${so.customer.name}`),
    });
  }

  if (overduePOs.length > 0) {
    risks.push({
      severity: "MEDIUM",
      category: "Procurement",
      description: `${overduePOs.length} purchase orders may be overdue (created 7+ days ago, still pending)`,
      items: overduePOs.map((po) => `${formatId(po.id, "PO")} - ${po.vendor.name}`),
    });
  }

  if (lowStock.length > 0) {
    risks.push({
      severity: "LOW",
      category: "Inventory",
      description: `${lowStock.length} products have low stock (≤${LOW_STOCK_THRESHOLD} units)`,
      items: lowStock.map((p) => `${p.name} (${p.onHandQty} units)`),
    });
  }

  if (staleWorkOrders.length > 0) {
    risks.push({
      severity: "LOW",
      category: "Manufacturing",
      description: `${staleWorkOrders.length} work orders in progress for 7+ days`,
      items: staleWorkOrders.map((wo) => wo.operation),
    });
  }

  return {
    type: "risk-analysis",
    data: { risks },
    summary: `Risk Analysis: ${risks.filter((r) => r.severity === "HIGH").length} high, ${risks.filter((r) => r.severity === "MEDIUM").length} medium, ${risks.filter((r) => r.severity === "LOW").length} low`,
  };
}

// ─── Daily Summary Context ──────────────────────────────

export async function buildDailySummaryContext(): Promise<ERPContext> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalSO,
    totalPO,
    totalMO,
    activeSO,
    activePO,
    activeMO,
    lowStockCount,
    todayAuditLogs,
    recentSO,
    recentPO,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.salesOrder.count(),
    prisma.purchaseOrder.count(),
    prisma.manufacturingOrder.count(),
    prisma.salesOrder.count({ where: { status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } } }),
    prisma.purchaseOrder.count({ where: { status: { in: ["DRAFT", "CONFIRMED"] } } }),
    prisma.manufacturingOrder.count({ where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } } }),
    prisma.product.count({ where: { onHandQty: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: todayStart } },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.salesOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
    prisma.purchaseOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { vendor: true, items: true },
    }),
  ]);

  return {
    type: "daily-summary",
    data: {
      kpis: {
        totalProducts,
        totalSalesOrders: totalSO,
        totalPurchaseOrders: totalPO,
        totalManufacturingOrders: totalMO,
        activeSalesOrders: activeSO,
        activePurchaseOrders: activePO,
        activeManufacturingOrders: activeMO,
        lowStockProducts: lowStockCount,
      },
      recentSalesOrders: recentSO.map((so) => ({
        id: formatId(so.id, "SO"),
        customer: so.customer.name,
        status: so.status,
        itemCount: so.items.length,
        total: so.items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0),
      })),
      recentPurchaseOrders: recentPO.map((po) => ({
        id: formatId(po.id, "PO"),
        vendor: po.vendor.name,
        status: po.status,
        itemCount: po.items.length,
        total: po.items.reduce((sum, i) => sum + Number(i.unitCost) * i.quantity, 0),
      })),
      todayActivity: todayAuditLogs.map((log) => ({
        user: log.user.name,
        module: log.module,
        action: log.action,
        time: log.createdAt.toISOString(),
      })),
    },
    summary: `Today: ${activeSO} active SOs, ${activePO} pending POs, ${activeMO} active MOs, ${lowStockCount} low stock alerts`,
  };
}

// ─── General Context (fallback) ─────────────────────────

export async function buildGeneralContext(): Promise<ERPContext> {
  const [inventoryCtx, riskCtx, summaryCtx] = await Promise.all([
    buildInventoryContext(),
    buildRiskContext(),
    buildDailySummaryContext(),
  ]);

  return {
    type: "general",
    data: {
      summary: summaryCtx.data,
      inventory: inventoryCtx.data,
      risks: riskCtx.data,
    },
    summary: `General ERP overview: ${summaryCtx.summary}. ${inventoryCtx.summary}. ${riskCtx.summary}`,
  };
}
