import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const t = await prisma.trophy.findMany({ where: { tournamentId: null } }); 
  console.log('Null Trophies:', t.length); 
  await prisma.trophy.deleteMany({ where: { tournamentId: null } }); 
  console.log('Deleted null trophies.');
} 
m().finally(()=>prisma.$disconnect());
