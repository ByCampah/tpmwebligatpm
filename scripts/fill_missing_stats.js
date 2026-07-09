const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
    include: { teams: { include: { players: true } } }
  });

  const realMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id },
    include: { stats: true }
  });

  const statsToCreate = [];

  for (const match of realMatches) {
    const homeTeam = tournament.teams.find(t => t.teamId === match.homeTeamId);
    const awayTeam = tournament.teams.find(t => t.teamId === match.awayTeamId);
    if (!homeTeam || !awayTeam) continue;

    const allPlayers = [...homeTeam.players, ...awayTeam.players];
    
    for (const p of allPlayers) {
      const exists = match.stats.find(s => s.playerId === p.playerId);
      if (!exists) {
        statsToCreate.push({
          matchId: match.id,
          playerId: p.playerId,
          goals: 0,
          assists: 0,
          savesMade: 0,
          savesTotal: 0,
          cleanSheet: false
        });
      }
    }
  }

  if (statsToCreate.length > 0) {
    await prisma.matchStat.createMany({ data: statsToCreate });
    console.log(`Created ${statsToCreate.length} missing 0-0 match stats.`);
  } else {
    console.log("No missing stats to create.");
  }
}
main().finally(() => prisma.$disconnect());
