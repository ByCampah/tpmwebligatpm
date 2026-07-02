"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/flags";

interface JugadoresClientProps {
  jugadores: {
    id: string;
    nick: string;
    nationality: string;
    stats: Record<string, { pj: number; goles: number; asistencias: number }>;
    lastTeam: string;
    lastTeamLogo?: string | null;
    primaryPosition?: string | null;
    secondaryPosition?: string | null;
    isCalledUp: boolean;
  }[];
  dictionary: any;
}

export default function JugadoresClient({ jugadores, dictionary }: JugadoresClientProps) {
  const [search, setSearch] = useState("");
  const [competition, setCompetition] = useState("Global");
  const [nationalityFilter, setNationalityFilter] = useState("Todas");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: "goles", direction: "desc" });

  // Extract all available competitions
  const allComps = useMemo(() => {
    const comps = new Set(["Global"]);
    jugadores.forEach(j => Object.keys(j.stats).forEach(c => comps.add(c)));
    return Array.from(comps);
  }, [jugadores]);

  // Sort and filter logic
  const filteredAndSorted = useMemo(() => {
    // 1. Filter
    let result = jugadores.filter(jugador => {
      const matchName = jugador.nick.toLowerCase().includes(search.toLowerCase());
      const matchNat = nationalityFilter === "Todas" || jugador.nationality === nationalityFilter;
      return matchName && matchNat;
    });

    // 2. Sort
    result.sort((a, b) => {
      const statsA = a.stats[competition] || { pj: 0, goles: 0, asistencias: 0 };
      const statsB = b.stats[competition] || { pj: 0, goles: 0, asistencias: 0 };

      let aValue = sortConfig.key === 'nick' ? a.nick : (statsA[sortConfig.key as keyof typeof statsA] || 0);
      let bValue = sortConfig.key === 'nick' ? b.nick : (statsB[sortConfig.key as keyof typeof statsB] || 0);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [jugadores, search, competition, sortConfig, nationalityFilter]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <span className="opacity-30">↕</span>;
    return sortConfig.direction === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input 
          type="text" 
          placeholder={dictionary.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
        <select 
          value={nationalityFilter} 
          onChange={(e) => setNationalityFilter(e.target.value)}
          className="w-full sm:w-1/3 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          <option value="Todas">Todas las Nacionalidades</option>
          <option value="Argentina">Argentina</option>
          <option value="Brasil">Brasil</option>
          <option value="Uruguay">Uruguay</option>
          <option value="Colombia">Colombia</option>
          <option value="Chile">Chile</option>
          <option value="Perú">Perú</option>
          <option value="Ecuador">Ecuador</option>
          <option value="Paraguay">Paraguay</option>
          <option value="Bolivia">Bolivia</option>
          <option value="Venezuela">Venezuela</option>
          <option value="Norte América">Norte América</option>
          <option value="Europa">Europa</option>
        </select>
        <select 
          value={competition} 
          onChange={(e) => setCompetition(e.target.value)}
          className="w-full sm:w-1/3 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          {allComps.map(comp => (
            <option key={comp} value={comp}>{comp === "Global" ? dictionary.allCompetitions : comp}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary text-secondary-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold w-12 text-center">#</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('nick')}>
                  Jugador <SortIcon column="nick" />
                </th>
                <th className="px-6 py-4 font-bold text-left text-muted-foreground">
                  Equipo
                </th>
                <th className="px-6 py-4 font-bold text-left text-muted-foreground">
                  Posición
                </th>
                <th className="px-6 py-4 font-bold text-center text-muted-foreground cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('pj')}>
                  PJ <SortIcon column="pj" />
                </th>
                <th className="px-6 py-4 font-bold text-center text-primary cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('goles')}>
                  Goles <SortIcon column="goles" />
                </th>
                <th className="px-6 py-4 font-bold text-center text-primary cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('asistencias')}>
                  Asistencias <SortIcon column="asistencias" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSorted.map((jugador, index) => {
                const stats = jugador.stats[competition] || { pj: 0, goles: 0, asistencias: 0 };
                if (competition !== "Global" && stats.pj === 0) return null;

                return (
                  <tr key={jugador.id} className="hover:bg-primary/5 transition-colors border-b border-border/50">
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono">{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      {jugador.nationality === 'Desconocida' || jugador.nationality === 'Sin Nacionalidad' ? (
                        <span className="w-5 text-center text-sm" title="Desconocida">❓</span>
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
                          className="w-5 h-auto rounded-sm"
                        />
                      )}
                      <Link href={`/jugadores/${jugador.id}`} className="hover:text-primary transition-colors">
                        {jugador.nick}
                      </Link>
                      {jugador.isCalledUp && <span className="ml-2 text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">Convocado</span>}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        {jugador.lastTeamLogo ? (
                          <img src={jugador.lastTeamLogo} alt={jugador.lastTeam} className="w-5 h-5 object-contain" />
                        ) : jugador.lastTeam !== 'Agente Libre' ? (
                          <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold">{jugador.lastTeam.charAt(0)}</div>
                        ) : null}
                        <span className={jugador.lastTeam === 'Agente Libre' ? 'text-muted-foreground italic text-xs' : 'font-bold text-xs'}>
                          {jugador.lastTeam}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 text-xs">
                        {jugador.primaryPosition && jugador.primaryPosition !== 'Ninguna' && (
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">{jugador.primaryPosition}</span>
                        )}
                        {jugador.secondaryPosition && jugador.secondaryPosition !== 'Ninguna' && (
                          <span className="bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded">{jugador.secondaryPosition}</span>
                        )}
                        {(!jugador.primaryPosition || jugador.primaryPosition === 'Ninguna') && (!jugador.secondaryPosition || jugador.secondaryPosition === 'Ninguna') && (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono">{stats.pj}</td>
                    <td className="px-4 py-3 text-center text-primary font-mono">{stats.goles}</td>
                    <td className="px-4 py-3 text-center text-primary font-mono">{stats.asistencias}</td>
                  </tr>
                );
              })}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    {jugadores.length === 0 ? "Aún no hay jugadores registrados." : "No se encontraron jugadores con esa búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
