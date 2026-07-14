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
    season?: { name: string } | null;
  } | null;
  challenge?: {
    name: string;
  } | null;
};

type PlayerWithTrophies = {
  id: string;
  nick: string;
  trophies: TrophyRecord[];
};

export default function TrofeosJugadoresView({ players, dictionary, type = "oficiales" }: { players: PlayerWithTrophies[], dictionary: any, type?: "oficiales" | "extras" | "challenges" }) {
  const [searchTerm, setSearchTerm] = useState("");

  const getRankedPlayers = () => {
    const ranked = players.filter(p => p.nick.toLowerCase().includes(searchTerm.toLowerCase())).map(player => {
      // Filter trophies based on type
      const relevantTrophies = player.trophies.filter(t => {
        if (type === "challenges") return t.challenge != null;
        if (t.challenge != null) return false;
        const tIsOfficial = t.tournament?.isOfficial ?? true; // Default true if not specified
        return type === "oficiales" ? tIsOfficial : !tIsOfficial;
      });

      const isMajorTrophy = (t: any) => {
        const name = (t.tournament?.name || t.challenge?.name || "").toLowerCase();
        return !name.includes("nacional b") && !name.includes("segunda");
      };

      const firsts = relevantTrophies.filter(t => (t.name.includes("Campeón") || t.name === "Campeon") && isMajorTrophy(t));
      const seconds = relevantTrophies.filter(t => (t.name.includes("Subcampeón") || t.name === "Subcampeon") && isMajorTrophy(t));
      const thirds = relevantTrophies.filter(t => (t.name.includes("Tercer") || t.name.includes("3er")) && isMajorTrophy(t));
      
      const goleador = relevantTrophies.filter(t => t.name.includes("Goleador") && isMajorTrophy(t));
      const asistidor = relevantTrophies.filter(t => t.name.includes("Asistidor") && isMajorTrophy(t));
      const mejorGk = relevantTrophies.filter(t => (t.name.includes("Mejor GK") || t.name.includes("Valla Invicta")) && isMajorTrophy(t));
      const mvp = relevantTrophies.filter(t => (t.name.includes("MVP") || t.name.includes("Mejor Jugador")) && isMajorTrophy(t));
      
      // Calculate total 1st place equivalents
      const totalFirsts = firsts.length;
      const totalInd = goleador.length + asistidor.length + mejorGk.length + mvp.length;

      // Calculate total count just for existence checking
      const anyFirsts = relevantTrophies.filter(t => t.name.includes("Campeón") || t.name === "Campeon").length;
      const anySeconds = relevantTrophies.filter(t => t.name.includes("Subcampeón") || t.name === "Subcampeon").length;
      const anyThirds = relevantTrophies.filter(t => t.name.includes("Tercer") || t.name.includes("3er")).length;
      const anyInd = relevantTrophies.filter(t => t.name.includes("Goleador") || t.name.includes("Asistidor") || t.name.includes("Mejor GK") || t.name.includes("Valla Invicta") || t.name.includes("MVP") || t.name.includes("Mejor Jugador")).length;

      return {
        ...player,
        count: totalFirsts,
        count2nd: seconds.length,
        count3rd: thirds.length,
        countInd: totalInd,
        hasAny: anyFirsts > 0 || anySeconds > 0 || anyThirds > 0 || anyInd > 0,
        allTrophies: relevantTrophies.sort((a, b) => {
          // Sort trophies: 1sts/Individual first, 2nds, 3rds
          const getWeight = (name: string, t: any) => {
            let weight = 0;
            if (name.includes("Campeón") || name === "Campeon" || 
                name.includes("Goleador") || name.includes("Asistidor") || 
                name.includes("Mejor GK") || name.includes("Valla Invicta") ||
                name.includes("MVP") || name.includes("Mejor Jugador")) weight = 3;
            else if (name.includes("Subcampeón") || name === "Subcampeon") weight = 2;
            else if (name.includes("Tercer") || name.includes("3er")) weight = 1;
            
            // Major trophies rank above minor trophies
            if (!isMajorTrophy(t)) weight -= 10;
            return weight;
          };
          return getWeight(b.name, b) - getWeight(a.name, a);
        })
      };
    }).filter(player => player.hasAny);

    return ranked.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.count2nd !== a.count2nd) return b.count2nd - a.count2nd;
      if (b.count3rd !== a.count3rd) return b.count3rd - a.count3rd;
      if (b.countInd !== a.countInd) return b.countInd - a.countInd;
      return a.nick.localeCompare(b.nick);
    });
  };

  const rankedPlayers = getRankedPlayers();

  const getTrophyImage = (tournamentName: string | undefined): string => {
    if (!tournamentName) return '/img/trophy-default.png';
    const normalized = tournamentName.toLowerCase();
    
    if (normalized.includes('supercopa')) return '/img/trofeos/SupercopaTPMNew.png';
    if (normalized.includes('promesas')) return '/img/trofeos/CopaDePromesasNew.png';
    if (normalized.includes('copa tpm') || (normalized.includes('copa') && !normalized.includes('liga'))) return '/img/trofeos/CopaTPMNew.png';
    if (normalized.includes('liga b')) return '/img/trofeos/LigaBTPMNew.png';
    if (normalized.includes('liga tpm') || normalized.includes('liga')) return '/img/trofeos/LigaTPMNew.png';
    
    return '/img/trophy-default.png';
  };

  const getIndividualBadge = (trophyName: string) => {
    if (trophyName.includes("Goleador")) return "⚽";
    if (trophyName.includes("Asistidor")) return "👟";
    if (trophyName.includes("GK") || trophyName.includes("Valla")) return "🧤";
    if (trophyName.includes("MVP") || trophyName.includes("Mejor Jugador")) return "⭐";
    return null;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-black text-primary uppercase">
          {type === "oficiales" ? "Ranking Oficial de Jugadores" : type === "extras" ? "Ranking Extra de Jugadores" : "Ranking de Challenges"}
        </h2>
        <input 
          type="text" 
          placeholder="Buscar jugador..." 
          className="bg-secondary/50 text-foreground border border-border rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:border-primary transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {rankedPlayers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            No hay jugadores con trofeos en esta categoría.
          </div>
        ) : (
          rankedPlayers.map((player, index) => (
            <div key={player.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center shadow-lg hover:border-primary/50 transition-all">
              
              {/* Pos & Player Info */}
              <div className="flex items-center gap-4 min-w-[250px] w-full md:w-auto border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                <div className="text-3xl font-black text-muted-foreground/30 w-10 text-center">
                  #{index + 1}
                </div>
                <div className="w-12 h-12 bg-secondary rounded-full p-1 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-xs">{player.nick.substring(0, 3).toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <Link href={`/jugadores/${player.id}`} className="font-bold text-lg hover:text-primary transition-colors">
                    {player.nick}
                  </Link>
                  <div className="text-sm text-muted-foreground font-semibold">
                    <span className="text-primary">{player.count}</span> 🥇 • <span className="text-zinc-400">{player.count2nd}</span> 🥈 • <span className="text-amber-700">{player.count3rd}</span> 🥉 {player.countInd > 0 && <><span className="ml-1">•</span> <span className="text-blue-400 ml-1">{player.countInd}</span> 🏅</>}
                  </div>
                </div>
              </div>

              {/* Trophies Visuals */}
              <div className="flex flex-wrap items-center gap-4 w-full flex-1">
                {player.allTrophies.map((trophy) => {
                  const isFirst = trophy.name.includes("Campeón") || trophy.name === "Campeon";
                  const isSecond = trophy.name.includes("Subcampeón") || trophy.name === "Subcampeon";
                  const isThird = trophy.name.includes("Tercer") || trophy.name.includes("3er");
                  
                  const indBadge = getIndividualBadge(trophy.name);
                  const isIndividual = indBadge !== null;
                  
                  const tournamentName = trophy.tournament?.name || trophy.challenge?.name || "Torneo Desconocido";
                  const seasonName = trophy.tournament?.season?.name ? ` - ${trophy.tournament.season.name}` : "";
                  const imageUrl = getTrophyImage(tournamentName);
                  
                  return (
                    <div 
                      key={trophy.id} 
                      className="relative group flex items-end justify-center"
                      title={`${trophy.name} - ${tournamentName}${seasonName}`}
                    >
                      {isFirst && !isIndividual && (
                        <div className="flex flex-col items-center">
                          <img src={getTrophyImage(trophy.tournament?.name || trophy.challenge?.name)} alt={trophy.name} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                        </div>
                      )}

                      {isIndividual && (
                        <div className="flex flex-col items-center relative">
                          <div className="absolute -top-3 -right-2 text-2xl z-10 drop-shadow-lg">{indBadge}</div>
                          <img src={imageUrl} alt={tournamentName} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
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
                        {trophy.name} - {tournamentName}{seasonName}
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
