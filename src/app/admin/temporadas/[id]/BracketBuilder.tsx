"use client";

import { useState } from "react";
import { saveBracketData } from "@/app/actions";

interface BracketBuilderProps {
  tournamentId: string;
  enrolledTeamsData: any[];
  initialData: any;
}

export default function BracketBuilder({ tournamentId, enrolledTeamsData, initialData }: BracketBuilderProps) {
  const [loading, setLoading] = useState(false);
  
  // Default structure if no data
  const defaultBracket = {
    size: 8,
    rounds: [
      {
        name: "Cuartos de Final",
        matches: Array(4).fill(null).map((_, i) => ({ id: `q${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }))
      },
      {
        name: "Semifinal",
        matches: Array(2).fill(null).map((_, i) => ({ id: `s${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }))
      },
      {
        name: "Final",
        matches: [{ id: "f1", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }]
      }
    ]
  };

  const [bracket, setBracket] = useState<any>(initialData || defaultBracket);

  const handleSizeChange = (size: number) => {
    let rounds = [];
    if (size === 4) {
      rounds = [
        { name: "Semifinal", matches: Array(2).fill(null).map((_, i) => ({ id: `s${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Final", matches: [{ id: "f1", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }] }
      ];
    } else if (size === 8) {
      rounds = [
        { name: "Cuartos de Final", matches: Array(4).fill(null).map((_, i) => ({ id: `q${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Semifinal", matches: Array(2).fill(null).map((_, i) => ({ id: `s${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Final", matches: [{ id: "f1", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }] }
      ];
    } else if (size === 16) {
      rounds = [
        { name: "Octavos de Final", matches: Array(8).fill(null).map((_, i) => ({ id: `o${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Cuartos de Final", matches: Array(4).fill(null).map((_, i) => ({ id: `q${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Semifinal", matches: Array(2).fill(null).map((_, i) => ({ id: `s${i+1}`, teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" })) },
        { name: "Final", matches: [{ id: "f1", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" }] }
      ];
    }
    setBracket({ size, rounds });
  };

  const updateMatch = (roundIndex: number, matchIndex: number, field: string, value: string) => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].matches[matchIndex][field] = value;
    setBracket(newBracket);
  };

  const saveBracket = async () => {
    setLoading(true);
    const res = await saveBracketData(tournamentId, bracket);
    setLoading(false);
    if (res.success) {
      alert("Llave guardada exitosamente");
    } else {
      alert("Error al guardar: " + res.error);
    }
  };

  const clearBracket = () => {
    if (confirm("¿Seguro que deseas borrar toda la llave? Esto eliminará todos los cruces y resultados actuales.")) {
      handleSizeChange(bracket.size);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <label className="font-bold text-sm text-muted-foreground">Tamaño de Llave:</label>
          <select 
            className="bg-black border border-border p-2 rounded focus:outline-none focus:border-primary"
            value={bracket.size}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
          >
            <option value={4}>4 Equipos (Semis y Final)</option>
            <option value={8}>8 Equipos (Cuartos a Final)</option>
            <option value={16}>16 Equipos (Octavos a Final)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearBracket} className="bg-destructive/20 text-destructive font-bold py-2 px-4 rounded hover:bg-destructive/40 transition-colors">
            Limpiar Todo
          </button>
          <button onClick={saveBracket} disabled={loading} className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors shadow-lg">
            {loading ? "Guardando..." : "Guardar Llave"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="flex gap-12 min-w-max">
          {bracket.rounds.map((round: any, rIndex: number) => (
            <div key={rIndex} className="flex flex-col gap-4 min-w-[280px]">
              <h3 className="text-center font-black text-xl text-primary mb-4">{round.name}</h3>
              
              <div className="flex flex-col justify-around flex-1 gap-4">
                {round.matches.map((match: any, mIndex: number) => (
                  <div key={match.id} className="bg-card border border-border rounded-lg p-3 shadow-md flex flex-col gap-2 relative z-10">
                    
                    {/* Equipo A */}
                    <div className="flex items-center gap-2">
                      <select 
                        className="flex-1 bg-black border border-border rounded p-1.5 text-sm focus:border-primary"
                        value={match.teamA}
                        onChange={e => updateMatch(rIndex, mIndex, "teamA", e.target.value)}
                      >
                        <option value="">-- Equipo --</option>
                        {enrolledTeamsData.map(t => (
                          <option key={`a_${t.team.id}`} value={t.team.id}>{t.team.name}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        placeholder="G" 
                        className="w-10 bg-black border border-border rounded p-1.5 text-center font-bold text-sm"
                        value={match.scoreA}
                        onChange={e => updateMatch(rIndex, mIndex, "scoreA", e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="P" 
                        title="Penales"
                        className="w-8 bg-black/50 border border-border rounded p-1.5 text-center text-xs text-muted-foreground"
                        value={match.penA}
                        onChange={e => updateMatch(rIndex, mIndex, "penA", e.target.value)}
                      />
                    </div>

                    {/* Equipo B */}
                    <div className="flex items-center gap-2">
                      <select 
                        className="flex-1 bg-black border border-border rounded p-1.5 text-sm focus:border-primary"
                        value={match.teamB}
                        onChange={e => updateMatch(rIndex, mIndex, "teamB", e.target.value)}
                      >
                        <option value="">-- Equipo --</option>
                        {enrolledTeamsData.map(t => (
                          <option key={`b_${t.team.id}`} value={t.team.id}>{t.team.name}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        placeholder="G" 
                        className="w-10 bg-black border border-border rounded p-1.5 text-center font-bold text-sm"
                        value={match.scoreB}
                        onChange={e => updateMatch(rIndex, mIndex, "scoreB", e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="P" 
                        title="Penales"
                        className="w-8 bg-black/50 border border-border rounded p-1.5 text-center text-xs text-muted-foreground"
                        value={match.penB}
                        onChange={e => updateMatch(rIndex, mIndex, "penB", e.target.value)}
                      />
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
