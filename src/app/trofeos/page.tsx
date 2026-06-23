import { prisma } from "@/lib/prisma";
import TrofeosView from "./TrofeosView";
import { getDictionary } from "@/i18n/getDictionary";
import { cookies } from "next/headers";

export default async function TrofeosPage() {
  const locale = "es";
  const t = await getDictionary(locale);

  const teams = await prisma.team.findMany({
    include: {
      trophies: {
        where: {
          type: "TEAM"
        },
        include: {
          tournament: true
        }
      }
    }
  });

  return (
    <div className="py-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">{t.trophies.title}</h1>
        <p className="text-muted-foreground">
          {t.trophies.subtitle}
        </p>
      </header>
      <TrofeosView teams={teams} dictionary={t.trophies} />
    </div>
  );
}
