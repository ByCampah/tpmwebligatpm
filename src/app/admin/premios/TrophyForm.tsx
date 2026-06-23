"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalName = presetName === "CUSTOM" ? customName : presetName;

    await submitTrophy({
      name: finalName,
      type,
      tournamentId: tournamentId || null,
      teamId: type === "TEAM" ? teamId : null,
      playerId: type === "PLAYER" ? playerId : null
    });

    setPresetName("");
    setCustomName("");
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
            value={type} onChange={e => setType(e.target.value)}
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
      )}

      <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">
        {loading ? "GUARDANDO..." : "OTORGAR TROFEO"}
      </button>

    </form>
  );
}
