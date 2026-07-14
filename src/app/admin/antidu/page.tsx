import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createAntiDuSession, deleteAntiDuSession } from "@/app/actions/antidu-actions";

export const dynamic = "force-dynamic";

export default async function AdminAntiDuPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  const sessions = await prisma.antiDuSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { results: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-secondary/30 p-6 rounded-xl border border-border flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Sistema Anti-DU (Moderadores)</h1>
          <p className="text-sm text-gray-400">Crea enlaces seguros para verificar la identidad de los jugadores y detectar multicuentas.</p>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <form action={async (formData) => {
            "use server";
            const title = formData.get("title") as string;
            if (title) await createAntiDuSession(title);
          }} className="flex gap-2">
            <input 
              type="text" 
              name="title" 
              placeholder="Ej: Partido Equipo A vs Equipo B" 
              className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white outline-none focus:border-red-500"
              required
            />
            <button type="submit" className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
              Generar Enlace
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(s => (
          <div key={s.id} className="bg-card border border-border p-5 rounded-xl shadow flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-6xl">🕵️</span>
            </div>
            
            <div className="z-10">
              <h3 className="font-black text-lg flex items-center gap-2">
                <span className={s.status === "OPEN" ? "text-red-400" : "text-white"}>{s.title}</span>
                {s.status === "OPEN" && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    ACTIVO
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(s.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-bold">{s._count.results} Firmas Registradas</p>
            </div>

            <div className="mt-auto flex gap-2 z-10 pt-4 border-t border-white/5">
              <Link 
                href={`/admin/antidu/${s.id}`}
                className="flex-1 bg-white/10 hover:bg-white/20 text-center py-2 rounded text-sm font-bold text-white transition-colors"
              >
                Ver Resultados
              </Link>
              {isAdmin && (
                <form action={async () => {
                  "use server";
                  await deleteAntiDuSession(s.id);
                }}>
                  <button type="submit" className="bg-destructive/20 hover:bg-destructive/40 text-destructive px-3 py-2 rounded text-sm font-bold transition-colors">
                    🗑️
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-secondary/20 rounded-xl border border-white/5 border-dashed">
            No hay sesiones Anti-DU creadas. Genera un enlace arriba para empezar.
          </div>
        )}
      </div>
    </div>
  );
}
