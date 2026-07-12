import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stat = await prisma.globalStat.findUnique({ where: { id: "visits" } });
  const visits = stat?.visits || 0;

  const dailyVisits = await prisma.dailyVisit.findMany({
    orderBy: { date: "desc" },
    take: 7
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Bienvenido al Panel de Moderación</h1>
          <p className="text-muted-foreground mt-1">
            Desde aquí podes gestionar la carga manual de datos de la Liga TPM.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-primary/20 border border-primary/30 p-4 rounded-xl flex flex-col items-center min-w-[150px]">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Visitas Hoy</span>
            <span className="text-3xl font-black text-white">{dailyVisits[0]?.visits || 0}</span>
          </div>
          <div className="bg-secondary/30 border border-border p-4 rounded-xl flex flex-col items-center min-w-[150px]">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Visitas Totales</span>
            <span className="text-3xl font-black text-white">{visits}</span>
          </div>
        </div>
      </div>
      
      {dailyVisits.length > 1 && (
        <div className="bg-secondary/20 p-4 rounded-xl border border-border mt-2">
          <h4 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Historial de Visitas (Últimos 7 días)</h4>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dailyVisits.slice(1).map(dv => (
              <div key={dv.date} className="flex flex-col items-center bg-black/40 px-4 py-2 rounded-lg min-w-[100px]">
                <span className="text-xs text-muted-foreground">{dv.date}</span>
                <span className="text-xl font-bold text-primary/80">{dv.visits}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h3 className="font-bold text-primary text-xl mb-4">Guía Básica de Uso</h3>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong>Partidos Históricos:</strong> Para torneos que solo son estadísticas, debes usar "Estadísticas Históricas" (u otras variantes como "Histórico", "Partidos historicos PJ") en el campo de Ronda.
            </li>
            <li>
              En estos partidos históricos, <strong>los Minutos (matchTime) cuentan como Partidos Jugados (PJ)</strong> en lugar de minutos reales.
            </li>
            <li>
              <strong>Premios de Equipo:</strong> Puedes excluir jugadores de recibir premios colectivos desmarcando sus nombres al entregar el premio. No aparecerá en sus perfiles ni en la sección Jugadores del salón de la fama.
            </li>
            <li>
              Revisa periódicamente el <strong>Registro de Acciones</strong> para auditar quién hace cambios en la base de datos.
            </li>
          </ul>
        </div>
        
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h3 className="font-bold text-primary text-xl mb-2">Backup Base de Datos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Descarga una copia completa de seguridad de la base de datos en formato JSON para poder restaurarla en caso de emergencia.
          </p>
          <a href="/api/backup" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors">
            Descargar Backup
          </a>
        </div>
      </div>
    </div>
  );
}
