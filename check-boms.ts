import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const boms = await prisma.bom.findMany({
    include: { product: true }
  })
  console.log("ALL BOMS IN DB:");
  boms.forEach(b => console.log(`- ${b.name} (Product: ${b.product.name} [${b.product.sku}])`))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
