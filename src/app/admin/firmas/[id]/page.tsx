import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AdminFirmaClientCopier from "./AdminFirmaClientCopier";
import FirmaLobbyTable from "./FirmaLobbyTable";

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
    if (!sig.userId || !sig.isActive) continue;

    const duplicates = await prisma.signature.findMany({
      where: {
        isActive: true,
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
        
        <div className="flex flex-col md:flex-row gap-2">
          <form action={toggleStatus}>
            <button type="submit" className={`px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${lobby.status === 'OPEN' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50' : 'bg-green-500/20 text-green-500 hover:bg-green-500/40 border border-green-500/50'}`}>
              {lobby.status === 'OPEN' ? 'Cerrar Sala' : 'Reabrir Sala'}
            </button>
          </form>
          <form action={async () => {
            "use server";
            await prisma.signatureLobby.delete({ where: { id: lobby?.id } });
            const { redirect } = await import("next/navigation");
            redirect("/admin/firmas");
          }}>
            <button type="submit" className="px-6 py-3 font-bold rounded-xl transition-all shadow-lg bg-gray-500/20 text-gray-400 hover:bg-red-500/40 hover:text-white border border-gray-500/50 hover:border-red-500/50">
              Eliminar Sala
            </button>
          </form>
        </div>
      </div>

      <FirmaLobbyTable lobby={lobby} matches={matches} />
    </div>
  );
}
