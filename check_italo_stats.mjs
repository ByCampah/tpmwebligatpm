import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function m() { 
  const p = await prisma.player.findFirst({ 
    where: { nick: { contains: 'italo', mode: 'insensitive' } }, 
    include: { matchStats: { include: { match: { include: { tournament: { include: { season: true } } } } } } } 
  }); 
  if (!p) { console.log('Italo not found'); return; }
  
  let pj = 0; 
  p.matchStats.forEach(s => { 
    if (['Histórico', 'Estadísticas Históricas'].includes(s.match.round) || s.match.round.toLowerCase().includes('historico') || s.match.round.toLowerCase().includes('histórico')) {
      pj += s.matchTime; 
      console.log(`+${s.matchTime} from ${s.match.round} in ${s.match.tournament.name} (${s.match.tournament.season?.name})`);
    } else if (s.matchTime > 0) {
      pj += 1; 
      console.log(`+1 from ${s.match.round} in ${s.match.tournament.name} (${s.match.tournament.season?.name})`);
    } 
  }); 
  console.log('Italo total PJ:', pj, 'matches count:', p.matchStats.length); 
} 
m().finally(()=>prisma.$disconnect());
