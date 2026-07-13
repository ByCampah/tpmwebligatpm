import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

      <div className="bg-secondary/20 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3">Jugador / Discord</th>
                <th className="px-4 py-3">Sala (Partido)</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicación (Idioma local)</th>
                <th className="px-4 py-3">IP Pública</th>
                <th className="px-4 py-3">Huella Única (PC)</th>
              </tr>
            </thead>
            <tbody>
              {signatures.map(sig => (
                <tr key={sig.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/tpm_logo.png"} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{sig.user?.nickName || sig.user?.name || "Desconocido"}</span>
                      <span className="text-xs text-tpm-primary">{sig.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-white">{sig.lobby?.title}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{new Date(sig.createdAt).toLocaleString("es-AR")}</td>
                  <td className="px-4 py-4">
                    {sig.city !== "Desconocido" ? `${sig.city}, ${sig.country}` : "Desconocido"}
                    <div className="text-xs text-gray-500 mt-1">Proveedor: {sig.isp}</div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-blue-300">{sig.ip}</td>
                  <td className="px-4 py-4 font-mono text-xs text-emerald-300">{sig.fingerprint}</td>
                </tr>
              ))}
              {signatures.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Todavía no hay registros en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
