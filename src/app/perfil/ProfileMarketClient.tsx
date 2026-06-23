"use client";

import { useState } from "react";
import { toggleFreeAgent, toggleTeamLookingForPlayers } from "@/app/actions/market";

export default function ProfileMarketClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const handleFreeAgentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const res = await toggleFreeAgent(e.target.checked);
    if (!res.success) {
      alert(res.error);
      e.target.checked = !e.target.checked; // Revert visually
    }
    setLoading(false);
  };

  const handleTeamToggle = async (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const res = await toggleTeamLookingForPlayers(teamId, e.target.checked);
    if (!res.success) {
      alert(res.error);
      e.target.checked = !e.target.checked; // Revert visually
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-primary/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.1)]">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-5 bg-primary rounded-full inline-block"></span>
        Mercado de Pases
      </h2>

      {/* Free Agent Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-gray-700/50 pb-2">
          Mi Estado
        </h3>
        
        {user.player ? (
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start mt-1">
              <input 
                type="checkbox" 
                defaultChecked={user.player.isFreeAgent}
                onChange={handleFreeAgentToggle}
                disabled={loading}
                className="peer sr-only"
              />
              <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-primary transition-colors">Soy Agente Libre</div>
              <div className="text-xs text-muted-foreground mt-1">
                Al activar esto, aparecerás en el Mercado de Pases indicando que estás buscando equipo.
              </div>
            </div>
          </label>
        ) : (
          <div className="text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
            No podés ofrecerte como Agente Libre porque no tenés un jugador vinculado a tu cuenta. Contactá a la administración.
          </div>
        )}
      </div>

      {/* Teams Looking for Players Section */}
      {user.captainOfTeams && user.captainOfTeams.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-gray-700/50 pb-2">
            Mis Equipos
          </h3>
          
          <div className="space-y-4">
            {user.captainOfTeams.map((team: any) => (
              <label key={team.id} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start mt-1">
                  <input 
                    type="checkbox" 
                    defaultChecked={team.isLookingForPlayers}
                    onChange={(e) => handleTeamToggle(team.id, e)}
                    disabled={loading}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-[10px]">{team.name.charAt(0)}</span>
                    )}
                    {team.name} busca jugadores
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    El equipo aparecerá en la sección derecha del mercado buscando incorporaciones.
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
