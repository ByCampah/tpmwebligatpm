import { forwardRef } from 'react';
import Image from "next/image";

interface Props {
  tournament: any;
  themeColor: string;
  selectedStats: string[];
  contentScale?: number;
  layout?: "square" | "vertical";
  customWidth?: number;
  customHeight?: number;
  customCols?: number;
}

export const STAT_CONFIG: Record<string, { label: string, emoji: string, getValue: (p: any) => number, getTotal?: (p: any) => number }> = {
  goals: { label: "Goleadores", emoji: "⚽", getValue: p => p.goals },
  assists: { label: "Asistencias", emoji: "👟", getValue: p => p.assists },
  passesMade: { label: "Pases Completados", emoji: "🎯", getValue: p => p.passesMade, getTotal: p => p.passesTotal },
  shotsMade: { label: "Tiros al Arco", emoji: "🥅", getValue: p => p.shotsMade, getTotal: p => p.shotsTotal },
  headersMade: { label: "Duelos de Cabeza", emoji: "🦅", getValue: p => p.headersMade, getTotal: p => p.headersTotal },
  slidingMade: { label: "Barridas (Sliding)", emoji: "🥾", getValue: p => p.slidingMade, getTotal: p => p.slidingTotal },
  tacklesWon: { label: "Quites / Duelos", emoji: "🛡️", getValue: p => p.tacklesWon },
  fouls: { label: "Faltas Cometidas", emoji: "⚠️", getValue: p => p.fouls },
  fouled: { label: "Faltas Recibidas", emoji: "🤕", getValue: p => p.fouled },
  offsides: { label: "Fueras de Juego", emoji: "🚩", getValue: p => p.offsides },
  ballLosses: { label: "Pérdidas de Balón", emoji: "📉", getValue: p => p.ballLosses },
  redCards: { label: "Tarjetas Rojas", emoji: "🟥", getValue: p => p.redCards },
  savesMade: { label: "Atajadas (GK)", emoji: "🧤", getValue: p => p.savesMade, getTotal: p => p.savesTotal },
  cleanSheets: { label: "Vallas Invictas", emoji: "🧱", getValue: p => p.cleanSheets },
  freeKickGoals: { label: "Goles Tiro Libre", emoji: "☄️", getValue: p => p.freeKickGoals },
  penaltyGoals: { label: "Goles de Penal", emoji: "🎯", getValue: p => p.penaltyGoals },
};

export const AdvancedStatsSummaryImage = forwardRef<HTMLDivElement, Props>(({
  tournament,
  themeColor,
  selectedStats,
  contentScale = 100,
  layout = "square",
  customWidth = 2400,
  customHeight = 2400,
  customCols = 4
}, ref) => {
  const getThemeStyles = () => {
    switch (themeColor) {
      case 'red': return {
        bgGradient: 'radial-gradient(circle at 50% 0%, #3a0000 0%, #0a0a0a 100%)',
        accentColor: 'text-red-500',
        borderColor: 'border-red-500/30',
        badgeBg: 'bg-red-500/20 text-red-300'
      };
      case 'blue': return {
        bgGradient: 'radial-gradient(circle at 50% 0%, #001a3a 0%, #0a0a0a 100%)',
        accentColor: 'text-blue-500',
        borderColor: 'border-blue-500/30',
        badgeBg: 'bg-blue-500/20 text-blue-300'
      };
      case 'purple': return {
        bgGradient: 'radial-gradient(circle at 50% 0%, #2a003a 0%, #0a0a0a 100%)',
        accentColor: 'text-purple-500',
        borderColor: 'border-purple-500/30',
        badgeBg: 'bg-purple-500/20 text-purple-300'
      };
      case 'gold': return {
        bgGradient: 'radial-gradient(circle at 50% 0%, #3a2e00 0%, #0a0a0a 100%)',
        accentColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/30',
        badgeBg: 'bg-yellow-500/20 text-yellow-300'
      };
      case 'emerald':
      default: return {
        bgGradient: 'radial-gradient(circle at 50% 0%, #002211 0%, #0a0a0a 100%)',
        accentColor: 'text-emerald-500',
        borderColor: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/20 text-emerald-300'
      };
    }
  };

  const theme = getThemeStyles();

  // Aggregate stats from all matches
  const playerMap = new Map<string, any>();

  const enrolledTeamsData = tournament.teams || [];

  tournament.matches?.forEach((m: any) => {
    m.stats?.forEach((s: any) => {
      const pId = s.playerId;
      if (!playerMap.has(pId)) {
        // Find player info
        const rosterEntry = enrolledTeamsData.flatMap((t:any) => t.players).find((p:any) => p.playerId === pId);
        const teamEntry = enrolledTeamsData.find((t:any) => t.players?.some((p:any) => p.playerId === pId));
        
        playerMap.set(pId, {
          id: pId,
          nick: rosterEntry?.player?.nick || rosterEntry?.player?.name || "Desconocido",
          teamName: teamEntry?.team?.name || "Sin Equipo",
          teamLogo: teamEntry?.team?.logoUrl || null,
          goals: 0,
          assists: 0,
          passesMade: 0,
          passesTotal: 0,
          shotsMade: 0,
          shotsTotal: 0,
          headersMade: 0,
          headersTotal: 0,
          slidingMade: 0,
          slidingTotal: 0,
          tacklesWon: 0,
          fouls: 0,
          fouled: 0,
          offsides: 0,
          ballLosses: 0,
          redCards: 0,
          savesMade: 0,
          savesTotal: 0,
          cleanSheets: 0,
          freeKickGoals: 0,
          penaltyGoals: 0,
        });
      }
      const p = playerMap.get(pId);
      p.goals += s.goals || 0;
      p.assists += s.assists || 0;
      p.passesMade += s.passesMade || 0;
      p.passesTotal += s.passesTotal || 0;
      p.shotsMade += s.shotsMade || 0;
      p.shotsTotal += s.shotsTotal || 0;
      p.headersMade += s.headersMade || 0;
      p.headersTotal += s.headersTotal || 0;
      p.slidingMade += s.slidingMade || 0;
      p.slidingTotal += s.slidingTotal || 0;
      p.tacklesWon += s.tacklesWon || 0;
      p.fouls += s.fouls || 0;
      p.fouled += s.fouled || 0;
      p.offsides += s.offsides || 0;
      p.ballLosses += s.ballLosses || 0;
      p.redCards += s.redCards || 0;
      p.savesMade += s.savesMade || 0;
      p.savesTotal += s.savesTotal || 0;
      if (s.cleanSheet) p.cleanSheets += 1;
      p.freeKickGoals += s.freeKickGoals || 0;
      p.penaltyGoals += s.penaltyGoals || 0;
    });
  });

  const allPlayers = Array.from(playerMap.values());

  // Helper to get top 5
  const getTop5 = (statKey: string) => {
    const config = STAT_CONFIG[statKey];
    if (!config) return [];
    
    // Sort descending by value, then alphabetically by nick
    return [...allPlayers]
      .filter(p => config.getValue(p) > 0)
      .sort((a, b) => {
        const valA = config.getValue(a);
        const valB = config.getValue(b);
        if (valB !== valA) return valB - valA;
        return a.nick.localeCompare(b.nick);
      })
      .slice(0, 5);
  };

  const getGridCols = () => {
    return `grid-cols-${customCols}`;
  };

  return (
    <div 
      ref={ref} 
      className={`bg-[#0a0a0a] text-white flex flex-col items-center relative overflow-hidden font-sans shadow-2xl justify-start pb-16`}
      style={{
        backgroundImage: theme.bgGradient,
        width: `${customWidth}px`,
        height: `${customHeight}px`
      }}
    >
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px]"></div>

      {/* ENVOLTORIO ESCALABLE */}
      <div 
        className="flex flex-col items-center w-full z-10 flex-1 px-12"
        style={{ transform: `scale(${contentScale / 100})`, transformOrigin: "center center" }}
      >
        {/* HEADER */}
        <div className="flex flex-col items-center mt-16 w-full mb-16">
          <div className="flex items-center justify-between w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logos/LogoTPM.png" alt="TPM Sudamerica" className="w-40 h-auto" />
            <div className="flex flex-col items-end text-right">
              <span className={`text-4xl font-black uppercase tracking-[0.3em] ${theme.badgeBg} px-8 py-3 rounded-full border ${theme.borderColor} mb-6`}>
                {tournament.season?.name || "Torneo Extra"}
              </span>
              <h2 className={`text-5xl font-black uppercase tracking-[0.2em] ${theme.accentColor} mb-2`}>
                TOP ESTADÍSTICAS AVANZADAS
              </h2>
              <h1 className="text-6xl font-black uppercase max-w-3xl text-white leading-tight" style={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                {tournament.name}
              </h1>
            </div>
          </div>
          <div className={`h-1 w-full mt-8 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent`}></div>
        </div>

        {/* STATS GRID */}
        <div className={`w-full grid ${getGridCols()} gap-8 items-start flex-1 mb-16 content-center`}>
          {selectedStats.map(statKey => {
            const config = STAT_CONFIG[statKey];
            if (!config) return null;
            const top5 = getTop5(statKey);

            return (
              <div key={statKey} className={`bg-black/60 border ${theme.borderColor} rounded-3xl p-10 flex flex-col shadow-2xl backdrop-blur-sm relative overflow-hidden h-full`}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                
                <div className="flex items-center justify-center gap-4 mb-10 border-b border-white/10 pb-6">
                  <span className="text-5xl">{config.emoji}</span>
                  <h3 className="text-3xl font-black text-center tracking-wider">{config.label}</h3>
                </div>

                {top5.length > 0 ? (
                  <div className="flex flex-col gap-4 flex-1 justify-center">
                    {top5.map((p, index) => (
                      <div key={p.id} className="flex items-center gap-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                        <span className={`text-4xl font-black ${index === 0 ? theme.accentColor : 'text-white/40'} w-12 text-center`}>
                          {index + 1}
                        </span>
                        {p.teamLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.teamLogo} alt={p.teamName} className="w-12 h-12 object-contain drop-shadow-md" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-lg font-bold">
                            {p.teamName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-2xl font-bold truncate pr-2" title={p.nick}>{p.nick}</span>
                          <span className="text-lg text-white/50 truncate uppercase tracking-wider">{p.teamName}</span>
                        </div>
                        <div className="flex flex-col items-end min-w-[70px]">
                          <span className={`text-4xl font-black ${theme.accentColor} drop-shadow-lg tabular-nums text-right leading-none`}>
                            {config.getValue(p)}
                          </span>
                          {config.getTotal && config.getTotal(p) > 0 && (
                            <span className="text-sm text-white/60 font-bold mt-2 tabular-nums whitespace-nowrap">
                              {config.getValue(p)}/{config.getTotal(p)} <span className="text-white/40">({Math.round((config.getValue(p) / config.getTotal(p)) * 100)}%)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <span className="text-xl text-white/30 font-bold uppercase tracking-wider text-center">Sin datos registrados</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="w-full mt-auto py-8 border-t border-white/5 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-zinc-500 font-bold tracking-widest uppercase text-lg">
                LIGA TPM SUDAMÉRICA
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logos/ByCampah3.png" alt="By Campah" className="w-48 h-auto opacity-80 mt-2" />
        </div>
      </div>

    </div>
  );
});

AdvancedStatsSummaryImage.displayName = 'AdvancedStatsSummaryImage';
