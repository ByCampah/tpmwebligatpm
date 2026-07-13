import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const t = await prisma.team.findFirst({ where: { name: 'Red Bull Haxball' } }); 
  const matches = await prisma.match.findMany({ where: { tournament: { season: { name: 'Temporada 1 x8 (2021)' } }, homeTeamId: t.id } }); 
  console.log('RBH matches:', matches.length); 
} 
m().finally(()=>prisma.$disconnect());
