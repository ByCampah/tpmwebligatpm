"use client";

import { useState } from "react";
import { createSeason, createTournament, setActiveSeason, deleteSeason, deleteTournament, renameSeason } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function SeasonsClient({ seasons, categories, userRole }: { seasons: any[], categories: any[], userRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      
      {/* SEASONS */}
      {userRole === "ADMIN" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h2 className="font-bold text-lg text-primary mb-4">Añadir Temporada</h2>
          <form action={async (formData) => {
            setLoading(true);
            await createSeason(formData);
            setLoading(false);
            router.refresh();
            (document.getElementById('createSeasonForm') as HTMLFormElement)?.reset();
          }} id="createSeasonForm" className="flex flex-col gap-4">
            
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre</label>
              <input name="name" type="text" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Temporada 3" />
            </div>

            <div className="flex items-center gap-2">
              <input name="isActive" type="checkbox" id="isActive" value="true" className="w-4 h-4" defaultChecked />
              <label htmlFor="isActive" className="text-sm font-bold text-muted-foreground">Establecer como Activa (Reemplaza la anterior)</label>
            </div>

            <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
              CREAR TEMPORADA
            </button>
          </form>
        </div>

        {/* TOURNAMENTS */}
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h2 className="font-bold text-lg text-primary mb-4">Añadir Torneo a Temporada</h2>
          <form action={async (formData) => {
            setLoading(true);
            await createTournament(formData);
            setLoading(false);
            router.refresh();
            (document.getElementById('createTournamentForm') as HTMLFormElement)?.reset();
          }} id="createTournamentForm" className="flex flex-col gap-4">
            
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Temporada</label>
              <select name="seasonId" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="">-- Selecciona Temporada --</option>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(ACTIVA)' : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre del Torneo</label>
              <input name="name" type="text" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Primera División" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Formato</label>
              <select name="format" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="LEAGUE">Liga</option>
                <option value="CUP">Copa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Categoría Histórica</label>
              <select name="categoryId" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="">-- Sin Categoría (General) --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">URL de la Llave / Bracket (Opcional, para Copas)</label>
              <input name="bracketImageUrl" type="url" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="https://ejemplo.com/llave.png" />
            </div>

            <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
              CREAR TORNEO
            </button>
          </form>
        </div>
      </div>
      )}

      {/* SEASONS LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Estructura de Temporadas</h2>
        
        <div className="flex flex-col gap-4">
          {seasons.map(season => (
            <div key={season.id} className={`border p-4 rounded-xl ${season.isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-xl flex items-center gap-2">
                  {season.name}
                  {season.isActive ? (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">ACTIVA</span>
                  ) : (
                    userRole === "ADMIN" && (
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          await setActiveSeason(season.id);
                          setLoading(false);
                        }}
                        className="bg-secondary hover:bg-primary hover:text-black text-secondary-foreground text-xs px-3 py-1 rounded font-bold transition-colors"
                        disabled={loading}
                      >
                        HACER ACTIVA
                      </button>
                    )
                  )}
                  {userRole === "ADMIN" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          const newName = window.prompt("Ingresa el nuevo nombre para la temporada:", season.name);
                          if (newName && newName.trim() !== "" && newName !== season.name) {
                            setLoading(true);
                            const res = await renameSeason(season.id, newName.trim());
                            if (!res.success) alert(res.error || "Error al renombrar");
                            else router.refresh();
                            setLoading(false);
                          }
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500 text-blue-500 hover:text-white text-xs px-3 py-1 rounded font-bold transition-colors ml-2"
                        disabled={loading}
                      >
                        EDITAR
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("¿Estás seguro de eliminar esta temporada? SE BORRARÁN TODOS LOS TORNEOS, PARTIDOS Y ESTADÍSTICAS ASOCIADAS.")) {
                            setLoading(true);
                            const res = await deleteSeason(season.id);
                            if (!res.success) alert(res.error || "Error al eliminar");
                            else router.refresh();
                            setLoading(false);
                          }
                        }}
                        className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white text-xs px-3 py-1 rounded font-bold transition-colors"
                        disabled={loading}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  )}
                </h3>

              </div>
              
              <div className="pl-4 border-l-2 border-secondary flex flex-col gap-2">
                {season.tournaments.length === 0 && <span className="text-muted-foreground text-sm">Sin torneos registrados.</span>}
                {season.tournaments.map((t: any) => (
                  <div key={t.id} className="bg-secondary/30 p-3 rounded flex justify-between items-center">
                    <div>
                      <span className="font-bold block">{t.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{t.format}</span>
                    </div>
                    <div className="flex gap-2">
                      {(userRole === "ADMIN" || season.isActive) && (
                        <a href={`/admin/temporadas/${t.id}`} className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-4 py-2 rounded transition-colors">
                          GESTIONAR
                        </a>
                      )}
                      {userRole === "ADMIN" && (
                        <button 
                          onClick={async () => {
                            if (confirm("¿Estás seguro de eliminar este torneo? SE BORRARÁN TODOS LOS PARTIDOS Y EQUIPOS INSCRITOS.")) {
                              setLoading(true);
                              const res = await deleteTournament(t.id);
                              if (!res.success) alert(res.error || "Error al eliminar");
                              else router.refresh();
                              setLoading(false);
                            }
                          }}
                          className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                          disabled={loading}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {seasons.length === 0 && (
            <p className="text-muted-foreground">No hay temporadas creadas.</p>
          )}
        </div>
      </div>
      
    </div>
  );
}
