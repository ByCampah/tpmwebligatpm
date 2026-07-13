import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const matches = await prisma.match.findMany({ where: { tournament: { season: { name: 'Temporada 9 (2022)' } } } }); 
  console.log(matches.length, 'matches in S9'); 
  const rounds = [...new Set(matches.map(m => m.round))];
  console.log('Rounds:', rounds);
} 
m().finally(()=>prisma.$disconnect());
