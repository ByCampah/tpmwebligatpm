import { prisma } from "@/lib/prisma";
import MatchManagerClient from "./MatchManagerClient";

export default async function AdminPartidosPage() {
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tournaments: {
        include: {
          category: true,
          teams: {
            include: { 
              team: true,
              players: { include: { player: true } }
            }
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
          }
        }
      }
    }
  });

  if (!activeSeason) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold mb-2 text-destructive">No hay Temporada Activa</h2>
        <p className="text-muted-foreground">Debes activar una temporada desde la sección de Temporadas y Torneos.</p>
      </div>
    );
  }

  // Extract all matches from all tournaments
  const allMatches = activeSeason.tournaments.flatMap(t => 
    t.matches.map(m => ({
      ...m,
      tournament: { 
        id: t.id, 
        name: t.name, 
        categoryId: t.categoryId,
        category: t.category,
        teams: t.teams 
      }
    }))
  );

  // Sort by date (if available) or by round
  allMatches.sort((a, b) => {
    if (a.matchDate && b.matchDate) return a.matchDate.getTime() - b.matchDate.getTime();
    return (a.round || "").localeCompare(b.round || "");
  });

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-black neon-text uppercase">Gestión de Partidos</h1>
        <p className="text-muted-foreground">Temporada Activa: <span className="font-bold text-primary">{activeSeason.name}</span></p>
      </header>
      
      <MatchManagerClient initialMatches={allMatches} />
    </div>
  );
}
