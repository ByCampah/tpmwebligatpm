"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "No autorizado" }
  }

  const nickName = formData.get("nickName") as string
  const customAvatarUrl = formData.get("customAvatarUrl") as string

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickName: nickName?.trim() || null,
        customAvatarUrl: customAvatarUrl?.trim() || null,
      }
    })
    
    revalidatePath("/perfil")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Ocurrió un error al actualizar el perfil" }
  }
}

export async function updateUserRole(formData: FormData) {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "No tienes permisos de Administrador." };
  }

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as "USER" | "MODERATOR" | "ADMIN" }
    });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error interno al actualizar rol." };
  }
}

export async function linkUserToPlayerAndTeam(formData: FormData) {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "No tienes permisos de Administrador." };
  }

  const userId = formData.get("userId") as string;
  const playerId = formData.get("playerId") as string;
  const teamId = formData.get("teamId") as string;

  try {
    // 1. Link Player
    // The foreign key is `playerId` on the `User` model
    if (playerId) {
      await prisma.user.update({
        where: { id: userId },
        data: { playerId }
      });
    } else {
      // Si mandan vacio, desvinculamos el jugador actual de este usuario
      await prisma.user.update({
        where: { id: userId },
        data: { playerId: null }
      });
    }

    // 2. Link Team
    if (teamId) {
      await prisma.team.update({
        where: { id: teamId },
        data: { captainId: userId }
      });
    }

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
