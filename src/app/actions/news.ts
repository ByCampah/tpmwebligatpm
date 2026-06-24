"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createAdminLog } from "@/app/actions"

export async function createNews(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" }
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !content) {
    return { success: false, error: "Faltan campos obligatorios" };
  }

  try {
    // Si la noticia es destacada, quitar destacada a las demás
    if (isFeatured) {
      await prisma.news.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      });
    }

    await prisma.news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isFeatured,
        authorId: session.user.id
      }
    });

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");

    await createAdminLog("Crear Noticia", `Creó la noticia: ${title}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function editNews(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" }
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isFeatured = formData.get("isFeatured") === "on";

  if (!id || !title || !content) {
    return { success: false, error: "Faltan campos obligatorios" };
  }

  try {
    if (isFeatured) {
      await prisma.news.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false }
      });
    }

    await prisma.news.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isFeatured
      }
    });

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${id}`);
    revalidatePath("/admin/noticias");
    
    await createAdminLog("Editar Noticia", `Editó la noticia: ${title}`);
    
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteNews(id: string) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" }
  }

  try {
    const n = await prisma.news.findUnique({ where: { id } });
    await prisma.news.delete({
      where: { id }
    });

    if (n) {
      await createAdminLog("Eliminar Noticia", `Eliminó la noticia: ${n.title}`);
    }

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
