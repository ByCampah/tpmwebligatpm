import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const t = await prisma.team.findFirst({ where: { name: 'Red Bull Haxball' } }); 
  const matches = await prisma.match.findMany({ where: { tournament: { season: { name: 'Temporada 1 x8 (2021)' } }, homeTeamId: t.id }, include: { stats: { include: { player: true } } } }); 
  matches.forEach(m => { 
    console.log('Match Round:', m.round); 
    m.stats.forEach(s => console.log(s.player.nick, 'G:', s.goals, 'A:', s.assists, 'PJ:', s.matchTime)); 
  }); 
} 
m().finally(()=>prisma.$disconnect());
