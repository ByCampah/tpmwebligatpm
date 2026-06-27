import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const nationalTeams = [
    { name: "Argentina", logoUrl: "/img/banderas/argentina.svg" },
    { name: "Brasil", logoUrl: "/img/banderas/brazil.svg" },
    { name: "Uruguay", logoUrl: "/img/banderas/uruguay.svg" },
    { name: "Colombia", logoUrl: "https://flagcdn.com/w320/co.png" },
    { name: "Chile", logoUrl: "https://flagcdn.com/w320/cl.png" },
    { name: "Perú", logoUrl: "https://flagcdn.com/w320/pe.png" },
    { name: "Ecuador", logoUrl: "https://flagcdn.com/w320/ec.png" },
    { name: "Paraguay", logoUrl: "https://flagcdn.com/w320/py.png" },
    { name: "Bolivia", logoUrl: "https://flagcdn.com/w320/bo.png" },
    { name: "Venezuela", logoUrl: "https://flagcdn.com/w320/ve.png" }
  ];

  for (const nt of nationalTeams) {
    await prisma.team.upsert({
      where: { name: nt.name },
      update: { isNationalTeam: true, logoUrl: nt.logoUrl },
      create: { name: nt.name, isNationalTeam: true, logoUrl: nt.logoUrl }
    });
  }

  return NextResponse.json({ success: true, message: "Selecciones creadas o actualizadas" });
}
