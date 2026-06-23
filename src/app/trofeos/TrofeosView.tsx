"use client";

import { useState } from "react";
import Link from "next/link";

type TrophyRecord = {
  id: string;
  name: string;
  tournament?: {
    name: string;
    category?: { name: string } | null;
  } | null;
};

type TeamWithTrophies = {
  id: string;
  name: string;
  trophies: TrophyRecord[];
};

export default function TrofeosView({ teams, dictionary }: { teams: TeamWithTrophies[], dictionary: any }) {
  // Extract categories dynamically
  const categoryNamesSet = new Set<string>();
  teams.forEach(team => {
    team.trophies.forEach(t => {
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
    return a.localeCompare(b);
  });

  const defaultTab = categories.includes("Primera División") ? "Primera División" : categories[0] || "General";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [searchTerm, setSearchTerm] = useState("");

  const getRelevantTrophies = (trophies: TrophyRecord[], cat: string) => {
    return trophies.filter(t => {
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
  const getRankedTeams = () => {
    const ranked = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
      const relevantTrophies = getRelevantTrophies(team.trophies, activeTab);
      const firsts = relevantTrophies.filter(t => t.name === "Campeón");
      const seconds = relevantTrophies.filter(t => t.name === "Subcampeón");
      const thirds = relevantTrophies.filter(t => t.name === "3er Puesto");
      
      return {
        ...team,
        count: firsts.length,
        count2nd: seconds.length,
        count3rd: thirds.length,
        trophiesList: firsts, // Keep just the 1sts for the Ligas/Copas detail
        allTrophies: relevantTrophies
      };
    }).filter(team => team.count > 0 || team.count2nd > 0 || team.count3rd > 0);

    return ranked.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.count2nd !== a.count2nd) return b.count2nd - a.count2nd;
      return b.count3rd - a.count3rd;
    });
  };

  const rankedTeams = getRankedTeams();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter neon-text">
          Salón de la Fama
        </h1>
        <p className="text-muted-foreground text-lg">
          Ranking histórico de los clubes más ganadores de la comunidad TPM.
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

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 bg-card border border-border rounded-lg px-4 py-2 font-mono outline-none focus:border-primary transition-colors text-white"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {rankedTeams.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay campeones registrados en esta categoría aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/40 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 w-16 text-center font-bold">#</th>
                  <th className="p-4 font-bold">{dictionary.team}</th>
                  <th className="p-4 text-center font-black text-primary" title={dictionary.champion}>🏆 {dictionary.total}</th>
                  <th className="p-4 text-center font-bold text-blue-500 bg-blue-500/5">🥇 Liga</th>
                  <th className="p-4 text-center font-bold text-blue-400/70 bg-blue-500/5">🥈 2do L</th>
                  <th className="p-4 text-center font-bold text-blue-300/50 bg-blue-500/5 border-r border-border/50">🥉 3er L</th>
                  <th className="p-4 text-center font-bold text-green-500 bg-green-500/5">🥇 Copa</th>
                  <th className="p-4 text-center font-bold text-green-400/70 bg-green-500/5">🥈 2do C</th>
                  <th className="p-4 text-center font-bold text-green-300/50 bg-green-500/5">🥉 3er C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rankedTeams.map((team, index) => {
                  const ligas1 = team.trophiesList.filter(t => (t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa")).length;
                  const copas1 = team.trophiesList.filter(t => (t.tournament?.name || "").includes("Copa")).length;
                  
                  const ligas2 = team.allTrophies.filter(t => t.name === "Subcampeón" && ((t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa"))).length;
                  const copas2 = team.allTrophies.filter(t => t.name === "Subcampeón" && (t.tournament?.name || "").includes("Copa")).length;
                  
                  const ligas3 = team.allTrophies.filter(t => t.name === "3er Puesto" && ((t.tournament?.name || "").includes("Liga") || (t.tournament?.name || "").includes("Primera") || (t.tournament?.name || "").includes("Segunda") && !(t.tournament?.name || "").includes("Copa"))).length;
                  const copas3 = team.allTrophies.filter(t => t.name === "3er Puesto" && (t.tournament?.name || "").includes("Copa")).length;
                  
                  return (
                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center">
                        {index === 0 ? <span className="text-2xl" title="1er Puesto">🏆</span> : 
                         index === 1 ? <span className="text-2xl" title="2do Puesto">🥈</span> : 
                         index === 2 ? <span className="text-2xl" title="3er Puesto">🥉</span> : 
                         <span className="font-bold text-muted-foreground">{index + 1}</span>}
                      </td>
                      <td className="p-4">
                        <Link href={`/equipos/${team.id}`} className="font-bold text-lg hover:text-primary transition-colors flex items-center gap-2">
                          {team.name}
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-3xl font-black text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                          {team.count}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-blue-400 bg-blue-500/5">{ligas1 > 0 ? ligas1 : "-"}</td>
                      <td className="p-4 text-center font-bold text-blue-400/50 bg-blue-500/5">{ligas2 > 0 ? ligas2 : "-"}</td>
                      <td className="p-4 text-center font-bold text-blue-300/30 bg-blue-500/5 border-r border-border/50">{ligas3 > 0 ? ligas3 : "-"}</td>
                      
                      <td className="p-4 text-center font-bold text-green-400 bg-green-500/5">{copas1 > 0 ? copas1 : "-"}</td>
                      <td className="p-4 text-center font-bold text-green-400/50 bg-green-500/5">{copas2 > 0 ? copas2 : "-"}</td>
                      <td className="p-4 text-center font-bold text-green-300/30 bg-green-500/5">{copas3 > 0 ? copas3 : "-"}</td>
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
