"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMatchStats } from "@/app/actions";

export default function MatchManagerClient({ initialMatches }: { initialMatches: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("TODOS");
  const [editingMatch, setEditingMatch] = useState<any | null>(null);
  
  const [homeScore, setHomeScore] = useState<number | "">("");
  const [awayScore, setAwayScore] = useState<number | "">("");
  const [editingEvents, setEditingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats Modal Methods
  const getPlayersForTeam = (tournament: any, teamId: string) => {
    const tteam = tournament.teams.find((t: any) => t.teamId === teamId);
    return tteam?.players || [];
  };

  const addEvent = (type: string) => {
    setEditingEvents([...editingEvents, { id: Date.now().toString(), type, minute: "", playerNick: "", assistNick: "", teamId: "" }]);
  };

  const updateEvent = (id: string, field: string, value: string) => {
    setEditingEvents(editingEvents.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvent = (id: string) => {
    setEditingEvents(editingEvents.filter(e => e.id !== id));
  };

  const handleMatchSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const playerStats = [];
    
    // Recopilar stats de todos los jugadores de ambos equipos
    const hPlayers = getPlayersForTeam(editingMatch.tournament, editingMatch.homeTeam.id);
    const aPlayers = getPlayersForTeam(editingMatch.tournament, editingMatch.awayTeam.id);
    const allPlayers = [...hPlayers, ...aPlayers];

    for (const p of allPlayers) {
      const pId = p.player.id;
      const goals = formData.get(`stats[${pId}][goals]`);
      // Si mandó algún dato aunque sea 0, lo enviamos (significa que está en el DOM)
      if (goals !== null) {
        playerStats.push({
          playerId: pId,
          goals: goals,
          assists: formData.get(`stats[${pId}][assists]`),
          fouls: formData.get(`stats[${pId}][fouls]`),
          fouled: formData.get(`stats[${pId}][fouled]`),
          offsides: formData.get(`stats[${pId}][offsides]`),
          ballLosses: formData.get(`stats[${pId}][ballLosses]`),
          tacklesWon: formData.get(`stats[${pId}][tacklesWon]`),
          passesMade: formData.get(`stats[${pId}][passesMade]`),
          passesTotal: formData.get(`stats[${pId}][passesTotal]`),
          slidingMade: formData.get(`stats[${pId}][slidingMade]`),
          slidingTotal: formData.get(`stats[${pId}][slidingTotal]`),
          shotsMade: formData.get(`stats[${pId}][shotsMade]`),
          shotsTotal: formData.get(`stats[${pId}][shotsTotal]`),
          headersMade: formData.get(`stats[${pId}][headersMade]`),
          headersTotal: formData.get(`stats[${pId}][headersTotal]`),
          savesMade: formData.get(`stats[${pId}][savesMade]`),
          savesTotal: formData.get(`stats[${pId}][savesTotal]`),
          matchTime: formData.get(`stats[${pId}][matchTime]`),
          gkTime: formData.get(`stats[${pId}][gkTime]`),
          cleanSheet: formData.get(`stats[${pId}][cleanSheet]`)
        });
      }
    }

    const res = await submitMatchStats({
      matchId: editingMatch.id,
      homeScore,
      awayScore,
      playerStats,
      eventsJson: JSON.stringify(editingEvents)
    });

    setLoading(false);
    if (res.success) {
      setEditingMatch(null);
      router.refresh();
      // small delay to re-fetch
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert("Error al guardar");
    }
  };

  const filteredMatches = initialMatches.filter(m => {
    if (filter === "PENDIENTES") return m.status === "SCHEDULED";
    if (filter === "JUGADOS") return m.status === "PLAYED";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 border-b border-border pb-4">
        <button onClick={() => setFilter("TODOS")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${filter === "TODOS" ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
          Todos los Partidos
        </button>
        <button onClick={() => setFilter("PENDIENTES")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${filter === "PENDIENTES" ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
          Pendientes
        </button>
        <button onClick={() => setFilter("JUGADOS")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${filter === "JUGADOS" ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
          Ya Jugados
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map(match => (
          <div key={match.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg hover:border-primary/50 transition-colors">
            
            <div className="flex justify-between items-center border-b border-border pb-2">
               <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                 {match.tournament.name}
               </span>
               <span className="text-xs font-bold bg-secondary px-2 py-1 rounded">
                 {match.round}
               </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center gap-2 w-1/3">
                {match.homeTeam.logoUrl ? (
                  <img src={match.homeTeam.logoUrl} className="w-12 h-12 object-contain" alt="" />
                ) : (
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold">{match.homeTeam.name.charAt(0)}</div>
                )}
                <span className="font-bold text-center text-sm truncate w-full">{match.homeTeam.name}</span>
              </div>
              
              <div className="w-1/3 flex flex-col items-center justify-center gap-1">
                {match.status === "PLAYED" ? (
                  <div className="bg-black border border-primary/30 px-3 py-2 rounded-lg shadow-inner flex items-center justify-center whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-black tracking-widest">{match.homeScore} - {match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-xl font-black text-muted-foreground">VS</span>
                )}
                {match.status === "PLAYED" && <span className="text-[10px] font-bold text-primary tracking-widest uppercase">FINALIZADO</span>}
              </div>

              <div className="flex flex-col items-center gap-2 w-1/3">
                {match.awayTeam.logoUrl ? (
                  <img src={match.awayTeam.logoUrl} className="w-12 h-12 object-contain" alt="" />
                ) : (
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold">{match.awayTeam.name.charAt(0)}</div>
                )}
                <span className="font-bold text-center text-sm truncate w-full">{match.awayTeam.name}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingMatch(match);
                setHomeScore(match.homeScore ?? "");
                setAwayScore(match.awayScore ?? "");
                setEditingEvents(match.events ? (typeof match.events === 'string' ? JSON.parse(match.events) : match.events) : []);
              }}
              className="mt-2 w-full py-2 bg-secondary hover:bg-primary hover:text-black font-bold rounded-lg transition-colors"
            >
              {match.status === "PLAYED" ? "Editar Estadísticas" : "Cargar Resultado"}
            </button>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <p className="text-muted-foreground p-8 text-center col-span-3 border border-dashed border-border rounded-xl">
            No se encontraron partidos.
          </p>
        )}
      </div>

      {editingMatch && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-primary/50 w-full max-w-5xl rounded-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border bg-black/50 rounded-t-2xl">
              <h3 className="text-2xl font-black neon-text uppercase">Carga de Partido</h3>
              <button onClick={() => setEditingMatch(null)} className="text-muted-foreground hover:text-white bg-secondary w-8 h-8 rounded-full font-bold">X</button>
            </div>
            
            <form key={editingMatch.id} onSubmit={handleMatchSubmit} className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar relative">
              
              {/* RESULTADO HEADER */}
              <div className="flex justify-center items-center gap-8 bg-black/30 p-6 rounded-xl border border-border">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-black text-xl text-primary">{editingMatch.homeTeam.name}</span>
                  <input type="number" required min="0" value={homeScore} onChange={e => setHomeScore(e.target.value === "" ? "" : parseInt(e.target.value))} className="w-24 text-center text-4xl font-black bg-black border border-primary/50 rounded-xl p-2 focus:border-primary focus:outline-none" />
                </div>
                <span className="text-2xl font-black text-muted-foreground">VS</span>
                <div className="flex flex-col items-center gap-2">
                  <span className="font-black text-xl text-primary">{editingMatch.awayTeam.name}</span>
                  <input type="number" required min="0" value={awayScore} onChange={e => setAwayScore(e.target.value === "" ? "" : parseInt(e.target.value))} className="w-24 text-center text-4xl font-black bg-black border border-primary/50 rounded-xl p-2 focus:border-primary focus:outline-none" />
                </div>
              </div>

              {/* TIMELINE DE EVENTOS (Goles, Rojas, Asistencias) */}
              <div className="bg-secondary/20 p-6 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-lg text-primary uppercase">Eventos del Partido (Timeline)</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addEvent("GOAL")} className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/50 rounded text-xs font-bold hover:bg-green-500 hover:text-black transition-colors">+ Gol</button>
                    <button type="button" onClick={() => addEvent("FREE_KICK_GOAL")} className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/50 rounded text-xs font-bold hover:bg-green-500 hover:text-black transition-colors">+ Gol Tiro Libre</button>
                    <button type="button" onClick={() => addEvent("PENALTY_GOAL")} className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/50 rounded text-xs font-bold hover:bg-green-500 hover:text-black transition-colors">+ Gol Penal</button>
                    <button type="button" onClick={() => addEvent("RED_CARD")} className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-xs font-bold hover:bg-red-500 hover:text-black transition-colors">+ Roja</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {editingEvents.sort((a,b) => parseInt(a.minute||"0") - parseInt(b.minute||"0")).map((ev, idx) => (
                    <div key={ev.id} className="flex flex-wrap items-center gap-2 bg-black/50 p-2 border border-border rounded">
                      <select value={ev.teamId || ""} onChange={(e) => updateEvent(ev.id, "teamId", e.target.value)} className="bg-black border border-border rounded p-1 text-xs focus:border-primary" required>
                        <option value="">-- Equipo --</option>
                        <option value={editingMatch.homeTeam.id}>{editingMatch.homeTeam.name}</option>
                        <option value={editingMatch.awayTeam.id}>{editingMatch.awayTeam.name}</option>
                      </select>

                      <div className={`px-2 py-1 rounded text-xs font-bold ${ev.type.includes('GOAL') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {ev.type === 'GOAL' ? '⚽ GOL' : ev.type === 'FREE_KICK_GOAL' ? '🎯 GOL T.L.' : ev.type === 'PENALTY_GOAL' ? '🥅 GOL PENAL' : '🟥 ROJA'}
                      </div>
                      
                      <input type="number" placeholder="Min" value={ev.minute} onChange={(e) => updateEvent(ev.id, "minute", e.target.value)} className="w-16 bg-black border border-border rounded p-1 text-xs text-center focus:border-primary" required />
                      
                      {ev.teamId ? (
                        <select value={ev.playerNick} onChange={(e) => updateEvent(ev.id, "playerNick", e.target.value)} className="bg-black border border-border rounded p-1 text-xs focus:border-primary flex-1" required>
                          <option value="">-- Jugador ({ev.type.includes('GOAL') ? 'Gol' : 'Roja'}) --</option>
                          {getPlayersForTeam(editingMatch.tournament, ev.teamId).map((p: any) => (
                            <option key={p.player.id} value={p.player.nick}>{p.player.nick}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" placeholder="Jugador" disabled className="bg-black/50 border border-border rounded p-1 text-xs flex-1 opacity-50" />
                      )}

                      {ev.type === 'GOAL' && (
                        ev.teamId ? (
                          <select value={ev.assistNick || ""} onChange={(e) => updateEvent(ev.id, "assistNick", e.target.value)} className="bg-black border border-border rounded p-1 text-xs focus:border-primary flex-1">
                            <option value="">-- Asistencia (Opcional) --</option>
                            {getPlayersForTeam(editingMatch.tournament, ev.teamId).map((p: any) => (
                              <option key={p.player.id} value={p.player.nick}>{p.player.nick}</option>
                            ))}
                          </select>
                        ) : (
                          <input type="text" placeholder="Asistencia" disabled className="bg-black/50 border border-border rounded p-1 text-xs flex-1 opacity-50" />
                        )
                      )}

                      <button type="button" onClick={() => removeEvent(ev.id)} className="text-red-500 hover:bg-red-500/20 p-1 rounded font-bold w-6 h-6 flex justify-center items-center">X</button>
                    </div>
                  ))}
                  {editingEvents.length === 0 && (
                    <p className="text-muted-foreground text-sm italic py-2">No se han registrado eventos.</p>
                  )}
                </div>
              </div>

              {/* STATS DE JUGADORES */}
              <div className="flex flex-col gap-8">
                {[editingMatch.homeTeam, editingMatch.awayTeam].map(team => {
                  const players = getPlayersForTeam(editingMatch.tournament, team.id);
                  if (players.length === 0) return (
                    <div key={team.id} className="text-muted-foreground italic">No hay jugadores inscritos en {team.name} para este torneo.</div>
                  );

                  return (
                    <div key={team.id} className="flex flex-col gap-2">
                      <h4 className="font-black text-xl text-primary uppercase border-b border-border pb-2">{team.name} - Estadísticas</h4>
                      <div className="overflow-x-auto bg-black border border-border rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-secondary/50 text-secondary-foreground text-xs uppercase">
                            <tr>
                              <th className="p-2 font-black sticky left-0 bg-secondary z-10 min-w-[120px]">Jugador</th>
                              <th className="p-2 font-bold text-center text-green-400" title="Goles">GL</th>
                              <th className="p-2 font-bold text-center text-blue-400" title="Asistencias">AS</th>
                              <th className="p-2 font-bold text-center text-red-400" title="Faltas">FL</th>
                              <th className="p-2 font-bold text-center text-red-400" title="Faltas Recibidas">FR</th>
                              <th className="p-2 font-bold text-center text-yellow-500" title="Fueras de Juego">OF</th>
                              <th className="p-2 font-bold text-center text-orange-400" title="Pérdidas">PE</th>
                              <th className="p-2 font-bold text-center text-emerald-400" title="Quites">QT</th>
                              <th className="p-2 font-bold text-center text-emerald-400" title="Portería a cero">V0</th>
                              <th className="p-2 font-bold text-center" title="Pases">PASES</th>
                              <th className="p-2 font-bold text-center" title="Barridas">BARR</th>
                              <th className="p-2 font-bold text-center" title="Tiros">TIROS</th>
                              <th className="p-2 font-bold text-center" title="Cabezazos">CABZ</th>
                              <th className="p-2 font-bold text-center text-cyan-400" title="Minutos GK">M.GK</th>
                              <th className="p-2 font-bold text-center text-cyan-400" title="Atajadas">ATAJ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {players.map((r: any) => {
                              const ps = editingMatch.stats.find((s: any) => s.playerId === r.playerId) || {};
                              return (
                              <tr key={r.playerId} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 font-bold sticky left-0 bg-card border-r border-border truncate max-w-[120px] shadow-[2px_0_5px_rgba(0,0,0,0.5)] z-10">
                                  {r.player.nick}
                                </td>
                                
                                {/* BASIC STATS */}
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][goals]`} min="0" defaultValue={ps.goals ?? "0"} className="w-12 bg-black border border-green-900/50 rounded p-1 text-center font-bold text-xs focus:border-green-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][assists]`} min="0" defaultValue={ps.assists ?? "0"} className="w-12 bg-black border border-blue-900/50 rounded p-1 text-center font-bold text-xs focus:border-blue-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][fouls]`} min="0" defaultValue={ps.fouls ?? "0"} className="w-12 bg-black border border-red-900/50 rounded p-1 text-center font-bold text-xs focus:border-red-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][fouled]`} min="0" defaultValue={ps.fouled ?? "0"} className="w-12 bg-black border border-red-900/50 rounded p-1 text-center font-bold text-xs focus:border-red-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][offsides]`} min="0" defaultValue={ps.offsides ?? "0"} className="w-12 bg-black border border-yellow-900/50 rounded p-1 text-center font-bold text-xs focus:border-yellow-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][ballLosses]`} min="0" defaultValue={ps.ballLosses ?? "0"} className="w-12 bg-black border border-orange-900/50 rounded p-1 text-center font-bold text-xs focus:border-orange-500" /></td>
                                <td className="p-1"><input type="number" name={`stats[${r.playerId}][tacklesWon]`} min="0" defaultValue={ps.tacklesWon ?? "0"} className="w-12 bg-black border border-emerald-900/50 rounded p-1 text-center font-bold text-xs focus:border-emerald-500" /></td>
                                
                                <td className="p-1 text-center">
                                  <input type="checkbox" name={`stats[${r.playerId}][cleanSheet]`} defaultChecked={ps.cleanSheet} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                                </td>

                                {/* RATIO STATS */}
                                <td className="p-1">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input type="number" name={`stats[${r.playerId}][passesMade]`} min="0" defaultValue={ps.passesMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                    <span className="text-muted-foreground">/</span>
                                    <input type="number" name={`stats[${r.playerId}][passesTotal]`} min="0" defaultValue={ps.passesTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                  </div>
                                </td>
                                <td className="p-1">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input type="number" name={`stats[${r.playerId}][slidingMade]`} min="0" defaultValue={ps.slidingMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                    <span className="text-muted-foreground">/</span>
                                    <input type="number" name={`stats[${r.playerId}][slidingTotal]`} min="0" defaultValue={ps.slidingTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                  </div>
                                </td>
                                <td className="p-1">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input type="number" name={`stats[${r.playerId}][shotsMade]`} min="0" defaultValue={ps.shotsMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                    <span className="text-muted-foreground">/</span>
                                    <input type="number" name={`stats[${r.playerId}][shotsTotal]`} min="0" defaultValue={ps.shotsTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                  </div>
                                </td>
                                <td className="p-1">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input type="number" name={`stats[${r.playerId}][headersMade]`} min="0" defaultValue={ps.headersMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                    <span className="text-muted-foreground">/</span>
                                    <input type="number" name={`stats[${r.playerId}][headersTotal]`} min="0" defaultValue={ps.headersTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs focus:border-primary" />
                                  </div>
                                </td>
                                <td className="p-1">
                                  <input type="number" name={`stats[${r.playerId}][gkTime]`} min="0" defaultValue={ps.gkTime ?? "0"} className="w-12 mx-auto block bg-black border border-cyan-900/50 rounded p-1 text-center font-bold text-xs focus:border-cyan-400" />
                                </td>
                                <td className="p-1">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input type="number" name={`stats[${r.playerId}][savesMade]`} min="0" defaultValue={ps.savesMade ?? "0"} className="w-10 bg-black border border-cyan-900/50 rounded p-1 text-center text-xs focus:border-cyan-400" />
                                    <span className="text-muted-foreground">/</span>
                                    <input type="number" name={`stats[${r.playerId}][savesTotal]`} min="0" defaultValue={ps.savesTotal ?? "0"} className="w-10 bg-black border border-cyan-900/50 rounded p-1 text-center text-xs focus:border-cyan-400" />
                                  </div>
                                </td>

                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-4 z-50 mt-4 flex justify-end px-4">
                <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-4 px-12 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 text-xl shadow-[0_10px_40px_rgba(var(--primary),0.5)] border border-white/20">
                  {loading ? 'GUARDANDO...' : 'GUARDAR PARTIDO ✅'}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
