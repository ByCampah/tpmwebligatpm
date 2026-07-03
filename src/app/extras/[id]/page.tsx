import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import SeasonView from "@/app/historial/[seasonId]/SeasonView";

export const dynamicParams = false;

export async function generateStaticParams() {
  const extraTournaments = await prisma.tournament.findMany({
    where: { isOfficial: false },
    select: { id: true }
  });
  return extraTournaments.map((t) => ({
    id: t.id,
  }));
}

export default async function ExtraTournamentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const locale = "es";
  const t = await getDictionary(locale);

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id, isOfficial: false },
    include: {
      category: true,
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
  });

  if (!tournament) return notFound();

  // We mock a season object to pass it to SeasonView, since SeasonView expects one.
  const fakeSeason = {
    id: "extra-" + tournament.id,
    name: "Torneo Extra",
    isActive: false,
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <Link href="/extras" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <span>←</span> Volver a Torneos Extras
      </Link>
      
      <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
        <h1 className="text-4xl font-black text-blue-400 uppercase">{tournament.name}</h1>
        <p className="text-muted-foreground">
          Torneo no oficial.
        </p>
      </header>

      <SeasonView season={fakeSeason as any} tournaments={[tournament]} dictionary={t.history} />
    </div>
  );
}
