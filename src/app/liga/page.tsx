import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export default async function LigaPage() {
  const locale = "es";
  const t = await getDictionary(locale);
  // Fetch active season and its "LEAGUE" format tournament
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tournaments: {
        where: { format: "LEAGUE" },
        include: {
          teams: {
            include: { team: true }
          },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: { matchDate: "desc" }
          }
        }
      }
    }
  });

  const leagueTournament = activeSeason?.tournaments[0];

  // Calculate Standings
  let standings = [];
  if (leagueTournament) {
    const tableMap = new Map();
    
    // Initialize teams
    leagueTournament.teams.forEach(tt => {
      tableMap.set(tt.teamId, {
        id: tt.team.id,
        name: tt.team.name,
        logo: tt.team.logoUrl,
        pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
      });
    });

    // Compute stats from PLAYED matches
    leagueTournament.matches.filter(m => m.status === 'PLAYED' && m.round !== 'Estadísticas Históricas').forEach(match => {
      const home = tableMap.get(match.homeTeamId);
      const away = tableMap.get(match.awayTeamId);
      
      if (home && away && match.homeScore !== null && match.awayScore !== null) {
        home.pj++; away.pj++;
        home.gf += match.homeScore; away.gf += match.awayScore;
        home.gc += match.awayScore; away.gc += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.pg++; home.pts += 3;
          away.pp++;
        } else if (match.homeScore < match.awayScore) {
          away.pg++; away.pts += 3;
          home.pp++;
        } else {
          home.pe++; away.pe++;
          home.pts += 1; away.pts += 1;
        }
      }
    });

    standings = Array.from(tableMap.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts; // Sort by points
      const diffA = a.gf - a.gc;
      const diffB = b.gf - b.gc;
      if (diffB !== diffA) return diffB - diffA; // Sort by Goal Difference
      return b.gf - a.gf; // Sort by Goals For
    });
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">{t.league.title}</h1>
        <p className="text-muted-foreground">
          {t.league.subtitle}
        </p>
      </header>

      {!leagueTournament ? (
        <div className="flex flex-col items-center justify-center p-24 bg-card border border-border rounded-xl shadow-lg mt-8 text-center gap-6">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-wider">{t.league.comingSoon}</h2>
          <p className="text-xl text-muted-foreground max-w-lg">
            No hay una temporada activa en este momento, o no hay un torneo de liga configurado.
          </p>
          <Link href="/historial" className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors mt-4">
            {t.league.btnHistory}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* TABLA DE POSICIONES */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black neon-text uppercase tracking-wider">Tabla de Posiciones</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead className="bg-secondary/80 text-secondary-foreground">
                    <tr>
                      <th className="p-4 w-12 font-black text-primary">#</th>
                      <th className="p-4 text-left font-bold tracking-wider">EQUIPO</th>
                      <th className="p-4 font-bold" title="Partidos Jugados">PJ</th>
                      <th className="p-4 text-primary font-bold" title="Partidos Ganados">PG</th>
                      <th className="p-4 text-muted-foreground font-bold" title="Partidos Empatados">PE</th>
                      <th className="p-4 text-destructive font-bold" title="Partidos Perdidos">PP</th>
                      <th className="p-4 text-primary font-bold" title="Goles a Favor">GF</th>
                      <th className="p-4 text-destructive font-bold" title="Goles en Contra">GC</th>
                      <th className="p-4 font-bold" title="Diferencia de Gol">DIF</th>
                      <th className="p-4 font-black text-white text-lg" title="Puntos">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standings.map((team: any, index: number) => (
                      <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-black text-primary">{index + 1}</td>
                        <td className="p-4 font-bold text-left flex items-center gap-4">
                          <div className="w-10 h-10 bg-black/50 rounded-full flex justify-center items-center overflow-hidden border border-border group-hover:border-primary transition-colors">
                            {team.logo ? <img src={team.logo} className="w-full h-full object-contain" alt="" /> : team.name.charAt(0)}
                          </div>
                          <Link href={`/equipos/${team.id}`} className="hover:text-primary transition-colors hover:underline">
                            {team.name}
                          </Link>
                        </td>
                        <td className="p-4 font-bold">{team.pj}</td>
                        <td className="p-4 text-primary font-bold">{team.pg}</td>
                        <td className="p-4 text-muted-foreground font-bold">{team.pe}</td>
                        <td className="p-4 text-destructive font-bold">{team.pp}</td>
                        <td className="p-4 font-bold">{team.gf}</td>
                        <td className="p-4 font-bold">{team.gc}</td>
                        <td className="p-4 font-bold text-muted-foreground">{team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}</td>
                        <td className="p-4 font-black text-white text-xl bg-black/20">{team.pts}</td>
                      </tr>
                    ))}
                    {standings.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-8 text-muted-foreground italic">No hay equipos inscritos en esta liga.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* ÚLTIMOS PARTIDOS */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black neon-text uppercase tracking-wider">Últimos Resultados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagueTournament.matches.filter((m: any) => m.status === 'PLAYED').slice(0, 6).map((match: any) => (
                <div key={match.id} className="bg-card border border-border p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden shadow-md hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded">{match.round || 'Liga'}</span>
                    <Link href={`/partidos/${match.id}`} className="text-xs font-bold text-primary hover:underline">VER DETALLES</Link>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <div className="flex items-center gap-2">
                      {match.homeTeam.logoUrl && <img src={match.homeTeam.logoUrl} className="h-6 object-contain" alt="" />}
                      <span className="truncate w-24">{match.homeTeam.name}</span>
                    </div>
                    <span className={`text-2xl font-black ${match.homeScore! > match.awayScore! ? 'text-primary' : (match.homeScore! < match.awayScore! ? 'text-destructive' : 'text-muted-foreground')}`}>
                      {match.homeScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <div className="flex items-center gap-2">
                      {match.awayTeam.logoUrl && <img src={match.awayTeam.logoUrl} className="h-6 object-contain" alt="" />}
                      <span className="truncate w-24">{match.awayTeam.name}</span>
                    </div>
                    <span className={`text-2xl font-black ${match.awayScore! > match.homeScore! ? 'text-primary' : (match.awayScore! < match.homeScore! ? 'text-destructive' : 'text-muted-foreground')}`}>
                      {match.awayScore}
                    </span>
                  </div>
                </div>
              ))}
              {leagueTournament.matches.filter((m: any) => m.status === 'PLAYED').length === 0 && (
                <p className="text-muted-foreground py-8 col-span-3 text-center">No hay partidos jugados aún en esta liga.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
