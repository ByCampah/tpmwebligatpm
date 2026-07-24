"use client";

import React, { forwardRef } from 'react';
import BracketViewer from './BracketViewer';

interface BracketSummaryImageProps {
  tournament: any;
}

export const BracketSummaryImage = forwardRef<HTMLDivElement, BracketSummaryImageProps>(
  ({ tournament }, ref) => {
    
    return (
      <div 
        ref={ref} 
        className="w-[1920px] h-[1080px] bg-[#0a0a0a] text-white flex flex-col items-center relative overflow-hidden font-sans pb-16 shadow-2xl justify-center"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(185,28,28,0.2) 0%, rgba(10,10,10,1) 80%)'
        }}
      >
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-red-900/30 to-transparent z-0"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/30 via-red-800/10 to-transparent rounded-full z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/20 via-orange-800/5 to-transparent rounded-full z-0"></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mt-16 z-10 w-full px-16 absolute top-0">
          <div className="flex items-center justify-between w-full">
            <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-40 h-auto" />
            <div className="flex flex-col items-end text-right">
              <h2 className="text-4xl font-bold tracking-widest text-red-600 uppercase mb-3">
                LLAVES
              </h2>
              <h1 className="text-6xl font-black uppercase max-w-3xl text-white leading-tight" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                {tournament.name}
              </h1>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent mt-8 rounded-full"></div>
        </div>

        {/* CONTENT LAYOUT */}
        <div className="w-full max-w-7xl px-12 flex flex-col items-center justify-center z-10 h-full mt-32">
            {(tournament.bracketData || tournament.bracketImageUrl) ? (
                <div className="bg-black/80 border border-white/10 p-12 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)] flex justify-center transform scale-110">
                {tournament.bracketImageUrl ? (
                    <img src={tournament.bracketImageUrl} alt="Llave Final" className="w-full h-auto object-contain max-h-[800px] rounded-xl" />
                ) : tournament.bracketData ? (
                    <BracketViewer bracketData={typeof tournament.bracketData === 'string' ? JSON.parse(tournament.bracketData) : tournament.bracketData} teams={tournament.teams?.map((t: any) => t.team) || []} />
                ) : null}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-3xl text-zinc-500 font-bold italic">Aún no hay llaves generadas.</p>
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="w-full py-6 text-center z-10 flex flex-col items-center justify-center gap-2 absolute bottom-0">
            <span className="text-zinc-500 font-bold tracking-widest uppercase text-sm">
                LIGA TPM SUDAMÉRICA
            </span>
            <span className="text-red-500/50 font-bold tracking-widest uppercase text-xs">
                BY CAMPAH
            </span>
        </div>
      </div>
    );
  }
);

BracketSummaryImage.displayName = 'BracketSummaryImage';
