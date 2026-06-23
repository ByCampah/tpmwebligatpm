"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFreeAgent(isFreeAgent: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { player: true }
    });

    if (!user?.playerId) {
      return { success: false, error: "No tienes un jugador vinculado a tu cuenta." };
    }

    await prisma.player.update({
      where: { id: user.playerId },
      data: { isFreeAgent }
    });

    revalidatePath("/perfil");
    revalidatePath("/mercado");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleTeamLookingForPlayers(teamId: string, isLookingForPlayers: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return { success: false, error: "Equipo no encontrado" };

    if (team.captainId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "No tienes permisos sobre este equipo" };
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { isLookingForPlayers }
    });

    revalidatePath("/perfil");
    revalidatePath("/mercado");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
