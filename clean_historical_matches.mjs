import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const historicalRounds = [
    "Partidos historicos estadisticas", 
    "Partidos historicos PJ", 
    "Ficticio (PJ)", 
    "Historico", 
    "Histórico"
  ];

  const seasons = await prisma.season.findMany({ include: { tournaments: true } });

  for (const season of seasons) {
    console.log(`Processing ${season.name}...`);
    for (const tournament of season.tournaments) {
      const matches = await prisma.match.findMany({
        where: {
          tournamentId: tournament.id,
          round: { in: [...historicalRounds, "Estadísticas Históricas"] }
        },
        include: { stats: true }
      });

      if (matches.length === 0) continue;

      const matchesByTeam = {};
      for (const m of matches) {
        if (!matchesByTeam[m.homeTeamId]) matchesByTeam[m.homeTeamId] = [];
        matchesByTeam[m.homeTeamId].push(m);
      }

      for (const [teamId, teamMatches] of Object.entries(matchesByTeam)) {
        if (teamMatches.length === 0) continue;

        // Check if we actually need to consolidate
        // We need to consolidate if there is > 1 match, OR if the round is not "Estadísticas Históricas"
        const needsConsolidation = teamMatches.length > 1 || teamMatches[0].round !== "Estadísticas Históricas";
        if (!needsConsolidation) continue;

        console.log(`Consolidating team ${teamId} in ${season.name}...`);

        const playerStats = {};
        for (const m of teamMatches) {
          for (const s of m.stats) {
            if (!playerStats[s.playerId]) {
              playerStats[s.playerId] = { goals: 0, assists: 0, pj: 0 };
            }
            playerStats[s.playerId].goals += s.goals;
            playerStats[s.playerId].assists += s.assists;
            
            if (["Estadísticas Históricas", "Historico", "Histórico"].includes(m.round)) {
              playerStats[s.playerId].pj += s.matchTime;
            } else {
              if (s.matchTime > 0) {
                playerStats[s.playerId].pj += 1;
              }
            }
          }
        }

        // Delete old matches
        for (const m of teamMatches) {
          await prisma.matchStat.deleteMany({ where: { matchId: m.id } });
          await prisma.match.delete({ where: { id: m.id } });
        }

        // Create new single match
        const newMatch = await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homeTeamId: teamId,
            awayTeamId: teamId,
            homeScore: Object.values(playerStats).reduce((sum, p) => sum + p.goals, 0),
            awayScore: 0,
            status: "PLAYED",
            matchDate: new Date(), // doesn't matter much for historical
            round: "Estadísticas Históricas"
          }
        });

        // Insert new stats
        const statsData = Object.entries(playerStats).map(([pId, st]) => ({
          matchId: newMatch.id,
          playerId: pId,
          goals: st.goals,
          assists: st.assists,
          matchTime: st.pj
        }));

        if (statsData.length > 0) {
          await prisma.matchStat.createMany({ data: statsData });
        }
      }
    }
  }

  console.log("All historical matches have been successfully consolidated into 'Estadísticas Históricas'!");
}

main().finally(() => prisma.$disconnect());
