import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const s = await prisma.season.findFirst({ where: { name: 'Temporada 1 x8 (2021)' } }); 
  const t = await prisma.trophy.findMany({ where: { seasonId: s.id } }); 
  console.log(t); 
} 
m().finally(()=>prisma.$disconnect());
