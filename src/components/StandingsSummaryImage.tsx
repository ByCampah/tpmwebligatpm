"use client";

import React, { forwardRef } from 'react';

interface StandingsSummaryImageProps {
  tournament: any;
}

export const StandingsSummaryImage = forwardRef<HTMLDivElement, StandingsSummaryImageProps>(
  ({ tournament }, ref) => {
    
    // Solo contar partidos jugados que no sean históricos
    const validMatches = tournament.matches?.filter((m: any) => m.status === 'PLAYED' && (!["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(m.round ?? ""))) || [];
    
    const isCup = tournament.format === "CUP" || tournament.format === "PLAYOFF";

    // Calcular tablas de posiciones
    let standings: any[] = [];
    let groupStandings: {name: string, standings: any[]}[] = [];
    
    const calculateStandingsForMatches = (matches: any[], teamsData: any[]) => {
      const tableMap = new Map();
      teamsData.forEach((tt: any) => {
        tableMap.set(tt.teamId, {
          id: tt.team.id, name: tt.team.name, logo: tt.team.logoUrl,
          pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
        });
      });

      matches.forEach((match: any) => {
        const home = tableMap.get(match.homeTeamId);
        const away = tableMap.get(match.awayTeamId);
        
        if (home && away && match.homeScore !== null && match.awayScore !== null) {
          home.pj++; away.pj++;
          home.gf += match.homeScore; away.gf += match.awayScore;
          home.gc += match.awayScore; away.gc += match.homeScore;

          if (match.homeScore > match.awayScore) {
            home.pg++; home.pts += 3;
            away.pp++;
          } else if (match.homeScore < match.awayScore) {
            away.pg++; away.pts += 3;
            home.pp++;
          } else {
            home.pe++; away.pe++;
            home.pts += 1; away.pts += 1;
          }
        }
      });

      teamsData.forEach((tt: any) => {
        if (tt.manualPoints !== null && tt.manualPoints !== undefined) {
          const teamEntry = tableMap.get(tt.teamId);
          if (teamEntry) {
            teamEntry.pts = tt.manualPoints;
            teamEntry.pj = tt.manualGamesPlayed ?? teamEntry.pj;
            teamEntry.pg = tt.manualWins ?? teamEntry.pg;
            teamEntry.pe = tt.manualDraws ?? teamEntry.pe;
            teamEntry.pp = tt.manualLosses ?? teamEntry.pp;
            teamEntry.gf = tt.manualGoalsFor ?? teamEntry.gf;
            teamEntry.gc = tt.manualGoalsAgainst ?? teamEntry.gc;
          }
        }
      });

      return Array.from(tableMap.values()).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const diffA = a.gf - a.gc;
        const diffB = b.gf - b.gc;
        if (diffB !== diffA) return diffB - diffA;
        return b.gf - a.gf;
      });
    };

    if (!isCup) {
      standings = calculateStandingsForMatches(validMatches, tournament.teams || []);
    } else {
      const cupGroups = Array.from(new Set(tournament.teams?.map((tt: any) => tt.group).filter(Boolean)));
      if (cupGroups.length > 0) {
        groupStandings = cupGroups.map((gName: any) => {
          const gTeams = tournament.teams?.filter((tt: any) => tt.group === gName) || [];
          const gTeamIds = new Set(gTeams.map((tt: any) => tt.teamId));
          const isPlayoffMatch = (m: any) => /final|cuarto|octavo|dieciseisavo|tercer|playoff|llave|3er|3ro/i.test(m.round || "");
          const gMatches = validMatches.filter((m: any) => 
            gTeamIds.has(m.homeTeamId) && 
            gTeamIds.has(m.awayTeamId) && 
            m.round?.toLowerCase().includes('grupo') &&
            !isPlayoffMatch(m)
          );
          return {
            name: `Grupo ${gName}`,
            standings: calculateStandingsForMatches(gMatches, gTeams)
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    const isGroups = isCup && groupStandings.length > 0;

    return (
      <div 
        ref={ref} 
        className="w-[1200px] h-fit min-h-[1200px] bg-[#0a0a0a] text-white flex flex-col items-center relative overflow-hidden font-sans pb-16 shadow-2xl"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(20,83,45,0.2) 0%, rgba(10,10,10,1) 80%)'
        }}
      >
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-900/30 to-transparent z-0"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-600/30 via-green-800/10 to-transparent rounded-full z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-600/20 via-teal-800/5 to-transparent rounded-full z-0"></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mt-16 z-10 w-full px-16">
          <div className="flex items-center justify-between w-full">
            <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-40 h-auto" />
            <div className="flex flex-col items-end text-right">
              <h2 className="text-4xl font-bold tracking-widest text-green-500 uppercase mb-3">
                {isGroups ? "FASE DE GRUPOS" : "TABLA DE POSICIONES"}
              </h2>
              <h1 className="text-6xl font-black uppercase max-w-3xl text-white leading-tight" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                {tournament.name}
              </h1>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-green-600 to-transparent mt-8 rounded-full"></div>
        </div>

        {/* CONTENT LAYOUT */}
        <div className="w-full max-w-6xl px-12 mt-16 flex flex-col items-center z-10 flex-1">
          <div className="bg-black/60 border border-white/10 p-12 rounded-3xl shadow-xl w-full">
            
            {!isGroups && standings.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/5 w-full">
                <table className="w-full text-left border-collapse text-xl">
                  <thead>
                    <tr className="bg-white/5 text-zinc-400 text-lg uppercase tracking-wider">
                      <th className="p-6 font-bold w-16 text-center">#</th>
                      <th className="p-6 font-bold">Equipo</th>
                      <th className="p-6 font-bold text-center">PJ</th>
                      <th className="p-6 font-bold text-center">PG</th>
                      <th className="p-6 font-bold text-center">PE</th>
                      <th className="p-6 font-bold text-center">PP</th>
                      <th className="p-6 font-bold text-center">GF</th>
                      <th className="p-6 font-bold text-center">GC</th>
                      <th className="p-6 font-bold text-center text-green-400">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((team, idx) => (
                      <tr key={team.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6 text-center font-bold text-zinc-500 text-2xl">{idx + 1}</td>
                        <td className="p-6 font-bold flex items-center gap-6">
                          {team.logo ? <img src={team.logo} className="w-14 h-14 object-contain drop-shadow-md" /> : <div className="w-14 h-14 bg-white/5 rounded-full" />}
                          <span className="text-2xl uppercase tracking-wider">{team.name}</span>
                        </td>
                        <td className="p-6 text-center text-zinc-400 text-2xl">{team.pj}</td>
                        <td className="p-6 text-center text-green-400 text-2xl">{team.pg}</td>
                        <td className="p-6 text-center text-yellow-400 text-2xl">{team.pe}</td>
                        <td className="p-6 text-center text-red-400 text-2xl">{team.pp}</td>
                        <td className="p-6 text-center text-zinc-300 text-xl">{team.gf}</td>
                        <td className="p-6 text-center text-zinc-300 text-xl">{team.gc}</td>
                        <td className="p-6 text-center font-black text-5xl text-green-400">{team.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {isGroups && groupStandings.length > 0 && (
              <div className="grid grid-cols-2 gap-10 w-full">
                {groupStandings.map((group, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-8 shadow-lg">
                    <h4 className="text-3xl font-black text-white mb-6 uppercase tracking-widest border-l-4 border-green-500 pl-4">{group.name}</h4>
                    <div className="overflow-hidden rounded-xl border border-white/5 w-full">
                      <table className="w-full text-left border-collapse text-lg">
                        <thead>
                          <tr className="bg-white/5 text-zinc-400 uppercase tracking-wider text-sm">
                            <th className="p-4 font-bold w-12 text-center">#</th>
                            <th className="p-4 font-bold">Equipo</th>
                            <th className="p-4 font-bold text-center">PJ</th>
                            <th className="p-4 font-bold text-center">PG</th>
                            <th className="p-4 font-bold text-center">PE</th>
                            <th className="p-4 font-bold text-center">PP</th>
                            <th className="p-4 font-bold text-center text-green-400">PTS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {group.standings.map((team: any, index: number) => (
                            <tr key={team.id} className="hover:bg-white/5">
                              <td className="p-4 text-center font-bold text-zinc-500 text-xl">{index + 1}</td>
                              <td className="p-4 font-bold flex items-center gap-4">
                                {team.logo && <img src={team.logo} className="w-10 h-10 object-contain drop-shadow-md" />}
                                <span className="truncate max-w-[200px] text-xl uppercase tracking-wider">{team.name}</span>
                              </td>
                              <td className="p-4 text-center text-zinc-400 text-xl">{team.pj}</td>
                              <td className="p-4 text-center text-green-400 text-xl">{team.pg}</td>
                              <td className="p-4 text-center text-yellow-400 text-xl">{team.pe}</td>
                              <td className="p-4 text-center text-red-400 text-xl">{team.pp}</td>
                              <td className="p-4 text-center font-black text-green-400 text-3xl">{team.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isGroups && standings.length === 0 && (
                <div className="py-12 text-zinc-500 italic text-2xl h-full flex items-center justify-center font-bold">
                    No hay equipos inscritos o tabla disponible.
                </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full mt-16 py-6 border-t border-white/5 text-center z-10 flex flex-col items-center justify-center gap-2">
            <span className="text-zinc-500 font-bold tracking-widest uppercase text-sm">
                LIGA TPM SUDAMÉRICA
            </span>
            <span className="text-green-500/50 font-bold tracking-widest uppercase text-xs">
                Generado Automáticamente • By Campah
            </span>
        </div>
      </div>
    );
  }
);

StandingsSummaryImage.displayName = 'StandingsSummaryImage';
