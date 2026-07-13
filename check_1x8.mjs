import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const t = await prisma.tournament.findFirst({ where: { season: { name: 'Temporada 1 x8 (2021)' } } }); 
  const stats = await prisma.matchStat.findMany({ where: { match: { tournamentId: t.id } }, include: { player: true } }); 
  stats.forEach(s => console.log(s.player.nick, 'G:', s.goals, 'A:', s.assists, 'PJ:', s.matchTime)); 
} 
m().finally(()=>prisma.$disconnect());
