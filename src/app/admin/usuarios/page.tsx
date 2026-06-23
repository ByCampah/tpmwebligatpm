import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin"); // Redirect moderators away from user management
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { player: true, captainOfTeams: true } 
  });

  const players = await prisma.player.findMany({
    orderBy: { nick: "asc" },
    select: { id: true, nick: true, user: true }
  });

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, captainId: true }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Gestión de Cuentas y Roles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra los roles de las cuentas de Discord vinculadas y visualiza a qué jugador de la base de datos pertenecen.
        </p>
      </div>

      <UsersClient users={users} players={players} teams={teams} />
    </div>
  );
}
