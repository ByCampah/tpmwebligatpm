import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AdminFirmaClientCopier from "./AdminFirmaClientCopier";

export const dynamic = "force-dynamic";

export default async function AdminFirmaLobbyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const lobby = await prisma.signatureLobby.findUnique({
    where: { id: params.id },
    include: {
      signatures: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!lobby) return <div>Lobby no encontrado</div>;

  // Search for DU matches
  // For each signature in this lobby, check if its IP or Fingerprint was used by a DIFFERENT userId
  const matches: { signatureId: string, dupeNames: string[], byIp: boolean, byFingerprint: boolean }[] = [];
  for (const sig of lobby.signatures) {
    if (!sig.userId) continue;

    const duplicates = await prisma.signature.findMany({
      where: {
        OR: [
          { ip: sig.ip },
          { fingerprint: sig.fingerprint }
        ],
        userId: { not: sig.userId } // Different Discord Account!
      },
      include: { user: true }
    });

    if (duplicates.length > 0) {
      // deduplicate users to avoid spam
      const uniqueDupeUsers = new Map();
      let byIp = false;
      let byFingerprint = false;
      
      duplicates.forEach(d => {
        if (d.user) uniqueDupeUsers.set(d.user.id, d.user.nickName || d.user.name || "Desconocido");
        if (d.ip === sig.ip) byIp = true;
        if (d.fingerprint === sig.fingerprint) byFingerprint = true;
      });
      
      matches.push({
        signatureId: sig.id,
        dupeNames: Array.from(uniqueDupeUsers.values()),
        byIp,
        byFingerprint
      });
    }
  }

  async function toggleStatus() {
    "use server";
    await prisma.signatureLobby.update({
      where: { id: lobby?.id },
      data: { status: lobby?.status === "OPEN" ? "CLOSED" : "OPEN" }
    });
    revalidatePath(`/admin/firmas/${lobby?.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/admin/firmas" className="hover:text-white">Firmas</Link>
        <span>/</span>
        <span className="text-white">{lobby.title}</span>
      </div>

      <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{lobby.title}</h1>
          <p className="text-sm text-gray-400 mt-1">Comparte el siguiente link para que firmen asistencia:</p>
          <div className="mt-2">
             <AdminFirmaClientCopier lobbyId={lobby.id} />
          </div>
        </div>
        
        <form action={toggleStatus}>
          <button type="submit" className={`px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${lobby.status === 'OPEN' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50' : 'bg-green-500/20 text-green-500 hover:bg-green-500/40 border border-green-500/50'}`}>
            {lobby.status === 'OPEN' ? 'Cerrar Sala' : 'Reabrir Sala'}
          </button>
        </form>
      </div>

      <div className="bg-secondary/20 rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 bg-black/40 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">Jugadores Firmados ({lobby.signatures.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3">Jugador / Discord</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Huella de PC</th>
                <th className="px-4 py-3 text-right">Alerta DU</th>
              </tr>
            </thead>
            <tbody>
              {lobby.signatures.map(sig => {
                const isDupe = matches.find(m => m.signatureId === sig.id);
                return (
                  <tr key={sig.id} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isDupe ? 'bg-red-500/10' : ''}`}>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <img src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/tpm_logo.png"} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{sig.user?.nickName || "Sin Nick Web"}</span>
                        <span className="text-xs text-tpm-primary">Discord: {sig.user?.name || "Desconocido"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{new Date(sig.createdAt).toLocaleTimeString("es-AR")}</td>
                    <td className="px-4 py-4">
                      {sig.city !== "Desconocido" ? `${sig.city}, ${sig.country}` : "Desconocido"}
                      <div className="text-xs text-gray-500">{sig.isp}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-400">{sig.ip}</td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-400">{sig.fingerprint}</td>
                    <td className="px-4 py-4 text-right">
                      {isDupe ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">Posible DU</span>
                          <span className="text-[10px] text-red-300 mt-1 max-w-[150px] text-right">Usada por: {isDupe.dupeNames.join(", ")}</span>
                          <span className="text-[9px] text-red-400 mt-0.5 font-bold uppercase text-right leading-tight">
                            Coincide por: {isDupe.byIp && "IP"} {isDupe.byIp && isDupe.byFingerprint && "y"} {isDupe.byFingerprint && "Huella (PC)"}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {lobby.signatures.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Todavía nadie ha firmado en esta sala.
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
