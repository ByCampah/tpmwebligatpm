import { prisma } from "@/lib/prisma";
import JugadoresClient from "./JugadoresClient";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export default async function JugadoresPage() {
  const locale = "es";
  const t = await getDictionary(locale);
  // Aggregate stats across all matches for each player
  const jugadores = await prisma.player.findMany({
    include: {
      matchStats: {
        include: {
          match: {
            include: {
              tournament: { include: { category: true } }
            }
          }
        }
      },
      tournamentTeams: {
        include: {
          tournamentTeam: {
            include: { 
              team: true,
              tournament: {
                include: { season: true }
              }
            }
          }
        },
        orderBy: {
          tournamentTeam: {
            tournament: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  const jugadoresStats = jugadores.map(p => {
    const compStats: Record<string, { pj: number, goles: number, asistencias: number }> = {
      "Global": { pj: 0, goles: 0, asistencias: 0 },
      "Torneos Extra (No Oficial)": { pj: 0, goles: 0, asistencias: 0 }
    };

    p.matchStats.forEach(stat => {
      const isHistoric = stat.match.round === "Estadísticas Históricas";
      
      const matchPj = isHistoric ? 0 : 1;
      
      const isOfficial = stat.match.tournament.isOfficial;

      if (isOfficial) {
        // Global stats
        compStats["Global"].pj += matchPj;
        compStats["Global"].goles += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
        compStats["Global"].asistencias += stat.assists;

        // Extract base competition name from the database schema field directly!
        const comp = stat.match.tournament.category?.name || "General";
        
        if (!compStats[comp]) {
          compStats[comp] = { pj: 0, goles: 0, asistencias: 0 };
        }
        compStats[comp].pj += matchPj;
        compStats[comp].goles += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
        compStats[comp].asistencias += stat.assists;
      } else {
        compStats["Torneos Extra (No Oficial)"].pj += matchPj;
        compStats["Torneos Extra (No Oficial)"].goles += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
        compStats["Torneos Extra (No Oficial)"].asistencias += stat.assists;
      }
    });
    
    // Get the active season club
    const activeSeasonTeam = p.tournamentTeams.find(tt => 
      tt.tournamentTeam.tournament.season?.isActive && !tt.tournamentTeam.team.isNationalTeam
    );
    
    const lastTeam = activeSeasonTeam 
      ? activeSeasonTeam.tournamentTeam.team.name 
      : "Agente Libre";
      
    const lastTeamLogo = activeSeasonTeam
      ? activeSeasonTeam.tournamentTeam.team.logoUrl
      : null;

    // Check if called up in active season
    const isCalledUp = p.tournamentTeams.some(tt => 
      tt.tournamentTeam.team.isNationalTeam && 
      tt.tournamentTeam.tournament.season?.isActive
    );

    return {
      id: p.id,
      nick: p.nick,
      nationality: p.nationality,
      primaryPosition: p.primaryPosition,
      secondaryPosition: p.secondaryPosition,
      stats: compStats,
      lastTeam,
      lastTeamLogo,
      isCalledUp
    };
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-4xl font-black neon-text uppercase">{t.players.title}</h1>
        <p className="text-muted-foreground">
          {t.players.subtitle}
        </p>
      </header>

      <JugadoresClient jugadores={jugadoresStats} dictionary={t.players} />
    </div>
  );
}
