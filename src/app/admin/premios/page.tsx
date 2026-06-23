import { prisma } from "@/lib/prisma";
import TrophyForm from "./TrophyForm";

export const dynamic = 'force-dynamic';

export default async function AdminPremiosPage() {
  const tournaments = await prisma.tournament.findMany({ include: { season: true } });
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const players = await prisma.player.findMany({ orderBy: { nick: "asc" } });

  const recentTrophies = await prisma.trophy.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      team: true,
      player: true,
      tournament: true
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black text-white">Asignación de Premios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crea podios de campeonatos o premios individuales. Éstos aparecerán en el perfil del jugador o equipo.
        </p>
      </div>

      <TrophyForm tournaments={tournaments} teams={teams} players={players} />

      <div className="mt-4">
        <h2 className="font-bold text-lg text-white border-b border-border pb-2 mb-4">Últimos Premios Otorgados</h2>
        <div className="flex flex-col gap-3">
          {recentTrophies.map(trophy => (
            <div key={trophy.id} className="bg-card border border-border p-4 rounded-lg flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-black text-primary uppercase">{trophy.name}</span>
                <span className="text-sm font-bold text-muted-foreground">
                  {trophy.type === "TEAM" ? trophy.team?.name : trophy.player?.nick}
                </span>
                {trophy.tournament && (
                  <span className="text-xs text-muted-foreground opacity-70">Torneo: {trophy.tournament.name}</span>
                )}
              </div>
            </div>
          ))}
          {recentTrophies.length === 0 && (
            <p className="text-muted-foreground text-sm">Aún no se han otorgado premios.</p>
          )}
        </div>
      </div>
    </div>
  );
}
