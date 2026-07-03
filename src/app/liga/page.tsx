import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import SeasonView from "@/app/historial/[seasonId]/SeasonView";
import { Suspense } from "react";

export default async function LigaPage() {
  const locale = "es";
  const t = await getDictionary(locale);

  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tournaments: {
        include: {
          teams: {
            include: { team: true }
          },
          matches: {
            include: { 
              homeTeam: true, 
              awayTeam: true,
              stats: {
                include: {
                  player: {
                    include: {
                      tournamentTeams: {
                        include: {
                          tournamentTeam: {
                            include: { team: true }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: { matchDate: "asc" }
          },
          trophies: {
            include: { team: true, player: true }
          }
        }
      }
    }
  });

  if (!activeSeason) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <h1 className="text-4xl font-black neon-text uppercase">Temporada Actual</h1>
        </header>
        <div className="flex flex-col items-center justify-center p-24 bg-card border border-border rounded-xl shadow-lg mt-8 text-center gap-6">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-wider">{t.league.comingSoon}</h2>
          <p className="text-xl text-muted-foreground max-w-lg">
            No hay una temporada activa en este momento.
          </p>
          <Link href="/historial" className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors mt-4">
            {t.league.btnHistory}
          </Link>
        </div>
      </div>
    );
  }

  // Sort tournaments so League is first
  const sortedTournaments = [...activeSeason.tournaments].sort((a, b) => {
    if (a.format.includes("LEAGUE") && !b.format.includes("LEAGUE")) return -1;
    if (!a.format.includes("LEAGUE") && b.format.includes("LEAGUE")) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
        <h1 className="text-4xl font-black neon-text uppercase">{activeSeason.name} (ACTUAL)</h1>
        <p className="text-muted-foreground">
          {t.history.selectTournament}
        </p>
      </header>

      <Suspense fallback={<div className="p-12 text-center">Cargando temporada...</div>}>
        <SeasonView season={activeSeason} tournaments={sortedTournaments} dictionary={t.history} />
      </Suspense>
    </div>
  );
}
