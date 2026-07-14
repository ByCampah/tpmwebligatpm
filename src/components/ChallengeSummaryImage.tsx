"use client";

import React, { forwardRef } from 'react';
import BracketViewer from './BracketViewer';

interface ChallengeSummaryImageProps {
  challenge: any;
  layout?: "vertical" | "square";
}

export const ChallengeSummaryImage = forwardRef<HTMLDivElement, ChallengeSummaryImageProps>(
  ({ challenge, layout = "vertical" }, ref) => {
    const groups = typeof challenge.groupsData === 'string' ? JSON.parse(challenge.groupsData || "[]") : (challenge.groupsData || []);
    const bracketData = typeof challenge.bracketData === 'string' ? JSON.parse(challenge.bracketData || "{}") : (challenge.bracketData || {});
    
    const formattedParticipants = challenge.participants.map((p: any) => ({
      id: p.playerId,
      player: p.player,
    }));

    return (
      <div 
        ref={ref} 
        className={`bg-[#0a0a0a] text-white p-8 relative overflow-hidden flex flex-col gap-8 ${layout === "square" ? "w-[1200px] h-[1200px]" : "w-[1200px] min-h-[1600px] h-fit"}`}
        style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[100px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.05]"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center justify-center border-b border-white/10 pb-8 text-center">
          <div className="w-24 h-24 mb-4">
            <img src="/img/logos/LogoTPM.png" alt="Liga TPM" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter uppercase">
            {challenge.name}
          </h1>
          <p className="text-2xl font-bold text-muted-foreground mt-2 uppercase tracking-widest">{challenge.type} CHALLENGE</p>
        </div>

        <div className="relative z-10 flex flex-col gap-12 flex-1">
          {groups && groups.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-black text-center text-white bg-white/5 py-4 rounded-xl border border-white/10">Fase de Grupos</h2>
              <div className="grid grid-cols-2 gap-6">
                {groups.map((g: any, gIndex: number) => (
                  <div key={gIndex} className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-emerald-500/20 py-3 text-center border-b border-emerald-500/20">
                      <h3 className="font-black text-emerald-400 text-xl">{g.name || `Grupo ${gIndex + 1}`}</h3>
                    </div>
                    <div className="flex flex-col">
                      {g.players.map((p: any, pIndex: number) => (
                        <div key={pIndex} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-white">{p.nick || "TBD"}</span>
                          </div>
                          <span className="font-black text-xl text-primary">{p.score || "0"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bracketData && bracketData.rounds && bracketData.rounds.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-black text-center text-white bg-white/5 py-4 rounded-xl border border-white/10">Eliminatorias</h2>
              <div className="bg-black/40 p-6 rounded-xl border border-white/10 overflow-hidden transform scale-90 origin-top">
                <BracketViewer bracketData={bracketData} teams={formattedParticipants} type="player" />
              </div>
            </div>
          )}
          
          {(!groups || groups.length === 0) && (!bracketData || !bracketData.rounds || bracketData.rounds.length === 0) && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-2xl text-muted-foreground font-bold">Datos del torneo no disponibles o en progreso.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex justify-between items-center mt-auto">
          <div className="flex flex-col">
            <span className="font-black text-xl text-white">LIGA TPM</span>
            <span className="text-sm text-emerald-400 font-bold">Online Football Manager</span>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Desarrollador</span>
              <span className="text-sm text-white font-black">Campah</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Comunidad</span>
              <span className="text-sm text-white font-black">TPM Sudamerica</span>
            </div>
          </div>
        </div>

      </div>
    );
  }
);

ChallengeSummaryImage.displayName = 'ChallengeSummaryImage';
