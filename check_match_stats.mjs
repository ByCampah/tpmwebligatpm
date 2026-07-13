import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const m = await prisma.match.findFirst({ where: { round: 'Histórico' }, include: { stats: true } }); 
  console.log(m.stats); 
} 
m().finally(()=>prisma.$disconnect());
