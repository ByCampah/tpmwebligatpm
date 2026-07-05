import React from "react";
import Link from "next/link";

interface BracketViewerProps {
  bracketData: any;
  teams: any[];
}

export default function BracketViewer({ bracketData, teams }: BracketViewerProps) {
  if (!bracketData || !bracketData.rounds) return null;

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId || t.team?.id === teamId);

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max px-4">
        {bracketData.rounds.map((round: any, rIndex: number) => (
          <div key={rIndex} className="flex flex-col min-w-[260px] sm:min-w-[300px]">
            <h3 className="text-center font-black text-xl text-primary mb-6 bg-secondary/50 py-2 rounded-t-xl">{round.name}</h3>
            
            <div className="flex flex-col justify-around flex-1 relative gap-8 py-4">
              {round.matches.map((match: any, mIndex: number) => {
                const teamA = getTeam(match.teamA)?.team || getTeam(match.teamA);
                const teamB = getTeam(match.teamB)?.team || getTeam(match.teamB);

                const hasPenA = match.penA !== "" && match.penA != null;
                const hasPenB = match.penB !== "" && match.penB != null;

                const winnerA = match.scoreA > match.scoreB || (match.scoreA === match.scoreB && match.penA > match.penB);
                const winnerB = match.scoreB > match.scoreA || (match.scoreA === match.scoreB && match.penB > match.penA);

                return (
                  <div key={match.id} className="relative flex flex-col justify-center my-2">
                    
                    {/* Visual Connector lines for next round */}
                    {rIndex < bracketData.rounds.length - 1 && (
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
                    <div className="bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden flex flex-col z-10 hover:border-primary/50 transition-colors">
                      
                      {/* Team A */}
                      <div className={`flex items-center justify-between p-2 sm:p-3 border-b border-border/50 ${winnerA ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          {teamA?.logo ? (
                            <img src={teamA.logo} alt={teamA.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex-shrink-0"></div>
                          )}
                          <Link href={teamA?.id ? `/equipos/${teamA.id}` : '#'} className={`font-bold text-sm sm:text-base truncate hover:text-primary transition-colors ${winnerA ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {teamA?.name || "TBD"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasPenA && <span className="text-[10px] sm:text-xs text-muted-foreground font-bold">({match.penA})</span>}
                          <span className={`font-black text-lg sm:text-xl w-6 text-center ${winnerA ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.scoreA || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Team B */}
                      <div className={`flex items-center justify-between p-2 sm:p-3 ${winnerB ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          {teamB?.logo ? (
                            <img src={teamB.logo} alt={teamB.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex-shrink-0"></div>
                          )}
                          <Link href={teamB?.id ? `/equipos/${teamB.id}` : '#'} className={`font-bold text-sm sm:text-base truncate hover:text-primary transition-colors ${winnerB ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {teamB?.name || "TBD"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasPenB && <span className="text-[10px] sm:text-xs text-muted-foreground font-bold">({match.penB})</span>}
                          <span className={`font-black text-lg sm:text-xl w-6 text-center ${winnerB ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.scoreB || "-"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Connector line from previous round */}
                    {rIndex > 0 && (
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
