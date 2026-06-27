import { prisma } from "@/lib/prisma";
import NationalTeamsAdminClient from "./NationalTeamsAdminClient";

export const dynamic = 'force-dynamic';

export default async function AdminSeleccionesPage() {
  const teams = await prisma.team.findMany({
    where: { isNationalTeam: true },
    orderBy: { name: "asc" },
    include: { captain: true }
  });

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  const players = await prisma.player.findMany({
    orderBy: { nick: "asc" }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Gestión de Selecciones</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Añade o edita selecciones nacionales y gestiona sus convocatorias.
        </p>
      </div>

      <NationalTeamsAdminClient teams={teams} users={users} players={players} />
    </div>
  );
}
