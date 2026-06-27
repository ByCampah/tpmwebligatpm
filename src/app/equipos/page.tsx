import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";
import EquiposClient from "./EquiposClient";

export default async function EquiposPage() {
  const locale = "es";
  const t = await getDictionary(locale);
  const equipos = await prisma.team.findMany({
    where: { isNationalTeam: false },
    include: { captain: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-4xl font-black neon-text uppercase">{t.teams.title}</h1>
        <p className="text-muted-foreground">
          {t.teams.subtitle}
        </p>
      </header>

      <EquiposClient equipos={equipos} />
    </div>
  );
}
