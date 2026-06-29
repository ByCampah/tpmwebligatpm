import { prisma } from '@/lib/prisma';

export async function getSeasonFromOptions(options: any[]) {
  const seasonName = options?.find((opt: any) => opt.name === 'temporada')?.value;
  if (seasonName) {
    return await prisma.season.findFirst({
      where: {
        name: { equals: seasonName, mode: 'insensitive' }
      }
    });
  }
  return await prisma.season.findFirst({
    where: { isActive: true }
  });
}

export async function getStandings(seasonId: string, categoryId?: string | null) {
  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: {
      tournament: {
        seasonId: seasonId,
        ...(categoryId ? { categoryId } : {})
      }
    },
    include: {
      team: true
    }
  });

  const matches = await prisma.match.findMany({
    where: {
      tournament: {
        seasonId: seasonId,
        ...(categoryId ? { categoryId } : {})
      },
      status: 'PLAYED'
    }
  });

  const standings = new Map<string, any>();

  for (const tt of tournamentTeams) {
    standings.set(tt.teamId, {
      team: tt.team,
      tournamentTeam: tt,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
    });
  }

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) continue;

    const home = standings.get(match.homeTeamId);
    const away = standings.get(match.awayTeamId);

    if (home && away) {
      home.pj++; away.pj++;
      home.gf += match.homeScore; home.gc += match.awayScore;
      away.gf += match.awayScore; away.gc += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.pg++; home.pts += 3;
        away.pp++;
      } else if (match.awayScore > match.homeScore) {
        away.pg++; away.pts += 3;
        home.pp++;
      } else {
        home.pe++; away.pe++;
        home.pts += 1; away.pts += 1;
      }
    }
  }

  // Override with manual stats if available
  const result = Array.from(standings.values()).map(entry => {
    const tt = entry.tournamentTeam;
    if (tt.manualPoints !== null) entry.pts = tt.manualPoints;
    if (tt.manualGamesPlayed !== null) entry.pj = tt.manualGamesPlayed;
    if (tt.manualWins !== null) entry.pg = tt.manualWins;
    if (tt.manualDraws !== null) entry.pe = tt.manualDraws;
    if (tt.manualLosses !== null) entry.pp = tt.manualLosses;
    if (tt.manualGoalsFor !== null) entry.gf = tt.manualGoalsFor;
    if (tt.manualGoalsAgainst !== null) entry.gc = tt.manualGoalsAgainst;
    entry.df = entry.gf - entry.gc;
    return entry;
  });

  result.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.df !== a.df) return b.df - a.df;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.name.localeCompare(b.team.name);
  });

  return result;
}

export async function getPlayerStats(seasonId: string) {
  const players = await prisma.player.findMany({
    include: {
      matchStats: {
        where: {
          match: {
            tournament: {
              seasonId: seasonId
            },
            status: 'PLAYED'
          }
        }
      },
      tournamentTeams: {
        where: {
          tournamentTeam: {
            tournament: {
              seasonId: seasonId
            }
          }
        },
        include: {
          tournamentTeam: {
            include: { team: true }
          }
        }
      }
    }
  });

  const stats = players.map(player => {
    const pj = player.matchStats.length;
    const g = player.matchStats.reduce((sum, stat) => sum + (stat.goals || 0), 0);
    const a = player.matchStats.reduce((sum, stat) => sum + (stat.assists || 0), 0);
    let currentTeam = player.tournamentTeams?.[0]?.tournamentTeam?.team?.name || 'Agente Libre';

    return {
      player,
      teamName: currentTeam,
      pj, g, a
    };
  });

  return stats;
}
