"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSignatureActive(signatureId: string, currentPath: string) {
  const sig = await prisma.signature.findUnique({ where: { id: signatureId } });
  if (sig) {
    await prisma.signature.update({
      where: { id: signatureId },
      data: { isActive: !sig.isActive }
    });
    revalidatePath(currentPath);
  }
}

export async function deleteSignatureLobby(lobbyId: string) {
  await prisma.signatureLobby.delete({
    where: { id: lobbyId }
  });
  revalidatePath("/admin/firmas");
}
