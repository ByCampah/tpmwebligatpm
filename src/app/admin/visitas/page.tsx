import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VisitasPage() {
  const stat = await prisma.globalStat.findUnique({ where: { id: "visits" } });
  const totalVisits = stat?.visits || 0;

  const dailyVisits = await prisma.dailyVisit.findMany({
    orderBy: { date: "desc" },
    take: 30
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Registro de Visitas</h1>
          <p className="text-muted-foreground mt-1">
            Historial diario de visitas únicas al sitio.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-primary/20 border border-primary/30 p-4 rounded-xl flex flex-col items-center min-w-[150px]">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Visitas Hoy</span>
            <span className="text-3xl font-black text-white">{dailyVisits[0]?.visits || 0}</span>
          </div>
          <div className="bg-secondary/30 border border-border p-4 rounded-xl flex flex-col items-center min-w-[150px]">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Visitas Totales</span>
            <span className="text-3xl font-black text-white">{totalVisits}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/20 p-6 rounded-xl border border-border mt-4">
        <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Últimos 30 días</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="pb-3 pr-4 font-bold">Fecha</th>
                <th className="pb-3 text-right font-bold">Visitas Únicas</th>
              </tr>
            </thead>
            <tbody className="text-white text-sm">
              {dailyVisits.map((dv) => (
                <tr key={dv.date} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 font-semibold">{dv.date}</td>
                  <td className="py-3 text-right font-bold text-primary/90">{dv.visits}</td>
                </tr>
              ))}
              {dailyVisits.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-muted-foreground">
                    No hay datos registrados aún.
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
