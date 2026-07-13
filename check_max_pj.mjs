import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.player.findMany({
    include: {
      matchStats: {
        include: {
          match: {
            include: {
              tournament: { include: { category: true } }
            }
          }
        }
      }
    }
  });

  let max = 0;
  let pNick = '';
  
  for(const pl of p){
    let pj = 0;
    pl.matchStats.forEach(s => {
      const isHist = ['Estadísticas Históricas', 'Partidos historicos estadisticas', 'Partidos historicos PJ', 'Ficticio (PJ)', 'Histórico'].includes(s.match.round);
      pj += isHist ? (s.matchTime||0) : ((s.matchTime||0)>0 || (s.gkTime||0)>0 ? 1 : 0);
    });
    
    if (pj > max) {
      max = pj;
      pNick = pl.nick;
    }
    
    if (pl.nick.toLowerCase() === 'julianweigl') {
      console.log('JulianWeigl PJ:', pj);
    }
  }
  
  console.log('Max PJ:', pNick, max);
}
main().finally(() => prisma.$disconnect());
