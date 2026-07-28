
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleNationalTeamCallUp } from "@/app/actions";
import NationalTeamGraphicModal from "../../components/NationalTeamGraphicModal";

export default function NationalTeamsClient({ nationalTeams, allPlayers, allClubs, session }: { nationalTeams: any[], allPlayers: any[], allClubs: any[], session: any }) {
  const [activeTab, setActiveTab] = useState(nationalTeams[0]?.id);
  const [isPending, startTransition] = useTransition();
  const [showGraphicModal, setShowGraphicModal] = useState(false);

  if (nationalTeams.length === 0) {
    return <p className="text-center text-muted-foreground p-12">No hay selecciones nacionales registrados en el sistema.</p>;
  }

  const activeTeam = nationalTeams.find(t => t.id === activeTab);
  
  const isDT = session?.user?.id === activeTeam?.captainId;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const canManage = isDT || isAdmin;

  // Find players that match the active team's name as their nationality
  const normalizeText = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
  const availablePlayers = allPlayers.filter(p => normalizeText(p.nationality) === normalizeText(activeTeam?.name));

  // Check if they are currently called up via the isNationalTeamCalledUp boolean
  const calledUpPlayerIds = new Set<string>();
  availablePlayers.forEach(p => {
    if (p.isNationalTeamCalledUp) calledUpPlayerIds.add(p.id);
  });

  const calledUpPlayers = availablePlayers.filter(p => calledUpPlayerIds.has(p.id)).sort((a, b) => a.nick.localeCompare(b.nick));
  const availableOnlyPlayers = availablePlayers.filter(p => !calledUpPlayerIds.has(p.id)).sort((a, b) => a.nick.localeCompare(b.nick));

  const handleToggleCallUp = (playerId: string, isCalledUp: boolean) => {
    startTransition(async () => {
      await toggleNationalTeamCallUp(playerId, isCalledUp);
    });
  };

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
          
          <div className="flex flex-col md:flex-row items-center gap-6 bg-card border border-border p-6 rounded-xl shadow-lg relative">
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
                  <span className="bg-destructive/20 text-destructive px-3 py-1 rounded font-bold">SIN DT</span>
                )}
              </div>
            </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href={`/equipos/${activeTeam.id}`} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/80 transition-colors shadow-md text-sm flex items-center justify-center gap-2">
                  VER ESTADÍSTICAS
                </Link>
                {canManage && (
                  <button onClick={() => setShowGraphicModal(true)} className="px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/80 transition-colors shadow-md text-sm flex items-center justify-center gap-2">
                    GENERAR GRÁFICA
                  </button>
                )}
              </div>
            </div>

          {/* CONVOCADOS PANEL */}
          {calledUpPlayers.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden shadow-lg shadow-primary/5">
              <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Convocados ({calledUpPlayers.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {calledUpPlayers.map(p => (
                  <div key={p.id} className="relative group">
                    <Link 
                      href={`/jugadores/${p.id}`} 
                      className="flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/10 transition-all hover:bg-primary/20 hover:border-primary/50 block w-full"
                    >
                      <div className="w-12 h-12 bg-black/40 rounded flex justify-center items-center font-black text-xl text-primary shrink-0 overflow-hidden">
                        {p.user?.image || p.user?.customAvatarUrl ? (
                          <img src={p.user.image || p.user.customAvatarUrl!} alt={p.nick} className="w-full h-full object-cover" />
                        ) : p.nick.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="font-bold text-white truncate">{p.nick}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-primary bg-primary/20 px-2 py-0.5 rounded w-fit uppercase border border-primary/20">Convocado Activo</span>
                          {p.primaryPosition && p.primaryPosition !== "Ninguna" && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.primaryPosition}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    {canManage && (
                      <button 
                        disabled={isPending}
                        onClick={(e) => { e.preventDefault(); handleToggleCallUp(p.id, false); }}
                        className="absolute right-2 top-2 bg-destructive text-destructive-foreground p-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        Desconvocar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Jugadores Disponibles ({availableOnlyPlayers.length})</h3>
            </div>
            
            {availableOnlyPlayers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">
                No hay más jugadores disponibles con la nacionalidad "{activeTeam.name}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity">
                {availableOnlyPlayers.map(p => (
                  <div key={p.id} className="relative group">
                    <Link 
                      href={`/jugadores/${p.id}`} 
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-black/30 transition-all hover:border-primary/50 block w-full"
                    >
                      <div className="w-12 h-12 bg-secondary rounded flex justify-center items-center font-black text-xl text-muted-foreground shrink-0 overflow-hidden">
                        {p.user?.image || p.user?.customAvatarUrl ? (
                          <img src={p.user.image || p.user.customAvatarUrl!} alt={p.nick} className="w-full h-full object-cover grayscale opacity-70" />
                        ) : p.nick.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="font-bold truncate">{p.nick}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded uppercase">Disponible</span>
                          {p.primaryPosition && p.primaryPosition !== "Ninguna" && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.primaryPosition}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    {canManage && (
                      <button 
                        disabled={isPending}
                        onClick={(e) => { e.preventDefault(); handleToggleCallUp(p.id, true); }}
                        className="absolute right-2 top-2 bg-primary text-primary-foreground p-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-md shadow-primary/20"
                      >
                        Convocar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {showGraphicModal && (
        <NationalTeamGraphicModal 
          isOpen={showGraphicModal} 
          onClose={() => setShowGraphicModal(false)}
          team={activeTeam}
          players={calledUpPlayers}
          allClubs={allClubs}
        />
      )}
    </div>
  );
}

