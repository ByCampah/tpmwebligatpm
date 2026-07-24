"use client";

import React, { forwardRef } from 'react';

interface FixtureSummaryImageProps {
  tournament: any;
  selectedRound?: string; // "ALL" or specific round like "Fecha 1"
  themeColor?: string;
}

import { getThemeColors } from '@/lib/themeColors';

export const FixtureSummaryImage = forwardRef<HTMLDivElement, FixtureSummaryImageProps>(
  ({ tournament, selectedRound = "ALL", themeColor = "emerald" }, ref) => {
    // Filter matches
    let matches = tournament.matches || [];
    
    // Quitar partidos "históricos" si están en el fixture
    matches = matches.filter((m: any) => !["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(m.round ?? ""));

    if (selectedRound !== "ALL") {
      matches = matches.filter((m: any) => m.round === selectedRound);
    }

    // Group by round
    const matchesByRound = matches.reduce((acc: any, m: any) => {
      const round = m.round || "Sin Etapa";
      if (!acc[round]) acc[round] = [];
      acc[round].push(m);
      return acc;
    }, {});

    const rounds = Object.keys(matchesByRound);

    const theme = getThemeColors(themeColor);

    return (
      <div 
        ref={ref} 
        className="w-[1200px] min-h-[1200px] h-fit bg-[#0a0a0a] text-white flex flex-col items-center relative overflow-hidden font-sans pb-16 shadow-2xl"
        style={{
          backgroundImage: theme.bgGradient,
        }}
      >
        {/* Decoración de fondo */}
        <div className={`absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[${theme.primary}]/40 to-transparent z-0`}></div>
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[${theme.primary}]/30 via-[${theme.primary}]/10 to-transparent rounded-full z-0`}></div>
        <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[${theme.secondary}]/20 via-[${theme.secondary}]/5 to-transparent rounded-full z-0`}></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mt-16 z-10 w-full px-16">
          <div className="flex items-center justify-between w-full">
            <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-40 h-auto" />
            <div className="flex flex-col items-end text-right">
              <h2 className="text-4xl font-bold tracking-widest uppercase mb-3" style={{ color: theme.secondary }}>
                FIXTURE{selectedRound !== "ALL" ? ` - ${selectedRound}` : ""}
              </h2>
              <h1 className="text-6xl font-black uppercase max-w-3xl text-white leading-tight" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                {tournament.name}
              </h1>
            </div>
          </div>
          <div className="h-1 w-full mt-8 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)` }}></div>
        </div>

        {/* CONTENT LAYOUT */}
        <div className="w-full max-w-6xl px-12 mt-16 flex flex-col gap-12 z-10 flex-1">
          {rounds.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <p className="text-3xl text-zinc-500 font-bold italic">No hay partidos programados.</p>
            </div>
          ) : (
            rounds.map((round) => (
              <div key={round} className="flex flex-col gap-6">
                {selectedRound === "ALL" && (
                  <h3 className="text-3xl font-black uppercase tracking-widest text-zinc-300 border-b border-white/10 pb-4 mb-4">
                    {round}
                  </h3>
                )}
                
                <div className="grid grid-cols-2 gap-8 w-full">
                  {matchesByRound[round].map((m: any) => {
                    const isPlayed = m.status === 'PLAYED';
                    return (
                      <div key={m.id} className="bg-black/60 border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between relative overflow-hidden">
                        {/* Background indicator if played */}
                        {isPlayed && <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5"></div>}
                        
                        {/* Home Team */}
                        <div className="flex flex-col items-center gap-4 w-1/3 z-10">
                          {m.homeTeam.logoUrl ? (
                            <img src={m.homeTeam.logoUrl} className="w-24 h-24 object-contain drop-shadow-md" alt={m.homeTeam.name} />
                          ) : (
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center font-bold text-2xl text-zinc-600">?</div>
                          )}
                          <span className="font-bold text-xl text-center uppercase tracking-wider">{m.homeTeam.name}</span>
                        </div>

                        {/* Score / VS */}
                        <div className="flex flex-col items-center justify-center w-1/3 z-10">
                          {isPlayed ? (
                            <div className="flex items-center gap-6">
                              <span className="text-6xl font-black text-white">{m.homeScore}</span>
                              <span className="text-2xl text-zinc-600">-</span>
                              <span className="text-6xl font-black text-white">{m.awayScore}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl font-black text-zinc-600">VS</span>
                                <span className="text-sm uppercase tracking-widest text-zinc-500 font-bold bg-white/5 px-3 py-1 rounded-full">Por jugar</span>
                            </div>
                          )}
                          
                          {isPlayed && (m.homePenaltyScore !== null && m.awayPenaltyScore !== null) && (
                            <div className="mt-2 text-yellow-500 font-bold text-lg bg-yellow-500/10 px-4 py-1 rounded-full border border-yellow-500/20">
                              PEN: {m.homePenaltyScore} - {m.awayPenaltyScore}
                            </div>
                          )}
                          
                          {m.scheduleNote && (
                            <div className="mt-3 text-blue-400 font-bold text-sm uppercase tracking-widest bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-500/20 text-center flex flex-col items-center justify-center leading-tight">
                              {m.scheduleNote.includes('-') ? m.scheduleNote.split('-').map((line: string, idx: number) => (
                                <span key={idx}>{line.trim()}</span>
                              )) : (
                                <span>{m.scheduleNote}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center gap-4 w-1/3 z-10">
                          {m.awayTeam.logoUrl ? (
                            <img src={m.awayTeam.logoUrl} className="w-24 h-24 object-contain drop-shadow-md" alt={m.awayTeam.name} />
                          ) : (
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center font-bold text-2xl text-zinc-600">?</div>
                          )}
                          <span className="font-bold text-xl text-center uppercase tracking-wider">{m.awayTeam.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="w-full mt-16 py-6 border-t border-white/5 text-center z-10 flex flex-col items-center justify-center gap-2">
            <span className="text-zinc-500 font-bold tracking-widest uppercase text-sm">
                LIGA TPM SUDAMÉRICA
            </span>
            <img src="/img/logos/ByCampah3.png" alt="By Campah" className="w-40 h-auto opacity-80 mt-2" />
        </div>
      </div>
    );
  }
);

FixtureSummaryImage.displayName = 'FixtureSummaryImage';
