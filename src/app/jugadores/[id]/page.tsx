import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getFlagUrl } from "@/lib/flags";
import { notFound } from "next/navigation";
import { getTournamentStyles, getTrophyCategory, formatTrophyName } from "@/lib/colors";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";
import PlayerMetricsClient from "./PlayerMetricsClient";

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
        include: { tournament: { include: { season: true, category: true } }, team: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!jugador) return notFound();

  // Find active season and current team
  const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
  let currentTeam = null;
  if (activeSeason) {
    const currentClubTeam = jugador.tournamentTeams.find(
      (tt) => tt.tournamentTeam.tournament.seasonId === activeSeason.id && !tt.tournamentTeam.team.isNationalTeam
    );
    if (currentClubTeam) {
      currentTeam = currentClubTeam.tournamentTeam.team;
    }
  }

  // Find collective trophies
  const rosterData = jugador.tournamentTeams.map(t => ({
    teamId: t.tournamentTeam.teamId,
    tournamentId: t.tournamentTeam.tournamentId
  }));

  const rawCollectiveTrophies = await prisma.trophy.findMany({
    where: {
      type: "TEAM",
      OR: rosterData.length > 0 ? rosterData : [{ id: "none" }]
    },
    include: { tournament: { include: { season: true, category: true } }, team: true, excludedPlayers: { select: { id: true } } },
    orderBy: { createdAt: "desc" }
  });

  const collectiveTrophies = rawCollectiveTrophies.filter(t => !t.excludedPlayers.some(p => p.id === params.id));

  // Merge trophies
  const allTrophies = [...jugador.trophies, ...collectiveTrophies];

  // Group Trophies (Excluir Nacional B del palmares)
  const validTrophies = allTrophies.filter(t => {
    const catName = t.tournament?.category?.name || t.tournament?.name || "";
    return !catName.toLowerCase().includes("nacional b");
  });

  const officialTrophies = validTrophies.filter(t => t.tournament?.isOfficial !== false);
  const extraTrophies = validTrophies.filter(t => t.tournament?.isOfficial === false);

  const getTrophiesByCategory = (trophies: any[], category: string) => 
    trophies.filter(t => getTrophyCategory(t.name) === category);

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

  const getIsNationalStat = (stat: any) => {
    const tTeam = jugador.tournamentTeams.find(tt => tt.tournamentTeam.tournamentId === stat.match.tournamentId);
    return tTeam?.tournamentTeam.team.isNationalTeam || false;
  };

  // Filtrar partidos donde no jugó (minutos y gkTime en 0) a menos que sea histórico
  const validStatsObj = jugador.matchStats.filter(s => 
    (s.matchTime ?? 0) > 0 || 
    (s.gkTime ?? 0) > 0 || 
    (["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(s.match.round ?? ""))
  );

  const officialStatsObj = validStatsObj.filter(s => s.match.tournament.isOfficial !== false);
  const extraStatsObj = validStatsObj.filter(s => s.match.tournament.isOfficial === false);

  const clubStatsObj = officialStatsObj.filter(s => !getIsNationalStat(s));
  const natStatsObj = officialStatsObj.filter(s => getIsNationalStat(s));

  const topClubStatsObj = validStatsObj.filter(s => {
    if (getIsNationalStat(s)) return false;
    const catName = s.match.tournament.category?.name || s.match.tournament.name;
    return ["Liga TPM", "Primera División"].includes(catName);
  });

  const aggregateStats = (stats: any[]) => {
    return stats.reduce((acc, stat) => {
      const isHistoric = (["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ", "Ficticio (PJ)"].includes(stat.match?.round ?? ""));
      let sumPj = 0;
      if (isHistoric) {
        sumPj = stat.matchTime || 0;
      } else {
        sumPj = ((stat.matchTime ?? 0) > 0 || (stat.gkTime ?? 0) > 0) ? 1 : 0;
      }
      acc.pj += sumPj;
      acc.goles += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
      acc.asistencias += stat.assists;
      acc.rojas += stat.redCards || 0;
      acc.golesTiroLibre += stat.freeKickGoals || 0;
      acc.golesPenal += stat.penaltyGoals || 0;
      acc.penalesAtajados += stat.penaltiesSaved || 0;
      acc.penalesRecibidos += stat.penaltiesConceded || 0;
      acc.pasesM += stat.passesMade;
      acc.pasesT += stat.passesTotal;
      acc.tirosM += stat.shotsMade;
      acc.tirosT += stat.shotsTotal;
      acc.atajadasM += stat.savesMade;
      acc.atajadasT += stat.savesTotal;
      acc.minutos += stat.matchTime;
      return acc;
    }, { 
      pj: 0, goles: 0, asistencias: 0, 
      rojas: 0, golesTiroLibre: 0, golesPenal: 0, penalesAtajados: 0, penalesRecibidos: 0,
      pasesM: 0, pasesT: 0, tirosM: 0, tirosT: 0, atajadasM: 0, atajadasT: 0, minutos: 0 
    });
  };

  const totalClubStats = aggregateStats(topClubStatsObj);
  const totalNatStats = aggregateStats(natStatsObj);

  const paseExito = totalClubStats.pasesT > 0 ? Math.round((totalClubStats.pasesM / totalClubStats.pasesT) * 100) : 0;
  const tiroExito = totalClubStats.tirosT > 0 ? Math.round((totalClubStats.tirosM / totalClubStats.tirosT) * 100) : 0;
  const atajadaExito = totalClubStats.atajadasT > 0 ? Math.round((totalClubStats.atajadasM / totalClubStats.atajadasT) * 100) : 0;

  const renderTrophyCard = (trofeo: any) => {
    const styles = getTournamentStyles(trofeo.name, trofeo.tournament?.name || "");
    const formattedName = formatTrophyName(trofeo.name);
    const isCampeon = formattedName.toLowerCase() === "campeón";

    if (isCampeon) {
      return (
        <div key={trofeo.id} className={`bg-card border ${styles.borderClass} rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-w-[220px] relative overflow-hidden shadow-xl hover:scale-110 transition-transform text-center`}>
          <div className="z-10 flex items-center justify-center mb-2">
            {styles.imageSrc ? (
              <img src={styles.imageSrc} alt={formattedName} className="h-28 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="text-7xl drop-shadow-xl">{styles.icon}</div>
            )}
          </div>
          <div className="flex flex-col z-10 items-center">
            <span className={`font-black text-xl ${styles.textClass} uppercase tracking-widest drop-shadow-md`}>{formattedName}</span>
            <span className="text-sm font-bold text-white/90 uppercase tracking-wider mt-1">
              {trofeo.tournament ? `${trofeo.tournament.name}${trofeo.tournament.isOfficial ? ` - ${trofeo.tournament.season?.name || ''}` : ''}` : 'Histórico'}
            </span>
            {trofeo.type === 'TEAM' && trofeo.team && (
              <span className="text-xs font-semibold text-muted-foreground/80 mt-0.5 uppercase tracking-wide">
                {trofeo.team.name}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none z-0"></div>
          <div className="absolute -right-4 -bottom-4 opacity-5 text-9xl z-0 pointer-events-none">
            {trofeo.type === 'TEAM' ? '👥' : styles.icon}
          </div>
        </div>
      );
    }

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
          <span className="text-xs text-muted-foreground">
            {trofeo.tournament ? `${trofeo.tournament.name} - ${trofeo.tournament.isOfficial ? (trofeo.tournament.season?.name || '') : 'Extra'}` : 'Histórico'}
          </span>
          {trofeo.type === 'TEAM' && trofeo.team && (
            <span className="text-[10px] text-muted-foreground/70 uppercase font-semibold mt-0.5 tracking-wide">
              {trofeo.team.name}
            </span>
          )}
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 text-8xl z-0 pointer-events-none">
          {trofeo.type === 'TEAM' ? '👥' : styles.icon}
        </div>
      </div>
    );
  };

  const renderTrophySection = (trophies: any[], title: string, isExtra: boolean = false) => {
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
    const individuales = getTrophiesByCategory(trophies, "DISTINCION");

    return (
      <div className="flex flex-col gap-6 mb-8">
        <h3 className={`text-2xl font-black flex items-center gap-2 border-b border-border pb-2 ${isExtra ? 'text-amber-500' : 'text-blue-500'}`}>
          <span className={`w-2 h-6 ${isExtra ? 'bg-amber-500' : 'bg-blue-500'} rounded-full inline-block`}></span>
          {title}
        </h3>
        
        <div className="flex flex-col gap-8">
          {campeon.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-xl">🥇</span> {t.playerDetail.champion}</h4>
              <div className="flex flex-wrap gap-4">
                {campeon.map(renderTrophyCard)}
              </div>
            </div>
          )}

          {subcampeon.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-zinc-300 flex items-center gap-2"><span className="text-xl">🥈</span> {t.playerDetail.runnerUp}</h4>
              <div className="flex flex-wrap gap-4">
                {subcampeon.map(renderTrophyCard)}
              </div>
            </div>
          )}

          {tercer.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-amber-600/80 flex items-center gap-2"><span className="text-xl">🥉</span> {t.playerDetail.thirdPlace}</h4>
              <div className="flex flex-wrap gap-4">
                {tercer.map(renderTrophyCard)}
              </div>
            </div>
          )}

          {individuales.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-blue-400 flex items-center gap-2"><span className="text-xl">🏅</span> {t.playerDetail.individual}</h4>
              <div className="flex flex-wrap gap-4">
                {individuales.map(renderTrophyCard)}
              </div>
            </div>
          )}
        </div>
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
            jugador.nick.charAt(0)
          )}
        </div>
        <div className="flex flex-col items-center md:items-start flex-1 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black neon-text text-center md:text-left drop-shadow-lg leading-tight uppercase">{jugador.nick}</h1>
            {jugador.user?.discordId && (
              <a href={`https://discord.com/users/${jugador.user.discordId}`} target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:text-[#4752C4] transition-colors bg-secondary p-2 rounded-full border border-border" title="Perfil de Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            )}
          </div>
          <div className="text-muted-foreground mt-2 font-mono flex items-center gap-2">
            <span>{t.playerDetail.title}</span>
            <span>•</span>
            <span className="flex items-center gap-2">
              {jugador.nationality === 'Desconocida' || jugador.nationality === 'Sin Nacionalidad' ? (
                <span className="w-6 text-center text-sm" title="Desconocida">❓</span>
              ) : (
                <img 
                  src={
                    jugador.nationality === 'Argentina' ? '/img/banderas/argentina.svg' :
                    jugador.nationality === 'Uruguay' ? '/img/banderas/uruguay.svg' :
                    jugador.nationality === 'Brasil' ? '/img/banderas/brazil.svg' :
                    getFlagUrl(jugador.nationality)
                  } 
                  alt={jugador.nationality} 
                  title={jugador.nationality}
                  className="w-6 h-auto rounded-sm shadow-sm"
                />
              )}
              <span className="font-bold">{jugador.nationality}</span>
            </span>
            {jugador.primaryPosition && jugador.primaryPosition !== 'Ninguna' && (
              <>
                <span>•</span>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-md font-bold uppercase border border-primary/30 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="text-white/60 font-normal text-[10px] tracking-wider uppercase mr-1">Principal:</span>
                  {jugador.primaryPosition}
                </span>
              </>
            )}
            {jugador.secondaryPosition && jugador.secondaryPosition !== 'Ninguna' && (
              <>
                <span>•</span>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md font-bold uppercase border border-blue-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <span className="text-white/60 font-normal text-[10px] tracking-wider uppercase mr-1">Secundaria:</span>
                  {jugador.secondaryPosition}
                </span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span>•</span>
            <span className="flex items-center gap-2">
              {currentTeam ? (
                <Link href={`/equipos/${currentTeam.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  {currentTeam.logoUrl && (
                    <img src={currentTeam.logoUrl} alt={currentTeam.name} className="w-5 h-5 object-contain" />
                  )}
                  <span className="font-bold text-white">{currentTeam.name}</span>
                </Link>
              ) : (
                <span className="italic">Sin equipo</span>
              )}
            </span>
          </div>
          
          <div className="mt-6 flex flex-col xl:flex-row gap-8 w-full justify-center md:justify-start">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center md:text-left">Clubes</span>
              <div className="flex flex-wrap gap-2">
                <div className="bg-secondary/50 px-4 py-2 rounded-xl border border-border text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-primary">{totalClubStats.pj}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">PJ</span>
                </div>
                <div className="bg-secondary/50 px-4 py-2 rounded-xl border border-border text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-white">{totalClubStats.goles}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">G</span>
                </div>
                <div className="bg-secondary/50 px-4 py-2 rounded-xl border border-border text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-white">{totalClubStats.asistencias}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">A</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center md:text-left">Selección</span>
              <div className="flex flex-wrap gap-2">
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/30 text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-primary">{totalNatStats.pj}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">PJ</span>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/30 text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-white">{totalNatStats.goles}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">G</span>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/30 text-center min-w-[70px]">
                  <span className="block text-2xl font-black text-white">{totalNatStats.asistencias}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* VITRINA DE TROFEOS */}
        <div className="lg:col-span-3 flex flex-col gap-6 mb-2">
          <h2 className="text-3xl font-black flex items-center gap-2 border-b border-border pb-2 neon-text">
            <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
            {t.playerDetail.trophies}
          </h2>
          
          {renderTrophySection(officialTrophies, "Trofeos Oficiales", false)}
          {renderTrophySection(extraTrophies, "Trofeos Extra", true)}
        </div>

        {/* ESTADISTICAS AVANZADAS */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">Rendimiento en Clubes</h2>
          <PlayerMetricsClient matchStats={clubStatsObj.map(s => ({
            goals: (s.goals || 0) + (s.freeKickGoals || 0) + (s.penaltyGoals || 0),
            assists: s.assists,
            teamPoints: s.teamPoints,
            matchTime: s.matchTime,
            passesMade: s.passesMade,
            passesTotal: s.passesTotal,
            slidingMade: s.slidingMade,
            slidingTotal: s.slidingTotal,
            fouls: s.fouls,
            ballLosses: s.ballLosses,
            gkTime: s.gkTime,
            shotsMade: s.shotsMade,
            shotsTotal: s.shotsTotal,
            headersMade: s.headersMade,
            headersTotal: s.headersTotal,
            tacklesWon: s.tacklesWon,
            fouled: s.fouled,
            offsides: s.offsides,
            savesMade: s.savesMade,
            savesTotal: s.savesTotal,
            redCards: s.redCards || 0,
            freeKickGoals: s.freeKickGoals || 0,
            penaltyGoals: s.penaltyGoals || 0,
            penaltiesSaved: s.penaltiesSaved || 0,
            penaltiesConceded: s.penaltiesConceded || 0,
            categoryName: s.match?.tournament?.category?.name || "Sin Categoría"
          }))} />

          {natStatsObj.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2 mt-4">Rendimiento en Selección</h2>
              <PlayerMetricsClient matchStats={natStatsObj.map(s => ({
                goals: (s.goals || 0) + (s.freeKickGoals || 0) + (s.penaltyGoals || 0),
                assists: s.assists,
                teamPoints: s.teamPoints,
                matchTime: s.matchTime,
                passesMade: s.passesMade,
                passesTotal: s.passesTotal,
                slidingMade: s.slidingMade,
                slidingTotal: s.slidingTotal,
                fouls: s.fouls,
                ballLosses: s.ballLosses,
                gkTime: s.gkTime,
                shotsMade: s.shotsMade,
                shotsTotal: s.shotsTotal,
                headersMade: s.headersMade,
                headersTotal: s.headersTotal,
                tacklesWon: s.tacklesWon,
                fouled: s.fouled,
                offsides: s.offsides,
                savesMade: s.savesMade,
                savesTotal: s.savesTotal,
                redCards: s.redCards || 0,
                freeKickGoals: s.freeKickGoals || 0,
                penaltyGoals: s.penaltyGoals || 0,
                penaltiesSaved: s.penaltiesSaved || 0,
                penaltiesConceded: s.penaltiesConceded || 0,
                categoryName: s.match?.tournament?.category?.name || "Sin Categoría"
              }))} />
            </>
          )}

          {extraStatsObj.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wider border-b border-border pb-2 mt-4">Torneos Extras (No Oficiales)</h2>
              <PlayerMetricsClient matchStats={extraStatsObj.map(s => ({
                goals: (s.goals || 0) + (s.freeKickGoals || 0) + (s.penaltyGoals || 0),
                assists: s.assists,
                teamPoints: s.teamPoints,
                matchTime: s.matchTime,
                passesMade: s.passesMade,
                passesTotal: s.passesTotal,
                slidingMade: s.slidingMade,
                slidingTotal: s.slidingTotal,
                fouls: s.fouls,
                ballLosses: s.ballLosses,
                gkTime: s.gkTime,
                shotsMade: s.shotsMade,
                shotsTotal: s.shotsTotal,
                headersMade: s.headersMade,
                headersTotal: s.headersTotal,
                tacklesWon: s.tacklesWon,
                fouled: s.fouled,
                offsides: s.offsides,
                savesMade: s.savesMade,
                savesTotal: s.savesTotal,
                redCards: s.redCards || 0,
                freeKickGoals: s.freeKickGoals || 0,
                penaltyGoals: s.penaltyGoals || 0,
                penaltiesSaved: s.penaltiesSaved || 0,
                penaltiesConceded: s.penaltiesConceded || 0,
                categoryName: s.match?.tournament?.name || "Torneo Extra"
              }))} />
            </>
          )}

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
                    <th className="px-4 py-3 font-bold text-center text-primary">Goles</th>
                    <th className="px-4 py-3 font-bold text-center text-primary">Asistencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {validStatsObj.slice(0, 5).map((stat: any) => {
                    const isHistorico = (["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(stat.match.round ?? ""));
                    return (
                    <tr key={stat.id} className={`transition-colors ${isHistorico ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}>
                      <td className="px-4 py-3">
                        <Link href={isHistorico ? '#' : `/partidos/${stat.match.id}`} className="block">
                          <div className={`font-bold flex items-center gap-2 ${!isHistorico ? 'hover:text-primary transition-colors' : ''}`}>
                             {isHistorico ? (
                               <span className="text-primary font-black uppercase tracking-wider">📊 Resumen Estadístico</span>
                             ) : (
                               `${stat.match.homeTeam.name} vs ${stat.match.awayTeam.name}`
                             )}
                          </div>
                          <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                             <span>{stat.match.tournament.name}</span>
                             {isHistorico && <span className="bg-primary/20 text-primary px-1 rounded">Carga Masiva</span>}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-lg">{(stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0)}</td>
                      <td className="px-4 py-3 text-center font-black text-lg">{stat.assists || 0}</td>
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
                  {validStatsObj.length > 5 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center">
                        <span className="text-xs text-muted-foreground font-bold">Mostrando los últimos 5 partidos.</span>
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
