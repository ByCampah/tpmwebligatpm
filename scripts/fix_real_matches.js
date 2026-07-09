const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
    include: { teams: { include: { team: true, players: { include: { player: true } } } } }
  });

  if (!tournament) return console.log("Tournament not found");

  // 1. Gather all actual stats from the dummy matches
  const dummyMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, round: { startsWith: 'Estadísticas' } },
    include: { stats: true }
  });

  const playerStats = {}; // playerId -> { goals, assists }
  for (const match of dummyMatches) {
    for (const stat of match.stats) {
      if (!playerStats[stat.playerId]) {
        playerStats[stat.playerId] = { goals: 0, assists: 0 };
      }
      playerStats[stat.playerId].goals += stat.goals || 0;
      playerStats[stat.playerId].assists += stat.assists || 0;
    }
  }

  // 2. Delete all dummy matches (this cascades to their stats)
  await prisma.match.deleteMany({
    where: { tournamentId: tournament.id, round: { startsWith: 'Estadísticas' } }
  });
  console.log(`Deleted ${dummyMatches.length} dummy matches.`);

  // 3. Get all real matches
  const realMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id },
    orderBy: { round: 'asc' } // Fecha 1, Fecha 10, Fecha 2, etc. (string sort, but that's fine)
  });

  if (realMatches.length === 0) {
    console.log("No real matches found!");
    return;
  }

  // 4. Fill stats into real matches
  let statsCreated = 0;
  for (const match of realMatches) {
    const homeTeam = tournament.teams.find(t => t.teamId === match.homeTeamId);
    const awayTeam = tournament.teams.find(t => t.teamId === match.awayTeamId);

    if (!homeTeam || !awayTeam) continue;

    const allPlayers = [...homeTeam.players, ...awayTeam.players];

    for (const p of allPlayers) {
      // Check if we need to dump their real stats here
      let g = 0;
      let a = 0;

      // If they have stats left to distribute, put them all in their FIRST match encountered
      if (playerStats[p.playerId] && (playerStats[p.playerId].goals > 0 || playerStats[p.playerId].assists > 0)) {
        g = playerStats[p.playerId].goals;
        a = playerStats[p.playerId].assists;
        
        // Clear them so we don't distribute them again in the next matches
        playerStats[p.playerId].goals = 0;
        playerStats[p.playerId].assists = 0;
      }

      await prisma.matchStat.create({
        data: {
          matchId: match.id,
          playerId: p.playerId,
          goals: g,
          assists: a,
          savesMade: 0,
          savesTotal: 0,
          cleanSheet: false
        }
      });
      statsCreated++;
    }
  }

  console.log(`Assigned stats to real matches! Created ${statsCreated} stat records.`);
}

main().finally(() => prisma.$disconnect());
