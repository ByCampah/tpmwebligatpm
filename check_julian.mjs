import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.player.findFirst({
    where: { nick: 'JulianWeigl' },
    include: { matchStats: { include: { match: { include: { tournament: true } } } } }
  });
  let pj = 0;
  console.log(p.matchStats.map(s => {
    const isOld = ['Estadísticas Históricas', 'Partidos historicos estadisticas', 'Partidos historicos PJ', 'Ficticio (PJ)'].includes(s.match.round);
    const val = isOld ? (s.matchTime || 0) : ((s.matchTime || 0) > 0 ? 1 : 0);
    pj += val;
    return {
      match: s.match.round,
      time: s.matchTime,
      val,
      tourney: s.match.tournament.name
    };
  }));
  console.log('Total PJ calculated:', pj);
}
main().finally(() => prisma.$disconnect());
