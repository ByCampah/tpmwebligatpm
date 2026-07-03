import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";

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

  const championsRaw = await prisma.trophy.groupBy({
    by: ['teamId'],
    where: { name: 'Campeón', type: 'TEAM', tournament: { name: 'Primera Division' } },
    _count: { teamId: true },
    orderBy: { _count: { teamId: 'desc' } }
  });

  const championTeams = await prisma.team.findMany({
    where: { id: { in: championsRaw.map(c => c.teamId).filter(Boolean) as string[] } }
  });

  const championsList = championsRaw.map(c => {
    const team = championTeams.find(t => t.id === c.teamId);
    return {
      team,
      count: c._count.teamId
    };
  }).filter(c => c.team);

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
          
          {activeExtra && (
            <Link href="/extras" className="mt-4 px-6 py-3 bg-secondary/80 text-white font-bold rounded-full border border-primary/50 hover:bg-secondary transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse hover:animate-none flex items-center gap-2">
              🏆 Torneo Extra en Curso: {activeExtra.name}
            </Link>
          )}
        </div>
      </section>

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
              Máximos Campeones Históricos
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden p-2">
              {(() => {
                // Find all teams with "Campeón" trophy in Primera Division
                // We'll list them or ideally fetch this inside the async component
                return null;
              })()}
              <div className="flex flex-col">
                {championsList.map((c, idx) => (
                  <div key={c.team!.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 w-1/2">
                      <span className="font-black text-xl text-muted-foreground w-6">{idx + 1}</span>
                      {c.team!.logoUrl ? (
                        <img src={c.team!.logoUrl!} alt={c.team!.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary"></div>
                      )}
                      <span className="font-bold">{c.team!.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-end w-1/2 gap-2">
                      <img src="/img/trofeos/LigaTPM.png" alt="Copa TPM" className="w-6 h-6 object-contain drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Títulos de Primera División" />
                      <span className="font-black text-xl text-primary bg-primary/10 px-3 py-1 rounded-md">{c.count}</span>
                    </div>
                  </div>
                ))}
                {championsList.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No hay campeones registrados
                  </div>
                )}
              </div>
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
