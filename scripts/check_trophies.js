const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trophy.findMany({ where: { tournament: { name: 'Liga TPM' } }, include: { team: true, tournament: true } })
  .then(t => console.log(JSON.stringify(t, null, 2)))
  .finally(() => prisma.$disconnect());
