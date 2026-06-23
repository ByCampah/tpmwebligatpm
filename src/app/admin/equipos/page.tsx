import { prisma } from "@/lib/prisma";
import TeamsClient from "./TeamsClient";

export const dynamic = 'force-dynamic';

export default async function AdminEquiposPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { captain: true }
  });

  const users = await prisma.user.findMany({
    orderBy: { username: "asc" }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Gestión de Equipos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Añade nuevos equipos a la base de datos o elimínalos si te equivocaste (y no tienen historial).
        </p>
      </div>

      <TeamsClient teams={teams} users={users} />
    </div>
  );
}
