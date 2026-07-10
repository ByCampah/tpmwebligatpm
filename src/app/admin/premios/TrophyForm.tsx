"use client";

import { useState, useEffect } from "react";
import { submitTrophy } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function TrophyForm({ tournaments, teams, players }: { tournaments: any[], teams: any[], players: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [presetName, setPresetName] = useState("");
  const [customName, setCustomName] = useState("");
  const [type, setType] = useState("PLAYER"); // PLAYER or TEAM
  const [tournamentId, setTournamentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [playerId, setPlayerId] = useState("");

  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [excludedPlayerIds, setExcludedPlayerIds] = useState<string[]>([]);
  const [fetchingPlayers, setFetchingPlayers] = useState(false);

  useEffect(() => {
    if (type === "TEAM" && teamId) {
      setFetchingPlayers(true);
      fetch(`/api/teams/${teamId}/players`)
        .then(res => res.json())
        .then(data => {
          setTeamPlayers(data);
          setExcludedPlayerIds([]); // Reset exclusions by default (everyone gets it)
          setFetchingPlayers(false);
        })
        .catch(e => {
          console.error(e);
          setFetchingPlayers(false);
        });
    } else {
      setTeamPlayers([]);
      setExcludedPlayerIds([]);
    }
  }, [type, teamId]);

  const toggleExclusion = (id: string) => {
    if (excludedPlayerIds.includes(id)) {
      setExcludedPlayerIds(prev => prev.filter(p => p !== id)); // Remove from exclusion (gets trophy)
    } else {
      setExcludedPlayerIds(prev => [...prev, id]); // Add to exclusion (does not get trophy)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalName = presetName === "CUSTOM" ? customName : presetName;

    await submitTrophy({
      name: finalName,
      type,
      tournamentId: tournamentId || null,
      teamId: type === "TEAM" ? teamId : null,
      playerId: type === "PLAYER" ? playerId : null,
      excludedPlayerIds: type === "TEAM" ? excludedPlayerIds : []
    });

    setPresetName("");
    setCustomName("");
    setExcludedPlayerIds([]);
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-secondary/30 p-6 rounded-xl border border-border">
      
      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">Premio / Posición</label>
        <select 
          required 
          className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
          value={presetName} onChange={e => setPresetName(e.target.value)}
        >
          <option value="">Selecciona el premio...</option>
          <option value="Campeón (1er Puesto)">Campeón (1er Puesto)</option>
          <option value="Subcampeón (2do Puesto)">Subcampeón (2do Puesto)</option>
          <option value="Tercer Puesto (3ro)">Tercer Puesto (3ro)</option>
          <option value="Goleador">Goleador</option>
          <option value="Mejor Asistidor">Mejor Asistidor</option>
          <option value="Valla Invicta">Valla Invicta</option>
          <option value="MVP">MVP (Mejor Jugador)</option>
          <option value="CUSTOM">Otro (Personalizado...)</option>
        </select>
        
        {presetName === "CUSTOM" && (
          <input 
            type="text" required 
            className="w-full bg-black border border-border rounded p-3 mt-2 focus:border-primary focus:outline-none"
            placeholder="Escribe el nombre del premio..."
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-1">Tipo de Premio</label>
          <select 
            className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
            value={type} onChange={e => { setType(e.target.value); setTeamId(""); setPlayerId(""); }}
          >
            <option value="PLAYER">Premio Individual (Jugador)</option>
            <option value="TEAM">Premio Grupal (Equipo)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-1">Torneo (Opcional)</label>
          <select 
            className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
            value={tournamentId} onChange={e => setTournamentId(e.target.value)}
          >
            <option value="">Selecciona un torneo...</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.season.name})</option>)}
          </select>
        </div>
      </div>

      {type === "PLAYER" ? (
        <div>
          <label className="block text-sm font-bold text-primary mb-1">Jugador Galardonado</label>
          <select 
            required
            className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
            value={playerId} onChange={e => setPlayerId(e.target.value)}
          >
            <option value="">Selecciona un jugador...</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.nick}</option>)}
          </select>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-1">Equipo Galardonado</label>
            <select 
              required
              className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
              value={teamId} onChange={e => setTeamId(e.target.value)}
            >
              <option value="">Selecciona un equipo...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          {teamId && (
            <div className="bg-black/50 border border-border rounded p-4">
              <h3 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Exclusión de Jugadores
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Desmarca a los jugadores de la plantilla actual que <b>NO</b> deben recibir este trofeo (ej. no cumplieron con los partidos mínimos requeridos).
              </p>
              
              {fetchingPlayers ? (
                <div className="text-sm text-muted-foreground animate-pulse">Cargando plantilla...</div>
              ) : teamPlayers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {teamPlayers.map(p => {
                    const receivesTrophy = !excludedPlayerIds.includes(p.id);
                    return (
                      <label key={p.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${receivesTrophy ? 'bg-primary/10 border-primary text-white' : 'bg-secondary/30 border-border text-muted-foreground'}`}>
                        <input 
                          type="checkbox" 
                          className="accent-primary"
                          checked={receivesTrophy}
                          onChange={() => toggleExclusion(p.id)}
                        />
                        <span className="text-sm font-medium">{p.nick}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-yellow-500 bg-yellow-500/10 p-2 rounded">
                  No se encontraron jugadores en este equipo para la temporada activa.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
        {loading ? "GUARDANDO..." : "OTORGAR TROFEO"}
      </button>

    </form>
  );
}
