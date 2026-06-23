import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export default async function LigaPage() {
  const locale = "es";
  const t = await getDictionary(locale);
  // Fetch active season and its "LEAGUE" format tournament
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tournaments: {
        where: { format: "LEAGUE" },
        include: {
          teams: {
            include: { team: true }
          },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: { matchDate: "desc" }
          }
        }
      }
    }
  });

  const leagueTournament = activeSeason?.tournaments[0];

  // Calculate Standings
  let standings = [];
  if (leagueTournament) {
    const tableMap = new Map();
    
    // Initialize teams
    leagueTournament.teams.forEach(tt => {
      tableMap.set(tt.teamId, {
        id: tt.team.id,
        name: tt.team.name,
        logo: tt.team.logoUrl,
        pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
      });
    });

    // Compute stats from PLAYED matches
    leagueTournament.matches.filter(m => m.status === 'PLAYED' && m.round !== 'Estadísticas Históricas').forEach(match => {
      const home = tableMap.get(match.homeTeamId);
      const away = tableMap.get(match.awayTeamId);
      
      if (home && away && match.homeScore !== null && match.awayScore !== null) {
        home.pj++; away.pj++;
        home.gf += match.homeScore; away.gf += match.awayScore;
        home.gc += match.awayScore; away.gc += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.pg++; home.pts += 3;
          away.pp++;
        } else if (match.homeScore < match.awayScore) {
          away.pg++; away.pts += 3;
          home.pp++;
        } else {
          home.pe++; away.pe++;
          home.pts += 1; away.pts += 1;
        }
      }
    });

    standings = Array.from(tableMap.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts; // Sort by points
      const diffA = a.gf - a.gc;
      const diffB = b.gf - b.gc;
      if (diffB !== diffA) return diffB - diffA; // Sort by Goal Difference
      return b.gf - a.gf; // Sort by Goals For
    });
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">{t.league.title}</h1>
        <p className="text-muted-foreground">
          {t.league.subtitle}
        </p>
      </header>

      <div className="flex flex-col items-center justify-center p-24 bg-card border border-border rounded-xl shadow-lg mt-8 text-center gap-6">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-4xl font-black text-primary uppercase tracking-wider">{t.league.comingSoon}</h2>
        <p className="text-xl text-muted-foreground max-w-lg">
          {t.league.comingSoonBody}
        </p>
        <Link href="/historial" className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors mt-4">
          {t.league.btnHistory}
        </Link>
      </div>
    </div>
  );
}
