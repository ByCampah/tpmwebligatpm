import { prisma } from "@/lib/prisma";
import NationalTeamsClient from "./NationalTeamsClient";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SeleccionesPage() {
  const session = await auth();
  
  const nationalTeams = await prisma.team.findMany({
    where: { isNationalTeam: true },
    include: {
      captain: true,
      tournaments: {
        where: {
          tournament: { season: { isActive: true } }
        },
        include: {
          players: {
            include: { player: true }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const allPlayers = await prisma.player.findMany({
    include: {
      user: true
    },
    orderBy: { nick: "asc" }
  });
  
  const allClubs = await prisma.team.findMany({
    where: { isNationalTeam: false },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
        <h1 className="text-4xl font-black neon-text uppercase">Selecciones Nacionales</h1>
        <p className="text-muted-foreground">
          Explora los jugadores disponibles de cada país para ser convocados.
        </p>
      </header>

      <NationalTeamsClient 
        nationalTeams={nationalTeams} 
        allPlayers={allPlayers} 
        allClubs={allClubs} 
        session={session} 
      />
    </div>
  );
}
