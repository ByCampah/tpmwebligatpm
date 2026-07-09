const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.matchStat.findMany({ 
  where: { match: { tournament: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } } }, goals: { gt: 0 } } 
})
.then(s => console.log(s))
.finally(() => prisma.$disconnect());
