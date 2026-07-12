import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const today = new Date();
    // Ajustar a la hora de Argentina o similar, o simplemente tomar el string ISO
    // Para no complicarla con zonas horarias, usamos UTC por ahora o la fecha local del server.
    const dateStr = today.toISOString().split("T")[0];

    await prisma.$transaction([
      prisma.globalStat.upsert({
        where: { id: "visits" },
        update: { visits: { increment: 1 } },
        create: { id: "visits", visits: 1 }
      }),
      prisma.dailyVisit.upsert({
        where: { date: dateStr },
        update: { visits: { increment: 1 } },
        create: { date: dateStr, visits: 1 }
      })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating visits:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
