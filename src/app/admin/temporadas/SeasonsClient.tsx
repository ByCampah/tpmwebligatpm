"use client";

import { useState } from "react";
import { createSeason, createTournament } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function SeasonsClient({ seasons }: { seasons: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      
      {/* SEASONS */}
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
                <option value="LEAGUE">Liga (Tabla de Puntos)</option>
                <option value="CUP">Copa (Llaves)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Categoría Histórica (Opcional)</label>
              <input name="category" type="text" list="categories" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Primera División, Copa TPM" defaultValue="General" />
              <datalist id="categories">
                <option value="Primera División" />
                <option value="Segunda División" />
                <option value="Copa TPM" />
                <option value="Supercopa" />
              </datalist>
            </div>

            <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
              CREAR TORNEO
            </button>
          </form>
        </div>
      </div>

      {/* SEASONS LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Estructura de Temporadas</h2>
        
        <div className="flex flex-col gap-4">
          {seasons.map(season => (
            <div key={season.id} className={`border p-4 rounded-xl ${season.isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-xl flex items-center gap-2">
                  {season.name}
                  {season.isActive && <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">ACTIVA</span>}
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
                    <a href={`/admin/temporadas/${t.id}`} className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-4 py-2 rounded transition-colors">
                      GESTIONAR TORNEO
                    </a>
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
