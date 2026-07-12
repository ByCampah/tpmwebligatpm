import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Bienvenido al Panel de Moderación</h1>
          <p className="text-muted-foreground mt-1">
            Desde aquí podes gestionar la carga manual de datos de la Liga TPM.
          </p>
        </div>
      </div>

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
