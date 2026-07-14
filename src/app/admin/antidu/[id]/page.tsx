import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminFirmaClientCopier from "../../firmas/[id]/AdminFirmaClientCopier";
import FirmaLobbyTable from "../../firmas/[id]/FirmaLobbyTable";
import FirmaLobbyGraficador from "../../firmas/[id]/FirmaLobbyGraficador";

export const dynamic = "force-dynamic";

export default async function AdminAntiDuLobbyPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";
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
    revalidatePath(`/admin/antidu/${lobby?.id}`);
    revalidatePath(`/admin/firmas/${lobby?.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/admin/antidu" className="hover:text-white">Anti-DU</Link>
        <span>/</span>
        <span className="text-white">{lobby.title}</span>
      </div>

      <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{lobby.title}</h1>
          <p className="text-sm text-gray-400 mt-1">Comparte el siguiente link para realizar la prueba Anti-DU y firmar asistencia:</p>
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
          {isAdmin && (
            <form action={async () => {
              "use server";
              await prisma.signatureLobby.delete({ where: { id: lobby?.id } });
              const { redirect } = await import("next/navigation");
              redirect("/admin/antidu");
            }}>
              <button type="submit" className="px-6 py-3 font-bold rounded-xl transition-all shadow-lg bg-gray-500/20 text-gray-400 hover:bg-red-500/40 hover:text-white border border-gray-500/50 hover:border-red-500/50">
                Eliminar Sala
              </button>
            </form>
          )}
        </div>
      </div>

      <FirmaLobbyTable lobby={lobby} matches={matches} isAdmin={isAdmin} />
      <FirmaLobbyGraficador lobby={lobby} matches={matches} />
    </div>
  );
}
