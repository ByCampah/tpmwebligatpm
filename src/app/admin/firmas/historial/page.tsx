import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HistorialTable from "./HistorialTable";

export const dynamic = "force-dynamic";

export default async function HistorialFirmasPage() {
  const signatures = await prisma.signature.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      lobby: true
    },
    take: 500 // Limit to last 500 for performance
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/admin/firmas" className="hover:text-white">Firmas</Link>
        <span>/</span>
        <span className="text-white">Historial Global</span>
      </div>

      <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">Historial Global de Jugadores</h1>
        <p className="text-sm text-gray-400">
          Aquí se registra absolutamente todos los jugadores que han firmado asistencia en alguna sala, junto con sus datos de conexión e IP.
        </p>
      </div>

      <HistorialTable signatures={signatures} />
    </div>
  );
}
