const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.match.findMany({ 
  where: { tournament: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } } }, 
  include: { stats: true } 
})
.then(m => console.log(m.map(match => ({ round: match.round, statsCount: match.stats.length }))))
.finally(() => prisma.$disconnect());
