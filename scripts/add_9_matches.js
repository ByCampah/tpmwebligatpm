const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
    include: { teams: { include: { team: true, players: { include: { player: true } } } } }
  });

  if (!tournament) return console.log("Tournament not found");

  const pairs = [
    { home: 'Almagro', away: 'Formandos' },
    { home: 'Red Bull Haxball', away: 'Juventus' },
    { home: 'Platense', away: 'Milan' }
  ];

  for (const pair of pairs) {
    const homeTeam = tournament.teams.find(t => t.team.name === pair.home);
    const awayTeam = tournament.teams.find(t => t.team.name === pair.away);
    
    if (!homeTeam || !awayTeam) {
      console.log("Missing team", pair);
      continue;
    }

    const allPlayers = [...homeTeam.players, ...awayTeam.players];

    for (let i = 2; i <= 10; i++) {
      const match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: homeTeam.team.id,
          awayTeamId: awayTeam.team.id,
          round: `Estadísticas Históricas ${i}`,
          status: "PLAYED",
          homeScore: 0,
          awayScore: 0,
          matchDate: new Date("2018-10-13T00:00:00Z"),
        }
      });

      const statsToCreate = allPlayers.map(p => ({
        matchId: match.id,
        playerId: p.playerId,
        goals: 0,
        assists: 0,
        savesMade: 0,
        savesTotal: 0,
        cleanSheet: false
      }));

      await prisma.matchStat.createMany({
        data: statsToCreate
      });
    }
  }

  console.log("Added 9 extra matches for each pair with 0 stats for all players.");
}

main().finally(() => prisma.$disconnect());
