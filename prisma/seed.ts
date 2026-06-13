import { PrismaClient, UserRole, ProductType, ProcurementStrategy, ProcurementType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data (optional, but good for local dev)
  await prisma.auditLog.deleteMany()
  await prisma.stockLedger.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.manufacturingOrder.deleteMany()
  await prisma.bomItem.deleteMany()
  await prisma.bomOperation.deleteMany()
  await prisma.bom.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      clerkId: 'user_admin123', // Placeholder, replace with real Clerk ID in prod
      name: 'Admin User',
      email: 'admin@shivfurniture.com',
      role: UserRole.ADMIN,
      position: 'System Administrator',
    },
  })

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Timber Supplies Inc.',
      email: 'sales@timbersupplies.com',
      phone: '+1 234 567 8900',
    },
  })

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Hardware Fasteners Ltd.',
      email: 'orders@hardwarefasteners.com',
    },
  })

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Acme Corp',
      email: 'purchasing@acmecorp.com',
    },
  })

  // 4. Create Products (Raw Materials)
  const leg = await prisma.product.create({
    data: {
      sku: 'RM-LEG-01',
      name: 'Wooden Leg',
      productType: ProductType.RAW_MATERIAL,
      costPrice: 5.00,
      onHandQty: 100,
      vendorId: vendor1.id,
      createdBy: admin.id,
      procurementStrategy: ProcurementStrategy.MTS,
      procurementType: ProcurementType.PURCHASE,
    },
  })

  const top = await prisma.product.create({
    data: {
      sku: 'RM-TOP-01',
      name: 'Wooden Top',
      productType: ProductType.RAW_MATERIAL,
      costPrice: 20.00,
      onHandQty: 25,
      vendorId: vendor1.id,
      createdBy: admin.id,
      procurementStrategy: ProcurementStrategy.MTS,
      procurementType: ProcurementType.PURCHASE,
    },
  })

  const screw = await prisma.product.create({
    data: {
      sku: 'RM-SCR-01',
      name: 'Screws (Pack of 100)',
      productType: ProductType.RAW_MATERIAL,
      costPrice: 2.00,
      onHandQty: 50,
      vendorId: vendor2.id,
      createdBy: admin.id,
      procurementStrategy: ProcurementStrategy.MTS,
      procurementType: ProcurementType.PURCHASE,
    },
  })

  // 5. Create Product (Finished Good)
  const table = await prisma.product.create({
    data: {
      sku: 'FG-TBL-01',
      name: 'Wooden Dining Table',
      productType: ProductType.FINISHED_GOOD,
      salesPrice: 150.00,
      costPrice: 42.00, // 4 legs (20) + 1 top (20) + 1 screw pack (2)
      onHandQty: 10,
      createdBy: admin.id,
      procurementStrategy: ProcurementStrategy.MTO,
      procurementType: ProcurementType.MANUFACTURING,
    },
  })

  // 6. Create BoM for Finished Good
  const bom = await prisma.bom.create({
    data: {
      productId: table.id,
      name: 'Standard Wooden Table BoM',
      items: {
        create: [
          { componentId: leg.id, quantity: 4 },
          { componentId: top.id, quantity: 1 },
          { componentId: screw.id, quantity: 1 }, // 1 pack per table for simplicity
        ],
      },
      operations: {
        create: [
          { operationName: 'Assembly', duration: 30, sequence: 1 },
          { operationName: 'Painting', duration: 45, sequence: 2 },
          { operationName: 'Packing', duration: 15, sequence: 3 },
        ],
      },
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
