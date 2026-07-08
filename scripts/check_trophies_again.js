const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trophy.findMany({ where: { tournament: { name: 'Liga TPM' } } })
  .then(t => console.log(t.map(tr => ({ name: tr.name, teamId: tr.teamId, playerId: tr.playerId }))))
  .finally(() => prisma.$disconnect());
