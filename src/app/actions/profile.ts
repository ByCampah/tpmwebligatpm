"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updatePlayerProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    });

    if (!user || !user.playerId) {
      return { success: false, error: "No tienes un jugador vinculado a tu cuenta." };
    }

    const nationality = formData.get("nationality") as string;
    const primaryPosition = formData.get("primaryPosition") as string;
    const secondaryPosition = formData.get("secondaryPosition") as string;

    const dataToUpdate: any = {
      primaryPosition: primaryPosition === "Ninguna" ? null : primaryPosition,
      secondaryPosition: secondaryPosition === "Ninguna" ? null : secondaryPosition
    };

    if (nationality) {
      dataToUpdate.nationality = nationality;
    }

    await prisma.player.update({
      where: { id: user.playerId },
      data: dataToUpdate
    });

    revalidatePath("/perfil");
    revalidatePath("/jugadores");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Error al actualizar perfil" };
  }
}
