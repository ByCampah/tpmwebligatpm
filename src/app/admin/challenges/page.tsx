import { prisma } from "@/lib/prisma";
import ChallengesListClient from "./ChallengesListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Challenges | Admin",
};

export default async function ChallengesAdminPage() {
  const challenges = await prisma.challengeTournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { participants: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-primary mb-2">Challenges Individuales</h1>
        <p className="text-muted-foreground text-sm">
          Crea y gestiona torneos individuales (Free Kick, Penaltys, Shooting, Volley).
        </p>
      </div>

      <ChallengesListClient initialChallenges={challenges} />
    </div>
  );
}
