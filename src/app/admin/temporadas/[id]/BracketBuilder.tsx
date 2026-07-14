"use client";

import { useState } from "react";
import { saveBracketData } from "@/app/actions";

interface BracketBuilderProps {
  tournamentId: string;
  participantsData: any[];
  initialData: any;
  type?: "team" | "player";
  onSave?: (id: string, bracketData: any) => Promise<{success: boolean, error?: string}>;
}

export default function BracketBuilder({ tournamentId, participantsData, initialData, type = "team", onSave }: BracketBuilderProps) {
  const [loading, setLoading] = useState(false);
  
  // Default structure if no data
  const defaultBracket = {
    size: "custom", // We change size to custom to mark it as new format, but it doesn't strictly matter
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
        matches: [
          { id: "f1", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "" },
          { id: "3rd", teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "", isThirdPlace: true, label: "Tercer Puesto" }
        ]
      }
    ]
  };

  const [bracket, setBracket] = useState<any>(initialData && initialData.rounds ? initialData : defaultBracket);

  const updateMatch = (roundIndex: number, matchIndex: number, field: string, value: string) => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].matches[matchIndex][field] = value;
    setBracket(newBracket);
  };

  const updateRoundName = (roundIndex: number, name: string) => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].name = name;
    setBracket(newBracket);
  };

  const addRound = () => {
    const newBracket = { ...bracket };
    newBracket.rounds.push({
      name: `Ronda ${newBracket.rounds.length + 1}`,
      matches: []
    });
    setBracket(newBracket);
  };

  const removeRound = (roundIndex: number) => {
    if (!confirm("¿Borrar esta ronda entera?")) return;
    const newBracket = { ...bracket };
    newBracket.rounds.splice(roundIndex, 1);
    setBracket(newBracket);
  };

  const addMatch = (roundIndex: number, nodeType: "match" | "spacer" | "title" = "match") => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].matches.push({
      id: `m_${Date.now()}`, 
      nodeType,
      teamA: "", teamB: "", scoreA: "", scoreB: "", penA: "", penB: "",
      titleText: nodeType === "title" ? "NUEVO TÍTULO" : ""
    });
    setBracket(newBracket);
  };

  const removeMatch = (roundIndex: number, matchIndex: number) => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].matches.splice(matchIndex, 1);
    setBracket(newBracket);
  };

  const saveBracket = async () => {
    setLoading(true);
    const saveFn = onSave || saveBracketData;
    const res = await saveFn(tournamentId, bracket);
    setLoading(false);
    if (res.success) {
      alert("Llave guardada exitosamente");
    } else {
      alert("Error al guardar: " + res.error);
    }
  };

  const clearBracket = () => {
    if (confirm("¿Seguro que deseas borrar toda la llave?")) {
      setBracket({ size: "custom", rounds: [] });
    }
  };

  const renderSelect = (match: any, field: "teamA" | "teamB", roundIndex: number, matchIndex: number) => {
    return (
      <select 
        className="flex-1 bg-black border border-border rounded p-1.5 text-sm focus:border-primary text-white"
        value={match[field]}
        onChange={e => updateMatch(roundIndex, matchIndex, field, e.target.value)}
      >
        <option value="">{type === "team" ? "-- Equipo --" : "-- Jugador --"}</option>
        {participantsData.map(p => {
          const val = type === "team" ? p.team?.id : p.player?.id;
          const name = type === "team" ? p.team?.name : p.player?.nick;
          return <option key={val} value={val}>{name}</option>;
        })}
      </select>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <label className="font-bold text-sm text-muted-foreground">Constructor Libre de Llaves</label>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRound} className="bg-emerald-500/20 text-emerald-400 font-bold py-2 px-4 rounded hover:bg-emerald-500/40 transition-colors text-sm">
            + Añadir Ronda
          </button>
          <button onClick={clearBracket} className="bg-destructive/20 text-destructive font-bold py-2 px-4 rounded hover:bg-destructive/40 transition-colors text-sm">
            Limpiar Todo
          </button>
          <button onClick={saveBracket} disabled={loading} className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors shadow-lg">
            {loading ? "Guardando..." : "Guardar Llave"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="flex gap-12 min-w-max items-start">
          {bracket.rounds.map((round: any, rIndex: number) => (
            <div key={rIndex} className="flex flex-col gap-4 min-w-[280px]">
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                <input 
                  type="text" 
                  value={round.name} 
                  onChange={e => updateRoundName(rIndex, e.target.value)}
                  className="bg-transparent font-black text-xl text-primary outline-none flex-1 text-center"
                />
                <button onClick={() => removeRound(rIndex)} className="text-red-500 hover:text-red-400 font-bold px-2" title="Borrar Ronda">X</button>
              </div>
              
              <div className="flex flex-col justify-center flex-1 gap-4">
                {round.matches.map((match: any, mIndex: number) => (
                  <div key={match.id} className="bg-card border border-border rounded-lg p-3 shadow-md flex flex-col gap-2 relative z-10 group min-h-[60px]">
                    <button 
                      onClick={() => removeMatch(rIndex, mIndex)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                      X
                    </button>
                    
                    {match.nodeType === "spacer" && (
                      <div className="w-full h-full min-h-[70px] flex items-center justify-center text-muted-foreground/30 border-2 border-dashed border-border/10 rounded-lg">
                        ESPACIO VACÍO
                      </div>
                    )}
                    
                    {match.nodeType === "title" && (
                      <div className="w-full text-center flex flex-col justify-center py-4">
                        <input 
                          type="text" 
                          value={match.titleText || ""} 
                          onChange={e => updateMatch(rIndex, mIndex, "titleText", e.target.value)}
                          className="bg-transparent font-black text-primary/80 uppercase tracking-widest text-sm text-center outline-none border-b border-primary/20 w-full"
                          placeholder="TITULO AQUÍ"
                        />
                      </div>
                    )}

                    {(!match.nodeType || match.nodeType === "match") && (
                      <>
                        {match.label ? (
                          <input 
                            type="text" 
                            value={match.label} 
                            onChange={e => updateMatch(rIndex, mIndex, "label", e.target.value)}
                            className="text-center text-xs font-bold text-muted-foreground uppercase bg-transparent border-b border-border outline-none w-full mb-1"
                          />
                        ) : (
                          <button 
                            onClick={() => updateMatch(rIndex, mIndex, "label", "Título Opcional")}
                            className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground text-center"
                          >
                            + Título Sup.
                          </button>
                        )}
                        
                        {/* Elemento A */}
                    <div className="flex items-center gap-2">
                      {renderSelect(match, "teamA", rIndex, mIndex)}
                      <input 
                        type="text" 
                        placeholder="G" 
                        className="w-10 bg-black border border-border rounded p-1.5 text-center font-bold text-sm text-white"
                        value={match.scoreA}
                        onChange={e => updateMatch(rIndex, mIndex, "scoreA", e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="P" 
                        title="Penales/Desempate"
                        className="w-8 bg-black/50 border border-border rounded p-1.5 text-center text-xs text-muted-foreground"
                        value={match.penA}
                        onChange={e => updateMatch(rIndex, mIndex, "penA", e.target.value)}
                      />
                    </div>

                    {/* Elemento B */}
                    <div className="flex items-center gap-2">
                      {renderSelect(match, "teamB", rIndex, mIndex)}
                      <input 
                        type="text" 
                        placeholder="G" 
                        className="w-10 bg-black border border-border rounded p-1.5 text-center font-bold text-sm text-white"
                        value={match.scoreB}
                        onChange={e => updateMatch(rIndex, mIndex, "scoreB", e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="P" 
                        title="Penales/Desempate"
                        className="w-8 bg-black/50 border border-border rounded p-1.5 text-center text-xs text-muted-foreground"
                        value={match.penB}
                        onChange={e => updateMatch(rIndex, mIndex, "penB", e.target.value)}
                      />
                    </div>
                      </>
                    )}

                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-1 w-full">
                <button 
                  onClick={() => addMatch(rIndex, "match")}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded text-xs text-muted-foreground transition-colors"
                >
                  + Añadir Partido
                </button>
                <div className="flex gap-1 w-full">
                  <button 
                    onClick={() => addMatch(rIndex, "spacer")}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded text-[10px] text-muted-foreground transition-colors"
                  >
                    + Espacio
                  </button>
                  <button 
                    onClick={() => addMatch(rIndex, "title")}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded text-[10px] text-muted-foreground transition-colors"
                  >
                    + Título
                  </button>
                </div>
              </div>

            </div>
          ))}
          {bracket.rounds.length === 0 && (
            <div className="text-center text-muted-foreground w-full py-12">
              Llave vacía. Comienza añadiendo una ronda.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
