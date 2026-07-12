import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await prisma.globalStat.upsert({
      where: { id: "visits" },
      update: { visits: { increment: 1 } },
      create: { id: "visits", visits: 1 }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating visits:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
