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

  const homeStats = match.stats.filter(s => getPlayerTeamId(s.playerId) === match.homeTeamId);
  const awayStats = match.stats.filter(s => getPlayerTeamId(s.playerId) === match.awayTeamId);

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
              {match.homeScore !== null && match.awayScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
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
      {events.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-auto flex flex-col gap-4">
          <h3 className="text-xl font-black text-center text-primary border-b border-border/50 pb-2 mb-2">Eventos del Partido</h3>
          <div className="flex flex-col gap-3">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="font-black text-lg text-muted-foreground w-12 text-right">{ev.minute}'</div>
                <div className="text-2xl">{ev.type === 'GOAL' ? '⚽' : '🟥'}</div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-white">{ev.playerName}</span>
                  {ev.assistName && <span className="text-xs font-bold text-muted-foreground">Asistencia: {ev.assistName}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Match Stats */}
      {match.status === 'PLAYED' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-3xl mx-auto flex flex-col gap-6">
          <h3 className="text-xl font-black text-center text-primary uppercase tracking-widest border-b border-border/50 pb-2">Estadísticas Generales</h3>
          
          <div className="flex flex-col gap-4">
            {[
              { label: 'Tiros (Al Arco / Total)', home: `${homeGeneral.shots} / ${homeGeneral.shotsTotal}`, away: `${awayGeneral.shots} / ${awayGeneral.shotsTotal}` },
              { label: 'Pases (Completados / Total)', home: `${homeGeneral.passes} / ${homeGeneral.passesTotal}`, away: `${awayGeneral.passes} / ${awayGeneral.passesTotal}` },
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

      {/* Stats Section */}
      {match.status === 'PLAYED' && match.stats.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
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
                    <th className="p-3 text-center font-bold" title="Quites">Quites</th>
                    <th className="p-3 text-center font-bold" title="Valla Invicta">🛡️ VI</th>
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
                      <td className="p-3 text-center font-black text-white">{stat.goals > 0 ? stat.goals : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.assists > 0 ? stat.assists : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.shotsMade}/{stat.shotsTotal}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.passesMade}/{stat.passesTotal}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.tacklesWon}</td>
                      <td className="p-3 text-center font-bold">{stat.cleanSheet ? '✅' : '-'}</td>
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
                    <th className="p-3 text-center font-bold" title="Quites">Quites</th>
                    <th className="p-3 text-center font-bold" title="Valla Invicta">🛡️ VI</th>
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
                      <td className="p-3 text-center font-black text-white">{stat.goals > 0 ? stat.goals : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.assists > 0 ? stat.assists : '-'}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.shotsMade}/{stat.shotsTotal}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.passesMade}/{stat.passesTotal}</td>
                      <td className="p-3 text-center font-bold text-white/80">{stat.tacklesWon}</td>
                      <td className="p-3 text-center font-bold">{stat.cleanSheet ? '✅' : '-'}</td>
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
