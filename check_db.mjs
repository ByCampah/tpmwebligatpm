import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany();
  console.log('Seasons:');
  console.dir(seasons, { depth: null });
  
  const tournaments = await prisma.tournament.findMany();
  console.log('Tournaments:');
  console.dir(tournaments, { depth: null });
  
  const teams = await prisma.tournamentTeam.findMany({
    include: { team: true, tournament: true }
  });
  console.log(`TournamentTeams: ${teams.length}`);
}

main().finally(() => prisma.$disconnect());
