import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ExtraTournamentsClient from "./ExtraTournamentsClient";

export const metadata = {
  title: "Gestión de Torneos Extras | Admin",
};

export default async function TorneosExtraAdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  // Fetch only non-official tournaments
  const extraTournaments = await prisma.tournament.findMany({
    where: { isOfficial: false },
    include: {
      category: true,
      _count: { select: { matches: true, teams: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-primary mb-6">Torneos Extras (No Oficiales)</h1>
      <p className="text-muted-foreground mb-8">
        Aquí puedes crear torneos esporádicos o relámpago. Estos torneos no pertenecen a ninguna temporada oficial y 
        sus estadísticas no se mezclarán con el historial general ("Global") de los jugadores.
      </p>

      <ExtraTournamentsClient 
        tournaments={extraTournaments} 
        categories={categories} 
        userRole={session.user.role} 
      />
    </div>
  );
}
