import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminFirmasPage() {
  const lobbies = await prisma.signatureLobby.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { signatures: true }
      }
    }
  });

  async function createLobby(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return;
    
    await prisma.signatureLobby.create({
      data: { title }
    });
    revalidatePath("/admin/firmas");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-secondary/30 p-6 rounded-xl border border-border flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Salas de Firma (Anti-DU)</h1>
          <p className="text-sm text-gray-400">Crea salas para que los jugadores firmen asistencia y detecta multicuentas.</p>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Link href="/admin/firmas/historial" className="px-4 py-2 bg-blue-500/20 text-blue-400 font-bold rounded-lg border border-blue-500/30 hover:bg-blue-500/40 transition-colors">
            Historial Global
          </Link>
          <form action={createLobby} className="flex gap-2">
            <input 
              type="text" 
              name="title" 
              placeholder="Ej: Almagro vs Insight" 
              className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white outline-none focus:border-tpm-primary"
              required
            />
            <button type="submit" className="px-4 py-2 bg-tpm-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors">
              Crear Sala
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lobbies.map(l => (
          <Link href={`/admin/firmas/${l.id}`} key={l.id} className="bg-secondary/20 p-5 rounded-xl border border-white/5 hover:border-tpm-primary/50 transition-colors group relative">
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${l.status === 'OPEN' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-tpm-primary transition-colors">{l.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{new Date(l.createdAt).toLocaleString("es-AR")}</p>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-gray-400">
                <strong className="text-white">{l._count.signatures}</strong> firmas
              </span>
              <span className="text-xs font-bold text-tpm-primary uppercase">Ver Detalles →</span>
            </div>
          </Link>
        ))}
        {lobbies.length === 0 && (
          <p className="text-gray-500 col-span-full">No hay salas creadas todavía.</p>
        )}
      </div>
    </div>
  );
}
