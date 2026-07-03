const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trophies = await prisma.trophy.findMany({
    include: {
      tournament: true
    }
  });
  console.log("ALL TROPHIES:");
  console.log(JSON.stringify(trophies, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
