import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";
import HeadToHeadClient from "./HeadToHeadClient";
import { getTournamentStyles, getTrophyCategory, formatTrophyName } from "@/lib/colors";
import TeamConfetti from "@/components/TeamConfetti";

export const dynamicParams = false;

export async function generateStaticParams() {
  const teams = await prisma.team.findMany({ select: { id: true } });
  return teams.map((team) => ({
    id: team.id,
  }));
}

export default async function EquipoProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const locale = "es";
  const t = await getDictionary(locale);

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      captain: true,
      tournaments: {
        include: {
          tournament: { include: { season: true, category: true } },
          players: { include: { player: true } }
        }
      },
      homeMatches: {
        include: { awayTeam: true, tournament: true, stats: { include: { player: true } } },
        orderBy: { matchDate: "desc" }
      },
      awayMatches: {
        include: { homeTeam: true, tournament: true, stats: { include: { player: true } } },
        orderBy: { matchDate: "desc" }
      },
      trophies: {
        where: { type: "TEAM" },
        include: { tournament: { include: { season: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!team) return notFound();

  const allTeams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  // Combine and sort recent matches
  const allMatches = [...team.homeMatches, ...team.awayMatches];
  
  const recentMatches = allMatches
    .filter(m => m.round !== "Estadísticas Históricas")
    .sort((a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime())
    .slice(0, 5);

  // Compute Overall Team Stats
  let officialPJ = 0, officialG = 0, officialA = 0;
  let extraPJ = 0, extraG = 0, extraA = 0;

  allMatches.forEach(match => {
    if (match.status !== "PLAYED") return;
    const isOfficial = match.tournament.isOfficial;
    const isHome = match.homeTeamId === team.id;
    
    if (isOfficial) {
      officialPJ++;
      officialG += isHome ? (match.homeScore || 0) : (match.awayScore || 0);
      officialA += isHome ? (match.awayScore || 0) : (match.homeScore || 0);
    } else {
      extraPJ++;
      extraG += isHome ? (match.homeScore || 0) : (match.awayScore || 0);
      extraA += isHome ? (match.awayScore || 0) : (match.homeScore || 0);
    }
  });

  // Calculate player records for this team
  const playerStatsMap = new Map<string, { player: any, goals: number, assists: number, appearances: number, cleanSheets: number }>();
  
  allMatches.forEach(match => {
    if (match.status !== "PLAYED") return;
    
    // Find players enrolled in this team for this tournament
    const tournamentTeam = team.tournaments.find(t => t.tournamentId === match.tournamentId);
    if (!tournamentTeam) return;

    const enrolledPlayerIds = new Set(tournamentTeam.players.map(p => p.playerId));

    match.stats.forEach(stat => {
      if (!enrolledPlayerIds.has(stat.playerId)) return;
      
      let pData = playerStatsMap.get(stat.playerId);
      if (!pData) {
        pData = { player: stat.player, goals: 0, assists: 0, appearances: 0, cleanSheets: 0 };
        playerStatsMap.set(stat.playerId, pData);
      }
      pData.goals += stat.goals;
      pData.assists += stat.assists;
      if (stat.matchTime > 0) pData.appearances++;
      if (stat.cleanSheet) pData.cleanSheets++;
    });
  });

  const playerRecordsArray = Array.from(playerStatsMap.values());
  const topScorer = playerRecordsArray.sort((a, b) => b.goals - a.goals)[0];
  const topAssister = playerRecordsArray.sort((a, b) => b.assists - a.assists)[0];
  const mostAppearances = playerRecordsArray.sort((a, b) => b.appearances - a.appearances)[0];
  const mostCleanSheets = playerRecordsArray.filter(p => p.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets)[0];

  // Group Trophies
  const officialTrophies = team.trophies.filter(t => t.tournament?.isOfficial !== false);
  const extraTrophies = team.trophies.filter(t => t.tournament?.isOfficial === false);

  const getTrophiesByCategory = (trophies: typeof team.trophies, category: string) => 
    trophies.filter(t => getTrophyCategory(t.name) === category);

  // Group Plantillas by Season
  const tournamentsBySeason: Record<string, typeof team.tournaments> = {};
  team.tournaments.forEach(t => {
    const sName = t.tournament.isOfficial ? (t.tournament.season?.name || "Sin Temporada") : "Torneos Extras (No Oficiales)";
    if (!tournamentsBySeason[sName]) tournamentsBySeason[sName] = [];
    tournamentsBySeason[sName].push(t);
  });

  const sortedSeasons = Object.keys(tournamentsBySeason).sort((a, b) => {
    if (a.includes("Extras")) return 1;
    if (b.includes("Extras")) return -1;
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    return numB - numA; // Sort descending (newest season first)
  });

  const renderTrophyCard = (trofeo: any) => {
    const styles = getTournamentStyles(trofeo.name, trofeo.tournament?.name || "");
    const formattedName = formatTrophyName(trofeo.name);
    return (
      <div key={trofeo.id} className={`bg-card border ${styles.borderClass} rounded-xl p-4 flex items-center gap-4 min-w-[200px] relative overflow-hidden shadow-lg hover:scale-105 transition-transform`}>
        <div className={`w-12 h-12 ${styles.bgClass} ${styles.textClass} rounded-full flex items-center justify-center text-2xl font-black z-10 overflow-hidden`}>
          {styles.imageSrc ? (
            <img src={styles.imageSrc} alt={formattedName} className="w-8 h-8 object-contain" />
          ) : (
            styles.icon
          )}
        </div>
        <div className="flex flex-col z-10">
          <span className={`font-black ${styles.textClass} uppercase tracking-wider`}>{formattedName}</span>
          <span className="text-xs text-muted-foreground">{trofeo.tournament ? `${trofeo.tournament.name} - ${trofeo.tournament.isOfficial ? (trofeo.tournament.season?.name || '') : 'Extra'}` : 'Histórico'}</span>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 text-8xl z-0 pointer-events-none">
          {styles.icon}
        </div>
      </div>
    );
  };

  const renderTrophySection = (trophies: typeof team.trophies, title: string, isExtra: boolean = false) => {
    if (trophies.length === 0) {
      return (
        <div className="flex flex-col gap-4 mb-4 opacity-50">
          <h3 className={`text-2xl font-black flex items-center gap-2 border-b border-border pb-2 ${isExtra ? 'text-amber-500' : 'text-blue-500'}`}>
            <span className={`w-2 h-6 ${isExtra ? 'bg-amber-500' : 'bg-blue-500'} rounded-full inline-block`}></span>
            {title}
          </h3>
          <p className="text-muted-foreground italic pl-4">Sin títulos.</p>
        </div>
      );
    }
    
    const campeon = getTrophiesByCategory(trophies, "CAMPEON");
    const subcampeon = getTrophiesByCategory(trophies, "SUBCAMPEON");
    const tercer = getTrophiesByCategory(trophies, "TERCER");

    return (
      <div className="flex flex-col gap-6 mb-8">
        <h3 className={`text-2xl font-black flex items-center gap-2 border-b border-border pb-2 ${isExtra ? 'text-amber-500' : 'text-blue-500'}`}>
          <span className={`w-2 h-6 ${isExtra ? 'bg-amber-500' : 'bg-blue-500'} rounded-full inline-block`}></span>
          {title}
        </h3>
        
        <div className="flex flex-col gap-8">
          {campeon.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-xl">🥇</span> {t.teams.champion}</h4>
              <div className="flex flex-wrap gap-4">
                {campeon.map(renderTrophyCard)}
              </div>
            </div>
          )}

          {subcampeon.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-zinc-300 flex items-center gap-2"><span className="text-xl">🥈</span> {t.teams.runnerUp}</h4>
              <div className="flex flex-wrap gap-4">
                {subcampeon.map(renderTrophyCard)}
              </div>
            </div>
          )}

          {tercer.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-amber-600/80 flex items-center gap-2"><span className="text-xl">🥉</span> {t.teams.thirdPlace}</h4>
              <div className="flex flex-wrap gap-4">
                {tercer.map(renderTrophyCard)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      <TeamConfetti hasTrophies={officialTrophies.length > 0} />
      <Link href="/equipos" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <span>←</span> {t.teams.back}
      </Link>
      
      {/* HEADER PERFIL */}
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-lg flex flex-col items-center md:items-start group">
        {/* BANNER */}
        <div className="w-full h-48 md:h-64 bg-secondary/50 relative overflow-hidden">
          {team.bannerUrl ? (
             <img src={team.bannerUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black opacity-80"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
        </div>
        
        {/* INFO EQUIPO */}
        <div className="relative -mt-20 md:-mt-24 px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 w-full z-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center p-4 border-4 border-card shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden bg-black/80 backdrop-blur-md">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-6xl font-black text-muted-foreground">{team.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col items-center md:items-start flex-1 md:mb-4">
            <h1 className="text-4xl md:text-5xl font-black neon-text text-center md:text-left drop-shadow-lg leading-tight">{team.name}</h1>
            <p className="text-muted-foreground mt-3 font-bold flex items-center gap-2 text-sm md:text-base bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm w-fit mx-auto md:mx-0 shadow-lg">
              👑 Capitán: <span className="text-primary">{team.captain?.nickName || team.captain?.name || "Sin asignar"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS E HISTÓRICOS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
            Estadísticas Globales
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1 items-center justify-center shadow-lg group hover:border-blue-500/50 transition-colors">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center">Torneos Oficiales</span>
              <div className="flex gap-4 mt-2">
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-blue-400">{officialPJ}</span><span className="text-[10px] text-muted-foreground">PJ</span></div>
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-blue-400">{officialG}</span><span className="text-[10px] text-muted-foreground">GF</span></div>
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-blue-400">{officialA}</span><span className="text-[10px] text-muted-foreground">GC</span></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1 items-center justify-center shadow-lg group hover:border-amber-500/50 transition-colors">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center">Torneos Extras</span>
              <div className="flex gap-4 mt-2">
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-amber-400">{extraPJ}</span><span className="text-[10px] text-muted-foreground">PJ</span></div>
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-amber-400">{extraG}</span><span className="text-[10px] text-muted-foreground">GF</span></div>
                <div className="flex flex-col items-center"><span className="text-2xl font-black text-amber-400">{extraA}</span><span className="text-[10px] text-muted-foreground">GC</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
            Líderes Históricos
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-3 flex flex-col shadow-lg hover:bg-secondary/20 transition-colors">
              <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">Máximo Goleador</span>
              {topScorer && topScorer.goals > 0 ? (
                <div className="flex justify-between items-center"><Link href={`/jugadores/${topScorer.player.id}`} className="font-bold hover:text-primary transition-colors text-sm truncate">{topScorer.player.nick}</Link><span className="text-emerald-400 font-black text-lg">{topScorer.goals} ⚽</span></div>
              ) : (<span className="text-xs text-muted-foreground italic">-</span>)}
            </div>
            <div className="bg-card border border-border rounded-xl p-3 flex flex-col shadow-lg hover:bg-secondary/20 transition-colors">
              <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">Máximo Asistidor</span>
              {topAssister && topAssister.assists > 0 ? (
                <div className="flex justify-between items-center"><Link href={`/jugadores/${topAssister.player.id}`} className="font-bold hover:text-primary transition-colors text-sm truncate">{topAssister.player.nick}</Link><span className="text-emerald-400 font-black text-lg">{topAssister.assists} 👟</span></div>
              ) : (<span className="text-xs text-muted-foreground italic">-</span>)}
            </div>
            <div className="bg-card border border-border rounded-xl p-3 flex flex-col shadow-lg hover:bg-secondary/20 transition-colors">
              <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">Más Presencias</span>
              {mostAppearances && mostAppearances.appearances > 0 ? (
                <div className="flex justify-between items-center"><Link href={`/jugadores/${mostAppearances.player.id}`} className="font-bold hover:text-primary transition-colors text-sm truncate">{mostAppearances.player.nick}</Link><span className="text-emerald-400 font-black text-lg">{mostAppearances.appearances} 🏃</span></div>
              ) : (<span className="text-xs text-muted-foreground italic">-</span>)}
            </div>
            <div className="bg-card border border-border rounded-xl p-3 flex flex-col shadow-lg hover:bg-secondary/20 transition-colors">
              <span className="text-[10px] font-black text-muted-foreground uppercase mb-1">Vallas Invictas</span>
              {mostCleanSheets && mostCleanSheets.cleanSheets > 0 ? (
                <div className="flex justify-between items-center"><Link href={`/jugadores/${mostCleanSheets.player.id}`} className="font-bold hover:text-primary transition-colors text-sm truncate">{mostCleanSheets.player.nick}</Link><span className="text-emerald-400 font-black text-lg">{mostCleanSheets.cleanSheets} 🧤</span></div>
              ) : (<span className="text-xs text-muted-foreground italic">-</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* VITRINA DE TROFEOS */}
        <div className="md:col-span-2 flex flex-col gap-6 mb-4">
          <h2 className="text-3xl font-black flex items-center gap-2 border-b border-border pb-2 neon-text">
            <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
            {t.teams.trophies}
          </h2>
          {renderTrophySection(officialTrophies, "Trofeos Oficiales", false)}
          {renderTrophySection(extraTrophies, "Trofeos Extra", true)}
        </div>

        {/* PLANTILLAS HISTORICAS */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            {t.teams.history}
          </h2>
          <div className="flex flex-col gap-6">
            {sortedSeasons.map(season => (
              <div key={season} className="flex flex-col gap-3">
                <h3 className="font-black text-xl text-primary border-b border-primary/20 pb-1">{season}</h3>
                <div className="flex flex-col gap-4">
                  {tournamentsBySeason[season].map(participation => {
                    const styles = getTournamentStyles(participation.tournament.name, participation.tournament.category?.name || "General");
                    return (
                      <div key={participation.id} className={`bg-card border ${styles.borderClass} rounded-xl p-4 shadow-md`}>
                        <h4 className={`font-bold text-md mb-3 ${styles.textClass}`}>
                          {participation.tournament.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {participation.players.map(p => (
                            <Link key={p.id} href={`/jugadores/${p.player.id}`} className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold transition-colors">
                              {p.player.nick}
                            </Link>
                          ))}
                          {participation.players.length === 0 && (
                            <span className="text-muted-foreground text-sm italic">{t.teams.noPlayers}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {sortedSeasons.length === 0 && (
              <div className="text-muted-foreground text-center py-4">{t.teams.noHistory}</div>
            )}
          </div>
        </div>

        {/* ÚLTIMOS PARTIDOS */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            {t.teams.recentMatches}
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 shadow-md">
            {recentMatches.map(match => {
              const isHome = match.homeTeamId === team.id;
              const opponent = isHome ? (match as any).awayTeam : (match as any).homeTeam;
              let resultClass = "text-muted-foreground";
              let resultText = "E";
              
              if (match.status === 'PLAYED') {
                if (isHome) {
                  if (match.homeScore! > match.awayScore!) { resultClass = "text-primary"; resultText = "G"; }
                  else if (match.homeScore! < match.awayScore!) { resultClass = "text-destructive"; resultText = "P"; }
                } else {
                  if (match.awayScore! > match.homeScore!) { resultClass = "text-primary"; resultText = "G"; }
                  else if (match.awayScore! < match.homeScore!) { resultClass = "text-destructive"; resultText = "P"; }
                }
              } else {
                resultText = "-";
              }

              return (
                <div key={match.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{(match as any).tournament?.name || "Sin Torneo"}</span>
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs bg-card border border-border ${resultClass}`}>
                        {resultText}
                      </span>
                      <span className="text-xs text-muted-foreground w-8">{isHome ? '(L)' : '(V)'}</span>
                      <Link href={`/partidos/${match.id}`} className="font-bold truncate max-w-[120px] sm:max-w-[200px] hover:text-primary hover:underline transition-colors">
                        vs {opponent.name}
                      </Link>
                    </div>
                  </div>
                  
                  {match.status === 'PLAYED' ? (
                     <div className="font-mono font-bold bg-black/50 px-3 py-1 rounded border border-border">
                       {isHome ? `${match.homeScore} - ${match.awayScore}` : `${match.awayScore} - ${match.homeScore}`}
                     </div>
                  ) : (
                     <div className="text-xs font-bold text-muted-foreground px-3 py-1">POR JUGAR</div>
                  )}
                </div>
              );
            })}
            
            {recentMatches.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No hay partidos registrados.</p>
            )}
          </div>
        </div>

      </div>

      {/* HEAD TO HEAD SECTION */}
      <HeadToHeadClient 
        currentTeamId={team.id} 
        currentTeamName={team.name}
        allTeams={allTeams} 
        allMatches={allMatches} 
      />
      
    </div>
  );
}
