"use client";

import { useState } from "react";
import Link from "next/link";

type TrophyRecord = {
  id: string;
  name: string;
  tournament?: {
    name: string;
    isOfficial?: boolean;
    category?: { name: string } | null;
  } | null;
};

type PlayerWithTrophies = {
  id: string;
  nick: string;
  trophies: TrophyRecord[];
};

export default function TrofeosJugadoresView({ players, dictionary }: { players: PlayerWithTrophies[], dictionary: any }) {
  // Extract categories dynamically
  const categoryNamesSet = new Set<string>();
  players.forEach(player => {
    player.trophies.forEach(t => {
      if (t.tournament && t.tournament.isOfficial === false) {
        categoryNamesSet.add("Torneos Extras");
        return;
      }
      
      const catName = t.tournament?.category?.name;
      if (catName) {
        categoryNamesSet.add(catName);
      } else {
        // Fallback for older data without category: parse from tournament name
        if ((t.tournament?.name || "").includes("Primera")) categoryNamesSet.add("Primera División");
        else if ((t.tournament?.name || "").includes("Segunda")) categoryNamesSet.add("Segunda División");
        else if ((t.tournament?.name || "").includes("x8")) categoryNamesSet.add("Liga 1 x8");
        else categoryNamesSet.add("General");
      }
    });
  });
  const categories = Array.from(categoryNamesSet).sort((a, b) => {
    // Custom sort: Primera first, then Segunda, etc.
    if (a.includes("Primera") && !b.includes("Primera")) return -1;
    if (!a.includes("Primera") && b.includes("Primera")) return 1;
    if (a.includes("Segunda") && !b.includes("Segunda")) return -1;
    if (!a.includes("Segunda") && b.includes("Segunda")) return 1;
    if (a === "Torneos Extras") return 1; // Extras at the end
    if (b === "Torneos Extras") return -1;
    return a.localeCompare(b);
  });

  const defaultTab = categories.includes("Primera División") ? "Primera División" : categories[0] || "General";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const getRelevantTrophies = (trophies: TrophyRecord[], cat: string) => {
    return trophies.filter(t => {
      if (cat === "Torneos Extras") {
        return t.tournament?.isOfficial === false;
      }
      
      if (t.tournament && t.tournament.isOfficial === false) return false;

      const tCat = t.tournament?.category?.name;
      if (tCat) return tCat === cat;
      
      // Fallback logic for filtering
      if (cat === "Primera División") return (t.tournament?.name || "").includes("Primera");
      if (cat === "Segunda División") return (t.tournament?.name || "").includes("Segunda");
      if (cat === "Liga 1 x8") return (t.tournament?.name || "").includes("x8");
      if (cat === "General") return !(t.tournament?.name || "").includes("Primera") && !(t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("x8");
      return false;
    });
  };

  // Process data for the active tab
  const getRankedPlayers = () => {
    const ranked = players.map(player => {
      const relevantTrophies = getRelevantTrophies(player.trophies, activeTab);
      
      const teamTrophies = relevantTrophies.filter(t => !t.name.includes("Goleador") && !t.name.includes("Asistidor") && !t.name.includes("Mejor GK") && !t.name.includes("Valla Invicta"));
      const firsts = teamTrophies.filter(t => t.name === "Campeón");
      const seconds = teamTrophies.filter(t => t.name === "Subcampeón");
      const thirds = teamTrophies.filter(t => t.name === "3er Puesto");
      
      const goleador = relevantTrophies.filter(t => t.name.includes("Goleador"));
      const asistidor = relevantTrophies.filter(t => t.name.includes("Asistidor"));
      const mejorGk = relevantTrophies.filter(t => t.name.includes("Mejor GK") || t.name.includes("Valla Invicta"));
      
      return {
        ...player,
        count: firsts.length,
        count2nd: seconds.length,
        count3rd: thirds.length,
        countGoleador: goleador.length,
        countAsistidor: asistidor.length,
        countGk: mejorGk.length,
        allTrophies: relevantTrophies
      };
    }).filter(p => p.count > 0 || p.count2nd > 0 || p.count3rd > 0 || p.countGoleador > 0 || p.countAsistidor > 0 || p.countGk > 0);

    return ranked.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.count2nd !== a.count2nd) return b.count2nd - a.count2nd;
      if (b.count3rd !== a.count3rd) return b.count3rd - a.count3rd;
      if (b.countGoleador !== a.countGoleador) return b.countGoleador - a.countGoleador;
      if (b.countAsistidor !== a.countAsistidor) return b.countAsistidor - a.countAsistidor;
      return b.countGk - a.countGk;
    });
  };

  const rankedPlayers = getRankedPlayers();

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter neon-text">
          Salón de la Fama - Jugadores
        </h1>
        <p className="text-muted-foreground text-lg">
          Ranking histórico de los jugadores más ganadores de la comunidad TPM.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center border-b border-border/50 pb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTab === cat ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-card text-muted-foreground hover:bg-white/5"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {rankedPlayers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay jugadores premiados en esta categoría aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/40 text-muted-foreground uppercase text-[10px] sm:text-xs tracking-wider">
                  <th className="p-3 sm:p-4 w-12 sm:w-16 text-center font-bold">#</th>
                  <th className="p-3 sm:p-4 font-bold border-r border-border/50">{dictionary.player}</th>
                  
                  {/* Títulos Equipos */}
                  <th className="p-3 sm:p-4 text-center font-black text-primary border-r border-border/50" title="Títulos Totales de Campeón con su equipo">🏆 Totales</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-blue-500 bg-blue-500/5">🥇 Liga</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-blue-400/70 bg-blue-500/5">🥈 2do L</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-blue-300/50 bg-blue-500/5 border-r border-border/50">🥉 3er L</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-green-500 bg-green-500/5">🥇 Copa</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-green-400/70 bg-green-500/5">🥈 2do C</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-green-300/50 bg-green-500/5 border-r border-border/50">🥉 3er C</th>
                  
                  {/* Premios Individuales */}
                  <th className="p-3 sm:p-4 text-center font-bold text-blue-400" title="Máximo Goleador">⚽ Goleador</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-pink-400" title="Máximo Asistidor">👟 Asist.</th>
                  <th className="p-3 sm:p-4 text-center font-bold text-teal-400" title="Valla Invicta / Mejor Arquero">🧤 Mejor GK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rankedPlayers.map((player, index) => {
                  // Re-calculate Ligas and Copas for the row
                  const teamTrophies = player.allTrophies.filter(t => !t.name.includes("Goleador") && !t.name.includes("Asistidor") && !t.name.includes("Mejor GK") && !t.name.includes("Valla Invicta"));
                  const firsts = teamTrophies.filter(t => t.name === "Campeón");
                  
                  const ligas1 = firsts.filter(t => (t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa")).length;
                  const copas1 = firsts.filter(t => (t.tournament?.name || "").includes("Copa")).length;
                  
                  const ligas2 = teamTrophies.filter(t => t.name === "Subcampeón" && ((t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa"))).length;
                  const copas2 = teamTrophies.filter(t => t.name === "Subcampeón" && (t.tournament?.name || "").includes("Copa")).length;
                  
                  const ligas3 = teamTrophies.filter(t => t.name === "3er Puesto" && ((t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa"))).length;
                  const copas3 = teamTrophies.filter(t => t.name === "3er Puesto" && (t.tournament?.name || "").includes("Copa")).length;
                  
                  return (
                    <tr key={player.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 sm:p-4 text-center">
                        {index === 0 ? <span className="text-xl sm:text-2xl" title="1er Puesto">🥇</span> : 
                         index === 1 ? <span className="text-xl sm:text-2xl" title="2do Puesto">🥈</span> : 
                         index === 2 ? <span className="text-xl sm:text-2xl" title="3er Puesto">🥉</span> : 
                         <span className="font-bold text-muted-foreground">{index + 1}</span>}
                      </td>
                      <td className="p-3 sm:p-4 border-r border-border/50">
                        <Link href={`/jugadores/${player.id}`} className="font-bold text-base sm:text-lg hover:text-primary transition-colors flex items-center gap-2">
                          {player.nick}
                        </Link>
                      </td>
                      <td className="p-3 sm:p-4 text-center border-r border-border/50 bg-primary/5">
                        <span className="text-2xl sm:text-3xl font-black text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                          {player.count}
                        </span>
                      </td>
                      
                      <td className="p-3 sm:p-4 text-center font-bold text-blue-400 bg-blue-500/5">{ligas1 > 0 ? ligas1 : "-"}</td>
                      <td className="p-3 sm:p-4 text-center font-bold text-blue-400/50 bg-blue-500/5">{ligas2 > 0 ? ligas2 : "-"}</td>
                      <td className="p-3 sm:p-4 text-center font-bold text-blue-300/30 bg-blue-500/5 border-r border-border/50">{ligas3 > 0 ? ligas3 : "-"}</td>
                      
                      <td className="p-3 sm:p-4 text-center font-bold text-green-400 bg-green-500/5">{copas1 > 0 ? copas1 : "-"}</td>
                      <td className="p-3 sm:p-4 text-center font-bold text-green-400/50 bg-green-500/5">{copas2 > 0 ? copas2 : "-"}</td>
                      <td className="p-3 sm:p-4 text-center font-bold text-green-300/30 bg-green-500/5 border-r border-border/50">{copas3 > 0 ? copas3 : "-"}</td>
                      
                      {/* Individual Stats */}
                      <td className="p-3 sm:p-4 text-center font-black text-blue-400 bg-blue-500/5">
                        {player.countGoleador > 0 ? player.countGoleador : "-"}
                      </td>
                      <td className="p-3 sm:p-4 text-center font-black text-pink-400 bg-pink-500/5">
                        {player.countAsistidor > 0 ? player.countAsistidor : "-"}
                      </td>
                      <td className="p-3 sm:p-4 text-center font-black text-teal-400 bg-teal-500/5">
                        {player.countGk > 0 ? player.countGk : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
