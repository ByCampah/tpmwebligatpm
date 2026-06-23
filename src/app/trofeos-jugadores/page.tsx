import { prisma } from "@/lib/prisma";
import TrofeosJugadoresView from "./TrofeosJugadoresView";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export default async function TrofeosJugadoresPage() {
  const locale = "es";
  const t = await getDictionary(locale);

  const playersRaw = await prisma.player.findMany({
    include: {
      trophies: {
        where: { type: "PLAYER" },
        include: { tournament: true }
      },
      tournamentTeams: {
        include: {
          tournamentTeam: {
            include: {
              team: {
                include: {
                  trophies: {
                    where: { type: "TEAM" },
                    include: { tournament: true }
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
        t => t.tournamentId === tournamentId
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
    <div className="max-w-6xl mx-auto flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">{t.trophies.playerTitle}</h1>
        <p className="text-muted-foreground">
          {t.trophies.playerSubtitle}
        </p>
      </header>
      <TrofeosJugadoresView players={players} dictionary={t.trophies} />
    </div>
  );
}
