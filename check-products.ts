import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany()
  console.log(`FOUND ${products.length} PRODUCTS:`);
  products.forEach(p => console.log(`- ${p.name} [${p.sku}]`))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
