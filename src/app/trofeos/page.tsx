import { prisma } from "@/lib/prisma";
import TrofeosTabs from "./TrofeosTabs";
import { getDictionary } from "@/i18n/getDictionary";
import { cookies } from "next/headers";

export default async function TrofeosPage() {
  const locale = "es";
  const t = await getDictionary(locale);

  // Get Teams
  const teams = await prisma.team.findMany({
    include: {
      trophies: {
        where: { type: "TEAM" },
        include: { tournament: { include: { category: true, season: true } } }
      }
    }
  });

  // Get Players
  const playersRaw = await prisma.player.findMany({
    include: {
      trophies: {
        where: { type: "PLAYER" },
        include: { tournament: { include: { category: true, season: true } }, challenge: true }
      },
      tournamentTeams: {
        include: {
          tournamentTeam: {
            include: {
              team: {
                include: {
                  trophies: {
                    where: { type: "TEAM" },
                    include: { 
                      tournament: { include: { category: true, season: true } },
                      excludedPlayers: { select: { id: true } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const players = playersRaw.map(player => {
    const collectiveTrophies: any[] = [];
    player.tournamentTeams.forEach(pt => {
      const tournamentId = pt.tournamentTeam.tournamentId;
      const wonTrophies = pt.tournamentTeam.team.trophies.filter(
        t => t.tournamentId === tournamentId && !t.excludedPlayers.some(ex => ex.id === player.id)
      );
      collectiveTrophies.push(...wonTrophies);
    });

    return {
      id: player.id,
      nick: player.nick,
      trophies: [...player.trophies, ...collectiveTrophies]
    };
  });

  return (
    <div className="py-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">Salón de la Fama</h1>
        <p className="text-muted-foreground">
          Palmarés histórico de equipos y jugadores.
        </p>
      </header>
      <TrofeosTabs teams={teams} players={players} dictionary={t.trophies} />
    </div>
  );
}
