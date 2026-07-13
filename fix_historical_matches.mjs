import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetSeasons = [
    "Temporada 9 (2022)",
    "Temporada 10 (2022)",
    "Temporada 11 (2023)",
    "Temporada 1 x8 (2021)"
  ];

  for (const sName of targetSeasons) {
    console.log(`Processing ${sName}...`);
    const season = await prisma.season.findUnique({ where: { name: sName }, include: { tournaments: true } });
    if (!season) {
      console.log(`Season not found: ${sName}`);
      continue;
    }

    for (const tournament of season.tournaments) {
      // Find historical matches for this tournament
      const matches = await prisma.match.findMany({
        where: {
          tournamentId: tournament.id,
          round: { in: ["Partidos historicos estadisticas", "Partidos historicos PJ", "Estadísticas Históricas"] }
        },
        include: { stats: true }
      });

      if (matches.length === 0) continue;

      // Group by teamId
      const matchesByTeam = {};
      for (const m of matches) {
        if (!matchesByTeam[m.homeTeamId]) matchesByTeam[m.homeTeamId] = [];
        matchesByTeam[m.homeTeamId].push(m);
      }

      for (const [teamId, teamMatches] of Object.entries(matchesByTeam)) {
        if (teamMatches.length === 0) continue;
        
        // Check if we need to fix this team (i.e. has multiple matches or wrong round)
        const hasWrongRound = teamMatches.some(m => ["Partidos historicos estadisticas", "Partidos historicos PJ"].includes(m.round));
        if (!hasWrongRound) continue; // already fixed

        console.log(`Fixing team ${teamId} in ${sName}...`);

        // Aggregate stats
        const playerStats = {};
        for (const m of teamMatches) {
          for (const s of m.stats) {
            if (!playerStats[s.playerId]) {
              playerStats[s.playerId] = { goals: 0, assists: 0, pj: 0 };
            }
            playerStats[s.playerId].goals += s.goals;
            playerStats[s.playerId].assists += s.assists;
            if (m.round === "Partidos historicos PJ" && s.matchTime > 0) {
              playerStats[s.playerId].pj += 1;
            } else if (m.round === "Estadísticas Históricas") {
              playerStats[s.playerId].pj += s.matchTime;
            }
          }
        }

        // Delete old matches
        for (const m of teamMatches) {
          await prisma.matchStat.deleteMany({ where: { matchId: m.id } });
          await prisma.match.delete({ where: { id: m.id } });
        }

        // Create new match
        const newMatch = await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homeTeamId: teamId,
            awayTeamId: teamId,
            homeScore: Object.values(playerStats).reduce((sum, p) => sum + p.goals, 0),
            awayScore: 0,
            status: "PLAYED",
            matchDate: new Date(),
            round: "Estadísticas Históricas"
          }
        });

        // Insert new stats
        const statsData = Object.entries(playerStats).map(([pId, st]) => ({
          matchId: newMatch.id,
          playerId: pId,
          goals: st.goals,
          assists: st.assists,
          matchTime: st.pj // Here matchTime = matches played
        }));

        if (statsData.length > 0) {
          await prisma.matchStat.createMany({ data: statsData });
        }
      }
    }
  }

  console.log("Done fixing historical matches.");
}
main().finally(() => prisma.$disconnect());
