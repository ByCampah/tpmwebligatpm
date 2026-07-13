"use client";

import { useState } from "react";
import Link from "next/link";
import BracketViewer from "@/components/BracketViewer";

export default function ChallengeDetailClient({ challenge }: { challenge: any }) {
  const [activeTab, setActiveTab] = useState<"LLAVES" | "GRUPOS" | "PARTICIPANTES">("LLAVES");

  const groups = typeof challenge.groupsData === 'string' ? JSON.parse(challenge.groupsData || "[]") : challenge.groupsData || [];
  const bracketData = typeof challenge.bracketData === 'string' ? JSON.parse(challenge.bracketData || "{}") : challenge.bracketData || {};

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 bg-black/40 p-2 rounded-xl border border-border">
        {["LLAVES", "GRUPOS", "PARTICIPANTES"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-4 text-center font-black uppercase tracking-wider transition-colors rounded-lg text-sm ${activeTab === tab ? "bg-emerald-500/20 text-emerald-400 shadow-lg border border-emerald-500/30" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LLAVES TAB */}
      {activeTab === "LLAVES" && (
        <div className="bg-secondary/20 p-6 rounded-xl border border-white/5 overflow-hidden">
          {bracketData.rounds && bracketData.rounds.length > 0 ? (
            <BracketViewer bracketData={bracketData} teams={challenge.participants} type="player" />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Aún no hay llaves generadas para este challenge.
            </div>
          )}
        </div>
      )}

      {/* GRUPOS TAB */}
      {activeTab === "GRUPOS" && (
        <div className="bg-secondary/20 p-6 rounded-xl border border-white/5">
          {groups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay grupos registrados.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((g: any, gIndex: number) => (
                <div key={gIndex} className="bg-card border border-border rounded-xl p-0 overflow-hidden shadow-lg">
                  <div className="bg-emerald-500/10 border-b border-white/5 p-4 text-center">
                    <h3 className="font-black text-xl text-emerald-400">{g.name}</h3>
                  </div>
                  <div className="flex flex-col divide-y divide-white/5">
                    {g.players.map((p: any, pIndex: number) => (
                      <div key={pIndex} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors">
                        <span className="font-bold text-white">{p.nick || "-"}</span>
                        <span className="font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded">{p.score || "0"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PARTICIPANTES TAB */}
      {activeTab === "PARTICIPANTES" && (
        <div className="bg-secondary/20 p-6 rounded-xl border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {challenge.participants.map((p: any) => (
              <Link 
                href={`/jugadores/${p.player.id}`} 
                key={p.id}
                className="bg-card hover:bg-white/5 border border-border hover:border-emerald-500/30 p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-lg font-black text-white overflow-hidden group-hover:scale-110 transition-transform shadow-lg">
                  {p.player.nick.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-sm text-center text-muted-foreground group-hover:text-emerald-400 transition-colors">
                  {p.player.nick}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
