"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  addChallengeParticipant, 
  removeChallengeParticipant,
  saveChallengeGroupsData,
  awardChallengeTrophy,
  addMultipleChallengeParticipants
} from "@/app/actions/challenge-actions";
import BracketBuilder from "../../temporadas/[id]/BracketBuilder";
import { useRef, useCallback } from "react";
import { toPng } from 'html-to-image';
import { ChallengeSummaryImage } from "@/components/ChallengeSummaryImage";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export default function ChallengeClient({ challenge, allPlayers }: { challenge: any, allPlayers: any[] }) {
  const [activeTab, setActiveTab] = useState<"PARTICIPANTES" | "GRUPOS" | "LLAVES" | "PREMIOS" | "GRÁFICOS">("PARTICIPANTES");
  const [error, setError] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const downloadSummary = useCallback(() => {
    if (summaryRef.current === null) return;
    setLoading(true);
    toPng(summaryRef.current, { cacheBust: true, quality: 1, backgroundColor: '#0a0a0a' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `resumen-challenge-${challenge.name}.png`;
        link.href = dataUrl;
        link.click();
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo generar la imagen.");
        setLoading(false);
      });
  }, [summaryRef, challenge.name]);
  
  // Participantes Tab
  const [playerIdToAdd, setPlayerIdToAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleAddParticipant = async () => {
    if (!playerIdToAdd) return;
    setLoading(true);
    const res = await addChallengeParticipant(challenge.id, playerIdToAdd);
    setLoading(false);
    if (res.success) {
      setPlayerIdToAdd("");
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;
    setLoading(true);
    const res = await addMultipleChallengeParticipants(challenge.id, bulkText);
    setLoading(false);
    if (res.success) {
      setBulkText("");
      let msg = `Se añadieron ${res.added.length} jugadores.`;
      if (res.notFound.length > 0) {
        msg += `\n\nNo encontrados:\n${res.notFound.join(', ')}`;
      }
      if (res.alreadyExists.length > 0) {
        msg += `\n\nYa estaban anotados:\n${res.alreadyExists.join(', ')}`;
      }
      alert(msg);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("Quitar participante?")) return;
    setLoading(true);
    const res = await removeChallengeParticipant(participantId, challenge.id);
    setLoading(false);
    if (!res.success) alert("Error: " + res.error);
  };

  // Grupos Tab
  const [groups, setGroups] = useState<any[]>(typeof challenge.groupsData === 'string' ? JSON.parse(challenge.groupsData || "[]") : challenge.groupsData || []);
  
  const addGroup = () => {
    setGroups([...groups, { name: `Grupo ${groups.length + 1}`, players: [ { nick: "", score: "" } ] }]);
  };

  const addPlayerToGroup = (gIndex: number) => {
    const newGroups = [...groups];
    newGroups[gIndex].players.push({ nick: "", score: "" });
    setGroups(newGroups);
  };

  const updateGroupPlayer = (gIndex: number, pIndex: number, field: string, value: string) => {
    const newGroups = [...groups];
    newGroups[gIndex].players[pIndex][field] = value;
    setGroups(newGroups);
  };

  const removeGroup = (gIndex: number) => {
    const newGroups = [...groups];
    newGroups.splice(gIndex, 1);
    setGroups(newGroups);
  };

  const saveGroups = async () => {
    setLoading(true);
    const res = await saveChallengeGroupsData(challenge.id, groups);
    setLoading(false);
    if (res.success) alert("Grupos guardados");
    else alert("Error: " + res.error);
  };

  // Premios Tab
  const [rank1, setRank1] = useState("");
  const [rank2, setRank2] = useState("");
  const [rank3, setRank3] = useState("");

  const handleAwardTrophy = async (rank: 1 | 2 | 3, playerId: string) => {
    if (!playerId) return alert("Selecciona un jugador");
    setLoading(true);
    const res = await awardChallengeTrophy(challenge.id, playerId, rank);
    setLoading(false);
    if (res.success) alert(`Premio otorgado al jugador con éxito.`);
    else alert("Error: " + res.error);
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-secondary/30 p-6 rounded-xl border border-border">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <Link href="/admin/challenges" className="text-muted-foreground hover:text-white transition-colors text-sm font-bold">← Volver a Challenges</Link>
          </div>
          <h1 className="text-3xl font-black text-white">{challenge.name}</h1>
          <p className="text-primary font-bold">{challenge.type}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 bg-black/40 p-2 rounded-xl border border-border">
        {["PARTICIPANTES", "GRUPOS", "LLAVES", "PREMIOS", "GRÁFICOS"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-4 text-center font-black uppercase tracking-wider transition-colors rounded-lg text-sm ${activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PARTICIPANTES TAB */}
      {activeTab === "PARTICIPANTES" && (
        <div className="flex flex-col gap-6">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-xl font-black text-primary mb-4">Añadir Participante Individual</h2>
            
            <form action={handleAddParticipant} className="flex flex-col gap-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <SearchableSelect
                    name="playerIdToAdd"
                    options={allPlayers
                      .filter(p => !challenge.participants.find((cp: any) => cp.playerId === p.id))
                      .map(p => ({ value: p.id, label: p.nick }))}
                    defaultValue={playerIdToAdd}
                    placeholder="-- Buscar y Seleccionar Jugador --"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-bold px-6 py-2 h-10 rounded hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    // Update state from hidden input created by SearchableSelect
                    const input = document.querySelector('input[name="playerIdToAdd"]') as HTMLInputElement;
                    if (input) setPlayerIdToAdd(input.value);
                  }}
                >
                  Añadir Uno
                </button>
              </div>
            </form>
          </div>

          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-xl font-black text-primary mb-4">Carga Masiva (Varios a la vez)</h2>
            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full bg-black border border-border p-3 rounded focus:outline-none focus:border-primary text-white text-sm min-h-[120px]"
                placeholder="Pega aquí los nicks separados por comas o saltos de línea... (Ej: Campah, Messi, Cr7)"
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
              />
              <button 
                onClick={handleBulkAdd}
                disabled={loading || !bulkText.trim()}
                className="bg-emerald-600 text-white font-bold px-6 py-3 rounded hover:bg-emerald-500 transition-colors w-fit"
              >
                Añadir Lista Completa
              </button>
            </div>
          </div>

          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-xl font-black text-white mb-4">Participantes ({challenge.participants.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {challenge.participants.map((p: any) => (
                <div key={p.id} className="bg-card border border-border p-3 rounded flex justify-between items-center">
                  <span className="font-bold text-white">{p.player.nick}</span>
                  <button 
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="text-red-500 hover:text-red-400 font-bold"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRUPOS TAB */}
      {activeTab === "GRUPOS" && (
        <div className="flex flex-col gap-6">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-primary">Grupos / Rooms (Manual)</h2>
              <div className="flex gap-2">
                <button onClick={addGroup} className="bg-emerald-500/20 text-emerald-400 font-bold py-2 px-4 rounded hover:bg-emerald-500/40 text-sm">
                  + Añadir Grupo
                </button>
                <button onClick={saveGroups} disabled={loading} className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors shadow-lg text-sm">
                  Guardar Grupos
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((g, gIndex) => (
                <div key={gIndex} className="bg-card border border-border rounded-xl p-4 shadow-lg flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <input 
                      type="text" 
                      value={g.name} 
                      onChange={e => {
                        const newGroups = [...groups];
                        newGroups[gIndex].name = e.target.value;
                        setGroups(newGroups);
                      }}
                      className="bg-transparent font-black text-lg text-primary outline-none flex-1"
                    />
                    <button onClick={() => removeGroup(gIndex)} className="text-red-500 hover:text-red-400 font-bold text-xs">Borrar</button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {g.players.map((p: any, pIndex: number) => (
                      <div key={pIndex} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Nick" 
                          value={p.nick} 
                          onChange={e => updateGroupPlayer(gIndex, pIndex, "nick", e.target.value)}
                          className="flex-1 bg-black border border-border p-2 rounded text-sm text-white"
                        />
                        <input 
                          type="text" 
                          placeholder="Pts/Goles" 
                          value={p.score} 
                          onChange={e => updateGroupPlayer(gIndex, pIndex, "score", e.target.value)}
                          className="w-20 bg-black border border-border p-2 rounded text-sm text-center font-bold text-primary"
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addPlayerToGroup(gIndex)} className="text-xs font-bold text-muted-foreground hover:text-white transition-colors py-2 border border-dashed border-border rounded">
                    + Añadir Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LLAVES TAB */}
      {activeTab === "LLAVES" && (
        <div className="bg-secondary/30 p-6 rounded-xl border border-border overflow-hidden">
          <BracketBuilder 
            tournamentId={challenge.id} 
            participantsData={challenge.participants} 
            initialData={typeof challenge.bracketData === 'string' ? JSON.parse(challenge.bracketData) : challenge.bracketData} 
            type="player"
          />
        </div>
      )}

      {/* PREMIOS TAB */}
      {activeTab === "PREMIOS" && (
        <div className="bg-secondary/30 p-6 rounded-xl border border-border">
          <h2 className="text-xl font-black text-primary mb-6">Otorgar Premios de Challenge</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Al otorgar estos premios, aparecerán inmediatamente en el Perfil del Jugador. 
            ¡Asegúrate de que sean los ganadores correctos!
          </p>

          <div className="flex flex-col gap-4 max-w-lg">
            <div className="bg-card p-4 rounded border border-border flex items-center gap-4">
              <span className="text-2xl">🥇</span>
              <select 
                className="flex-1 bg-black border border-border p-2 rounded focus:outline-none focus:border-primary text-white"
                value={rank1} onChange={e => setRank1(e.target.value)}
              >
                <option value="">-- Campeón --</option>
                {challenge.participants.map((p: any) => <option key={p.id} value={p.playerId}>{p.player.nick}</option>)}
              </select>
              <button onClick={() => handleAwardTrophy(1, rank1)} className="bg-yellow-600/30 text-yellow-500 font-bold px-4 py-2 rounded hover:bg-yellow-600/50">Otorgar</button>
            </div>

            <div className="bg-card p-4 rounded border border-border flex items-center gap-4">
              <span className="text-2xl">🥈</span>
              <select 
                className="flex-1 bg-black border border-border p-2 rounded focus:outline-none focus:border-primary text-white"
                value={rank2} onChange={e => setRank2(e.target.value)}
              >
                <option value="">-- Segundo Puesto --</option>
                {challenge.participants.map((p: any) => <option key={p.id} value={p.playerId}>{p.player.nick}</option>)}
              </select>
              <button onClick={() => handleAwardTrophy(2, rank2)} className="bg-gray-400/30 text-gray-300 font-bold px-4 py-2 rounded hover:bg-gray-400/50">Otorgar</button>
            </div>

            <div className="bg-card p-4 rounded border border-border flex items-center gap-4">
              <span className="text-2xl">🥉</span>
              <select 
                className="flex-1 bg-black border border-border p-2 rounded focus:outline-none focus:border-primary text-white"
                value={rank3} onChange={e => setRank3(e.target.value)}
              >
                <option value="">-- Tercer Puesto --</option>
                {challenge.participants.map((p: any) => <option key={p.id} value={p.playerId}>{p.player.nick}</option>)}
              </select>
              <button onClick={() => handleAwardTrophy(3, rank3)} className="bg-orange-700/30 text-orange-600 font-bold px-4 py-2 rounded hover:bg-orange-700/50">Otorgar</button>
            </div>
          </div>
        </div>
      )}

      {/* GRAFICOS TAB */}
      {activeTab === "GRÁFICOS" && (
        <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col gap-6">
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-border">
            <div>
              <h2 className="text-xl font-black text-primary">Generador de Imagen de Resumen</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Genera una imagen descargable con los grupos y las llaves del torneo.
              </p>
            </div>
            <button 
              onClick={downloadSummary}
              disabled={loading}
              className="bg-primary text-primary-foreground font-black px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              {loading ? "Generando..." : "Descargar Imagen"}
            </button>
          </div>

          {error && <p className="text-red-500 font-bold bg-red-500/10 p-4 rounded-lg">{error}</p>}

          <div className="overflow-x-auto bg-black/50 p-4 rounded-xl border border-border">
            <div className="min-w-fit origin-top-left scale-[0.8] mb-[-20%]">
              <ChallengeSummaryImage ref={summaryRef} challenge={challenge} layout="vertical" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
