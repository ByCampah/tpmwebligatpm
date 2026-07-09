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

type TeamWithTrophies = {
  id: string;
  name: string;
  trophies: TrophyRecord[];
};

export default function TrofeosView({ teams, dictionary, isOfficial = true }: { teams: TeamWithTrophies[], dictionary: any, isOfficial?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");

  const getRankedTeams = () => {
    const ranked = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
      // Filter trophies based on isOfficial
      const relevantTrophies = team.trophies.filter(t => {
        const tIsOfficial = t.tournament?.isOfficial ?? true; // Default true if not specified
        return tIsOfficial === isOfficial;
      });

      const isMajorTrophy = (t: any) => {
        const name = t.tournament?.name?.toLowerCase() || "";
        return !name.includes("nacional b") && !name.includes("segunda") && !name.includes("promesas");
      };

      const firsts = relevantTrophies.filter(t => (t.name.includes("Campeón") || t.name === "Campeon") && isMajorTrophy(t));
      const seconds = relevantTrophies.filter(t => (t.name.includes("Subcampeón") || t.name === "Subcampeon") && isMajorTrophy(t));
      const thirds = relevantTrophies.filter(t => (t.name.includes("Tercer") || t.name.includes("3er")) && isMajorTrophy(t));
      
      // Calculate total count just for existence checking
      const anyFirsts = relevantTrophies.filter(t => t.name.includes("Campeón") || t.name === "Campeon").length;
      const anySeconds = relevantTrophies.filter(t => t.name.includes("Subcampeón") || t.name === "Subcampeon").length;
      const anyThirds = relevantTrophies.filter(t => t.name.includes("Tercer") || t.name.includes("3er")).length;

      return {
        ...team,
        count: firsts.length,
        count2nd: seconds.length,
        count3rd: thirds.length,
        hasAny: anyFirsts > 0 || anySeconds > 0 || anyThirds > 0,
        allTrophies: relevantTrophies.sort((a, b) => {
          // Sort trophies: 1sts first, 2nds, 3rds
          const getWeight = (name: string, t: any) => {
            let weight = 0;
            if (name.includes("Campeón") || name === "Campeon") weight = 3;
            else if (name.includes("Subcampeón") || name === "Subcampeon") weight = 2;
            else if (name.includes("Tercer") || name.includes("3er")) weight = 1;
            
            // Major trophies rank above minor trophies
            if (!isMajorTrophy(t)) weight -= 10;
            return weight;
          };
          return getWeight(b.name, b) - getWeight(a.name, a);
        })
      };
    }).filter(team => team.hasAny);

    return ranked.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.count2nd !== a.count2nd) return b.count2nd - a.count2nd;
      if (b.count3rd !== a.count3rd) return b.count3rd - a.count3rd;
      return a.name.localeCompare(b.name);
    });
  };

  const rankedTeams = getRankedTeams();

  const getTrophyImage = (tournamentName: string | undefined): string => {
    if (!tournamentName) return '/img/trophy-default.png';
    const normalized = tournamentName.toLowerCase();
    
    if (normalized.includes('supercopa')) return '/img/trofeos/SupercopaTPMNew.png';
    if (normalized.includes('promesas')) return '/img/trofeos/CopaDePromesasNew.png';
    if (normalized.includes('copa tpm')) return '/img/trofeos/CopaTPMNew.png';
    if (normalized.includes('copa nacional b') || normalized.includes('copa b')) return '/img/trofeos/CopaDePromesasNew.png'; // Temporal image
    if (normalized.includes('copa') && !normalized.includes('liga')) return '/img/trofeos/CopaTPMNew.png';
    if (normalized.includes('liga b') || normalized.includes('nacional b') || normalized.includes('segunda')) return '/img/trofeos/LigaBTPMNew.png';
    if (normalized.includes('liga tpm') || normalized.includes('liga')) return '/img/trofeos/LigaTPMNew.png';
    
    return '/img/trophy-default.png';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-black text-primary uppercase">
          {isOfficial ? "Ranking Oficial" : "Ranking Extras"}
        </h2>
        <input 
          type="text" 
          placeholder="Buscar equipo..." 
          className="bg-secondary/50 text-foreground border border-border rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:border-primary transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {rankedTeams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            No hay equipos con trofeos en esta categoría.
          </div>
        ) : (
          rankedTeams.map((team, index) => (
            <div key={team.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center shadow-lg hover:border-primary/50 transition-all">
              
              {/* Pos & Team Info */}
              <div className="flex items-center gap-4 min-w-[250px] w-full md:w-auto border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                <div className="text-3xl font-black text-muted-foreground/30 w-10 text-center">
                  #{index + 1}
                </div>
                <div className="w-12 h-12 bg-secondary rounded-full p-1 flex items-center justify-center flex-shrink-0">
                  {(team as any).logoUrl ? (
                    <img src={(team as any).logoUrl} alt={team.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs">{team.name.substring(0, 3)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <Link href={`/equipos/${team.id}`} className="font-bold text-lg hover:text-primary transition-colors">
                    {team.name}
                  </Link>
                  <div className="text-sm text-muted-foreground font-semibold">
                    <span className="text-primary">{team.count}</span> 🏆 • <span className="text-zinc-400">{team.count2nd}</span> 🥈 • <span className="text-amber-700">{team.count3rd}</span> 🥉
                  </div>
                </div>
              </div>

              {/* Trophies Visuals */}
              <div className="flex flex-wrap items-center gap-4 w-full flex-1">
                {team.allTrophies.map((trophy) => {
                  const isFirst = trophy.name.includes("Campeón") || trophy.name === "Campeon";
                  const isSecond = trophy.name.includes("Subcampeón") || trophy.name === "Subcampeon";
                  const isThird = trophy.name.includes("Tercer") || trophy.name.includes("3er");
                  const tournamentName = trophy.tournament?.name || "Torneo Desconocido";
                  const imageUrl = getTrophyImage(tournamentName);
                  
                  return (
                    <div 
                      key={trophy.id} 
                      className="relative group flex items-end justify-center"
                      title={`${trophy.name} - ${tournamentName}`}
                    >
                      {isFirst && (
                        <div className="flex flex-col items-center">
                          <img src={imageUrl} alt={tournamentName} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                        </div>
                      )}
                      
                      {isSecond && (
                        <div className="flex flex-col items-center relative">
                          <div className="absolute -top-2 -right-2 text-xl z-10 drop-shadow-md">🥈</div>
                          <img src={imageUrl} alt={tournamentName} className="w-8 h-8 object-contain opacity-80" />
                        </div>
                      )}
                      
                      {isThird && (
                        <div className="flex flex-col items-center relative">
                          <div className="absolute -top-2 -right-2 text-xl z-10 drop-shadow-md">🥉</div>
                          <img src={imageUrl} alt={tournamentName} className="w-8 h-8 object-contain opacity-60" />
                        </div>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {trophy.name} - {tournamentName}
                      </div>
                    </div>
                  );
                })}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}
