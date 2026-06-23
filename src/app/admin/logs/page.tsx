import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 100 // Get latest 100 logs
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Registro de Acciones (Logs)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historial de los últimos 100 eventos importantes realizados por Administradores y Moderadores.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/80 text-secondary-foreground border-b border-border">
            <tr>
              <th className="p-4 font-bold">Fecha y Hora</th>
              <th className="p-4 font-bold">Usuario</th>
              <th className="p-4 font-bold">Acción</th>
              <th className="p-4 font-bold">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4 font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                    {(log.user.name || "U").charAt(0)}
                  </div>
                  {log.user.name || "Usuario"} 
                  {log.user.role === "MODERATOR" && <span className="text-xs bg-blue-500/20 text-blue-400 px-1 rounded ml-1">MOD</span>}
                </td>
                <td className="p-4 text-primary font-bold">
                  {log.action}
                </td>
                <td className="p-4 text-muted-foreground">
                  {log.details || "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No hay registros de actividad aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
