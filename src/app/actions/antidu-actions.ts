"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAntiDuSession(title: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const s = await prisma.antiDuSession.create({
      data: { title }
    });
    revalidatePath("/admin/antidu");
    return { success: true, sessionId: s.id };
  } catch (error: any) {
    console.error("createAntiDuSession error:", error);
    return { success: false, error: "Error al crear la sesión" };
  }
}

export async function toggleAntiDuSessionStatus(id: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.antiDuSession.update({
      where: { id },
      data: { status: currentStatus === "OPEN" ? "CLOSED" : "OPEN" }
    });
    revalidatePath("/admin/antidu");
    revalidatePath(`/admin/antidu/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("toggleAntiDuSessionStatus error:", error);
    return { success: false, error: "Error al cambiar estado" };
  }
}

export async function deleteAntiDuSession(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Solo los administradores pueden eliminar sesiones" };
  }

  try {
    await prisma.antiDuSession.delete({ where: { id } });
    revalidatePath("/admin/antidu");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAntiDuSession error:", error);
    return { success: false, error: "Error al eliminar la sesión" };
  }
}

export async function submitAntiDuResult(data: {
  sessionId: string;
  nick: string;
  discord: string;
  ip: string;
  fingerprint: string;
  isp: string;
  city: string;
  country: string;
  zip: string;
}) {
  try {
    const session = await prisma.antiDuSession.findUnique({ where: { id: data.sessionId } });
    if (!session || session.status !== "OPEN") {
      return { success: false, error: "La sesión no existe o está cerrada." };
    }

    // Checking if there is another player with the same IP or Fingerprint across the signatures or antidu results
    // Wait, the easiest and most effective way is to just query Signature and AntiDuResult.
    // Let's just cross reference AntiDuResult for now to keep it simple, or Signature.
    let status = "OK";
    
    const duplicateSignature = await prisma.signature.findFirst({
      where: {
        OR: [
          { ip: data.ip },
          { fingerprint: data.fingerprint }
        ],
        nick: { not: data.nick }
      }
    });

    const duplicateAntiDu = await prisma.antiDuResult.findFirst({
      where: {
        OR: [
          { ip: data.ip },
          { fingerprint: data.fingerprint }
        ],
        nick: { not: data.nick }
      }
    });

    if (duplicateSignature || duplicateAntiDu) {
      status = "DU";
    }

    await prisma.antiDuResult.create({
      data: {
        sessionId: data.sessionId,
        nick: data.nick,
        discord: data.discord || null,
        ip: data.ip,
        fingerprint: data.fingerprint,
        isp: data.isp,
        city: data.city,
        country: data.country,
        zip: data.zip,
        status
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("submitAntiDuResult error:", error);
    return { success: false, error: "Error al registrar la firma" };
  }
}
