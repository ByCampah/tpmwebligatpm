import { prisma } from "@/lib/prisma";
import GraficasClient from "./GraficasClient";

export const dynamic = 'force-dynamic';

export default async function AdminGraficasPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" }
  });

  const players = await prisma.player.findMany({
    orderBy: { nick: "asc" }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Generador Gráfico</h1>
        <p className="text-muted-foreground mt-2">
          Herramientas para generar imágenes de estadísticas, partidos y perfiles de jugadores para redes sociales.
        </p>
      </div>

      <GraficasClient teams={teams} players={players} />
    </div>
  );
}
