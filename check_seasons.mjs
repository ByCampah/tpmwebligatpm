import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const seasons = await prisma.season.findMany({
    where: { name: { in: ['Temporada 9', 'Temporada 10 (2022)', 'Temporada 11 (2023)', 'Temporada 1 x8 (2021)'] } }
  });

  for (const s of seasons) {
    console.log(`\n--- ${s.name} ---`);
    const matches = await prisma.match.findMany({
      where: { tournament: { seasonId: s.id } },
      include: { stats: true }
    });
    
    let realCount = 0;
    let histCount = 0;
    for (const m of matches) {
      if (['Estadísticas Históricas', 'Partidos historicos estadisticas', 'Partidos historicos PJ', 'Ficticio (PJ)'].includes(m.round)) {
        histCount++;
        const sample = m.stats[0];
        console.log(`Historic Match: ID=${m.id}, Round=${m.round}, sample matchTime=${sample?.matchTime}, players in match=${m.stats.length}`);
      } else {
        realCount++;
      }
    }
    console.log(`Real matches: ${realCount}, Historic matches: ${histCount}`);
  }
}
main().finally(() => prisma.$disconnect());
