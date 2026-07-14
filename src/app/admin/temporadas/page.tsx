import { prisma } from "@/lib/prisma";
import SeasonsClient from "./SeasonsClient";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function AdminTemporadasPage() {
  const session = await auth();
  const userRole = session?.user?.role || "USER";
  const isAdmin = userRole === "ADMIN";

  const seasons = await prisma.season.findMany({
    where: isAdmin ? undefined : { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { tournaments: true }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Estructura de Temporadas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define las Temporadas y los Torneos que se jugarán dentro de ellas.
        </p>
      </div>

      <SeasonsClient seasons={seasons} categories={categories} userRole={userRole} isAdmin={isAdmin} />
    </div>
  );
}
