import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const season = await prisma.season.findFirst({ where: { name: 'Temporada 9 (2022)' } });
  console.log('Season ID:', season?.id);
  const tournaments = await prisma.tournament.findMany({ where: { seasonId: season?.id } });
  console.log(tournaments);
  for (const t of tournaments) {
    const teams = await prisma.tournamentTeam.count({ where: { tournamentId: t.id } });
    const matches = await prisma.match.count({ where: { tournamentId: t.id } });
    console.log(`Tournament ${t.id} - Teams: ${teams}, Matches: ${matches}`);
  }
}
main().finally(() => prisma.$disconnect());
