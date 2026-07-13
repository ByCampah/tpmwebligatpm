import React from "react";
import Link from "next/link";

interface BracketViewerProps {
  bracketData: any;
  teams: any[];
  type?: "team" | "player";
}

export default function BracketViewer({ bracketData, teams, type = "team" }: BracketViewerProps) {
  if (!bracketData || !bracketData.rounds) return null;

  const getEntity = (id: string) => {
    if (!id) return null;
    if (type === "team") {
      return teams.find(t => t.id === id || t.team?.id === id);
    } else {
      return teams.find(t => t.player?.id === id || t.id === id);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-4 sm:gap-8 min-w-max px-2 sm:px-4">
        {bracketData.rounds.map((round: any, rIndex: number) => (
          <div key={rIndex} className="flex flex-col min-w-[150px] sm:min-w-[180px]">
            <h3 className="text-center font-black text-sm sm:text-base text-primary mb-4 bg-secondary/50 py-1.5 rounded-t-xl">{round.name}</h3>
            
            <div className="flex flex-col justify-around flex-1 relative gap-8 py-4">
              {round.matches.map((match: any, mIndex: number) => {
                const entityA = getEntity(match.teamA);
                const entityB = getEntity(match.teamB);
                
                const teamA = type === "team" ? (entityA?.team || entityA) : (entityA?.player || entityA);
                const teamB = type === "team" ? (entityB?.team || entityB) : (entityB?.player || entityB);

                const hasPenA = match.penA !== "" && match.penA != null;
                const hasPenB = match.penB !== "" && match.penB != null;

                const winnerA = match.scoreA > match.scoreB || (match.scoreA === match.scoreB && match.penA > match.penB);
                const winnerB = match.scoreB > match.scoreA || (match.scoreA === match.scoreB && match.penB > match.penA);

                return (
                  <div key={match.id} className={`relative flex flex-col justify-center my-2 min-w-[140px] sm:min-w-[170px] ${match.isThirdPlace ? 'mt-8' : ''}`}>
                    {match.label && <div className="text-center text-[10px] font-bold text-muted-foreground uppercase mb-1">{match.label}</div>}
                    
                    {/* Visual Connector lines for next round */}
                    {rIndex < bracketData.rounds.length - 1 && !match.isThirdPlace && (
                      <>
                        <div className="absolute w-4 border-t-2 border-border/50 right-[-16px] top-1/2"></div>
                        {mIndex % 2 === 0 ? (
                          <div className="absolute w-4 border-r-2 border-border/50 right-[-16px] top-1/2 h-[calc(50%+16px)]"></div>
                        ) : (
                          <div className="absolute w-4 border-r-2 border-border/50 right-[-16px] bottom-1/2 h-[calc(50%+16px)]"></div>
                        )}
                      </>
                    )}

                    {/* The Match Card */}
                    <div className={`bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col z-10 hover:border-primary/50 transition-colors ${match.isThirdPlace ? 'border-dashed' : ''}`}>
                      
                      {/* Team A */}
                      <div className={`flex items-center justify-between p-1.5 border-b border-border/50 ${winnerA ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {teamA?.logoUrl ? (
                            <img src={teamA.logoUrl} alt={teamA.name} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                          ) : type === "player" ? (
                             <div className="w-4 h-4 sm:w-5 sm:h-5 bg-black rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white border border-white/10">
                               {teamA?.nick?.substring(0,2).toUpperCase() || "?"}
                             </div>
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-secondary rounded-full flex-shrink-0"></div>
                          )}
                          <Link href={teamA?.id ? (type === "team" ? `/equipos/${teamA.id}` : `/jugadores/${teamA.id}`) : '#'} className={`font-bold text-[10px] sm:text-xs truncate hover:text-primary transition-colors ${winnerA ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {teamA?.name || teamA?.nick || "TBD"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasPenA && <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">({match.penA})</span>}
                          <span className={`font-black text-xs sm:text-sm w-4 text-center ${winnerA ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.scoreA || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Team B */}
                      <div className={`flex items-center justify-between p-1.5 ${winnerB ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {teamB?.logoUrl ? (
                            <img src={teamB.logoUrl} alt={teamB.name} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                          ) : type === "player" ? (
                             <div className="w-4 h-4 sm:w-5 sm:h-5 bg-black rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white border border-white/10">
                               {teamB?.nick?.substring(0,2).toUpperCase() || "?"}
                             </div>
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-secondary rounded-full flex-shrink-0"></div>
                          )}
                          <Link href={teamB?.id ? (type === "team" ? `/equipos/${teamB.id}` : `/jugadores/${teamB.id}`) : '#'} className={`font-bold text-[10px] sm:text-xs truncate hover:text-primary transition-colors ${winnerB ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {teamB?.name || teamB?.nick || "TBD"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasPenB && <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">({match.penB})</span>}
                          <span className={`font-black text-xs sm:text-sm w-4 text-center ${winnerB ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.scoreB || "-"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Connector line from previous round */}
                    {rIndex > 0 && !match.isThirdPlace && (
                      <div className="absolute w-4 border-t-2 border-border/50 left-[-16px] top-1/2"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
