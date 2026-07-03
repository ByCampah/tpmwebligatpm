import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";
import HeadToHeadClient from "./HeadToHeadClient";
import { getTournamentStyles, getTrophyCategory } from "@/lib/colors";

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
        include: { awayTeam: true, tournament: true },
        orderBy: { matchDate: "desc" }
      },
      awayMatches: {
        include: { homeTeam: true, tournament: true },
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

  // Group Trophies
  const campeon = team.trophies.filter(t => getTrophyCategory(t.name) === "CAMPEON");
  const subcampeon = team.trophies.filter(t => getTrophyCategory(t.name) === "SUBCAMPEON");
  const tercer = team.trophies.filter(t => getTrophyCategory(t.name) === "TERCER");

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
          <span className="text-xs text-muted-foreground">{trofeo.tournament ? `${trofeo.tournament.name} - ${trofeo.tournament.isOfficial ? (trofeo.tournament.season?.name || '') : 'Extra'}` : 'Histórico'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      <Link href="/equipos" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <span>←</span> {t.teams.back}
      </Link>
      
      {/* HEADER PERFIL */}
      <div className="relative bg-card border border-border rounded-2xl p-8 overflow-hidden shadow-lg flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center p-4 border-4 border-card shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-6xl font-black text-muted-foreground">{team.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col items-center md:items-start justify-center h-full z-10 py-4">
          <h1 className="text-4xl md:text-6xl font-black neon-text text-center md:text-left">{team.name}</h1>
          <p className="text-muted-foreground mt-2 font-bold flex items-center gap-2 text-sm md:text-base">
            Capitán: <span className="text-primary">{team.captain?.nickName || team.captain?.name || "Sin asignar"}</span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* VITRINA DE TROFEOS (Si tiene) */}
        {team.trophies.length > 0 && (
          <div className="md:col-span-2 flex flex-col gap-6 mb-4">
            <h2 className="text-3xl font-black flex items-center gap-2 border-b border-border pb-2 neon-text">
              <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
              {t.teams.trophies}
            </h2>
            
            <div className="flex flex-col gap-8">
              {campeon.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">🥇</span> {t.teams.champion}</h3>
                  <div className="flex flex-wrap gap-4">
                    {campeon.map(renderTrophyCard)}
                  </div>
                </div>
              )}

              {subcampeon.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-zinc-300 flex items-center gap-2"><span className="text-2xl">🥈</span> {t.teams.runnerUp}</h3>
                  <div className="flex flex-wrap gap-4">
                    {subcampeon.map(renderTrophyCard)}
                  </div>
                </div>
              )}

              {tercer.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-amber-600/80 flex items-center gap-2"><span className="text-2xl">🥉</span> {t.teams.thirdPlace}</h3>
                  <div className="flex flex-wrap gap-4">
                    {tercer.map(renderTrophyCard)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                  <div className="flex items-center gap-4">
                    <span className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs bg-card border border-border ${resultClass}`}>
                      {resultText}
                    </span>
                    <span className="text-xs text-muted-foreground w-8">{isHome ? '(L)' : '(V)'}</span>
                    <Link href={`/partidos/${match.id}`} className="font-bold truncate max-w-[120px] sm:max-w-[200px] hover:text-primary hover:underline transition-colors">
                      vs {opponent.name}
                    </Link>
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
