import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.matchStat.findMany({
    where: {
      match: {
        round: { in: ['Estadísticas Históricas', 'Partidos historicos estadisticas', 'Partidos historicos PJ', 'Ficticio (PJ)', 'Histórico'] }
      },
      matchTime: { gte: 90 }
    },
    include: {
      match: {
        include: {
          tournament: { include: { season: true } }
        }
      },
      player: true
    }
  });
  
  console.log(stats.map(s => s.player.nick + ' - ' + s.matchTime + ' min in ' + s.match.round + ' (' + s.match.tournament.season.name + ')').slice(0, 20));
  console.log('Total bad stats:', stats.length);
}
main().finally(() => prisma.$disconnect());
