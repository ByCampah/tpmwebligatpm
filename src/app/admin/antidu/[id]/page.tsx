import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toggleAntiDuSessionStatus, deleteAntiDuSession } from "@/app/actions/antidu-actions";
import AdminAntiDuClientCopier from "./AdminAntiDuClientCopier";
import AntiDuResultsTable from "./AntiDuResultsTable";

export const dynamic = "force-dynamic";

export default async function AntiDuSessionPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  const antiDuSession = await prisma.antiDuSession.findUnique({
    where: { id: params.id },
    include: {
      results: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!antiDuSession) {
    return <div className="p-8 text-center text-white">Sesión no encontrada</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/admin/antidu" className="hover:text-white">Anti-DU</Link>
        <span>/</span>
        <span className="text-white">{antiDuSession.title}</span>
      </div>

      <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{antiDuSession.title}</h1>
          <p className="text-sm text-gray-400 mt-1">Comparte el siguiente link para realizar la prueba Anti-DU:</p>
          <div className="mt-2">
             <AdminAntiDuClientCopier sessionId={antiDuSession.id} />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <form action={async () => {
            "use server";
            await toggleAntiDuSessionStatus(antiDuSession.id, antiDuSession.status);
          }}>
            <button type="submit" className={`px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${antiDuSession.status === 'OPEN' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50' : 'bg-green-500/20 text-green-500 hover:bg-green-500/40 border border-green-500/50'}`}>
              {antiDuSession.status === 'OPEN' ? 'Cerrar Sala' : 'Reabrir Sala'}
            </button>
          </form>
          {isAdmin && (
            <form action={async () => {
              "use server";
              await deleteAntiDuSession(antiDuSession.id);
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

      <AntiDuResultsTable results={antiDuSession.results} isAdmin={isAdmin} />
    </div>
  );
}
