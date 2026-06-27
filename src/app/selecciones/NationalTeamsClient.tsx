"use client";

import { useState } from "react";
import Link from "next/link";

export default function NationalTeamsClient({ nationalTeams, allPlayers }: { nationalTeams: any[], allPlayers: any[] }) {
  const [activeTab, setActiveTab] = useState(nationalTeams[0]?.id);

  if (nationalTeams.length === 0) {
    return <p className="text-center text-muted-foreground p-12">No hay selecciones nacionales registrados en el sistema.</p>;
  }

  const activeTeam = nationalTeams.find(t => t.id === activeTab);
  
  // Find players that match the active team's name as their nationality
  const availablePlayers = allPlayers.filter(p => p.nationality === activeTeam?.name);

  // Check if they are currently called up in the active season
  // activeTeam.tournaments contains the active season's tournaments if any
  const calledUpPlayerIds = new Set<string>();
  activeTeam?.tournaments?.forEach((tt: any) => {
    tt.players?.forEach((p: any) => calledUpPlayerIds.add(p.playerId));
  });

  // Sort availablePlayers: Called Up first, then by name
  availablePlayers.sort((a, b) => {
    const aCalled = calledUpPlayerIds.has(a.id);
    const bCalled = calledUpPlayerIds.has(b.id);
    if (aCalled && !bCalled) return -1;
    if (!aCalled && bCalled) return 1;
    return a.nick.localeCompare(b.nick);
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* SIDEBAR TABS */}
      <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
        <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider mb-2 px-4">Países</h3>
        {nationalTeams.map(nt => (
          <button
            key={nt.id}
            onClick={() => setActiveTab(nt.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === nt.id
                ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground border-l-4 border-transparent"
            }`}
          >
            {nt.logoUrl && <img src={nt.logoUrl} alt={nt.name} className="w-6 h-6 object-contain rounded-sm" />}
            {nt.name}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTeam && (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col md:flex-row items-center gap-6 bg-card border border-border p-6 rounded-xl shadow-lg">
            {activeTeam.logoUrl ? (
              <img src={activeTeam.logoUrl} alt={activeTeam.name} className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            ) : (
              <div className="w-24 h-24 bg-secondary flex justify-center items-center rounded-xl text-3xl font-bold text-muted-foreground">
                {activeTeam.name.charAt(0)}
              </div>
            )}
            
            <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
              <h2 className="text-4xl font-black text-white">{activeTeam.name}</h2>
              <div className="mt-2 text-muted-foreground text-sm font-medium flex items-center gap-2">
                Seleccionador / DT: 
                {activeTeam.captain ? (
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded font-black flex items-center gap-2">
                    {activeTeam.captain.customAvatarUrl && <img src={activeTeam.captain.customAvatarUrl} className="w-4 h-4 rounded-full" alt="Avatar" />}
                    {activeTeam.captain.nickName || activeTeam.captain.name}
                  </span>
                ) : (
                  <span className="bg-destructive/20 text-destructive px-3 py-1 rounded font-bold">Sin Asignar</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Jugadores Disponibles ({availablePlayers.length})</h3>
            </div>
            
            {availablePlayers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">
                No hay jugadores registrados con la nacionalidad "{activeTeam.name}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {availablePlayers.map(p => {
                  const isCalledUp = calledUpPlayerIds.has(p.id);
                  return (
                    <Link 
                      href={`/jugadores/${p.id}`} 
                      key={p.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${isCalledUp ? 'bg-primary/5 border-primary/30' : 'bg-black/30 border-border hover:border-primary/50'}`}
                    >
                      <div className="w-12 h-12 bg-secondary rounded flex justify-center items-center font-black text-xl text-muted-foreground shrink-0 overflow-hidden">
                        {p.user?.image || p.user?.customAvatarUrl ? (
                          <img src={p.user.image || p.user.customAvatarUrl!} alt={p.nick} className="w-full h-full object-cover" />
                        ) : p.nick.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold truncate">{p.nick}</span>
                        {isCalledUp ? (
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded w-fit uppercase">Convocado Activo</span>
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Disponible</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
