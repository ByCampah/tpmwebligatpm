import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { homeTeam: true, awayTeam: true }
  });

  if (!match) return { title: "Partido no encontrado" };

  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} | Liga TPM`,
  };
}

export default async function PartidoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      tournament: true,
      stats: {
        include: {
          player: {
            include: {
              tournamentTeams: {
                include: {
                  tournamentTeam: {
                    include: {
                      team: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!match) {
    notFound();
  }

  const getPlayerTeamId = (playerId: string) => {
    const player = match.stats.find(s => s.playerId === playerId)?.player;
    if (!player) return null;
    const tt = player.tournamentTeams.find(t => t.tournamentTeam.tournamentId === match.tournamentId);
    return tt?.tournamentTeam.teamId || null;
  };

  const homeStats = match.stats.filter(s => getPlayerTeamId(s.playerId) === match.homeTeamId && ((s.matchTime || 0) > 0 || (s.gkTime || 0) > 0));
  const awayStats = match.stats.filter(s => getPlayerTeamId(s.playerId) === match.awayTeamId && ((s.matchTime || 0) > 0 || (s.gkTime || 0) > 0));

  const events: any[] = match.events ? (typeof match.events === 'string' ? JSON.parse(match.events) : match.events) : [];
  events.sort((a, b) => a.minute - b.minute);

  const homeGeneral = {
    shots: homeStats.reduce((acc, s) => acc + s.shotsMade, 0),
    shotsTotal: homeStats.reduce((acc, s) => acc + s.shotsTotal, 0),
    passes: homeStats.reduce((acc, s) => acc + s.passesMade, 0),
    passesTotal: homeStats.reduce((acc, s) => acc + s.passesTotal, 0),
    tackles: homeStats.reduce((acc, s) => acc + s.tacklesWon, 0),
    fouls: homeStats.reduce((acc, s) => acc + s.fouls, 0),
    offsides: homeStats.reduce((acc, s) => acc + s.offsides, 0),
    saves: homeStats.reduce((acc, s) => acc + s.savesMade, 0),
  };

  const awayGeneral = {
    shots: awayStats.reduce((acc, s) => acc + s.shotsMade, 0),
    shotsTotal: awayStats.reduce((acc, s) => acc + s.shotsTotal, 0),
    passes: awayStats.reduce((acc, s) => acc + s.passesMade, 0),
    passesTotal: awayStats.reduce((acc, s) => acc + s.passesTotal, 0),
    tackles: awayStats.reduce((acc, s) => acc + s.tacklesWon, 0),
    fouls: awayStats.reduce((acc, s) => acc + s.fouls, 0),
    offsides: awayStats.reduce((acc, s) => acc + s.offsides, 0),
    saves: awayStats.reduce((acc, s) => acc + s.savesMade, 0),
  };

  const formatStat = (made: number, total: number) => {
    const percentage = total > 0 ? Math.round((made / total) * 100) : 0;
    return `${made}/${total} ${percentage}%`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      <Link href="/historial" className="text-primary hover:underline font-bold self-start">
        &larr; Volver
      </Link>

      {/* Match Header */}
      <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
        
        <div className="text-center">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{match.tournament.name}</div>
          <div className="text-xl font-black text-white">{match.round}</div>
        </div>

        <div className="flex w-full items-center justify-between md:justify-center md:gap-16">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-4 flex-1 md:flex-none">
            {match.homeTeam.logoUrl ? (
              <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain drop-shadow-xl" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center font-black text-2xl sm:text-4xl text-muted-foreground border-4 border-border">
                {match.homeTeam.name.substring(0, 3).toUpperCase()}
              </div>
            )}
            <div className="text-lg sm:text-xl md:text-3xl font-black text-center">{match.homeTeam.name}</div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-black rounded-xl border border-white/10 font-mono font-black text-3xl sm:text-4xl md:text-6xl text-white shadow-inner whitespace-nowrap">
              {match.homeScore !== null && match.awayScore !== null ? (
                <>
                  {match.homeScore}
                  {match.homePenaltyScore !== null && <span className="text-xl sm:text-2xl text-muted-foreground ml-2">({match.homePenaltyScore})</span>}
                  <span className="mx-2 sm:mx-4">-</span>
                  {match.awayPenaltyScore !== null && <span className="text-xl sm:text-2xl text-muted-foreground mr-2">({match.awayPenaltyScore})</span>}
                  {match.awayScore}
                </>
              ) : 'VS'}
            </div>
            <div className="text-xs sm:text-sm font-bold text-muted-foreground">
              {match.status === 'PLAYED' ? 'FINALIZADO' : 'PENDIENTE'}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-4 flex-1 md:flex-none">
            {match.awayTeam.logoUrl ? (
              <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain drop-shadow-xl" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center font-black text-2xl sm:text-4xl text-muted-foreground border-4 border-border">
                {match.awayTeam.name.substring(0, 3).toUpperCase()}
              </div>
            )}
            <div className="text-lg sm:text-xl md:text-3xl font-black text-center">{match.awayTeam.name}</div>
          </div>
        </div>
      </div>

      {/* Match Events Timeline */}
      {events.filter(e => !e.type.includes('SHOOTOUT')).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-auto flex flex-col gap-6">
          <h3 className="text-xl font-black text-center text-primary border-b border-border/50 pb-2">Línea de Tiempo</h3>
          <div className="flex flex-col gap-4 relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2"></div>
            
            {events.filter(e => !e.type.includes('SHOOTOUT')).map((ev, i) => {
              const isAway = ev.teamId === match.awayTeamId;
              // If teamId is missing, default to Home or center it? Let's just use flex-start if home, flex-end if away.
              
              return (
              <div key={i} className={`flex w-full ${isAway ? 'justify-end' : 'justify-start'} relative`}>
                <div className={`w-1/2 flex ${isAway ? 'justify-start pl-6 md:pl-12' : 'justify-end pr-6 md:pr-12'}`}>
                  
                  {/* Event Bubble */}
                  <div className={`flex items-center gap-3 bg-black/60 p-3 md:p-4 rounded-xl border ${isAway ? 'border-blue-500/30 flex-row-reverse text-right' : 'border-primary/30 text-left'} hover:border-primary/60 transition-colors shadow-lg relative min-w-[200px]`}>
                    
                    {/* Circle on the timeline */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-black bg-white z-10 ${isAway ? '-left-[calc(1.5rem+8px)] md:-left-[calc(3rem+8px)]' : '-right-[calc(1.5rem+8px)] md:-right-[calc(3rem+8px)]'}`}></div>
                    
                    <div className="font-black text-xl text-primary w-10 text-center">{ev.minute}'</div>
                    <div className="text-3xl">{ev.type.includes('GOAL') ? '⚽' : '🟥'}</div>
                    <div className={`flex flex-col flex-1 ${isAway ? 'items-end' : 'items-start'}`}>
                      {ev.playerId ? (
                        <Link href={`/jugadores/${ev.playerId}`} className="font-black text-white hover:text-primary transition-colors hover:underline">
                          {ev.playerName}
                        </Link>
                      ) : (
                        <span className="font-black text-white">{ev.playerName}</span>
                      )}
                      
                      {ev.type === 'FREE_KICK_GOAL' && <div className="text-xs font-bold text-yellow-500 uppercase">Tiro Libre</div>}
                      {ev.type === 'PENALTY_GOAL' && <div className="text-xs font-bold text-blue-500 uppercase">Penal</div>}
                      
                      {ev.assistName && (
                        <div className="text-xs font-bold text-muted-foreground mt-1 flex gap-1">
                          Asist: 
                          {ev.assistId ? (
                            <Link href={`/jugadores/${ev.assistId}`} className="hover:text-primary transition-colors hover:underline">
                              {ev.assistName}
                            </Link>
                          ) : (
                            <span>{ev.assistName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* General Match Stats */}
      {match.status === 'PLAYED' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-3xl mx-auto flex flex-col gap-6">
          <h3 className="text-xl font-black text-center text-primary uppercase tracking-widest border-b border-border/50 pb-2">Estadísticas Generales</h3>
          
          <div className="flex flex-col gap-4">
            {[
              { label: 'Tiros (Al Arco / Total)', home: formatStat(homeGeneral.shots, homeGeneral.shotsTotal), away: formatStat(awayGeneral.shots, awayGeneral.shotsTotal) },
              { label: 'Pases (Completados / Total)', home: formatStat(homeGeneral.passes, homeGeneral.passesTotal), away: formatStat(awayGeneral.passes, awayGeneral.passesTotal) },
              { label: 'Quites Ganados', home: homeGeneral.tackles, away: awayGeneral.tackles },
              { label: 'Atajadas', home: homeGeneral.saves, away: awayGeneral.saves },
              { label: 'Faltas Cometidas', home: homeGeneral.fouls, away: awayGeneral.fouls },
              { label: 'Fueras de Juego', home: homeGeneral.offsides, away: awayGeneral.offsides },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="font-black text-lg w-24 text-center">{stat.home}</div>
                <div className="flex-1 text-center font-bold text-muted-foreground uppercase text-xs sm:text-sm">{stat.label}</div>
                <div className="font-black text-lg w-24 text-center">{stat.away}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tanda de Penales */}
      {events.filter(e => e.type.includes('SHOOTOUT')).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-auto flex flex-col gap-6">
          <h3 className="text-xl font-black text-center text-primary border-b border-border/50 pb-2">Tanda de Penaltis</h3>
          <div className="flex flex-col gap-4 relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2"></div>
            
            {events.filter(e => e.type.includes('SHOOTOUT')).map((ev, i) => {
              const isAway = ev.teamId === match.awayTeamId;
              
              return (
              <div key={i} className={`flex w-full ${isAway ? 'justify-end' : 'justify-start'} relative`}>
                <div className={`w-1/2 flex ${isAway ? 'justify-start pl-6 md:pl-12' : 'justify-end pr-6 md:pr-12'}`}>
                  
                  {/* Event Bubble */}
                  <div className={`flex items-center gap-3 bg-black/60 p-3 md:p-4 rounded-xl border ${isAway ? 'border-blue-500/30 flex-row-reverse text-right' : 'border-primary/30 text-left'} hover:border-primary/60 transition-colors shadow-lg relative min-w-[200px]`}>
                    
                    {/* Circle on the timeline */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-black bg-white z-10 ${isAway ? '-left-[calc(1.5rem+8px)] md:-left-[calc(3rem+8px)]' : '-right-[calc(1.5rem+8px)] md:-right-[calc(3rem+8px)]'}`}></div>
                    
                    <div className="font-black text-xl text-primary w-10 text-center">{i + 1}</div>
                    <div className="text-3xl">{ev.type === 'SHOOTOUT_GOAL' ? '✅' : '❌'}</div>
                    <div className={`flex flex-col flex-1 ${isAway ? 'items-end' : 'items-start'}`}>
                      {ev.playerId ? (
                        <Link href={`/jugadores/${ev.playerId}`} className="font-black text-white hover:text-primary transition-colors hover:underline">
                          {ev.playerName}
                        </Link>
                      ) : (
                        <span className="font-black text-white">{ev.playerName}</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Player Stats Detailed Tables */}
      {match.status === 'PLAYED' && match.stats.length > 0 && (
        <div className="flex flex-col gap-12">
          {/* Home Stats */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black border-b border-border/50 pb-2 flex items-center gap-2">
              {match.homeTeam.logoUrl && <img src={match.homeTeam.logoUrl} className="w-6 h-6 object-contain" alt="Home" />}
              {match.homeTeam.name}
            </h3>
            <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-lg">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="p-3 font-bold">Jugador</th>
                    <th className="p-3 text-center font-bold" title="Goles">⚽</th>
                    <th className="p-3 text-center font-bold" title="Asistencias">👟</th>
                    <th className="p-3 text-center font-bold" title="Tiros">Tiros</th>
                    <th className="p-3 text-center font-bold" title="Pases">Pases</th>
                    <th className="p-3 text-center font-bold text-red-400" title="Pérdidas">Pérdidas</th>
                    <th className="p-3 text-center font-bold text-orange-400" title="Faltas Hechas">Faltas H</th>
                    <th className="p-3 text-center font-bold text-purple-400" title="Faltas Recibidas">Faltas R</th>
                    <th className="p-3 text-center font-bold" title="Offsides">Offside</th>
                    <th className="p-3 text-center font-bold" title="Valla Invicta">🛡️ VI</th>
                    <th className="p-3 text-center font-bold text-cyan-400" title="Minutos GK">GK Time</th>
                    <th className="p-3 text-center font-bold text-cyan-400" title="Atajadas">Atajadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {homeStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold">
                        <Link href={`/jugadores/${stat.playerId}`} className="hover:text-primary transition-colors">
                          {stat.player.nick}
                        </Link>
                      </td>
                      <td className="p-3 text-center font-black text-white">{((stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0)) > 0 ? ((stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0)) : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.assists > 0 ? stat.assists : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{formatStat(stat.shotsMade, stat.shotsTotal)}</td>
                      <td className="p-3 text-center font-bold text-white/80">{formatStat(stat.passesMade, stat.passesTotal)}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.ballLosses}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.fouls}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.fouled}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.offsides}</td>
                      <td className="p-3 text-center font-bold">{stat.cleanSheet ? '✅' : '-'}</td>
                      <td className="p-3 text-center font-bold text-cyan-400">{stat.gkTime > 0 ? stat.gkTime + "'" : '-'}</td>
                      <td className="p-3 text-center font-bold text-cyan-400">{formatStat(stat.savesMade, stat.savesTotal)}</td>
                    </tr>
                  ))}
                  {homeStats.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sin datos cargados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Away Stats */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black border-b border-border/50 pb-2 flex items-center gap-2">
              {match.awayTeam.logoUrl && <img src={match.awayTeam.logoUrl} className="w-6 h-6 object-contain" alt="Away" />}
              {match.awayTeam.name}
            </h3>
            <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-lg">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="p-3 font-bold">Jugador</th>
                    <th className="p-3 text-center font-bold" title="Goles">⚽</th>
                    <th className="p-3 text-center font-bold" title="Asistencias">👟</th>
                    <th className="p-3 text-center font-bold" title="Tiros">Tiros</th>
                    <th className="p-3 text-center font-bold" title="Pases">Pases</th>
                    <th className="p-3 text-center font-bold text-red-400" title="Pérdidas">Pérdidas</th>
                    <th className="p-3 text-center font-bold text-orange-400" title="Faltas Hechas">Faltas H</th>
                    <th className="p-3 text-center font-bold text-purple-400" title="Faltas Recibidas">Faltas R</th>
                    <th className="p-3 text-center font-bold" title="Offsides">Offside</th>
                    <th className="p-3 text-center font-bold" title="Valla Invicta">🛡️ VI</th>
                    <th className="p-3 text-center font-bold text-cyan-400" title="Minutos GK">GK Time</th>
                    <th className="p-3 text-center font-bold text-cyan-400" title="Atajadas">Atajadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {awayStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold">
                        <Link href={`/jugadores/${stat.playerId}`} className="hover:text-primary transition-colors">
                          {stat.player.nick}
                        </Link>
                      </td>
                      <td className="p-3 text-center font-black text-white">{((stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0)) > 0 ? ((stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0)) : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.assists > 0 ? stat.assists : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{formatStat(stat.shotsMade, stat.shotsTotal)}</td>
                      <td className="p-3 text-center font-bold text-white/80">{formatStat(stat.passesMade, stat.passesTotal)}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.ballLosses}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.fouls}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.fouled}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.offsides}</td>
                      <td className="p-3 text-center font-bold">{stat.cleanSheet ? '✅' : '-'}</td>
                      <td className="p-3 text-center font-bold text-cyan-400">{stat.gkTime > 0 ? stat.gkTime + "'" : '-'}</td>
                      <td className="p-3 text-center font-bold text-cyan-400">{formatStat(stat.savesMade, stat.savesTotal)}</td>
                    </tr>
                  ))}
                  {awayStats.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sin datos cargados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
