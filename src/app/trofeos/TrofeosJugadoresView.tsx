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

export default function TrofeosJugadoresView({ players, dictionary, isOfficial = true }: { players: PlayerWithTrophies[], dictionary: any, isOfficial?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");

  const getRankedPlayers = () => {
    const ranked = players.filter(p => p.nick.toLowerCase().includes(searchTerm.toLowerCase())).map(player => {
      // Filter trophies based on isOfficial
      const relevantTrophies = player.trophies.filter(t => {
        const tIsOfficial = t.tournament?.isOfficial ?? true; // Default true if not specified
        return tIsOfficial === isOfficial;
      });

      const firsts = relevantTrophies.filter(t => t.name.includes("Campeón") || t.name === "Campeon");
      const seconds = relevantTrophies.filter(t => t.name.includes("Subcampeón") || t.name === "Subcampeon");
      const thirds = relevantTrophies.filter(t => t.name.includes("Tercer") || t.name.includes("3er"));
      
      const goleador = relevantTrophies.filter(t => t.name.includes("Goleador"));
      const asistidor = relevantTrophies.filter(t => t.name.includes("Asistidor"));
      const mejorGk = relevantTrophies.filter(t => t.name.includes("Mejor GK") || t.name.includes("Valla Invicta"));
      const mvp = relevantTrophies.filter(t => t.name.includes("MVP") || t.name.includes("Mejor Jugador"));
      
      // Calculate total 1st place equivalents
      const totalFirsts = firsts.length + goleador.length + asistidor.length + mejorGk.length + mvp.length;

      return {
        ...player,
        count: totalFirsts,
        count2nd: seconds.length,
        count3rd: thirds.length,
        allTrophies: relevantTrophies.sort((a, b) => {
          // Sort trophies: 1sts/Individual first, 2nds, 3rds
          const getWeight = (name: string) => {
            if (name.includes("Campeón") || name === "Campeon" || 
                name.includes("Goleador") || name.includes("Asistidor") || 
                name.includes("Mejor GK") || name.includes("Valla Invicta") ||
                name.includes("MVP") || name.includes("Mejor Jugador")) return 3;
            if (name.includes("Subcampeón") || name === "Subcampeon") return 2;
            if (name.includes("Tercer") || name.includes("3er")) return 1;
            return 0;
          };
          return getWeight(b.name) - getWeight(a.name);
        })
      };
    }).filter(player => player.count > 0 || player.count2nd > 0 || player.count3rd > 0);

    return ranked.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.count2nd !== a.count2nd) return b.count2nd - a.count2nd;
      if (b.count3rd !== a.count3rd) return b.count3rd - a.count3rd;
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
          {isOfficial ? "Ranking Oficial de Jugadores" : "Ranking Extra de Jugadores"}
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

        )}
      </div>
    </div>
  );
}
