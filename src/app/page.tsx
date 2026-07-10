import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import ProdeSection from "@/components/ProdeSection";

export default async function Home() {
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tournaments: {
        include: {
          matches: {
            take: 5,
            orderBy: { matchDate: "desc" },
            include: { homeTeam: true, awayTeam: true }
          }
        }
      }
    }
  });

  const activeExtra = await prisma.tournament.findFirst({
    where: { isActiveExtra: true }
  });

  const seasonsHistory = await prisma.season.findMany({
    where: { isActive: false },
    orderBy: { createdAt: "asc" },
    include: {
      tournaments: {
        include: {
          trophies: {
            where: { type: "TEAM" },
            include: { team: true }
          }
        }
      }
    }
  });

  const historyData = await Promise.all(seasonsHistory.map(async (season) => {
    const sortedTournaments = [...season.tournaments].sort((a, b) => {
      if (a.format.includes("LEAGUE") && !b.format.includes("LEAGUE")) return -1;
      if (!a.format.includes("LEAGUE") && b.format.includes("LEAGUE")) return 1;
      return a.name.localeCompare(b.name);
    });

    const tournamentsData = await Promise.all(sortedTournaments.map(async (tournament) => {
      let topScorer = null;
      let topAssister = null;

      if (tournament.name.toLowerCase().includes("liga tpm")) {
        const scorerStats = await prisma.matchStat.groupBy({
          by: ['playerId'],
          where: { match: { tournamentId: tournament.id } },
          _sum: { goals: true, freeKickGoals: true, penaltyGoals: true },
          orderBy: { _sum: { goals: 'desc' } },
          take: 1
        });
        
        if (scorerStats.length > 0 && scorerStats[0]._sum.goals) {
          const p = await prisma.player.findUnique({ where: { id: scorerStats[0].playerId } });
          topScorer = { player: p, count: (scorerStats[0]._sum.goals || 0) + (scorerStats[0]._sum.freeKickGoals || 0) + (scorerStats[0]._sum.penaltyGoals || 0) };
        }

        const assistStats = await prisma.matchStat.groupBy({
          by: ['playerId'],
          where: { match: { tournamentId: tournament.id } },
          _sum: { assists: true },
          orderBy: { _sum: { assists: 'desc' } },
          take: 1
        });
        
        if (assistStats.length > 0 && assistStats[0]._sum.assists) {
          const p = await prisma.player.findUnique({ where: { id: assistStats[0].playerId } });
          topAssister = { player: p, count: assistStats[0]._sum.assists };
        }
      }

      return {
        ...tournament,
        topScorer,
        topAssister
      };
    }));

    return {
      ...season,
      tournaments: tournamentsData
    };
  }));

  const featuredNews = await prisma.news.findFirst({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-card rounded-2xl border border-border shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter neon-text">
          Bienvenido a Liga TPM
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          TPM Football es un juego donde vos manejas tu propio jugador, que estas esperando? Unite a la comunidad!
        </p>
        <div className="flex flex-col items-center justify-center gap-4">
          <a href="https://dl.dropboxusercontent.com/s/rud9i5kqrabsajy/TPM.rar?dl=0" target="_blank" rel="noreferrer" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center gap-2 text-lg">
            ⬇ DESCARGAR JUEGO
          </a>
        </div>
      </section>

      {/* PRODE SECTION */}
      <ProdeSection />

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Col: News & Streams (Mock) */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
                Noticias
              </h2>
              <Link href="/noticias" className="text-sm font-bold text-primary hover:underline">
                Ver todas &rarr;
              </Link>
            </div>
            
            {featuredNews ? (
              <Link href={`/noticias/${featuredNews.id}`} className="group block">
                <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50 relative">
                  {featuredNews.imageUrl && (
                    <div className="w-full h-48 relative">
                      <img src={featuredNews.imageUrl} alt={featuredNews.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>
                  )}
                  <div className={`p-6 ${featuredNews.imageUrl ? 'absolute bottom-0 left-0 w-full' : ''}`}>
                    <span className="text-xs font-black text-primary mb-2 block drop-shadow-md">DESTACADA</span>
                    <h3 className={`text-xl font-bold mb-2 group-hover:text-primary transition-colors ${featuredNews.imageUrl ? 'text-white drop-shadow-md' : ''}`}>
                      {featuredNews.title}
                    </h3>
                    {!featuredNews.imageUrl && (
                      <p className="text-muted-foreground line-clamp-3">
                        {featuredNews.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
                No hay noticias destacadas en este momento.
              </div>
            )}
          </section>

          {/* Historical Champions */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
              Historial de Campeones
            </h2>
            <div className="flex flex-col gap-4">
              {historyData.map((season) => (
                <details key={season.id} className="group bg-card border border-border rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors font-bold text-lg">
                    <span>{season.name}</span>
                    <span className="text-primary transition duration-300 group-open:-rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 pt-0 flex flex-col gap-6 border-t border-border/50 mt-2">
                    {season.tournaments.map((tournament: any) => {
                      const campeon = tournament.trophies.find((t: any) => t.name === 'Campeón');
                      const subcampeon = tournament.trophies.find((t: any) => t.name === 'Subcampeón');
                      const tercero = tournament.trophies.find((t: any) => t.name === 'Tercer Puesto');

                      return (
                        <div key={tournament.id} className="flex flex-col gap-3 bg-secondary/20 p-4 rounded-lg border border-border/30">
                          <h4 className="font-bold text-primary flex items-center gap-2">
                            🏆 {tournament.name}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {campeon && (
                              <div className="flex items-center gap-2 bg-card p-2 rounded border border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                                <span className="text-xl">🥇</span>
                                {campeon.team?.logoUrl ? <img src={campeon.team.logoUrl} alt={campeon.team.name} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 rounded-full bg-secondary"></div>}
                                <span className="font-bold text-sm truncate">{campeon.team?.name}</span>
                              </div>
                            )}
                            {subcampeon && (
                              <div className="flex items-center gap-2 bg-card p-2 rounded border border-[#C0C0C0]/30">
                                <span className="text-xl">🥈</span>
                                {subcampeon.team?.logoUrl ? <img src={subcampeon.team.logoUrl} alt={subcampeon.team.name} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 rounded-full bg-secondary"></div>}
                                <span className="font-bold text-sm truncate">{subcampeon.team?.name}</span>
                              </div>
                            )}
                            {tercero && (
                              <div className="flex items-center gap-2 bg-card p-2 rounded border border-[#CD7F32]/30">
                                <span className="text-xl">🥉</span>
                                {tercero.team?.logoUrl ? <img src={tercero.team.logoUrl} alt={tercero.team.name} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 rounded-full bg-secondary"></div>}
                                <span className="font-bold text-sm truncate">{tercero.team?.name}</span>
                              </div>
                            )}
                          </div>

                          {(tournament.topScorer || tournament.topAssister) && (
                            <div className="flex gap-4 mt-2 pt-2 border-t border-border/30">
                              {tournament.topScorer && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span title="Goleador">⚽</span>
                                  <span className="font-bold">{tournament.topScorer.player?.nick}</span>
                                  <span className="text-primary font-black bg-primary/10 px-2 rounded">
                                    {tournament.topScorer.count}
                                  </span>
                                </div>
                              )}
                              {tournament.topAssister && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span title="Asistidor">👟</span>
                                  <span className="font-bold">{tournament.topAssister.player?.nick}</span>
                                  <span className="text-primary font-black bg-primary/10 px-2 rounded">
                                    {tournament.topAssister.count}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {season.tournaments.length === 0 && (
                      <p className="text-sm text-muted-foreground">No hay torneos registrados.</p>
                    )}
                  </div>
                </details>
              ))}
              {historyData.length === 0 && (
                <div className="p-8 text-center text-muted-foreground border border-border rounded-xl">
                  No hay historial de campeones
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Col: Active Season Info */}
        <div className="flex flex-col gap-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-muted-foreground">Temporada Actual</h3>
            {activeSeason ? (
              <>
                <div className="text-3xl font-black mb-6 text-primary">{activeSeason.name}</div>
                <div className="space-y-4">
                  <h4 className="font-bold text-sm border-b border-border pb-2">Torneos en Juego:</h4>
                  {activeSeason.tournaments.map(tData => (
                    <div key={tData.id} className="flex items-center justify-between">
                      <Link href={`/liga?torneo=${tData.id}`} className="text-sm font-bold hover:text-primary hover:underline transition-colors">
                        {tData.name}
                      </Link>
                      <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">{tData.format}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay temporada activa</p>
            )}
          </section>

          {/* Active Extra Tournament */}
          {activeExtra && (
            <section className="bg-card border border-primary/30 rounded-xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="animate-pulse">🏆</span> Torneo Extra Activo
              </h3>
              <div className="text-2xl font-black mb-4">{activeExtra.name}</div>
              <Link href="/extras" className="w-full py-3 bg-secondary/80 hover:bg-secondary text-white font-bold rounded-lg border border-border transition-colors flex items-center justify-center gap-2">
                Ver Torneo &rarr;
              </Link>
            </section>
          )}

          {/* Discord Links */}
          <section className="bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl p-6 flex flex-col items-center text-center gap-4">
            <div>
              <h3 className="font-bold text-[#5865F2] mb-1 text-lg">👾 Unite a Discord</h3>
              <p className="text-sm text-muted-foreground">Participá con la comunidad</p>
            </div>
            
            <a href="https://discord.gg/7WZVN8qTsA" target="_blank" rel="noreferrer" className="w-full py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-bold transition-colors">
              TPM SUDAMERICA
            </a>
            <a href="https://discord.com/invite/xpGVgQ4qSN" target="_blank" rel="noreferrer" className="w-full py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-bold transition-colors">
              Comunidad de Campah
            </a>
            <a href="https://discord.gg/KMAgjumg6P" target="_blank" rel="noreferrer" className="w-full py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-bold transition-colors">
              Comunidad de Cerviyb
            </a>
          </section>

          {/* Kick Links */}
          <section className="bg-[#53FC18]/10 border border-[#53FC18]/20 rounded-xl p-6 flex flex-col items-center text-center gap-4">
            <div>
              <h3 className="font-bold text-[#53FC18] mb-1 text-lg">🟢 Seguinos en Kick</h3>
              <p className="text-sm text-muted-foreground">Mirá los partidos en vivo</p>
            </div>
            
            <div className="flex w-full gap-3">
              <a href="https://kick.com/campah" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#000000] border border-[#53FC18] hover:bg-[#53FC18] hover:text-black text-white rounded-md font-bold transition-colors">
                Campah
              </a>
              <a href="https://kick.com/cerviyb" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#000000] border border-[#53FC18] hover:bg-[#53FC18] hover:text-black text-white rounded-md font-bold transition-colors">
                Cerviyb
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
