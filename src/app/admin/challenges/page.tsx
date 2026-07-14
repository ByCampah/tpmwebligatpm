import { prisma } from "@/lib/prisma";
import ChallengesListClient from "./ChallengesListClient";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Challenges | Admin",
};

export default async function ChallengesAdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  const challenges = await prisma.challengeTournament.findMany({
    where: isAdmin ? undefined : { isActive: true },
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
        <p className="text-gray-400 mt-1">Crea y administra torneos de tipo Challenge (1v1). {isAdmin ? "" : "(Solo lectura para inactivos)"}</p>
      </div>

      <ChallengesListClient initialChallenges={challenges} isAdmin={isAdmin} />
    </div>
  );
}
