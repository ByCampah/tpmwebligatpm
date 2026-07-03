const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.tournament.findFirst({ where: { name: 'Copa de Promesas' } });
  console.log(t);
}

main().finally(() => prisma.$disconnect());
