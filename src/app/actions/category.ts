"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return { success: false, error: "No autorizado" }
    }

    const name = formData.get("name") as string

    if (!name) return { success: false, error: "Nombre requerido" }

    await prisma.category.create({
      data: { name }
    })

    revalidatePath("/admin/categorias")
    revalidatePath("/admin/temporadas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error interno" }
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Solo los Administradores pueden editar categorías" }
    }

    const categoryId = formData.get("categoryId") as string
    const name = formData.get("name") as string

    if (!categoryId || !name) return { success: false, error: "Datos incompletos" }

    await prisma.category.update({
      where: { id: categoryId },
      data: { name }
    })

    revalidatePath("/admin/categorias")
    revalidatePath("/admin/temporadas")
    revalidatePath("/historial")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error interno" }
  }
}

export async function deleteCategory(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Solo los Administradores pueden borrar categorías" }
    }

    const categoryId = formData.get("categoryId") as string
    if (!categoryId) return { success: false, error: "Categoría no encontrada" }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    revalidatePath("/admin/categorias")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al borrar, es posible que esté siendo usada" }
  }
}
