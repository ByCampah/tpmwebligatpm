import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, CalendarDays, Users } from "lucide-react";
import { getTournamentStyles } from "@/lib/colors";
import SeasonView from "@/app/historial/[seasonId]/SeasonView";
import { getDictionary } from "@/i18n/getDictionary";

export const metadata = {
  title: "Pretemporada | TPM",
};

export default async function ExtrasPage() {
  const extraTournaments = await prisma.tournament.findMany({
    where: { isOfficial: false },
    include: {
      category: true,
      teams: {
        include: { team: true }
      },
      matches: {
        include: { 
          homeTeam: true, 
          awayTeam: true,
          stats: {
            include: {
              player: {
                include: {
                  tournamentTeams: {
                    include: {
                      tournamentTeam: {
                        include: { team: true }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { matchDate: "asc" }
      },
      trophies: {
        include: { team: true, player: true }
      },
      _count: { select: { matches: true, teams: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const currentExtra = extraTournaments.find(t => t.isActiveExtra) || (extraTournaments.length > 0 ? extraTournaments[0] : null);
  const historyExtras = currentExtra ? extraTournaments.filter(t => t.id !== currentExtra.id) : [];
  
  const locale = "es";
  const t = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12">
      <header className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-4xl font-black text-blue-400 uppercase">Pretemporada</h1>
        <p className="text-muted-foreground">
          Historial de torneos relámpago, de pretemporada y amistosos.
        </p>
      </header>

      {extraTournaments.length === 0 ? (
        <div className="bg-card border border-border p-8 rounded-xl text-center flex flex-col items-center gap-4">
          <Trophy className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-bold text-muted-foreground">No hay Pretemporada disputados.</p>
        </div>
      ) : (
        <>
          {currentExtra && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                Torneo Actual / Último Disputado
              </h2>
              <div className="bg-card border border-blue-500/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <h3 className="text-3xl font-black text-white mb-2">{currentExtra.name}</h3>
                <SeasonView 
                  season={{ 
                    id: "extra-" + currentExtra.id, 
                    name: "Torneo Extra", 
                    isActive: false, 
                    createdAt: currentExtra.createdAt 
                  } as any} 
                  tournaments={[currentExtra]} 
                  dictionary={t.history} 
                />
              </div>
            </div>
          )}

          {historyExtras.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                <span className="w-2 h-6 bg-muted-foreground rounded-full inline-block"></span>
                Historial de Pretemporada
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyExtras.map(t => {
                  const styles = getTournamentStyles(t.name, t.category?.name || "General");
                  return (
                    <Link key={t.id} href={`/extras/${t.id}`} className="block group">
                      <div className={`bg-card border ${styles.borderClass} rounded-2xl overflow-hidden shadow-lg transition-transform group-hover:-translate-y-1`}>
                        <div className={`${styles.bgClass} p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className={`relative z-10 w-20 h-20 ${styles.textClass} flex items-center justify-center text-4xl mb-4 font-black`}>
                            {styles.imageSrc ? (
                              <img src={styles.imageSrc} alt={t.name} className="w-16 h-16 object-contain" />
                            ) : (
                              styles.icon
                            )}
                          </div>
                          <h3 className="relative z-10 text-2xl font-black text-white text-center drop-shadow-md">
                            {t.name}
                          </h3>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4">
                          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {t._count.teams} Equipos</span>
                            <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> {t._count.matches} Partidos</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
