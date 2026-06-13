import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing all transactional data...");

  // Delete in order to respect foreign key constraints
  await prisma.workOrder.deleteMany();
  await prisma.manufacturingOrder.deleteMany();
  await prisma.bomOperation.deleteMany();
  await prisma.bomItem.deleteMany();
  await prisma.bom.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.auditLog.deleteMany();

  // Reset product stock to 0
  await prisma.product.updateMany({
    data: { onHandQty: 0, reservedQty: 0 },
  });

  console.log("✅ All transactional data cleared!");

  // ── Reference IDs ──────────────────────────────────────
  const USER_ID = "cmqcaz3yw0000pymttf643q0a"; // Gupta Prakash (ADMIN)
  const CUSTOMER_ACME = "cmqc55xmf0003129lrnxjgadp";
  const VENDOR_TIMBER = "cmqc55x1d0001129lq2mr3egz";
  const VENDOR_HARDWARE = "cmqc55xbu0002129lez4xjhbe";
  const PROD_TABLE = "cmqc55yht000b129ls3welw0r"; // Wooden Dining Table (FG)
  const PROD_WOODEN_TABLE = "cmqcm73z60007uwbg18l50t8n"; // Wooden Table (FG)
  const PROD_LEG = "cmqc55xwu0005129l26fffwwm";   // Wooden Leg (RM)
  const PROD_TOP = "cmqc55y7m0007129lunpsrbis";    // Wooden Top (RM)
  const PROD_SCREWS = "cmqc55ycp0009129lskhcrwzs"; // Screws (RM)

  // ── Add more customers ────────────────────────────────
  console.log("👥 Creating additional customers...");
  const customer2 = await prisma.customer.create({
    data: {
      name: "BuildRight Interiors",
      email: "orders@buildright.in",
      phone: "+91 98765 43210",
      address: "45, MG Road, Bengaluru, Karnataka 560001",
    },
  });
  const customer3 = await prisma.customer.create({
    data: {
      name: "HomeStyle Furnishings",
      email: "procurement@homestyle.co.in",
      phone: "+91 87654 32109",
      address: "12, Civil Lines, Jaipur, Rajasthan 302006",
    },
  });

  // ── Set product stock levels ──────────────────────────
  console.log("📦 Setting realistic inventory levels...");
  await prisma.product.update({ where: { id: PROD_TABLE }, data: { onHandQty: 25, reservedQty: 5 } });
  await prisma.product.update({ where: { id: PROD_WOODEN_TABLE }, data: { onHandQty: 8, reservedQty: 0 } });
  await prisma.product.update({ where: { id: PROD_LEG }, data: { onHandQty: 200, reservedQty: 20 } });
  await prisma.product.update({ where: { id: PROD_TOP }, data: { onHandQty: 60, reservedQty: 5 } });
  await prisma.product.update({ where: { id: PROD_SCREWS }, data: { onHandQty: 50, reservedQty: 10 } });

  // ── Create Bills of Materials ─────────────────────────
  console.log("📋 Creating Bills of Materials...");
  const bom1 = await prisma.bom.create({
    data: {
      productId: PROD_TABLE,
      name: "Standard Dining Table BoM",
      isActive: true,
      items: {
        create: [
          { componentId: PROD_LEG, quantity: 4 },
          { componentId: PROD_TOP, quantity: 1 },
          { componentId: PROD_SCREWS, quantity: 2 },
        ],
      },
      operations: {
        create: [
          { operationName: "Cut & Shape Legs", duration: 45, sequence: 1 },
          { operationName: "Sand & Polish Top", duration: 30, sequence: 2 },
          { operationName: "Assembly", duration: 60, sequence: 3 },
          { operationName: "Quality Inspection", duration: 15, sequence: 4 },
          { operationName: "Packaging", duration: 20, sequence: 5 },
        ],
      },
    },
  });

  // ── Create Sales Orders ───────────────────────────────
  console.log("🛒 Creating Sales Orders...");

  // SO-1: Delivered order (completed)
  const so1 = await prisma.salesOrder.create({
    data: {
      customerId: CUSTOMER_ACME,
      status: "DELIVERED",
      orderDate: new Date("2026-05-20"),
      createdBy: USER_ID,
      createdAt: new Date("2026-05-20"),
      items: {
        create: [
          { productId: PROD_TABLE, quantity: 5, deliveredQty: 5, unitPrice: 15000 },
        ],
      },
    },
  });

  // SO-2: Confirmed order (ready to deliver)
  const so2 = await prisma.salesOrder.create({
    data: {
      customerId: customer2.id,
      status: "CONFIRMED",
      orderDate: new Date("2026-06-05"),
      createdBy: USER_ID,
      createdAt: new Date("2026-06-05"),
      items: {
        create: [
          { productId: PROD_TABLE, quantity: 5, deliveredQty: 0, unitPrice: 15000 },
        ],
      },
    },
  });

  // SO-3: Draft order (awaiting confirmation)
  const so3 = await prisma.salesOrder.create({
    data: {
      customerId: customer3.id,
      status: "DRAFT",
      orderDate: new Date("2026-06-12"),
      createdBy: USER_ID,
      createdAt: new Date("2026-06-12"),
      items: {
        create: [
          { productId: PROD_TABLE, quantity: 10, deliveredQty: 0, unitPrice: 14500 },
        ],
      },
    },
  });

  // SO-4: Another draft
  const so4 = await prisma.salesOrder.create({
    data: {
      customerId: CUSTOMER_ACME,
      status: "DRAFT",
      orderDate: new Date("2026-06-13"),
      createdBy: USER_ID,
      createdAt: new Date("2026-06-13"),
      items: {
        create: [
          { productId: PROD_TABLE, quantity: 15, deliveredQty: 0, unitPrice: 15000 },
          { productId: PROD_WOODEN_TABLE, quantity: 8, deliveredQty: 0, unitPrice: 2500 },
        ],
      },
    },
  });

  // ── Create Purchase Orders ────────────────────────────
  console.log("📥 Creating Purchase Orders...");

  // PO-1: Received (completed)
  const po1 = await prisma.purchaseOrder.create({
    data: {
      vendorId: VENDOR_TIMBER,
      status: "RECEIVED",
      createdBy: USER_ID,
      createdAt: new Date("2026-05-15"),
      items: {
        create: [
          { productId: PROD_LEG, quantity: 100, receivedQty: 100, unitCost: 250 },
          { productId: PROD_TOP, quantity: 30, receivedQty: 30, unitCost: 1200 },
        ],
      },
    },
  });

  // PO-2: Confirmed (awaiting delivery)
  const po2 = await prisma.purchaseOrder.create({
    data: {
      vendorId: VENDOR_TIMBER,
      status: "CONFIRMED",
      createdBy: USER_ID,
      createdAt: new Date("2026-06-08"),
      items: {
        create: [
          { productId: PROD_LEG, quantity: 80, receivedQty: 0, unitCost: 250 },
          { productId: PROD_TOP, quantity: 20, receivedQty: 0, unitCost: 1200 },
        ],
      },
    },
  });

  // PO-3: Draft
  const po3 = await prisma.purchaseOrder.create({
    data: {
      vendorId: VENDOR_HARDWARE,
      status: "DRAFT",
      createdBy: USER_ID,
      createdAt: new Date("2026-06-12"),
      items: {
        create: [
          { productId: PROD_SCREWS, quantity: 50, receivedQty: 0, unitCost: 120 },
        ],
      },
    },
  });

  // ── Create Manufacturing Orders ───────────────────────
  console.log("🏭 Creating Manufacturing Orders...");

  // MO-1: Completed
  const mo1 = await prisma.manufacturingOrder.create({
    data: {
      productId: PROD_TABLE,
      bomId: bom1.id,
      quantity: 10,
      status: "COMPLETED",
      createdBy: USER_ID,
      createdAt: new Date("2026-05-25"),
      workOrders: {
        create: [
          { operation: "Cut & Shape Legs", duration: 45, sequence: 1, status: "COMPLETED", startedAt: new Date("2026-05-25T09:00:00"), completedAt: new Date("2026-05-25T09:45:00") },
          { operation: "Sand & Polish Top", duration: 30, sequence: 2, status: "COMPLETED", startedAt: new Date("2026-05-25T10:00:00"), completedAt: new Date("2026-05-25T10:30:00") },
          { operation: "Assembly", duration: 60, sequence: 3, status: "COMPLETED", startedAt: new Date("2026-05-25T11:00:00"), completedAt: new Date("2026-05-25T12:00:00") },
          { operation: "Quality Inspection", duration: 15, sequence: 4, status: "COMPLETED", startedAt: new Date("2026-05-25T13:00:00"), completedAt: new Date("2026-05-25T13:15:00") },
          { operation: "Packaging", duration: 20, sequence: 5, status: "COMPLETED", startedAt: new Date("2026-05-25T13:30:00"), completedAt: new Date("2026-05-25T13:50:00") },
        ],
      },
    },
  });

  // MO-2: In Progress
  const mo2 = await prisma.manufacturingOrder.create({
    data: {
      productId: PROD_TABLE,
      bomId: bom1.id,
      quantity: 15,
      status: "IN_PROGRESS",
      createdBy: USER_ID,
      createdAt: new Date("2026-06-10"),
      workOrders: {
        create: [
          { operation: "Cut & Shape Legs", duration: 45, sequence: 1, status: "COMPLETED", startedAt: new Date("2026-06-10T09:00:00"), completedAt: new Date("2026-06-10T09:45:00") },
          { operation: "Sand & Polish Top", duration: 30, sequence: 2, status: "COMPLETED", startedAt: new Date("2026-06-10T10:00:00"), completedAt: new Date("2026-06-10T10:30:00") },
          { operation: "Assembly", duration: 60, sequence: 3, status: "IN_PROGRESS", startedAt: new Date("2026-06-10T11:00:00") },
          { operation: "Quality Inspection", duration: 15, sequence: 4, status: "PENDING" },
          { operation: "Packaging", duration: 20, sequence: 5, status: "PENDING" },
        ],
      },
    },
  });

  // MO-3: Draft
  const mo3 = await prisma.manufacturingOrder.create({
    data: {
      productId: PROD_TABLE,
      bomId: bom1.id,
      quantity: 20,
      status: "DRAFT",
      createdBy: USER_ID,
      createdAt: new Date("2026-06-13"),
    },
  });

  // ── Create Stock Ledger Entries ───────────────────────
  console.log("📊 Creating Stock Ledger entries...");

  await prisma.stockLedger.createMany({
    data: [
      { productId: PROD_LEG, movementType: "PURCHASE_RECEIPT", quantity: 100, previousStock: 0, newStock: 100, referenceType: "PurchaseOrder", referenceId: po1.id, createdBy: USER_ID, createdAt: new Date("2026-05-16") },
      { productId: PROD_TOP, movementType: "PURCHASE_RECEIPT", quantity: 30, previousStock: 0, newStock: 30, referenceType: "PurchaseOrder", referenceId: po1.id, createdBy: USER_ID, createdAt: new Date("2026-05-16") },
      { productId: PROD_SCREWS, movementType: "PURCHASE_RECEIPT", quantity: 50, previousStock: 0, newStock: 50, referenceType: "PurchaseOrder", referenceId: po1.id, createdBy: USER_ID, createdAt: new Date("2026-05-16") },
      { productId: PROD_LEG, movementType: "MANUFACTURING_CONSUMPTION", quantity: -40, previousStock: 100, newStock: 60, referenceType: "ManufacturingOrder", referenceId: mo1.id, createdBy: USER_ID, createdAt: new Date("2026-05-25") },
      { productId: PROD_TOP, movementType: "MANUFACTURING_CONSUMPTION", quantity: -10, previousStock: 30, newStock: 20, referenceType: "ManufacturingOrder", referenceId: mo1.id, createdBy: USER_ID, createdAt: new Date("2026-05-25") },
      { productId: PROD_SCREWS, movementType: "MANUFACTURING_CONSUMPTION", quantity: -20, previousStock: 50, newStock: 30, referenceType: "ManufacturingOrder", referenceId: mo1.id, createdBy: USER_ID, createdAt: new Date("2026-05-25") },
      { productId: PROD_TABLE, movementType: "MANUFACTURING_PRODUCTION", quantity: 10, previousStock: 0, newStock: 10, referenceType: "ManufacturingOrder", referenceId: mo1.id, createdBy: USER_ID, createdAt: new Date("2026-05-25") },
      { productId: PROD_TABLE, movementType: "SALES_DELIVERY", quantity: -5, previousStock: 10, newStock: 5, referenceType: "SalesOrder", referenceId: so1.id, createdBy: USER_ID, createdAt: new Date("2026-05-22") },
      { productId: PROD_LEG, movementType: "PURCHASE_RECEIPT", quantity: 140, previousStock: 60, newStock: 200, referenceType: "PurchaseOrder", referenceId: po1.id, createdBy: USER_ID, createdAt: new Date("2026-06-01") },
      { productId: PROD_TOP, movementType: "PURCHASE_RECEIPT", quantity: 40, previousStock: 20, newStock: 60, referenceType: "PurchaseOrder", referenceId: po1.id, createdBy: USER_ID, createdAt: new Date("2026-06-01") },
      { productId: PROD_TABLE, movementType: "MANUFACTURING_PRODUCTION", quantity: 20, previousStock: 5, newStock: 25, referenceType: "ManufacturingOrder", referenceId: mo1.id, createdBy: USER_ID, createdAt: new Date("2026-06-05") },
    ],
  });

  // ── Create Audit Log Entries ──────────────────────────
  console.log("📝 Creating Audit Log entries...");

  await prisma.auditLog.createMany({
    data: [
      { userId: USER_ID, module: "SALES", action: "ORDER_CREATED", entityId: so1.id, newValue: { status: "DRAFT", customer: "Acme Corp", items: 1 }, createdAt: new Date("2026-05-20") },
      { userId: USER_ID, module: "SALES", action: "ORDER_CONFIRMED", entityId: so1.id, oldValue: { status: "DRAFT" }, newValue: { status: "CONFIRMED" }, createdAt: new Date("2026-05-20") },
      { userId: USER_ID, module: "SALES", action: "ORDER_DELIVERED", entityId: so1.id, oldValue: { status: "CONFIRMED" }, newValue: { status: "DELIVERED" }, createdAt: new Date("2026-05-22") },
      { userId: USER_ID, module: "PURCHASE", action: "ORDER_CREATED", entityId: po1.id, newValue: { status: "DRAFT", vendor: "Timber Supplies Inc." }, createdAt: new Date("2026-05-15") },
      { userId: USER_ID, module: "PURCHASE", action: "ORDER_CONFIRMED", entityId: po1.id, oldValue: { status: "DRAFT" }, newValue: { status: "CONFIRMED" }, createdAt: new Date("2026-05-15") },
      { userId: USER_ID, module: "PURCHASE", action: "ORDER_RECEIVED", entityId: po1.id, oldValue: { status: "CONFIRMED" }, newValue: { status: "RECEIVED" }, createdAt: new Date("2026-05-16") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_CREATED", entityId: mo1.id, newValue: { product: "Wooden Dining Table", quantity: 10 }, createdAt: new Date("2026-05-25") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_CONFIRMED", entityId: mo1.id, oldValue: { status: "DRAFT" }, newValue: { status: "CONFIRMED" }, createdAt: new Date("2026-05-25") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_STARTED", entityId: mo1.id, oldValue: { status: "CONFIRMED" }, newValue: { status: "IN_PROGRESS" }, createdAt: new Date("2026-05-25") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_COMPLETED", entityId: mo1.id, oldValue: { status: "IN_PROGRESS" }, newValue: { status: "COMPLETED" }, createdAt: new Date("2026-05-25") },
      { userId: USER_ID, module: "SALES", action: "ORDER_CREATED", entityId: so2.id, newValue: { status: "DRAFT", customer: "BuildRight Interiors" }, createdAt: new Date("2026-06-05") },
      { userId: USER_ID, module: "SALES", action: "ORDER_CONFIRMED", entityId: so2.id, oldValue: { status: "DRAFT" }, newValue: { status: "CONFIRMED" }, createdAt: new Date("2026-06-05") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_CREATED", entityId: mo2.id, newValue: { product: "Wooden Dining Table", quantity: 15 }, createdAt: new Date("2026-06-10") },
      { userId: USER_ID, module: "MANUFACTURING", action: "ORDER_STARTED", entityId: mo2.id, oldValue: { status: "CONFIRMED" }, newValue: { status: "IN_PROGRESS" }, createdAt: new Date("2026-06-10") },
      { userId: USER_ID, module: "INVENTORY", action: "STOCK_ADJUSTED", entityId: PROD_LEG, newValue: { reason: "Cycle count correction", adjustment: +40 }, createdAt: new Date("2026-06-01") },
    ],
  });

  console.log("\n🎉 Dummy data seeded successfully!");
  console.log("   📦 Products: stock levels set");
  console.log("   📋 BoMs: 1 active Bill of Materials");
  console.log("   🛒 Sales Orders: 4 (1 Delivered, 1 Confirmed, 2 Draft)");
  console.log("   📥 Purchase Orders: 3 (1 Received, 1 Confirmed, 1 Draft)");
  console.log("   🏭 Manufacturing Orders: 3 (1 Completed, 1 In Progress, 1 Draft)");
  console.log("   📊 Stock Ledger: 11 entries");
  console.log("   📝 Audit Logs: 15 entries");
}

main().finally(() => prisma.$disconnect());
