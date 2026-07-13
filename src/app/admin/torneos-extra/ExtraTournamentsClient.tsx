"use client";

import { useState } from "react";
import { createTournament, deleteTournament, setActiveExtraTournament } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Trash2, Users, CalendarDays, ExternalLink } from "lucide-react";

export default function ExtraTournamentsClient({ tournaments, categories, userRole }: { tournaments: any[], categories: any[], userRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      
      {/* CREATE TOURNAMENT */}
      {userRole === "ADMIN" && (
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h2 className="font-bold text-lg text-primary mb-4">Crear Nuevo Torneo Extra</h2>
          <form action={async (formData) => {
            setLoading(true);
            await createTournament(formData);
            setLoading(false);
            router.refresh();
            (document.getElementById('createExtraTournamentForm') as HTMLFormElement)?.reset();
          }} id="createExtraTournamentForm" className="grid md:grid-cols-2 gap-4">
            
            <input type="hidden" name="isOfficial" value="false" />
            <input type="hidden" name="seasonId" value="" />

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre del Torneo</label>
              <input name="name" type="text" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Copa de Promesas" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Formato</label>
              <select name="format" required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="CUP">Copa</option>
                <option value="LEAGUE">Liga</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Categoría Histórica (Opcional)</label>
              <select name="categoryId" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="">-- Sin Categoría --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">URL de la Llave (Bracket)</label>
              <input name="bracketImageUrl" type="url" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="https://ejemplo.com/llave.png" />
            </div>

            <div className="md:col-span-2">
              <button disabled={loading} type="submit" className="w-full bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
                CREAR TORNEO EXTRA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOURNAMENTS LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Lista de Pretemporada</h2>
        {tournaments.length === 0 ? (
          <p className="text-muted-foreground italic">No hay Pretemporada creados todavía.</p>
        ) : (
          <div className="grid gap-4">
            {tournaments.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${t.isActiveExtra ? 'bg-primary/20 text-primary border border-primary' : 'bg-secondary/50 text-primary'} flex items-center justify-center`}>
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg flex items-center gap-2">
                      {t.name}
                      <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        {t.format}
                      </span>
                      {t.isActiveExtra && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          ACTIVO
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bold mt-1">
                      {t._count.teams} Equipos • {t._count.matches} Partidos
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {(userRole === "ADMIN" || userRole === "MODERATOR") && !t.isActiveExtra && (
                    <button 
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        await setActiveExtraTournament(t.id);
                        setLoading(false);
                      }}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
                    >
                      HACER ACTIVO
                    </button>
                  )}
                  <Link href={`/admin/temporadas/${t.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                    Editar
                  </Link>
                  <Link href={`/extras/${t.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Ver Público
                  </Link>
                  <Link href={`/admin/temporadas/${t.id}?tab=EQUIPOS`} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors">
                    <Users className="w-3 h-3" /> Equipos
                  </Link>
                  <Link href={`/admin/temporadas/${t.id}?tab=PARTIDOS`} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors">
                    <CalendarDays className="w-3 h-3" /> Partidos
                  </Link>
                  {userRole === "ADMIN" && (
                    <button 
                      disabled={loading}
                      onClick={async () => {
                        if(confirm(`¿Estás seguro de eliminar el torneo extra ${t.name}? Se perderán todos sus partidos.`)) {
                          setLoading(true);
                          await deleteTournament(t.id);
                          setLoading(false);
                          router.refresh();
                        }
                      }}
                      className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                      title="Eliminar torneo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
