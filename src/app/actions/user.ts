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
