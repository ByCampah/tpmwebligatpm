"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/flags";
import { useSearchParams } from "next/navigation";
import BracketViewer from "@/components/BracketViewer";

interface TournamentData {
  id: string;
  name: string;
  format: string;
  bracketImageUrl?: string | null;
  bracketData?: any | null;
  matches: any[];
  teams: any[];
  trophies: any[];
}

interface SeasonViewProps {
  season: { id: string; name: string };
  tournaments: TournamentData[];
  dictionary: any;
}

export default function SeasonView({ season, tournaments, dictionary }: SeasonViewProps) {
  const searchParams = useSearchParams();
  const initialTorneo = searchParams.get('torneo');
  
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    initialTorneo && tournaments.some(t => t.id === initialTorneo) 
      ? initialTorneo 
      : tournaments[0]?.id
  );
  
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('standings');

  // Si cambia el parametro en la url y no habiamos renderizado, sincronizamos (opcional, por si navegan)
  useEffect(() => {
    const t = searchParams.get('torneo');
    if (t && tournaments.some(x => x.id === t)) {
      setSelectedTournamentId(t);
    }
  }, [searchParams, tournaments]);

  if (tournaments.length === 0) {
    return (
      <div className="p-12 text-center bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-lg">{dictionary.noTournaments}</p>
      </div>
    );
  }

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);
  const isCup = selectedTournament?.format === "CUP" || selectedTournament?.format === "PLAYOFF";

  const calculateStandings = (matches: any[], teams: any[]) => {
    const tableMap = new Map();
    teams.forEach((tt: any) => {
      tableMap.set(tt.teamId, {
        id: tt.team.id, name: tt.team.name, logo: tt.team.logoUrl,
        pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
      });
    });

    matches.filter((m: any) => m.status === 'PLAYED' && m.round !== 'Estadísticas Históricas').forEach((match: any) => {
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

    teams.forEach((tt: any) => {
      if (tt.manualPoints !== null && tt.manualPoints !== undefined) {
        const teamEntry = tableMap.get(tt.teamId);
        if (teamEntry) {
          teamEntry.pts = tt.manualPoints;
          teamEntry.pj = tt.manualGamesPlayed ?? teamEntry.pj;
          teamEntry.pg = tt.manualWins ?? teamEntry.pg;
          teamEntry.pe = tt.manualDraws ?? teamEntry.pe;
          teamEntry.pp = tt.manualLosses ?? teamEntry.pp;
          teamEntry.gf = tt.manualGoalsFor ?? teamEntry.gf;
          teamEntry.gc = tt.manualGoalsAgainst ?? teamEntry.gc;
        }
      }
    });

    return Array.from(tableMap.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const diffA = a.gf - a.gc;
      const diffB = b.gf - b.gc;
      if (diffB !== diffA) return diffB - diffA;
      return b.gf - a.gf;
    });
  };

  const isPlayoffMatch = (m: any) => /final|cuarto|octavo|dieciseisavo|tercer|playoff|llave|3er|3ro/i.test(m.round || "");
  const groupMatches = selectedTournament?.matches.filter((m: any) => m.round?.toLowerCase().includes('grupo') && !isPlayoffMatch(m)) || [];
  const playoffMatches = selectedTournament?.matches.filter((m: any) => isPlayoffMatch(m) || (!m.round?.toLowerCase().includes('grupo') && !m.round?.toLowerCase().includes('fecha') && m.round !== 'Estadísticas Históricas')) || [];
  const regularMatches = selectedTournament?.matches.filter((m: any) => m.round?.toLowerCase().includes('fecha') && !isPlayoffMatch(m) && m.round !== 'Estadísticas Históricas') || [];
  
  const allTournamentMatches = [...groupMatches, ...regularMatches, ...playoffMatches];
  const displayedMatches = selectedRound ? allTournamentMatches.filter((m: any) => m.round === selectedRound) : allTournamentMatches;

  const cupGroups = Array.from(new Set(selectedTournament?.teams.map((tt: any) => tt.group).filter(Boolean)));
  const groupStandings = cupGroups.map((gName: any) => {
    const gTeams = selectedTournament?.teams.filter((tt: any) => tt.group === gName) || [];
    const gTeamIds = new Set(gTeams.map((tt: any) => tt.teamId));
    const gMatches = groupMatches.filter((m: any) => gTeamIds.has(m.homeTeamId) && gTeamIds.has(m.awayTeamId));
    
    return {
      name: `Grupo ${gName}`,
      standings: calculateStandings(gMatches, gTeams)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const calculatePlayerStats = () => {
    const statsMap = new Map();
    selectedTournament?.matches.forEach((m: any) => {
      if (m.round === 'Estadísticas Históricas' || m.status === 'PLAYED') {
        m.stats?.forEach((s: any) => {
          if (!statsMap.has(s.playerId)) {
            const pTeamData = s.player.tournamentTeams?.find((t: any) => t.tournamentTeam.tournamentId === selectedTournament.id);
            const teamInfo = pTeamData?.tournamentTeam.team;

            statsMap.set(s.playerId, {
              id: s.playerId,
              name: s.player.nick,
              nationality: s.player.nationality || 'Desconocida',
              teamName: teamInfo?.name || "Agente Libre",
              teamLogo: teamInfo?.logoUrl,
              goals: 0,
              assists: 0,
              cleanSheets: 0,
              savesMade: 0,
              savesTotal: 0,
            });
          }
          const pStat = statsMap.get(s.playerId);
          pStat.goals += (s.goals || 0) + (s.freeKickGoals || 0) + (s.penaltyGoals || 0);
          pStat.assists += s.assists || 0;
          pStat.savesMade += s.savesMade || 0;
          pStat.savesTotal += s.savesTotal || 0;
          if (s.cleanSheet) pStat.cleanSheets += 1;
        });
      }
    });
    
    return Array.from(statsMap.values());
  };

  const playerStats = calculatePlayerStats();
  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 10).filter(p => p.goals > 0);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 10).filter(p => p.assists > 0);
  const topGk = [...playerStats].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10).filter(p => p.cleanSheets > 0);
  const topSaves = [...playerStats].sort((a, b) => b.savesMade - a.savesMade).slice(0, 10).filter(p => p.savesMade > 0);

  const renderMatchCard = (match: any) => (
    <div key={match.id} className="flex flex-col border border-border rounded-lg overflow-hidden shadow-sm bg-card transition-colors hover:border-primary/50 shrink-0">
      <div className="bg-secondary/50 px-3 py-1.5 text-xs text-center text-muted-foreground font-bold border-b border-border">
        {match.round}
      </div>
      <div className="flex items-center justify-between p-3 gap-2">
        <div className="flex-1 text-right font-bold text-sm truncate flex items-center justify-end gap-2">
          <span className="truncate">{match.homeTeam.name}</span>
          {match.homeTeam.logoUrl && <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-5 h-5 object-contain shrink-0" />}
        </div>
        <div className="shrink-0 flex justify-center">
          <span className="px-3 py-1 bg-black rounded border border-white/10 font-mono font-bold text-white shadow-inner whitespace-nowrap">
            {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
          </span>
        </div>
        <div className="flex-1 text-left font-bold text-sm truncate flex items-center gap-2">
          {match.awayTeam.logoUrl && <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-5 h-5 object-contain shrink-0" />}
          <span className="truncate">{match.awayTeam.name}</span>
        </div>
      </div>
      <Link href={`/partidos/${match.id}`} className="bg-primary/5 text-primary text-xs text-center py-2 font-bold hover:bg-primary hover:text-primary-foreground transition-colors border-t border-border/50">
        {dictionary.viewDetails}
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {tournaments.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTournamentId(t.id)}
            className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-300 ${
              selectedTournamentId === t.id 
                ? 'bg-primary text-primary-foreground shadow-[0_-4px_12px_rgba(16,185,129,0.2)]' 
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {selectedTournament && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-black text-primary border-l-4 border-primary pl-4">{selectedTournament.name}</h2>
          
          <div className="flex gap-2 border-b border-border/30 pb-4 overflow-x-auto hide-scrollbar">
            {[
              { id: 'standings', label: dictionary.standings },
              { id: 'goleadores', label: dictionary.topScorers },
              { id: 'asistencias', label: dictionary.topAssists },
              { id: 'vallas', label: dictionary.topGk },
              { id: 'atajadas', label: 'Atajadas' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {activeTab === 'standings' && (
                <div className="flex flex-col gap-8 w-full">
                  {!isCup && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-2xl font-bold">{dictionary.standings}</h3>
                      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-secondary text-secondary-foreground">
                              <tr>
                                <th className="px-4 py-3 font-bold w-12 text-center">#</th>
                                <th className="px-4 py-3 font-bold">{dictionary.team}</th>
                                <th className="px-4 py-3 font-bold text-center">PTS</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">PJ</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">PG</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">PE</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">PP</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">GF</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">GC</th>
                                <th className="px-4 py-3 font-bold text-center text-muted-foreground">DG</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {calculateStandings(regularMatches, selectedTournament.teams).map((team: any, index: number) => (
                                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-center font-bold text-muted-foreground">{index + 1}</td>
                                  <td className="px-4 py-3 font-bold flex items-center gap-2">
                                    {team.logo ? <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 bg-secondary rounded-full"></div>}
                                    <Link href={`/equipos/${team.id}`} className="hover:text-primary transition-colors">{team.name}</Link>
                                  </td>
                                  <td className="px-4 py-3 text-center font-black text-primary text-base">{team.pts}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.pj}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.pg}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.pe}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.pp}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.gf}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">{team.gc}</td>
                                  <td className="px-4 py-3 text-center text-muted-foreground font-mono">{team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCup && groupStandings.length > 0 && (
                    <div className="flex flex-col gap-6">
                      {groupStandings.map((group, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                          <h3 className="text-xl font-bold">{group.name as string}</h3>
                          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-secondary text-secondary-foreground">
                                  <tr>
                                    <th className="px-4 py-3 font-bold w-12 text-center">#</th>
                                    <th className="px-4 py-3 font-bold">{dictionary.team}</th>
                                    <th className="px-4 py-3 font-bold text-center">PTS</th>
                                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">PJ</th>
                                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">GF</th>
                                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">GC</th>
                                    <th className="px-4 py-3 font-bold text-center text-muted-foreground">DG</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {group.standings.map((team: any, index: number) => (
                                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                                      <td className="px-4 py-3 text-center font-bold text-muted-foreground">{index + 1}</td>
                                      <td className="px-4 py-3 font-bold flex items-center gap-2">
                                        {team.logo ? <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 bg-secondary rounded-full"></div>}
                                        <Link href={`/equipos/${team.id}`} className="hover:text-primary transition-colors">{team.name}</Link>
                                      </td>
                                      <td className="px-4 py-3 text-center font-black text-primary text-base">{team.pts}</td>
                                      <td className="px-4 py-3 text-center text-muted-foreground">{team.pj}</td>
                                      <td className="px-4 py-3 text-center text-muted-foreground">{team.gf}</td>
                                      <td className="px-4 py-3 text-center text-muted-foreground">{team.gc}</td>
                                      <td className="px-4 py-3 text-center text-muted-foreground font-mono">{team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(selectedTournament.bracketData || selectedTournament.bracketImageUrl) && (
                    <div className="flex flex-col gap-4 mb-8 w-full">
                      <h3 className="text-xl font-bold">Llave Final</h3>
                      {selectedTournament.bracketData && (
                        <div className="bg-card/50 border border-border rounded-xl shadow-lg overflow-hidden py-4">
                          <BracketViewer 
                            bracketData={typeof selectedTournament.bracketData === 'string' ? JSON.parse(selectedTournament.bracketData) : selectedTournament.bracketData} 
                            teams={selectedTournament.teams} 
                          />
                        </div>
                      )}
                      {selectedTournament.bracketImageUrl && !selectedTournament.bracketData && (
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                          <img src={selectedTournament.bracketImageUrl} alt="Llave del torneo" className="w-full h-auto object-contain bg-black/50" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'goleadores' && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xl font-bold flex items-center gap-2">{dictionary.topScorers}</h4>
                  <div className="bg-card border border-border rounded-xl shadow-lg p-2">
                    {topScorers.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded min-w-[2.5rem] text-center">{p.goals}</span>
                          <div className="flex items-center gap-2">
                            {p.nationality === 'Desconocida' || p.nationality === 'Sin Nacionalidad' ? (
                              <span className="w-5 text-center text-sm" title="Desconocida">❓</span>
                            ) : (
                              <img 
                                src={
                                  getFlagUrl(p.nationality)
                                } 
                                alt={p.nationality} 
                                title={p.nationality}
                                className="w-5 h-auto rounded-sm shadow-sm"
                              />
                            )}
                            <Link href={`/jugadores/${p.id}`} className="font-bold text-sm sm:text-base hover:text-primary transition-colors">
                              {p.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground hidden sm:block">{p.teamName}</span>
                          {p.teamLogo && <img src={p.teamLogo} alt={p.teamName} className="w-6 h-6 object-contain" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'asistencias' && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xl font-bold flex items-center gap-2">{dictionary.topAssists}</h4>
                  <div className="bg-card border border-border rounded-xl shadow-lg p-2">
                    {topAssists.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded min-w-[2.5rem] text-center">{p.assists}</span>
                          <div className="flex items-center gap-2">
                            {p.nationality === 'Desconocida' || p.nationality === 'Sin Nacionalidad' ? (
                              <span className="w-5 text-center text-sm" title="Desconocida">❓</span>
                            ) : (
                              <img 
                                src={getFlagUrl(p.nationality)} 
                                alt={p.nationality} 
                                title={p.nationality}
                                className="w-5 h-auto rounded-sm shadow-sm"
                              />
                            )}
                            <Link href={`/jugadores/${p.id}`} className="font-bold text-sm sm:text-base hover:text-primary transition-colors">
                              {p.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground hidden sm:block">{p.teamName}</span>
                          {p.teamLogo && <img src={p.teamLogo} alt={p.teamName} className="w-6 h-6 object-contain" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'vallas' && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xl font-bold flex items-center gap-2">{dictionary.topGk}</h4>
                  <div className="bg-card border border-border rounded-xl shadow-lg p-2">
                    {topGk.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded min-w-[2.5rem] text-center">{p.cleanSheets}</span>
                          <div className="flex items-center gap-2">
                            {p.nationality === 'Desconocida' || p.nationality === 'Sin Nacionalidad' ? (
                              <span className="w-5 text-center text-sm" title="Desconocida">❓</span>
                            ) : (
                              <img 
                                src={getFlagUrl(p.nationality)} 
                                alt={p.nationality} 
                                title={p.nationality}
                                className="w-5 h-auto rounded-sm shadow-sm"
                              />
                            )}
                            <Link href={`/jugadores/${p.id}`} className="font-bold text-sm sm:text-base hover:text-primary transition-colors">
                              {p.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground hidden sm:block">{p.teamName}</span>
                          {p.teamLogo && <img src={p.teamLogo} alt={p.teamName} className="w-6 h-6 object-contain" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'atajadas' && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xl font-bold flex items-center gap-2">Más Atajadas</h4>
                  <div className="bg-card border border-border rounded-xl shadow-lg p-2">
                    {topSaves.map((p, idx) => {
                      const perc = p.savesTotal > 0 ? Math.round((p.savesMade / p.savesTotal) * 100) : 0;
                      return (
                      <div key={p.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-4">
                          <span className="font-black text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded min-w-[4rem] text-center whitespace-nowrap" title="Atajadas / Tiros Recibidos">
                            {p.savesMade} <span className="text-xs text-muted-foreground font-normal">/ {p.savesTotal}</span>
                          </span>
                          <span className="font-black text-red-400 bg-red-900/20 px-2 py-1 rounded min-w-[2.5rem] text-center text-xs" title="Goles Recibidos">
                            {Math.max(0, p.savesTotal - p.savesMade)} GC
                          </span>
                          <span className={`text-xs font-bold w-12 text-center rounded px-1 ${perc >= 70 ? 'text-green-400 bg-green-400/10' : perc >= 50 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`} title="Porcentaje de Atajadas">
                            {perc}%
                          </span>
                          <div className="flex items-center gap-2 ml-2">
                            {p.nationality === 'Desconocida' || p.nationality === 'Sin Nacionalidad' ? (
                              <span className="w-5 text-center text-sm" title="Desconocida">❓</span>
                            ) : (
                              <img 
                                src={getFlagUrl(p.nationality)} 
                                alt={p.nationality} 
                                title={p.nationality}
                                className="w-5 h-auto rounded-sm shadow-sm"
                              />
                            )}
                            <Link href={`/jugadores/${p.id}`} className="font-bold text-sm sm:text-base hover:text-cyan-400 transition-colors">
                              {p.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground hidden sm:block">{p.teamName}</span>
                          {p.teamLogo && <img src={p.teamLogo} alt={p.teamName} className="w-6 h-6 object-contain" />}
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold">{dictionary.matches}</h3>
                {allTournamentMatches.length > 0 && (
                  <select 
                    className="bg-card border border-border rounded-lg px-4 py-2 font-bold text-sm outline-none focus:border-primary transition-colors cursor-pointer"
                    value={selectedRound || "ALL"}
                    onChange={(e) => setSelectedRound(e.target.value === "ALL" ? null : e.target.value)}
                  >
                    <option value="ALL">{dictionary.allRounds}</option>
                    {Array.from(new Set(allTournamentMatches.map((m: any) => m.round))).map(round => (
                      <option key={round as string} value={round as string}>{round}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 max-h-[800px] overflow-y-auto shadow-lg">
                {displayedMatches.map(renderMatchCard)}
                {displayedMatches.length === 0 && <p className="text-muted-foreground text-center py-4">{dictionary.noMatches}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
