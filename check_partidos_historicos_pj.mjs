import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const m = await prisma.match.findFirst({ where: { round: 'Partidos historicos PJ' }, include: { stats: true } }); 
  if(m) console.log(m.stats); 
} 
m().finally(()=>prisma.$disconnect());
