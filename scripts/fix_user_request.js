const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
    include: { teams: { include: { team: true } } }
  });

  if (!tournament) return console.log("Tournament not found");

  // 1. Gather the actual goals/assists which are currently hiding in Fecha 1 or somewhere else in this tournament
  const allStats = await prisma.matchStat.findMany({
    where: { match: { tournamentId: tournament.id }, OR: [{ goals: { gt: 0 } }, { assists: { gt: 0 } }] },
    include: { match: { include: { homeTeam: true, awayTeam: true } }, player: { include: { tournamentTeams: { include: { tournamentTeam: { include: { team: true } } } } } } }
  });

  const playerStatsMap = {};
  for (const stat of allStats) {
    if (!playerStatsMap[stat.playerId]) {
      playerStatsMap[stat.playerId] = { goals: 0, assists: 0 };
    }
    playerStatsMap[stat.playerId].goals += stat.goals;
    playerStatsMap[stat.playerId].assists += stat.assists;
  }

  // 2. Create the 3 Estadísticas Históricas matches
  const teamsMap = {};
  tournament.teams.forEach(t => teamsMap[t.team.name] = t.teamId);

  const m1 = await prisma.match.create({
    data: { tournamentId: tournament.id, homeTeamId: teamsMap["Almagro"], awayTeamId: teamsMap["Formandos"], round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
  });
  const m2 = await prisma.match.create({
    data: { tournamentId: tournament.id, homeTeamId: teamsMap["Red Bull Haxball"], awayTeamId: teamsMap["Juventus"], round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
  });
  const m3 = await prisma.match.create({
    data: { tournamentId: tournament.id, homeTeamId: teamsMap["Platense"], awayTeamId: teamsMap["Milan"], round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
  });

  // 3. Move the stats into these 3 matches
  for (const playerId of Object.keys(playerStatsMap)) {
    // Find which team this player belongs to
    let teamName = null;
    const pStat = allStats.find(s => s.playerId === playerId);
    if (pStat) {
      const tt = pStat.player.tournamentTeams.find(tt => tt.tournamentTeam.tournamentId === tournament.id);
      if (tt) teamName = tt.tournamentTeam.team.name;
    }

    let matchId = m1.id;
    if (teamName === "Red Bull Haxball" || teamName === "Juventus") matchId = m2.id;
    if (teamName === "Platense" || teamName === "Milan") matchId = m3.id;

    await prisma.matchStat.create({
      data: {
        matchId: matchId,
        playerId: playerId,
        goals: playerStatsMap[playerId].goals,
        assists: playerStatsMap[playerId].assists,
        matchTime: 0, // 0 minutes so it doesn't count as PJ
        savesMade: 0,
        savesTotal: 0,
        cleanSheet: false
      }
    });
  }

  console.log(`Created 3 dummy matches and moved the stats of ${Object.keys(playerStatsMap).length} players.`);

  // 4. Reset ALL stats in the real matches (Fecha 1 to Fecha 10) to 0 goals/assists and 90 matchTime
  const realMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, round: { startsWith: 'Fecha' } }
  });

  const updated = await prisma.matchStat.updateMany({
    where: { matchId: { in: realMatches.map(m => m.id) } },
    data: { goals: 0, assists: 0, matchTime: 90 }
  });

  console.log(`Updated ${updated.count} real match stats to 90 minutes and 0 goals/assists.`);
}

main().finally(() => prisma.$disconnect());
