import { prisma } from "@/lib/prisma";
import PlayersClient from "./PlayersClient";

export const dynamic = 'force-dynamic';

export default async function AdminJugadoresPage() {
  const players = await prisma.player.findMany({
    orderBy: { nick: "asc" },
    include: { user: true }
  });

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Gestión de Jugadores</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Añade jugadores a la base de datos y vincúlalos a sus cuentas de usuario de la web.
        </p>
      </div>

      <PlayersClient players={players} users={users} />
    </div>
  );
}
