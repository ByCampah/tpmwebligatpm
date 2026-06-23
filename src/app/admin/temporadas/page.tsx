import { prisma } from "@/lib/prisma";
import SeasonsClient from "./SeasonsClient";

export const dynamic = 'force-dynamic';

export default async function AdminTemporadasPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: "desc" },
    include: { tournaments: true }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Estructura de Temporadas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define las Temporadas y los Torneos que se jugarán dentro de ellas.
        </p>
      </div>

      <SeasonsClient seasons={seasons} />
    </div>
  );
}
