export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black text-white">Bienvenido al Panel de Moderación</h1>
      <p className="text-muted-foreground">
        Desde aquí podes gestionar la carga manual de datos de la Liga TPM.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h3 className="font-bold text-primary text-xl mb-2">1. Cargar Partidos</h3>
          <p className="text-sm text-muted-foreground">
            Sube el resultado de un partido y las estadísticas (goles, asistencias, atajadas) de cada jugador de forma manual para que la tabla de posiciones se actualice.
          </p>
        </div>
        
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h3 className="font-bold text-primary text-xl mb-2">2. Asignar Premios</h3>
          <p className="text-sm text-muted-foreground">
            Arma el podio del torneo, asignando quién salió Campeón o quién ganó el premio a Goleador / Valla Invicta / MVP.
          </p>
        </div>
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h3 className="font-bold text-primary text-xl mb-2">3. Backup Base de Datos</h3>
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
