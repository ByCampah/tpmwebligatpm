const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.tournament.findUnique({ where: { id: 'cmr4nv3ez00012eh3aahov22o' } });
  console.log(t);
}

main().finally(() => prisma.$disconnect());
