import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentStyles, getTrophyCategory } from "@/lib/colors";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export const dynamicParams = false;

export async function generateStaticParams() {
  const players = await prisma.player.findMany({ select: { id: true } });
  return players.map((player) => ({
    id: player.id,
  }));
}

export default async function JugadorProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const locale = "es";
  const t = await getDictionary(locale);

  const jugador = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      matchStats: {
        include: {
          match: { include: { homeTeam: true, awayTeam: true, tournament: { include: { season: true, category: true } } } }
        },
        orderBy: { match: { matchDate: "desc" } }
      },
      tournamentTeams: {
        include: { tournamentTeam: { include: { team: true, tournament: { include: { season: true, category: true } } } } }
      },
      trophies: {
        include: { tournament: true, team: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!jugador) return notFound();

  // Find collective trophies
  const rosterData = jugador.tournamentTeams.map(t => ({
    teamId: t.tournamentTeam.teamId,
    tournamentId: t.tournamentTeam.tournamentId
  }));

  const collectiveTrophies = await prisma.trophy.findMany({
    where: {
      type: "TEAM",
      OR: rosterData.length > 0 ? rosterData : [{ id: "none" }]
    },
    include: { tournament: true, team: true },
    orderBy: { createdAt: "desc" }
  });

  // Merge trophies
  const allTrophies = [...jugador.trophies, ...collectiveTrophies];

  // Group Trophies
  const campeon = allTrophies.filter(t => getTrophyCategory(t.name) === "CAMPEON");
  const subcampeon = allTrophies.filter(t => getTrophyCategory(t.name) === "SUBCAMPEON");
  const tercer = allTrophies.filter(t => getTrophyCategory(t.name) === "TERCER");
  const individuales = allTrophies.filter(t => getTrophyCategory(t.name) === "DISTINCION");

  // Group Trayectoria
  const trajectoryBySeason: Record<string, typeof jugador.tournamentTeams> = {};
  jugador.tournamentTeams.forEach(t => {
    const sName = t.tournamentTeam.tournament.season?.name || "Sin Temporada";
    if (!trajectoryBySeason[sName]) trajectoryBySeason[sName] = [];
    trajectoryBySeason[sName].push(t);
  });

  // Sort seasons alphabetically or logically if possible (assuming "Temporada X" string sorting is mostly ok for now, or by ID)
  // To do a simple string sort for "Temporada X"
  const sortedSeasons = Object.keys(trajectoryBySeason).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  // Aggregate stats
  const totalStats = jugador.matchStats.reduce((acc, stat) => {
    acc.pj += (stat.match.round === "Estadísticas Históricas" ? (stat.matchTime || 1) : 1);
    acc.goles += stat.goals;
    acc.asistencias += stat.assists;
    acc.pasesM += stat.passesMade;
    acc.pasesT += stat.passesTotal;
    acc.tirosM += stat.shotsMade;
    acc.tirosT += stat.shotsTotal;
    acc.atajadasM += stat.savesMade;
    acc.atajadasT += stat.savesTotal;
    acc.minutos += stat.matchTime;
    return acc;
  }, { pj: 0, goles: 0, asistencias: 0, pasesM: 0, pasesT: 0, tirosM: 0, tirosT: 0, atajadasM: 0, atajadasT: 0, minutos: 0 });

  const paseExito = totalStats.pasesT > 0 ? Math.round((totalStats.pasesM / totalStats.pasesT) * 100) : 0;
  const tiroExito = totalStats.tirosT > 0 ? Math.round((totalStats.tirosM / totalStats.tirosT) * 100) : 0;
  const atajadaExito = totalStats.atajadasT > 0 ? Math.round((totalStats.atajadasM / totalStats.atajadasT) * 100) : 0;

  const renderTrophyCard = (trofeo: any) => {
    const styles = getTournamentStyles(trofeo.name, trofeo.tournament?.name || "");
    return (
      <div key={trofeo.id} className={`bg-card border ${styles.borderClass} rounded-xl p-4 flex items-center gap-4 min-w-[200px] relative overflow-hidden`}>
          <div className={`w-12 h-12 ${styles.bgClass} ${styles.textClass} rounded-full flex items-center justify-center text-2xl font-black z-10 overflow-hidden`}>
            {styles.imageSrc ? (
              <img src={styles.imageSrc} alt={trofeo.name} className="w-8 h-8 object-contain" />
            ) : (
              styles.icon
            )}
          </div>
        <div className="flex flex-col z-10">
          <span className={`font-black ${styles.textClass} uppercase tracking-wider`}>{trofeo.name}</span>
          <span className="text-xs text-muted-foreground">
            {trofeo.tournament ? `${trofeo.tournament.name} - ${trofeo.tournament.season?.name || ''}` : 'Histórico'}
            {trofeo.type === 'TEAM' && trofeo.team ? ` (con ${trofeo.team.name})` : ''}
          </span>
        </div>
        {trofeo.type === 'TEAM' && (
          <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] grayscale">👥</div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      <Link href="/jugadores" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <span>←</span> {t.playerDetail.back}
      </Link>
      
      {/* HEADER PERFIL */}
      <div className="relative bg-card border border-border rounded-2xl p-8 overflow-hidden shadow-lg flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center border-4 border-card shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10 text-6xl font-black text-primary uppercase overflow-hidden">
          {jugador.user?.customAvatarUrl || jugador.user?.image ? (
            <img src={jugador.user.customAvatarUrl || jugador.user.image || ""} alt={jugador.nick} className="w-full h-full object-cover" />
          ) : (
            jugador.nick.slice(0, 2)
          )}
        </div>
        <div className="flex flex-col items-center md:items-start justify-center h-full z-10 py-4 w-full">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-black neon-text text-center md:text-left">
              {jugador.nick}
            </h1>
            {jugador.user?.discordId && (
              <a 
                href={`https://discordapp.com/users/${jugador.user.discordId}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/50 hover:bg-[#5865F2] hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 mt-2 md:mt-0"
                title="Contactar por Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                Contactar en Discord
              </a>
            )}
          </div>
          <div className="text-muted-foreground mt-2 font-mono flex items-center gap-2">
            <span>{t.playerDetail.title}</span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <img 
                src={
                  jugador.nationality === 'Argentina' ? '/img/banderas/argentina.svg' :
                  jugador.nationality === 'Uruguay' ? '/img/banderas/uruguay.svg' :
                  jugador.nationality === 'Cuba' ? 'https://flagcdn.com/w20/us.png' :
                  '/img/banderas/brazil.svg'
                } 
                alt={jugador.nationality} 
                title={jugador.nationality}
                className="w-6 h-auto rounded-sm shadow-sm"
              />
              <span>{jugador.nationality}</span>
            </span>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4 w-full justify-center md:justify-start">
            <div className="bg-secondary/50 px-6 py-3 rounded-xl border border-border text-center min-w-[100px]">
              <span className="block text-3xl font-black text-primary">{totalStats.pj}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t.playerDetail.stats.pj}</span>
            </div>
            <div className="bg-secondary/50 px-6 py-3 rounded-xl border border-border text-center min-w-[100px]">
              <span className="block text-3xl font-black text-white">{totalStats.goles}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t.playerDetail.stats.goals}</span>
            </div>
            <div className="bg-secondary/50 px-6 py-3 rounded-xl border border-border text-center min-w-[100px]">
              <span className="block text-3xl font-black text-white">{totalStats.asistencias}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t.playerDetail.stats.assists}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* VITRINA DE TROFEOS (Si tiene) */}
        {allTrophies.length > 0 && (
          <div className="lg:col-span-3 flex flex-col gap-6 mb-2">
            <h2 className="text-3xl font-black flex items-center gap-2 border-b border-border pb-2 neon-text">
              <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
              {t.playerDetail.trophies}
            </h2>
            
            <div className="flex flex-col gap-8">
              {campeon.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">🥇</span> {t.playerDetail.champion}</h3>
                  <div className="flex flex-wrap gap-4">
                    {campeon.map(renderTrophyCard)}
                  </div>
                </div>
              )}

              {subcampeon.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-zinc-300 flex items-center gap-2"><span className="text-2xl">🥈</span> {t.playerDetail.runnerUp}</h3>
                  <div className="flex flex-wrap gap-4">
                    {subcampeon.map(renderTrophyCard)}
                  </div>
                </div>
              )}

              {tercer.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-amber-600/80 flex items-center gap-2"><span className="text-2xl">🥉</span> {t.playerDetail.thirdPlace}</h3>
                  <div className="flex flex-wrap gap-4">
                    {tercer.map(renderTrophyCard)}
                  </div>
                </div>
              )}

              {individuales.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><span className="text-2xl">🏅</span> {t.playerDetail.individual}</h3>
                  <div className="flex flex-wrap gap-4">
                    {individuales.map(renderTrophyCard)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ESTADISTICAS AVANZADAS */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            {t.playerDetail.metrics}
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 shadow-md flex flex-col gap-6">
            
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-muted-foreground">{t.playerDetail.metricsPasses}</span>
                <span>{paseExito}% ({totalStats.pasesM}/{totalStats.pasesT})</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${paseExito}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-muted-foreground">{t.playerDetail.metricsShots}</span>
                <span>{tiroExito}% ({totalStats.tirosM}/{totalStats.tirosT})</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-[#ef4444]" style={{ width: `${tiroExito}%` }}></div>
              </div>
            </div>

            {totalStats.atajadasT > 0 && (
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-muted-foreground">{t.playerDetail.metricsSaves}</span>
                  <span>{atajadaExito}% ({totalStats.atajadasM}/{totalStats.atajadasT})</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b82f6]" style={{ width: `${atajadaExito}%` }}></div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border mt-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-muted-foreground">{t.playerDetail.metricsMinutes}</span>
                <span className="font-mono">{totalStats.minutos}</span>
              </div>
            </div>
            
          </div>

          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mt-4">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            {t.playerDetail.trajectory}
          </h2>
          <div className="flex flex-col gap-4">
            {sortedSeasons.map(season => (
              <div key={season} className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider">{season}</h3>
                <div className="flex flex-col gap-2 pl-2 border-l-2 border-primary/30">
                  {trajectoryBySeason[season].map(t => {
                    const styles = getTournamentStyles(t.tournamentTeam.tournament.name, t.tournamentTeam.tournament.category?.name || "General");
                    return (
                      <Link key={t.id} href={`/equipos/${t.tournamentTeam.team.id}`} className="bg-card border border-border p-2 rounded-lg hover:border-primary transition-colors flex flex-col gap-1">
                        <span className="font-bold text-white">{t.tournamentTeam.team.name}</span>
                        <span className={`text-xs font-bold ${styles.textClass}`}>
                          {t.tournamentTeam.tournament.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {sortedSeasons.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.playerDetail.noHistory}</p>
            )}
          </div>
        </div>

        {/* HISTORIAL DE PARTIDOS (ESTADISTICAS) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            {t.playerDetail.matchHistory}
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary text-secondary-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-bold">Partido</th>
                    <th className="px-4 py-3 font-bold text-center text-primary">Goals</th>
                    <th className="px-4 py-3 font-bold text-center text-primary">Assists</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Team PTS</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Match Time</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Passes Realizados/Totales</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Sliding Realizados/Totales</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Fouls</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Ball losses</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">GK time</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Shoot accuracy Realizados/Totales</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Header Duels Realizados/Totales</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Tackles won</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Fouled</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Offside</th>
                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">Saves Realizados/Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jugador.matchStats.map((stat: any) => {
                    const isHistorico = stat.match.round === "Estadísticas Históricas";
                    return (
                    <tr key={stat.id} className={`transition-colors ${isHistorico ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold flex items-center gap-2">
                           {isHistorico ? (
                             <span className="text-primary font-black uppercase tracking-wider">📊 Resumen Estadístico</span>
                           ) : (
                             `${stat.match.homeTeam.name} vs ${stat.match.awayTeam.name}`
                           )}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                           <span>{stat.match.tournament.name}</span>
                           {isHistorico && <span className="bg-primary/20 text-primary px-1 rounded">Carga Masiva</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-lg">{stat.goals || 0}</td>
                      <td className="px-4 py-3 text-center font-black text-lg">{stat.assists || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.teamPoints || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.matchTime || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.passesMade || 0}/{stat.passesTotal || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.slidingMade || 0}/{stat.slidingTotal || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.fouls || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.ballLosses || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.gkTime || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.shotsMade || 0}/{stat.shotsTotal || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.headersMade || 0}/{stat.headersTotal || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.tacklesWon || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.fouled || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.offsides || 0}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{stat.savesMade || 0}/{stat.savesTotal || 0}</td>
                    </tr>
                    );
                  })}
                  {jugador.matchStats.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No hay estadísticas registradas para este jugador.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
