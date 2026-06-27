"use client";

import { useState } from "react";
import { toggleFreeAgent, toggleTeamLookingForPlayers } from "@/app/actions/market";
import { updatePlayerProfile } from "@/app/actions/profile";

export default function ProfileMarketClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const [freeAgentDesc, setFreeAgentDesc] = useState(user.player?.marketDescription || "");
  const [teamDescs, setTeamDescs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (user.captainOfTeams) {
      user.captainOfTeams.forEach((t: any) => {
        init[t.id] = t.marketDescription || "";
      });
    }
    return init;
  });

  const handleFreeAgentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const res = await toggleFreeAgent(e.target.checked, freeAgentDesc);
    if (!res.success) {
      alert(res.error);
      e.target.checked = !e.target.checked; // Revert visually
    }
    setLoading(false);
  };

  const handleSaveFreeAgentDesc = async (isChecked: boolean) => {
    setLoading(true);
    const res = await toggleFreeAgent(isChecked, freeAgentDesc);
    if (!res.success) alert(res.error);
    else alert("Mensaje guardado correctamente.");
    setLoading(false);
  };

  const handleTeamToggle = async (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const res = await toggleTeamLookingForPlayers(teamId, e.target.checked, teamDescs[teamId]);
    if (!res.success) {
      alert(res.error);
      e.target.checked = !e.target.checked; // Revert visually
    }
    setLoading(false);
  };

  const handleSaveTeamDesc = async (teamId: string, isChecked: boolean) => {
    setLoading(true);
    const res = await toggleTeamLookingForPlayers(teamId, isChecked, teamDescs[teamId]);
    if (!res.success) alert(res.error);
    else alert("Mensaje guardado correctamente.");
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updatePlayerProfile(formData);
    if (!res.success) alert(res.error);
    else alert("Perfil actualizado correctamente.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Player Profile Section */}
      {user.player && (
        <div className="bg-gray-800/50 backdrop-blur border border-primary/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-primary rounded-full inline-block"></span>
            Ajustes del Jugador
          </h2>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-lg">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nacionalidad Sugerida</label>
              <select 
                name="nationality" 
                defaultValue={user.player.nationality || "Sin Nacionalidad"} 
                className="w-full bg-black border border-border rounded p-3 text-white focus:border-primary focus:outline-none"
              >
                <option value="Sin Nacionalidad">Sin Nacionalidad</option>
                <option value="Argentina">Argentina</option>
                <option value="Brasil">Brasil</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Chile">Chile</option>
                <option value="Colombia">Colombia</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Peru">Perú</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Mexico">México</option>
                <option value="USA">Estados Unidos</option>
                <option value="Espana">España</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Posición Principal</label>
                <select 
                  name="primaryPosition" 
                  defaultValue={user.player.primaryPosition || "Ninguna"} 
                  className="w-full bg-black border border-border rounded p-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="Ninguna">Ninguna</option>
                  <option value="Todas">Todas</option>
                  <option value="GK">GK (Portero)</option>
                  <option value="ZAG">ZAG (Defensa)</option>
                  <option value="ALA">ALA (Banda)</option>
                  <option value="ATK">ATK (Delantero)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Posición Secundaria</label>
                <select 
                  name="secondaryPosition" 
                  defaultValue={user.player.secondaryPosition || "Ninguna"} 
                  className="w-full bg-black border border-border rounded p-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="Ninguna">Ninguna</option>
                  <option value="Todas">Todas</option>
                  <option value="GK">GK (Portero)</option>
                  <option value="ZAG">ZAG (Defensa)</option>
                  <option value="ALA">ALA (Banda)</option>
                  <option value="ATK">ATK (Delantero)</option>
                </select>
              </div>
            </div>
            
            <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-2 rounded-lg hover:bg-primary/90 transition-colors mt-2">
              GUARDAR PERFIL
            </button>
          </form>
        </div>
      )}

      {/* Market Section */}
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
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start mt-1">
                <input 
                  id="freeAgentCheck"
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
            
            <div className="pl-13 mt-2">
              <textarea 
                placeholder="Ej: Juego de delantero, mis horarios son y quiero un equipo chill..."
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none resize-none h-20 mb-2"
                value={freeAgentDesc}
                onChange={e => setFreeAgentDesc(e.target.value)}
                disabled={loading}
              />
              <button 
                onClick={() => handleSaveFreeAgentDesc((document.getElementById('freeAgentCheck') as HTMLInputElement)?.checked || false)}
                disabled={loading}
                className="bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors px-3 py-1.5 rounded font-bold text-xs"
              >
                Guardar Mensaje
              </button>
            </div>
          </div>
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
              <div key={team.id} className="flex flex-col gap-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-start mt-1">
                    <input 
                      id={`teamCheck-${team.id}`}
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

                <div className="pl-13 mt-2">
                  <textarea 
                    placeholder="Ej: Estamos buscando un arquero mas que nada, mandar msj al priv..."
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none resize-none h-20 mb-2"
                    value={teamDescs[team.id]}
                    onChange={e => setTeamDescs(prev => ({...prev, [team.id]: e.target.value}))}
                    disabled={loading}
                  />
                  <button 
                    onClick={() => handleSaveTeamDesc(team.id, (document.getElementById(`teamCheck-${team.id}`) as HTMLInputElement)?.checked || false)}
                    disabled={loading}
                    className="bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors px-3 py-1.5 rounded font-bold text-xs"
                  >
                    Guardar Mensaje
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
