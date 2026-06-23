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
            include: { team: true }
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
      "Global": { pj: 0, goles: 0, asistencias: 0 }
    };

    p.matchStats.forEach(stat => {
      const matchPj = stat.match.round === "Estadísticas Históricas" ? (stat.matchTime || 1) : 1;
      
      // Global stats
      compStats["Global"].pj += matchPj;
      compStats["Global"].goles += stat.goals;
      compStats["Global"].asistencias += stat.assists;

      // Extract base competition name from the database schema field directly!
      const comp = stat.match.tournament.category?.name || "General";
      
      if (!compStats[comp]) {
        compStats[comp] = { pj: 0, goles: 0, asistencias: 0 };
      }
      compStats[comp].pj += matchPj;
      compStats[comp].goles += stat.goals;
      compStats[comp].asistencias += stat.assists;
    });
    
    // Get the current/last team
    const lastTeam = p.tournamentTeams.length > 0 
      ? p.tournamentTeams[0].tournamentTeam.team.name 
      : "Agente Libre";

    return {
      id: p.id,
      nick: p.nick,
      nationality: p.nationality,
      stats: compStats,
      lastTeam
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
