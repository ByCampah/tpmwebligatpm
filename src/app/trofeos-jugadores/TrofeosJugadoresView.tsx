"use client";

import { useState } from "react";
import Link from "next/link";

type TrophyRecord = {
  id: string;
  name: string;
  tournament?: {
    name: string;
    category: string;
  } | null;
};

type PlayerWithTrophies = {
  id: string;
  nick: string;
  trophies: TrophyRecord[];
};

export default function TrofeosJugadoresView({ players, dictionary }: { players: PlayerWithTrophies[], dictionary: any }) {
  const [activeTab, setActiveTab] = useState<"primera" | "segunda" | "x8">("primera");

  // Function to filter trophies for a specific category
  const getRelevantTrophies = (trophies: TrophyRecord[], categoryFilter: (t: TrophyRecord) => boolean) => {
    return trophies.filter(t => categoryFilter(t));
  };

  const primeraFilter = (t: TrophyRecord) => {
    const isX8 = t.name.includes("x8") || (t.tournament?.name || "").includes("x8");
    const isSegunda = t.name.includes("Segunda") || (t.tournament?.category || "").includes("Segunda");
    return !isX8 && !isSegunda;
  };
  const segundaFilter = (t: TrophyRecord) => t.name.includes("Segunda") || (t.tournament?.category || "").includes("Segunda");
  const x8Filter = (t: TrophyRecord) => t.name.includes("x8") || (t.tournament?.name || "").includes("x8");

  // Process data for the active tab
  const getRankedPlayers = (filterFn: (t: TrophyRecord) => boolean) => {
    const ranked = players.map(player => {
      const relevantTrophies = getRelevantTrophies(player.trophies, filterFn);
      
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

  const rankedPlayers = getRankedPlayers(
    activeTab === "primera" ? primeraFilter : 
    activeTab === "segunda" ? segundaFilter : x8Filter
  );

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
        <button
          onClick={() => setActiveTab("primera")}
          className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTab === "primera" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-card text-muted-foreground hover:bg-white/5"}`}
        >
          Primera División
        </button>
        <button
          onClick={() => setActiveTab("segunda")}
          className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTab === "segunda" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-card text-muted-foreground hover:bg-white/5"}`}
        >
          Segunda División
        </button>
        <button
          onClick={() => setActiveTab("x8")}
          className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTab === "x8" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-card text-muted-foreground hover:bg-white/5"}`}
        >
          Liga 1 x8
        </button>
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
