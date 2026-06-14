import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const draftPOs = await prisma.purchaseOrder.findMany({
    where: { status: 'DRAFT' },
    include: { vendor: true, items: true }
  });
  console.log(`Found ${draftPOs.length} DRAFT purchase orders:`);
  console.log(JSON.stringify(draftPOs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
