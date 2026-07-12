"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeadToHeadClient({ 
  currentTeamId, 
  currentTeamName,
  allTeams, 
  allMatches 
}: { 
  currentTeamId: string;
  currentTeamName: string;
  allTeams: any[];
  allMatches: any[];
}) {
  const [search, setSearch] = useState("");
  const [selectedOpponentId, setSelectedOpponentId] = useState("");

  const filteredTeams = allTeams.filter(t => 
    t.id !== currentTeamId && 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const opponent = allTeams.find(t => t.id === selectedOpponentId);

  // Filtrar partidos: sacar amistosos/historiales, y dejar solo los que jugó contra el oponente
  const h2hMatches = allMatches.filter(m => 
    (!["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(m.round)) &&
    m.status === "PLAYED" &&
    (m.homeTeamId === selectedOpponentId || m.awayTeamId === selectedOpponentId)
  ).sort((a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime());

  // Calcular stats
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  h2hMatches.forEach(m => {
    const isHome = m.homeTeamId === currentTeamId;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;

    goalsFor += teamScore || 0;
    goalsAgainst += oppScore || 0;

    if (teamScore! > oppScore!) wins++;
    else if (teamScore! < oppScore!) losses++;
    else draws++;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-md mt-8">
      <h2 className="text-2xl font-black flex items-center gap-2 border-b border-border pb-4 mb-6 text-primary">
        <span className="text-3xl">⚔️</span>
        Historial Cara a Cara (H2H)
      </h2>

      <div className="flex flex-col md:flex-row gap-6 mb-8 bg-secondary/20 p-4 rounded-xl border border-border">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Buscar Rival</label>
          <input 
            type="text" 
            placeholder="Ej. Fiorentina..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Seleccionar Rival</label>
          <select 
            value={selectedOpponentId} 
            onChange={(e) => setSelectedOpponentId(e.target.value)}
            className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none"
          >
            <option value="">-- Elige un equipo --</option>
            {filteredTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {opponent && (
        <div className="flex flex-col gap-8">
          
          <div className="flex justify-between items-center text-center max-w-2xl mx-auto w-full">
            <div className="flex-1">
               <h3 className="text-2xl font-black text-primary truncate px-2">{currentTeamName}</h3>
            </div>
            <div className="px-4 text-3xl font-black text-muted-foreground">VS</div>
            <div className="flex-1">
               <h3 className="text-2xl font-black text-destructive truncate px-2">{opponent.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto w-full">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-primary">{wins}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Victorias</span>
            </div>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{draws}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Empates</span>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-destructive">{losses}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Derrotas</span>
            </div>
          </div>

          <div className="bg-black/50 border border-border p-4 rounded-xl flex justify-center gap-12 max-w-xl mx-auto w-full">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{goalsFor}</span>
                <span className="text-xs text-muted-foreground">Goles a Favor</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-destructive">{goalsAgainst}</span>
                <span className="text-xs text-muted-foreground">Goles en Contra</span>
             </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
             <h4 className="font-bold text-lg border-b border-border pb-2 text-white">Partidos Oficiales</h4>
             {h2hMatches.length === 0 ? (
               <p className="text-muted-foreground text-center py-4">Nunca se enfrentaron oficialmente.</p>
             ) : (
               h2hMatches.map(m => {
                 const isHome = m.homeTeamId === currentTeamId;
                 const teamScore = isHome ? m.homeScore : m.awayScore;
                 const oppScore = isHome ? m.awayScore : m.homeScore;
                 
                 let resultClass = "text-muted-foreground";
                 let resultText = "E";
                 if (teamScore! > oppScore!) { resultClass = "text-primary"; resultText = "G"; }
                 else if (teamScore! < oppScore!) { resultClass = "text-destructive"; resultText = "P"; }

                 return (
                   <div key={m.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors gap-4">
                     <div className="flex items-center gap-4 flex-1">
                        <span className={`w-8 h-8 flex items-center justify-center rounded font-black text-sm bg-card border border-border ${resultClass}`}>
                          {resultText}
                        </span>
                        <div className="flex flex-col">
                           <span className="font-bold text-sm text-muted-foreground uppercase">{m.tournament?.name || 'Torneo'} - {m.round}</span>
                           <Link href={`/partidos/${m.id}`} className="font-bold hover:text-primary hover:underline transition-colors">
                             {isHome ? `${currentTeamName} (L) vs ${opponent.name} (V)` : `${opponent.name} (L) vs ${currentTeamName} (V)`}
                           </Link>
                        </div>
                     </div>
                     <div className="font-mono text-2xl font-black bg-black px-4 py-2 rounded-xl border border-border text-center min-w-[100px]">
                        {isHome ? `${m.homeScore} - ${m.awayScore}` : `${m.awayScore} - ${m.homeScore}`}
                     </div>
                   </div>
                 );
               })
             )}
          </div>
          
        </div>
      )}
    </div>
  );
}
