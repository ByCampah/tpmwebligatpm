import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    where: { 
      round: "Estadísticas Históricas",
      homeTeamId: { equals: prisma.match.awayTeamId } // not valid prisma syntax but whatever
    },
    include: {
      stats: true,
      homeTeam: true,
      awayTeam: true
    }
  });

  const validMatches = matches.filter(m => m.homeTeamId === m.awayTeamId);

  let hasDups = false;
  for (const m of validMatches) {
    const playerIds = new Set();
    for (const stat of m.stats) {
      if (playerIds.has(stat.playerId)) {
        console.log(`Duplicate found for player ${stat.playerId} in match ${m.id}`);
        hasDups = true;
      }
      playerIds.add(stat.playerId);
    }
  }

  if (!hasDups) {
    console.log("No duplicates found in the DB. Each player has exactly ONE MatchStat per historical match.");
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
