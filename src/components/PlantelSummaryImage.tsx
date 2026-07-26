"use client";

import React, { forwardRef } from 'react';
import { getThemeColors } from '@/lib/themeColors';

interface PlantelSummaryImageProps {
  tournament: any;
  themeColor?: string;
  showDiscord?: boolean;
  showAvatar?: boolean;
  selectedTeam?: string; // "" o nombre del equipo
  limitGoalsTo4?: boolean;
}

export const PlantelSummaryImage = forwardRef<HTMLDivElement, PlantelSummaryImageProps>(
  ({ tournament, themeColor = "emerald", showDiscord = false, showAvatar = false, selectedTeam = "", limitGoalsTo4 = false }, ref) => {
    
    // 1. Calcular Goleadores, Asistidores, GK, PJ
    const playerStats = new Map<string, any>();
    
    // Solo contar partidos jugados que no sean de "Estadísticas Históricas"
    const validMatches = tournament.matches?.filter((m: any) => m.status === 'PLAYED' && (!["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(m.round ?? ""))) || [];
    
    validMatches.forEach((match: any) => {
      let validGoalsEvents: any[] = [];
      if (limitGoalsTo4 && match.events) {
        try {
          const parsedEvents = typeof match.events === 'string' ? JSON.parse(match.events) : match.events;
          if (Array.isArray(parsedEvents)) {
            let homeGoals = 0;
            let awayGoals = 0;
            const sortedEvents = [...parsedEvents].sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0));
            
            for (const ev of sortedEvents) {
              if (ev.type === 'GOAL' || ev.type === 'FREE_KICK_GOAL' || ev.type === 'PENALTY_GOAL') {
                if (ev.teamId === match.homeTeamId) {
                  if (homeGoals < 4) {
                    validGoalsEvents.push(ev);
                    homeGoals++;
                  }
                } else if (ev.teamId === match.awayTeamId) {
                  if (awayGoals < 4) {
                    validGoalsEvents.push(ev);
                    awayGoals++;
                  }
                }
              }
            }
          }
        } catch(e) {}
      }

      match.stats?.forEach((stat: any) => {
        if (!stat.player) return;
        const pId = stat.player.id;
        if (!playerStats.has(pId)) {
          playerStats.set(pId, {
            goals: 0,
            assists: 0,
            matchesPlayed: 0
          });
        }
        
        const pData = playerStats.get(pId);
        
        if (limitGoalsTo4 && match.events) {
           const playerGoalEvents = validGoalsEvents.filter(ev => ev.playerId === pId);
           const playerAssistEvents = validGoalsEvents.filter(ev => ev.assistId === pId);
           pData.goals += playerGoalEvents.length;
           pData.assists += playerAssistEvents.length;
        } else {
           pData.goals += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
           pData.assists += (stat.assists || 0);
        }

        if ((stat.matchTime || 0) > 0) pData.matchesPlayed += 1;
      });
    });

    const theme = getThemeColors(themeColor);

    // Filtrar equipos
    let teamsToRender = tournament.teams || [];
    if (selectedTeam && selectedTeam !== "") {
      teamsToRender = teamsToRender.filter((t: any) => t.team?.name === selectedTeam);
    }
    
    // Sort teams alphabetically
    teamsToRender.sort((a: any, b: any) => (a.team?.name || "").localeCompare(b.team?.name || ""));

    // Determinar columnas dependiendo de la cantidad de equipos
    let gridCols = "grid-cols-1";
    if (teamsToRender.length > 1) {
      if (teamsToRender.length <= 4) gridCols = "grid-cols-2";
      else if (teamsToRender.length <= 9) gridCols = "grid-cols-3";
      else gridCols = "grid-cols-4";
    }

    // Calcular el alto aproximado
    const isSingle = teamsToRender.length === 1;

    return (
      <div 
        ref={ref} 
        className={`${isSingle ? "w-[800px]" : "w-[1600px]"} bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans pb-12 shadow-2xl h-fit min-h-[1000px]`}
        style={{
          backgroundImage: theme.bgGradient,
        }}
      >
        {/* Decoración de fondo */}
        <div className={`absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[${theme.primary}]/40 to-transparent z-0`}></div>
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[${theme.primary}]/30 via-[${theme.primary}]/10 to-transparent rounded-full z-0`}></div>
        <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[${theme.secondary}]/20 via-[${theme.secondary}]/5 to-transparent rounded-full z-0`}></div>
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0"></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mt-12 z-10 w-full px-16 text-center">
          <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-48 h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-4" />
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-2" style={{ color: theme.secondary }}>
            PLANTELES OFICIALES
          </h2>
          <h1 className="text-5xl font-black uppercase max-w-4xl text-white leading-tight" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
            {tournament.name}
          </h1>
          <div className="h-1 w-full max-w-2xl mt-6 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)` }}></div>
        </div>

        {/* BODY */}
        <div className={`relative z-10 w-full px-12 mt-12 grid ${gridCols} gap-8 flex-1`}>
          {teamsToRender.map((t: any, index: number) => {
            const team = t.team;
            const players = t.players?.map((p: any) => p.player) || [];
            
            return (
              <div key={index} className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex flex-col items-center justify-center p-6 border-b" style={{ backgroundColor: `${theme.primary}22`, borderColor: `${theme.primary}44` }}>
                  <img src={team.logoUrl || "/img/trophy-default.png"} alt={team.name} className="w-24 h-24 object-contain mb-3 drop-shadow-xl" />
                  <h3 className="text-2xl font-black text-white text-center">{team.name}</h3>
                </div>
                <div className="flex flex-col p-2">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 text-xs font-bold text-muted-foreground uppercase">
                    <span className="flex-1">Jugador</span>
                    <div className="flex gap-4 w-32 justify-end">
                      <span className="w-8 text-center" title="Partidos Jugados">PJ</span>
                      <span className="w-8 text-center" title="Goles">G</span>
                      <span className="w-8 text-center" title="Asistencias">A</span>
                    </div>
                  </div>
                  {players.map((p: any, pIndex: number) => {
                    const stats = playerStats.get(p.id) || { matchesPlayed: 0, goals: 0, assists: 0 };
                    return (
                      <div key={pIndex} className="flex justify-between items-center px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          {showAvatar && (
                            <img src={p.avatarUrl || "/img/default-avatar.png"} alt={p.nick} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
                          )}
                          <div className="flex flex-col truncate justify-center">
                            <span className="font-bold text-lg text-white truncate flex items-center gap-2">
                              {p.nick}
                              {showDiscord && p.user?.discordId && (
                                <span className="text-sm font-normal text-muted-foreground mt-0.5">@{p.user.discordId}</span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 w-32 justify-end items-center">
                          <span className="font-black text-white w-8 text-center bg-white/10 rounded py-1">{stats.matchesPlayed}</span>
                          <span className="font-black text-white w-8 text-center bg-white/10 rounded py-1">{stats.goals}</span>
                          <span className="font-black text-white w-8 text-center bg-white/10 rounded py-1">{stats.assists}</span>
                        </div>
                      </div>
                    );
                  })}
                  {players.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground italic">
                      Sin jugadores registrados
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="relative z-10 w-full px-16 mt-16 pt-8 border-t border-white/10 flex justify-center items-center bg-black/40">
          <img src="/img/logos/ByCampah3.png" alt="ByCampah" className="h-28 w-auto opacity-100" />
        </div>
      </div>
    );
  }
);

PlantelSummaryImage.displayName = "PlantelSummaryImage";
