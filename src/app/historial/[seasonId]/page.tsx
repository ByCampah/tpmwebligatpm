import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";
import SeasonView from "./SeasonView";

export const dynamicParams = false;

export async function generateStaticParams() {
  const seasons = await prisma.season.findMany({ select: { id: true } });
  return seasons.map((season) => ({
    seasonId: season.id,
  }));
}

export default async function HistorialSeasonPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const locale = "es";
  const t = await getDictionary(locale);

  const season = await prisma.season.findUnique({
    where: { id: seasonId },
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

  if (!season) {
    notFound();
  }

  // Sort tournaments so League is first
  const sortedTournaments = [...season.tournaments].sort((a, b) => {
    if (a.format.includes("LEAGUE") && !b.format.includes("LEAGUE")) return -1;
    if (!a.format.includes("LEAGUE") && b.format.includes("LEAGUE")) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
        <Link href="/historial" className="text-primary hover:underline font-bold text-sm mb-2">&larr; {t.history.back}</Link>
        <h1 className="text-4xl font-black neon-text uppercase">{season.name}</h1>
        <p className="text-muted-foreground">
          {t.history.selectTournament}
        </p>
      </header>

      <SeasonView season={season} tournaments={sortedTournaments} dictionary={t.history} />
    </div>
  );
}
