import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    where: { 
      round: "Estadísticas Históricas",
    }
  });

  let pjCount = 0;
  let statCount = 0;

  for (const m of matches) {
    if (m.homeScore === 0 && m.awayScore === 0) {
      await prisma.match.update({
        where: { id: m.id },
        data: { round: "Partidos historicos PJ" }
      });
      pjCount++;
    } else {
      await prisma.match.update({
        where: { id: m.id },
        data: { round: "Partidos historicos estadisticas" }
      });
      statCount++;
    }
  }

  console.log(`Actualizados ${pjCount} partidos como PJ y ${statCount} partidos como estadisticas.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
