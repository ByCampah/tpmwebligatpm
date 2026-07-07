"use client";

import React, { forwardRef } from 'react';
import { getTrophyImage } from '@/lib/trophyImages';
import BracketViewer from './BracketViewer';

interface SeasonSummaryImageProps {
  tournament: any; // Raw tournament data
  layout?: "vertical" | "square";
}

export const SeasonSummaryImage = forwardRef<HTMLDivElement, SeasonSummaryImageProps>(
  ({ tournament, layout = "vertical" }, ref) => {
    // 1. Calcular Goleadores, Asistidores, GK
    const playerStats = new Map<string, any>();
    
    // Solo contar partidos jugados que no sean de "Estadísticas Históricas"
    const validMatches = tournament.matches?.filter((m: any) => m.status === 'PLAYED' && m.round !== 'Estadísticas Históricas') || [];
    
    validMatches.forEach((match: any) => {
      match.stats?.forEach((stat: any) => {
        if (!stat.player) return;
        const pId = stat.player.id;
        if (!playerStats.has(pId)) {
          // Encontrar equipo del jugador en este torneo
          let teamLogo = null;
          let teamName = null;
          const pTeamInfo = stat.player.tournamentTeams?.find((tt: any) => tt.tournamentTeam?.tournamentId === tournament.id);
          if (pTeamInfo) {
            teamLogo = pTeamInfo.tournamentTeam.team.logoUrl;
            teamName = pTeamInfo.tournamentTeam.team.name;
          }

          playerStats.set(pId, {
            id: pId,
            player: stat.player,
            nick: stat.player.nick,
            teamLogo,
            teamName,
            goals: 0,
            assists: 0,
            saves: 0,
            cleanSheets: 0
          });
        }
        
        const pData = playerStats.get(pId);
        pData.goals += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
        pData.assists += (stat.assists || 0);
        pData.saves += (stat.savesMade || 0);
        if (stat.cleanSheet) pData.cleanSheets += 1;
      });
    });

    const trophies = tournament.trophies || [];
    const championTrophy = trophies.find((t: any) => t.type === "TEAM" && (t.name.includes("Campeón") || t.name === "Campeon"));
    const championTeam = championTrophy?.team;

    let goleadorTrophy = trophies.find((t: any) => t.type === "PLAYER" && t.name.includes("Goleador"));
    let asistidorTrophy = trophies.find((t: any) => t.type === "PLAYER" && t.name.includes("Asistidor"));
    let gkTrophy = trophies.find((t: any) => t.type === "PLAYER" && (t.name.toLowerCase().includes("arquero") || t.name.toLowerCase().includes("gk") || t.name.toLowerCase().includes("salvadas")));
    let vallaTrophy = trophies.find((t: any) => t.type === "PLAYER" && t.name.toLowerCase().includes("valla") && t.id !== gkTrophy?.id);
    
    // Calculate Top 5 for weekly updates
    const playersArr = Array.from(playerStats.values());
    const topScorers = [...playersArr].sort((a, b) => b.goals - a.goals).slice(0, 5).filter(p => p.goals > 0);
    const topAssisters = [...playersArr].sort((a, b) => b.assists - a.assists).slice(0, 5).filter(p => p.assists > 0);
    const topKeepers = [...playersArr].sort((a, b) => b.saves !== a.saves ? b.saves - a.saves : b.cleanSheets - a.cleanSheets).slice(0, 5).filter(p => p.saves > 0 || p.cleanSheets > 0);

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
          const gMatches = validMatches.filter((m: any) => gTeamIds.has(m.homeTeamId) && gTeamIds.has(m.awayTeamId));
          return {
            name: `Grupo ${gName}`,
            standings: calculateStandingsForMatches(gMatches, gTeams)
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    const getPlayerStatInfo = (player: any) => {
      const pInfo = playerStats.get(player?.id);
      
      if (pInfo) {
        return {
          nick: player?.nick || "N/A",
          logo: pInfo.teamLogo || "/img/trophy-default.png",
          teamName: pInfo.teamName || ""
        };
      }

      // Fallback para copas o torneos donde el jugador no sumó estadísticas pero ganó el premio
      let fallbackLogo = "/img/trophy-default.png";
      let fallbackTeamName = "";

      if (tournament.teams) {
        for (const tt of tournament.teams) {
          if (tt.players?.some((p: any) => p.playerId === player?.id)) {
            fallbackLogo = tt.team?.logoUrl || fallbackLogo;
            fallbackTeamName = tt.team?.name || fallbackTeamName;
            break;
          }
        }
      }

      return {
        nick: player?.nick || "N/A",
        logo: fallbackLogo,
        teamName: fallbackTeamName
      };
    };

    const trophyImageUrl = getTrophyImage(tournament.name);

    return (
      <div 
        ref={ref} 
        className={`${layout === "square" ? "w-[1280px]" : "w-[1080px]"} min-h-[1080px] bg-[#0a0a0a] text-white flex flex-col items-center relative overflow-hidden font-sans pb-12 shadow-2xl`}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(30,58,138,0.3) 0%, rgba(10,10,10,1) 80%)'
        }}
      >
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-900/40 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-blue-800/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-600/20 via-green-800/5 to-transparent rounded-full"></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mt-16 z-10 w-full px-16">
          <div className="flex items-center justify-between w-full">
            <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-40 h-auto" />
            <div className="flex flex-col items-end text-right">
              <h2 className="text-3xl font-bold tracking-widest text-blue-400 uppercase mb-2">
                {tournament.season?.name || "Torneo de Pretemporada"}
              </h2>
              <h1 className="text-5xl font-black uppercase max-w-2xl text-white" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                {tournament.name}
              </h1>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-8 rounded-full"></div>
        </div>
        
        {/* CONTENT LAYOUT */}
        <div className={`w-full ${layout === "square" ? "max-w-7xl" : "max-w-5xl"} px-12 mt-12 flex ${layout === "square" ? "flex-row" : "flex-col"} gap-10 z-10 flex-1`}>
          
          <div className={`flex flex-col gap-10 ${layout === "square" ? "flex-1" : "w-full"}`}>
            {/* EL CAMPEÓN */}
            {championTeam && (
              <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-tr from-yellow-900/40 to-amber-600/20 border border-yellow-500/40 rounded-3xl relative overflow-hidden shadow-2xl">
                <h3 className="text-3xl font-black text-yellow-500 uppercase tracking-[0.3em] mb-12" style={{ textShadow: "0 0 15px rgba(234,179,8,0.7)" }}>
                  ¡Campeón!
                </h3>
                
                <div className="flex items-center justify-center gap-20 relative">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/40 via-yellow-600/10 to-transparent rounded-full scale-150"></div>
                    <img src={championTeam.logoUrl || "/img/trophy-default.png"} alt={championTeam.name} className="w-56 h-56 object-contain relative z-10" />
                  </div>

                  <div className="relative">
                    <img src={trophyImageUrl || undefined} alt="Trofeo" className="w-64 h-64 object-contain relative z-10" />
                  </div>
                </div>
                
                <h2 className="text-6xl font-black mt-12 text-center text-white" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                  {championTeam.name}
                </h2>
              </div>
            )}

            {/* TABLA O BRACKET */}
            <div className="bg-black/60 border border-white/10 p-10 rounded-3xl shadow-xl mt-4">
              <h3 className="text-2xl font-bold text-center uppercase tracking-widest text-zinc-300 mb-8 border-b border-white/10 pb-4">
                {isCup ? "Fase Final" : "Tabla de Posiciones Final"}
              </h3>
              
              {!isCup && (
                <div className="overflow-hidden rounded-xl border border-white/5 w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-zinc-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-bold">#</th>
                        <th className="p-4 font-bold">Equipo</th>
                        <th className="p-4 font-bold text-center">PJ</th>
                        <th className="p-4 font-bold text-center">PG</th>
                        <th className="p-4 font-bold text-center">PE</th>
                        <th className="p-4 font-bold text-center">PP</th>
                        <th className="p-4 font-bold text-center text-blue-400">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {standings.map((team, idx) => (
                        <tr key={team.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-zinc-500">{idx + 1}</td>
                          <td className="p-4 font-bold flex items-center gap-3">
                            <img src={team.logo} className="w-8 h-8 object-contain drop-shadow-md" />
                            <span className="text-lg">{team.name}</span>
                          </td>
                          <td className="p-4 text-center text-zinc-400">{team.pj}</td>
                          <td className="p-4 text-center text-green-400">{team.pg}</td>
                          <td className="p-4 text-center text-yellow-400">{team.pe}</td>
                          <td className="p-4 text-center text-red-400">{team.pp}</td>
                          <td className="p-4 text-center font-black text-xl text-blue-400">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isCup && groupStandings.length > 0 && (
                <div className="flex flex-col gap-8 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {groupStandings.map((group, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-xl font-bold text-zinc-300 mb-4">{group.name}</h4>
                        <div className="overflow-hidden rounded-xl border border-white/5">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-white/5 text-zinc-400 uppercase tracking-wider">
                                <th className="p-2 font-bold w-6 text-center">#</th>
                                <th className="p-2 font-bold">Equipo</th>
                                <th className="p-2 font-bold text-center">PJ</th>
                                <th className="p-2 font-bold text-center">PG</th>
                                <th className="p-2 font-bold text-center">PE</th>
                                <th className="p-2 font-bold text-center">PP</th>
                                <th className="p-2 font-bold text-center text-blue-400">PTS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {group.standings.map((team: any, index: number) => (
                                <tr key={team.id} className="hover:bg-white/5">
                                  <td className="p-2 text-center text-zinc-500">{index + 1}</td>
                                  <td className="p-2 font-bold flex items-center gap-2">
                                    {team.logo && <img src={team.logo} className="w-5 h-5 object-contain" />}
                                    <span className="truncate max-w-[100px]">{team.name}</span>
                                  </td>
                                  <td className="p-2 text-center text-zinc-400">{team.pj}</td>
                                  <td className="p-2 text-center text-zinc-400">{team.pg}</td>
                                  <td className="p-2 text-center text-zinc-400">{team.pe}</td>
                                  <td className="p-2 text-center text-zinc-400">{team.pp}</td>
                                  <td className="p-2 text-center font-black text-blue-400">{team.pts}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(tournament.bracketData || tournament.bracketImageUrl) && (
                <div className="flex flex-col gap-4 w-full">
                  {(!isCup || groupStandings.length > 0) && <h4 className="text-xl font-bold text-center text-zinc-300 border-t border-white/10 pt-8 mt-4">Llave Final</h4>}
                  <div className="flex justify-center transform scale-90 origin-top">
                    {tournament.bracketImageUrl ? (
                      <img src={tournament.bracketImageUrl} alt="Llave Final" className="w-full h-auto object-contain max-h-[800px] rounded-xl" />
                    ) : tournament.bracketData ? (
                      <BracketViewer bracketData={typeof tournament.bracketData === 'string' ? JSON.parse(tournament.bracketData) : tournament.bracketData} teams={tournament.teams?.map((t: any) => t.team) || []} />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PREMIOS INDIVIDUALES */}
          <div className={`${layout === "square" ? "flex flex-col w-[350px] gap-8" : "grid grid-cols-3 gap-8 mt-4"}`}>
            {/* GOLEADOR */}
            <div className="bg-gradient-to-b from-blue-900/30 to-black border border-blue-500/30 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-4xl opacity-50">⚽</div>
              <h4 className="text-blue-400 font-bold uppercase tracking-wider text-lg mb-4">Goleadores</h4>
              {goleadorTrophy?.player ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="w-24 h-24 bg-black/60 rounded-full border-4 border-blue-500/50 flex items-center justify-center p-2 mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <img src={getPlayerStatInfo(goleadorTrophy.player).logo} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-2xl font-black mb-1">{goleadorTrophy.player.nick}</span>
                  <span className="text-zinc-400 font-bold text-xs mb-3">{getPlayerStatInfo(goleadorTrophy.player).teamName}</span>
                  <span className="text-zinc-300 text-lg font-bold bg-blue-500/20 px-3 py-1 rounded-full">{goleadorTrophy.extraInfo || "-"}</span>
                </div>
              ) : topScorers.length > 0 ? (
                <div className="flex flex-col w-full gap-2 mt-2">
                  {topScorers.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2">
                         <span className="text-blue-500 font-bold w-4">{idx + 1}</span>
                         <img src={getPlayerStatInfo(p.player).logo} className="w-6 h-6 object-contain" />
                         <span className="font-bold text-sm truncate max-w-[100px] text-left">{p.nick}</span>
                      </div>
                      <span className="font-black text-blue-400">{p.goals}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-zinc-600 italic text-xl h-full flex items-center">No definido</div>
              )}
            </div>

            {/* ASISTIDOR */}
            <div className="bg-gradient-to-b from-pink-900/30 to-black border border-pink-500/30 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-4xl opacity-50">👟</div>
              <h4 className="text-pink-400 font-bold uppercase tracking-wider text-lg mb-4">Asistencias</h4>
              {asistidorTrophy?.player ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="w-24 h-24 bg-black/60 rounded-full border-4 border-pink-500/50 flex items-center justify-center p-2 mb-3 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    <img src={getPlayerStatInfo(asistidorTrophy.player).logo} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-2xl font-black mb-1">{asistidorTrophy.player.nick}</span>
                  <span className="text-zinc-400 font-bold text-xs mb-3">{getPlayerStatInfo(asistidorTrophy.player).teamName}</span>
                  <span className="text-zinc-300 text-lg font-bold bg-pink-500/20 px-3 py-1 rounded-full">{asistidorTrophy.extraInfo || "-"}</span>
                </div>
              ) : topAssisters.length > 0 ? (
                <div className="flex flex-col w-full gap-2 mt-2">
                  {topAssisters.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-pink-500/20">
                      <div className="flex items-center gap-2">
                         <span className="text-pink-500 font-bold w-4">{idx + 1}</span>
                         <img src={getPlayerStatInfo(p.player).logo} className="w-6 h-6 object-contain" />
                         <span className="font-bold text-sm truncate max-w-[100px] text-left">{p.nick}</span>
                      </div>
                      <span className="font-black text-pink-400">{p.assists}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-zinc-600 italic text-xl h-full flex items-center">No definido</div>
              )}
            </div>

            {/* ARQUEROS (Combined Mejor GK and Valla Invicta) */}
            <div className="bg-gradient-to-b from-teal-900/30 to-black border border-teal-500/30 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-4xl opacity-50">🧤</div>
              <h4 className="text-teal-400 font-bold uppercase tracking-wider text-lg mb-4">Arqueros</h4>
              
              <div className="flex flex-col w-full h-full gap-2 mt-2">
                {gkTrophy?.player || vallaTrophy?.player ? (
                  <div className="flex flex-col justify-around h-full gap-4">
                    {gkTrophy?.player && (
                      <div className="flex flex-col items-center bg-black/40 p-3 rounded-2xl border border-teal-500/20">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-16 h-16 bg-black/60 rounded-full border-2 border-teal-500/50 flex items-center justify-center p-2 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                            <img src={getPlayerStatInfo(gkTrophy.player).logo} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xl font-black">{gkTrophy.player.nick}</span>
                            <span className="text-zinc-400 font-bold text-xs">{getPlayerStatInfo(gkTrophy.player).teamName}</span>
                          </div>
                        </div>
                        <span className="text-zinc-300 text-sm font-bold bg-teal-500/20 px-3 py-1 rounded-full w-full">Salvadas: {gkTrophy.extraInfo || "-"}</span>
                      </div>
                    )}

                    {vallaTrophy?.player && (
                      <div className="flex flex-col items-center bg-black/40 p-3 rounded-2xl border border-teal-500/20">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-16 h-16 bg-black/60 rounded-full border-2 border-teal-500/50 flex items-center justify-center p-2 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                            <img src={getPlayerStatInfo(vallaTrophy.player).logo} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xl font-black">{vallaTrophy.player.nick}</span>
                            <span className="text-zinc-400 font-bold text-xs">{getPlayerStatInfo(vallaTrophy.player).teamName}</span>
                          </div>
                        </div>
                        <span className="text-zinc-300 text-sm font-bold bg-teal-500/20 px-3 py-1 rounded-full w-full">Valla Invicta: {vallaTrophy.extraInfo || "-"}</span>
                      </div>
                    )}
                  </div>
                ) : topKeepers.length > 0 ? (
                  <div className="flex flex-col w-full gap-2">
                    {/* Encabezado */}
                    <div className="flex items-center justify-end w-full gap-2 text-[10px] uppercase text-teal-500/70 font-bold px-1 mb-1">
                      <span className="w-6 text-center">Sal.</span>
                      <span className="w-6 text-center">VI</span>
                    </div>
                    {topKeepers.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-teal-500/20">
                        <div className="flex items-center gap-2">
                           <span className="text-teal-500 font-bold w-4">{idx + 1}</span>
                           <img src={getPlayerStatInfo(p.player).logo} className="w-6 h-6 object-contain" />
                           <span className="font-bold text-sm truncate max-w-[70px] text-left">{p.nick}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-black">
                           <span className="text-teal-400 w-6 text-center">{p.saves}</span>
                           <span className="text-emerald-400 w-6 text-center">{p.cleanSheets}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-zinc-600 italic text-xl h-full flex items-center justify-center">No definido</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="w-full mt-16 py-6 border-t border-white/5 text-center z-10 flex items-center justify-center gap-4">
            <span className="text-zinc-500 font-bold tracking-widest uppercase text-sm">
                {tournament.name} • By Campah
            </span>
        </div>
      </div>
    );
  }
);

SeasonSummaryImage.displayName = 'SeasonSummaryImage';
