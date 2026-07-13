import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixSeason(seasonName) {
  const season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) return;
  console.log(`Fixing ${seasonName}...`);

  const tournaments = await prisma.tournament.findMany({ where: { seasonId: season.id } });
  for (const tourney of tournaments) {
    console.log(`Checking tournament ${tourney.name}...`);
    const matches = await prisma.match.findMany({
      where: { 
        tournamentId: tourney.id,
        round: { in: ['Partidos historicos estadisticas', 'Partidos historicos PJ', 'Ficticio (PJ)', 'Histórico'] }
      },
      include: { stats: true, homeTeam: true }
    });
    console.log(`Found ${matches.length} matches to fix.`);

    if (matches.length === 0) continue;

    const teamPlayerStats = {}; // teamId -> playerId -> { g, a, pj }

    // 1. Aggregate stats from the fictitious/historic matches we are going to delete
    for (const m of matches) {
      const tId = m.homeTeamId;
      if (!teamPlayerStats[tId]) teamPlayerStats[tId] = {};
      
      for (const s of m.stats) {
        if (!teamPlayerStats[tId][s.playerId]) {
          teamPlayerStats[tId][s.playerId] = { g: 0, a: 0, pj: 0 };
        }
        teamPlayerStats[tId][s.playerId].g += s.goals || 0;
        teamPlayerStats[tId][s.playerId].a += s.assists || 0;
        if (m.round === 'Partidos historicos PJ' || m.round === 'Ficticio (PJ)') {
          if (s.matchTime > 0) {
            teamPlayerStats[tId][s.playerId].pj += 1;
          }
        }
      }
    }

    // 2. Delete those matches
    for (const m of matches) {
      await prisma.matchStat.deleteMany({ where: { matchId: m.id } });
      await prisma.match.delete({ where: { id: m.id } });
    }

    // 3. Create ONE 'Estadísticas Históricas' match per team
    for (const [tId, pStats] of Object.entries(teamPlayerStats)) {
      const dbm = await prisma.match.create({
        data: {
          tournamentId: tourney.id,
          homeTeamId: tId,
          awayTeamId: tId,
          homeScore: 0,
          awayScore: 0,
          status: 'PLAYED',
          matchDate: new Date(),
          round: 'Estadísticas Históricas'
        }
      });
      
      const inserts = [];
      for (const [pId, stats] of Object.entries(pStats)) {
        inserts.push({
          matchId: dbm.id,
          playerId: pId,
          goals: stats.g,
          assists: stats.a,
          matchTime: stats.pj
        });
      }
      if (inserts.length > 0) {
        await prisma.matchStat.createMany({ data: inserts });
      }
    }
  }
}

async function main() {
  await fixSeason('Temporada 11 (2023)');
  await fixSeason('Temporada 1 x8 (2021)');
  
  // For Season 10, we just rename "Histórico" to "Estadísticas Históricas"
  const s10 = await prisma.season.findFirst({ where: { name: 'Temporada 10 (2022)' } });
  if (s10) {
    const s10Matches = await prisma.match.findMany({
      where: { tournament: { seasonId: s10.id }, round: 'Histórico' }
    });
    for (const m of s10Matches) {
      await prisma.match.update({
        where: { id: m.id },
        data: { round: 'Estadísticas Históricas' }
      });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
