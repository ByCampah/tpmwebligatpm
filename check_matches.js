const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    where: { tournament: { season: { name: "Temporada 7" } } },
    include: { homeTeam: true, awayTeam: true }
  });
  console.log("Matches:", matches.length);
  if (matches.length > 0) {
    console.log(matches[0]);
  }
}
main().finally(() => prisma.$disconnect());
