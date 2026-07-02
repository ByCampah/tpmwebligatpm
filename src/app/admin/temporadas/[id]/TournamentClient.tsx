"use client";

import { useState } from "react";
import { enrollTeamToTournament, removeTeamFromTournament, createManualMatch, generateRoundRobin, addPlayerToRoster, removePlayerFromRoster, submitMatchStats, assignTournamentPodium, updateTournament } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TournamentClient({ tournament, allTeams, allPlayers, categories, userRole }: { tournament: any, allTeams: any[], allPlayers: any[], categories: any[], userRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"EQUIPOS" | "PARTIDOS" | "PREMIOS" | "AJUSTES">(userRole === "MODERATOR" ? "PARTIDOS" : "EQUIPOS");
  
  // States for search/filters
  const [teamSearch, setTeamSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");

  const [editingRosterTeam, setEditingRosterTeam] = useState<any>(null);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [editingEvents, setEditingEvents] = useState<any[]>([]);

  const enrolledTeamIds = tournament.teams.map((t: any) => t.teamId);
  
  // Get all player IDs enrolled in ANY team in this tournament
  const allEnrolledPlayerIds = tournament.teams.flatMap((t: any) => t.players?.map((p: any) => p.playerId) || []);

  // Filter available teams
  const availableTeams = allTeams.filter(t => !enrolledTeamIds.includes(t.id) && t.name.toLowerCase().includes(teamSearch.toLowerCase()));
  const enrolledTeamsData = tournament.teams;

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    if (confirm(`¿Quitar a ${teamName} del torneo?`)) {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("tournamentId", tournament.id);
      formData.append("teamId", teamId);
      const res = await removeTeamFromTournament(formData);
      if (!res.success) setError(res.error || "Error");
      setLoading(false);
      router.refresh();
    }
  };

  const handleRemovePlayer = async (teamId: string, playerId: string, nick: string) => {
    if (confirm(`¿Quitar a ${nick} del plantel?`)) {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("tournamentId", tournament.id);
      formData.append("teamId", teamId);
      formData.append("playerId", playerId);
      const res = await removePlayerFromRoster(formData);
      if (!res.success) setError((res as any).error || "Error");
      setLoading(false);
      router.refresh();
    }
  };

  const handleMatchSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const homeScore = formData.get("homeScore");
    const awayScore = formData.get("awayScore");
    const homePenaltyScore = formData.get("homePenaltyScore");
    const awayPenaltyScore = formData.get("awayPenaltyScore");
    
    const playerStats = [];
    const matchHomeRoster = enrolledTeamsData.find((t: any) => t.teamId === editingMatch.homeTeamId)?.players || [];
    const matchAwayRoster = enrolledTeamsData.find((t: any) => t.teamId === editingMatch.awayTeamId)?.players || [];
    const allMatchPlayers = [...matchHomeRoster, ...matchAwayRoster];

    for (const entry of allMatchPlayers) {
      const pId = entry.playerId;
      const goals = formData.get(`stats[${pId}][goals]`);
      if (goals !== null) {
        playerStats.push({
          playerId: pId,
          goals: goals,
          assists: formData.get(`stats[${pId}][assists]`),
          fouls: formData.get(`stats[${pId}][fouls]`),
          fouled: formData.get(`stats[${pId}][fouled]`),
          offsides: formData.get(`stats[${pId}][offsides]`),
          ballLosses: formData.get(`stats[${pId}][ballLosses]`),
          tacklesWon: formData.get(`stats[${pId}][tacklesWon]`),
          passesMade: formData.get(`stats[${pId}][passesMade]`),
          passesTotal: formData.get(`stats[${pId}][passesTotal]`),
          slidingMade: formData.get(`stats[${pId}][slidingMade]`),
          slidingTotal: formData.get(`stats[${pId}][slidingTotal]`),
          shotsMade: formData.get(`stats[${pId}][shotsMade]`),
          shotsTotal: formData.get(`stats[${pId}][shotsTotal]`),
          headersMade: formData.get(`stats[${pId}][headersMade]`),
          headersTotal: formData.get(`stats[${pId}][headersTotal]`),
          savesMade: formData.get(`stats[${pId}][savesMade]`),
          savesTotal: formData.get(`stats[${pId}][savesTotal]`),
          matchTime: formData.get(`stats[${pId}][matchTime]`),
          gkTime: formData.get(`stats[${pId}][gkTime]`),
          cleanSheet: formData.get(`stats[${pId}][cleanSheet]`),
          redCards: formData.get(`stats[${pId}][redCards]`),
          freeKickGoals: formData.get(`stats[${pId}][freeKickGoals]`),
          penaltyGoals: formData.get(`stats[${pId}][penaltyGoals]`),
          penaltiesSaved: formData.get(`stats[${pId}][penaltiesSaved]`),
          penaltiesConceded: formData.get(`stats[${pId}][penaltiesConceded]`)
        });
      }
    }

    const res = await submitMatchStats({
      matchId: editingMatch.id,
      homeScore,
      awayScore,
      homePenaltyScore,
      awayPenaltyScore,
      playerStats,
      eventsJson: JSON.stringify(editingEvents)
    });

    setLoading(false);
    if (res.success) {
      setEditingMatch(null);
      router.refresh();
    } else {
      alert("Error al guardar");
    }
  };

  const handlePodiumSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("tournamentId", tournament.id);

    const res = await assignTournamentPodium(formData);
    setLoading(false);

    if (res.success) {
      alert("¡Podio asignado y trofeos entregados con éxito!");
      router.refresh();
    } else {
      setError(res.error || "Error al asignar podio");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{tournament.season.name}</span>
          <h1 className="text-2xl font-black text-primary">{tournament.name} <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded ml-2">{tournament.format}</span></h1>
        </div>
        <Link href="/admin/temporadas" className="text-sm font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded transition-colors">
          VOLVER
        </Link>
      </div>

      {error && <div className="bg-destructive/20 text-destructive border border-destructive p-4 rounded-xl font-bold">{error}</div>}

      {/* TABS MENU */}
      <div className="flex flex-wrap border-b border-border mb-4">
        {userRole === "ADMIN" && (
          <button 
            onClick={() => setActiveTab("EQUIPOS")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "EQUIPOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Equipos y Planteles ({enrolledTeamsData.length})
          </button>
        )}
        <button 
          onClick={() => setActiveTab("PARTIDOS")}
          className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "PARTIDOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Partidos y Resultados ({tournament.matches.length})
        </button>
        {userRole === "ADMIN" && (
          <button 
            onClick={() => setActiveTab("PREMIOS")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "PREMIOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Podio y Premios
          </button>
        )}
      </div>

      {/* TAB CONTENT: EQUIPOS */}
      {activeTab === "EQUIPOS" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* AÑADIR EQUIPOS */}
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h3 className="font-bold text-lg mb-4">Inscribir Nuevo Equipo al Torneo</h3>
            <form action={async (formData) => {
              setLoading(true);
              setError("");
              formData.append("tournamentId", tournament.id);
              const res = await enrollTeamToTournament(formData);
              if (!res.success) setError(res.error || "Error");
              setLoading(false);
              setTeamSearch("");
              router.refresh();
            }} className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                placeholder="🔍 Buscar equipo por nombre..." 
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="flex-1 bg-black border border-border rounded p-2 focus:border-primary focus:outline-none text-sm"
              />
              <select name="teamId" required className="flex-1 bg-black border border-border rounded p-2 focus:border-primary focus:outline-none text-sm">
                <option value="">-- Seleccionar Equipo Filtrado --</option>
                {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button disabled={loading || availableTeams.length === 0} type="submit" className="bg-primary text-primary-foreground font-bold px-8 rounded hover:bg-primary/90 transition-colors py-2 md:py-0">
                INSCRIBIR
              </button>
            </form>
          </div>

          {/* LISTA DE EQUIPOS Y PLANTELES */}
          <div className="flex flex-col gap-4">
            {enrolledTeamsData.map((tData: any) => {
              const team = tData.team;
              const roster = tData.players || [];
              const isEditingRoster = editingRosterTeam === team.id;
              
              // Filter players for this roster (excluding anyone already enrolled in the tournament)
              const availablePlayersForRoster = allPlayers.filter(p => !allEnrolledPlayerIds.includes(p.id) && p.nick.toLowerCase().includes(playerSearch.toLowerCase()));
              
              return (
              <div key={team.id} className={`flex flex-col bg-card border p-4 rounded-xl transition-colors ${isEditingRoster ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-border'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary flex justify-center items-center rounded text-sm font-bold text-muted-foreground">{team.name.charAt(0)}</div>
                    )}
                    <span className="font-bold text-lg">{team.name} <span className="text-sm bg-black px-2 py-1 rounded ml-2 text-muted-foreground font-normal">{roster.length} jugadores</span></span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { setEditingRosterTeam(isEditingRoster ? null : team.id); setPlayerSearch(""); }} className="text-sm bg-primary/20 text-primary px-4 py-2 rounded hover:bg-primary hover:text-black font-bold transition-colors">
                      {isEditingRoster ? 'Cerrar Plantel' : 'Gestionar Plantel'}
                    </button>
                    <button onClick={() => handleRemoveTeam(team.id, team.name)} disabled={loading} className="text-sm text-destructive hover:underline font-bold px-2">Quitar</button>
                  </div>
                </div>

                {isEditingRoster && (
                  <div className="mt-6 pt-6 border-t border-border flex flex-col gap-6">
                    <div className="bg-black/30 p-4 rounded border border-border">
                      <h4 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Añadir Jugador</h4>
                      <form action={async (formData) => {
                        setLoading(true);
                        setError("");
                        formData.append("tournamentId", tournament.id);
                        formData.append("teamId", team.id);
                        const res = await addPlayerToRoster(formData);
                        if (!res.success) setError(res.error || "Error");
                        setLoading(false);
                        setPlayerSearch("");
                        router.refresh();
                      }} className="flex flex-col md:flex-row gap-2">
                        <input 
                          type="text" 
                          placeholder="🔍 Buscar jugador..." 
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          className="flex-1 bg-black border border-border rounded p-2 focus:border-primary focus:outline-none text-sm"
                        />
                        <select name="playerId" required className="flex-1 bg-black border border-border rounded p-2 focus:border-primary focus:outline-none text-sm">
                          <option value="">-- Seleccionar Jugador Filtrado --</option>
                          {availablePlayersForRoster.map(p => (
                            <option key={p.id} value={p.id}>{p.nick}</option>
                          ))}
                        </select>
                        <button disabled={loading} type="submit" className="bg-secondary text-secondary-foreground font-bold px-6 py-2 rounded text-sm hover:bg-secondary/80">
                          AÑADIR
                        </button>
                      </form>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Plantel Actual</h4>
                      <div className="flex flex-wrap gap-2">
                        {roster.map((r: any) => (
                          <div key={r.id} className="bg-secondary/50 border border-border px-4 py-2 rounded-full text-sm flex items-center gap-3">
                            <span className="font-bold">{r.player.nick}</span>
                            <button onClick={() => handleRemovePlayer(team.id, r.playerId, r.player.nick)} className="text-destructive font-black hover:text-red-400 hover:scale-125 transition-all">×</button>
                          </div>
                        ))}
                        {roster.length === 0 && <span className="text-sm text-muted-foreground italic">No hay jugadores inscritos en este equipo para este torneo.</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )})}
            {enrolledTeamsData.length === 0 && <p className="text-muted-foreground text-center py-8">No hay equipos inscritos aún.</p>}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PARTIDOS */}
      {activeTab === "PARTIDOS" && (
        <div className="flex flex-col gap-6 w-full">
          
          <div className="grid lg:grid-cols-2 gap-4">
            {userRole === "ADMIN" && (
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <span className="bg-primary/20 p-1.5 rounded-md">⚡</span> Generación Automática
                </h3>
                <p className="text-sm text-muted-foreground">Crea todos los partidos "Todos contra Todos" al instante para las Ligas.</p>
                <form action={async (formData) => {
                  if (confirm("¿Estás seguro de generar el fixture automático?")) {
                    setLoading(true);
                    setError("");
                    formData.append("tournamentId", tournament.id);
                    const res = await generateRoundRobin(formData);
                    if (!res.success) setError(res.error || "Error");
                    setLoading(false);
                    router.refresh();
                  }
                }} className="flex flex-col gap-3 mt-auto">
                  <select name="doubleRound" className="w-full bg-black/50 border border-border text-sm p-3 rounded-lg focus:border-primary outline-none transition-colors">
                    <option value="false">Ida (Single Round Robin)</option>
                    <option value="true">Ida y Vuelta (Double Round Robin)</option>
                  </select>
                  <button disabled={loading || enrolledTeamsData.length < 2} type="submit" className="w-full bg-primary text-primary-foreground font-black px-6 py-3 rounded-lg text-sm hover:bg-primary/90 transition-transform active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    GENERAR FIXTURE
                  </button>
                </form>
              </div>
            )}

            {userRole === "ADMIN" && (
              <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col gap-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary-foreground"></div>
                <h3 className="font-bold text-lg text-secondary-foreground flex items-center gap-2">
                  <span className="bg-secondary p-1.5 rounded-md">🛠️</span> Partido Manual
                </h3>
                <p className="text-sm text-muted-foreground">Añade un partido extra al calendario para Copas o Playoffs.</p>
                <form action={async (formData) => {
                  setLoading(true);
                  setError("");
                  formData.append("tournamentId", tournament.id);
                  const res = await createManualMatch(formData);
                  if (!res.success) setError(res.error || "Error");
                  setLoading(false);
                  router.refresh();
                }} className="flex flex-col gap-3 mt-auto">
                  <input type="text" name="round" placeholder="Etapa / Fecha (ej. Semifinal, Playoff)" required className="w-full bg-black/50 border border-border text-sm p-3 rounded-lg focus:border-primary outline-none transition-colors" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select name="homeTeamId" required className="flex-1 bg-black/50 border border-border text-sm p-3 rounded-lg focus:border-primary outline-none transition-colors">
                      <option value="">Equipo Local...</option>
                      {enrolledTeamsData.map((t: any) => <option key={t.team.id} value={t.team.id}>{t.team.name}</option>)}
                    </select>
                    <div className="flex items-center justify-center py-1 sm:py-0">
                      <span className="text-muted-foreground font-bold text-xs bg-black px-2 py-1 rounded">VS</span>
                    </div>
                    <select name="awayTeamId" required className="flex-1 bg-black/50 border border-border text-sm p-3 rounded-lg focus:border-primary outline-none transition-colors">
                      <option value="">Equipo Visitante...</option>
                      {enrolledTeamsData.map((t: any) => <option key={t.team.id} value={t.team.id}>{t.team.name}</option>)}
                    </select>
                  </div>
                  <button disabled={loading} type="submit" className="w-full bg-secondary text-secondary-foreground hover:text-white font-bold px-6 py-3 rounded-lg text-sm hover:bg-border transition-colors">
                    CREAR PARTIDO
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="font-bold text-2xl border-b border-border pb-2">Calendario</h3>
            
            {/* Agrupar Partidos por Fecha/Round */}
            {(() => {
              const matchesByRound = tournament.matches.reduce((acc: any, m: any) => {
                const round = m.round || "Sin Etapa";
                if (!acc[round]) acc[round] = [];
                acc[round].push(m);
                return acc;
              }, {});

              const rounds = Object.keys(matchesByRound);

              if (rounds.length === 0) {
                return <p className="text-muted-foreground text-center py-8">No hay partidos generados.</p>;
              }

              return rounds.map(round => (
                <div key={round} className="mb-8">
                  <h4 className="text-xl font-black text-primary mb-4 bg-primary/10 inline-block px-4 py-1 rounded">{round}</h4>
                  <div className="flex flex-col gap-4">
                    {matchesByRound[round].map((m: any) => {
                      const isEditing = editingMatch?.id === m.id;
                      
                      return (
                      <div key={m.id} className={`bg-card border rounded-xl overflow-hidden transition-colors ${isEditing ? 'border-primary' : 'border-border'}`}>
                  
                  {/* BARRA DEL PARTIDO */}
                  <div className="p-4 flex justify-between items-center text-lg bg-black/20">
                    <div className="flex-1 flex justify-end items-center gap-4">
                      <span className="font-bold">{m.homeTeam.name}</span>
                      {m.homeTeam.logoUrl && <img src={m.homeTeam.logoUrl} className="h-8 object-contain" alt="" />}
                      <span className="text-3xl font-black w-10 text-center">{m.status === 'PLAYED' ? m.homeScore : '-'}</span>
                    </div>
                    <span className="mx-6 text-muted-foreground text-sm font-bold">VS</span>
                    <div className="flex-1 flex justify-start items-center gap-4">
                      <span className="text-3xl font-black w-10 text-center">{m.status === 'PLAYED' ? m.awayScore : '-'}</span>
                      {m.awayTeam.logoUrl && <img src={m.awayTeam.logoUrl} className="h-8 object-contain" alt="" />}
                      <span className="font-bold">{m.awayTeam.name}</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setEditingMatch(isEditing ? null : m);
                        setEditingEvents(m.events ? (typeof m.events === 'string' ? JSON.parse(m.events) : m.events) : []);
                      }}
                      className={`ml-4 text-sm font-black px-6 py-3 rounded transition-colors ${isEditing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_10px_rgba(var(--primary),0.2)]'}`}
                    >
                      {isEditing ? 'CERRAR PLANILLA' : (m.status === 'PLAYED' ? 'EDITAR RESULTADO' : 'CARGAR RESULTADO')}
                    </button>
                  </div>

                  {/* PLANILLA DE CARGA GIGANTE */}
                  {isEditing && (
                    <div className="p-6 border-t border-border bg-black/50">
                      <form onSubmit={handleMatchSubmit} key={m.id} className="flex flex-col gap-8 w-full">
                        
                        {/* RESULTADO FINAL */}
                        <div className="flex justify-center gap-8 items-center bg-card p-6 rounded-2xl border border-border max-w-lg mx-auto">
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-bold text-muted-foreground uppercase">{m.homeTeam.name}</span>
                            <div className="flex items-center gap-2">
                              <input type="number" name="homeScore" required min="0" defaultValue={m.homeScore ?? ""} className="w-20 text-center text-5xl font-black bg-black border-2 border-border rounded-xl p-2 focus:border-primary focus:outline-none" placeholder="0" />
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground font-bold">PEN</span>
                                <input type="number" name="homePenaltyScore" min="0" defaultValue={m.homePenaltyScore ?? ""} className="w-12 text-center text-xl font-bold bg-black border-2 border-border rounded p-1 text-primary focus:border-primary focus:outline-none" placeholder="-" />
                              </div>
                            </div>
                          </div>
                          <span className="text-2xl text-muted-foreground font-black">-</span>
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-bold text-muted-foreground uppercase">{m.awayTeam.name}</span>
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <input type="number" name="awayScore" required min="0" defaultValue={m.awayScore ?? ""} className="w-20 text-center text-5xl font-black bg-black border-2 border-border rounded-xl p-2 focus:border-primary focus:outline-none" placeholder="0" />
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground font-bold">PEN</span>
                                <input type="number" name="awayPenaltyScore" min="0" defaultValue={m.awayPenaltyScore ?? ""} className="w-12 text-center text-xl font-bold bg-black border-2 border-border rounded p-1 text-primary focus:border-primary focus:outline-none" placeholder="-" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* EVENTOS DEL PARTIDO */}
                        <div className="bg-card p-6 rounded-2xl border border-border">
                          <h4 className="font-black text-xl text-primary mb-4 border-b border-border pb-2">Eventos del Partido (Goles, Rojas, etc.)</h4>
                          <input type="hidden" name="eventsJson" value={JSON.stringify(editingEvents)} />
                          
                          <div className="flex flex-col gap-4">
                            {editingEvents.map((ev, idx) => {
                              const isHome = ev.teamId === m.homeTeamId;
                              return (
                              <div key={idx} className={`flex items-center gap-4 bg-black/50 p-3 rounded border ${isHome ? 'border-primary/50' : 'border-blue-500/50'}`}>
                                <span className="font-black text-lg w-16 text-muted-foreground">{ev.minute}'</span>
                                <span className="text-2xl">{ev.type.includes('GOAL') ? '⚽' : '🟥'}</span>
                                <span className="font-bold flex-1">
                                  {ev.playerName} 
                                  {ev.type === 'FREE_KICK_GOAL' && <span className="ml-2 text-xs text-yellow-500 uppercase">Tiro Libre</span>}
                                  {ev.type === 'PENALTY_GOAL' && <span className="ml-2 text-xs text-blue-500 uppercase">Penal</span>}
                                  {ev.type === 'SHOOTOUT_GOAL' && <span className="ml-2 text-xs text-green-500 uppercase">Convirtió (Tanda)</span>}
                                  {ev.type === 'SHOOTOUT_MISS' && <span className="ml-2 text-xs text-red-500 uppercase">Erró (Tanda)</span>}
                                  {ev.assistName ? <span className="ml-2 text-muted-foreground font-normal text-sm">(Asistencia: {ev.assistName})</span> : ''}
                                </span>
                                <span className="text-xs uppercase font-bold text-muted-foreground mr-4">{isHome ? m.homeTeam.name : m.awayTeam.name}</span>
                                <button type="button" onClick={() => setEditingEvents(prev => prev.filter((_, i) => i !== idx))} className="text-destructive font-black hover:scale-110">×</button>
                              </div>
                            )})}
                            {editingEvents.length === 0 && <p className="text-muted-foreground italic text-sm">No hay eventos registrados.</p>}
                          </div>

                          <div className="mt-4 flex flex-col md:flex-row gap-2 bg-secondary/20 p-4 rounded-lg border border-border">
                            <select id={`type_${m.id}`} className="bg-black border border-border rounded p-2 focus:border-primary text-sm">
                              <option value="GOAL">⚽ Gol</option>
                              <option value="FREE_KICK_GOAL">⚽ Tiro Libre</option>
                              <option value="PENALTY_GOAL">⚽ Penal</option>
                              <option value="RED">🟥 Tarjeta Roja</option>
                              <option value="SHOOTOUT_GOAL">✅ Penal Convertido (Tanda)</option>
                              <option value="SHOOTOUT_MISS">❌ Penal Errado (Tanda)</option>
                            </select>
                            <input id={`min_${m.id}`} type="number" placeholder="Minuto" className="w-24 bg-black border border-border rounded p-2 focus:border-primary text-sm" />
                            
                            <select id={`player_${m.id}`} className="flex-1 bg-black border border-border rounded p-2 focus:border-primary text-sm">
                              <option value="">Seleccionar Jugador...</option>
                              <optgroup label={m.homeTeam.name}>
                                {enrolledTeamsData.find((t:any) => t.teamId === m.homeTeamId)?.players?.map((p:any) => (
                                  <option key={`p_${p.playerId}`} value={p.playerId}>{p.player.nick}</option>
                                ))}
                              </optgroup>
                              <optgroup label={m.awayTeam.name}>
                                {enrolledTeamsData.find((t:any) => t.teamId === m.awayTeamId)?.players?.map((p:any) => (
                                  <option key={`p_${p.playerId}`} value={p.playerId}>{p.player.nick}</option>
                                ))}
                              </optgroup>
                            </select>

                            <select id={`assist_${m.id}`} className="flex-1 bg-black border border-border rounded p-2 focus:border-primary text-sm">
                              <option value="">Asistencia (Opcional)...</option>
                              <optgroup label={m.homeTeam.name}>
                                {enrolledTeamsData.find((t:any) => t.teamId === m.homeTeamId)?.players?.map((p:any) => (
                                  <option key={`a_${p.playerId}`} value={p.playerId}>{p.player.nick}</option>
                                ))}
                              </optgroup>
                              <optgroup label={m.awayTeam.name}>
                                {enrolledTeamsData.find((t:any) => t.teamId === m.awayTeamId)?.players?.map((p:any) => (
                                  <option key={`a_${p.playerId}`} value={p.playerId}>{p.player.nick}</option>
                                ))}
                              </optgroup>
                            </select>

                            <button type="button" onClick={() => {
                              const type = (document.getElementById(`type_${m.id}`) as HTMLSelectElement).value;
                              const min = parseInt((document.getElementById(`min_${m.id}`) as HTMLInputElement).value);
                              
                              const playerSelect = document.getElementById(`player_${m.id}`) as HTMLSelectElement;
                              const assistSelect = document.getElementById(`assist_${m.id}`) as HTMLSelectElement;
                              
                              const playerId = playerSelect.value;
                              const assistId = assistSelect.value || null;
                              
                              if(!min || !playerId) return alert("Minuto y Jugador son obligatorios");

                              const playerName = playerSelect.options[playerSelect.selectedIndex].text;
                              const assistName = assistId ? assistSelect.options[assistSelect.selectedIndex].text : null;
                              
                              // Determine teamId from the optgroup label
                              const optgroupLabel = playerSelect.options[playerSelect.selectedIndex].parentElement?.getAttribute('label');
                              const teamId = optgroupLabel === m.homeTeam.name ? m.homeTeamId : m.awayTeamId;

                              setEditingEvents([...editingEvents, { 
                                type, minute: min, 
                                playerId, playerName, 
                                assistId, assistName, 
                                teamId 
                              }].sort((a,b) => a.minute - b.minute));
                              
                              (document.getElementById(`min_${m.id}`) as HTMLInputElement).value = '';
                              playerSelect.value = '';
                              assistSelect.value = '';
                            }} className="bg-secondary text-secondary-foreground font-bold px-4 rounded hover:bg-primary hover:text-primary-foreground transition-colors text-sm py-2">
                              AÑADIR EVENTO
                            </button>
                          </div>
                        </div>

                        {/* TABLAS DE ESTADISTICAS */}
                        <div className="flex flex-col gap-10 w-full overflow-x-auto pb-4">
                          {[
                            { team: m.homeTeam, roster: enrolledTeamsData.find((t:any) => t.teamId === m.homeTeamId)?.players || [] },
                            { team: m.awayTeam, roster: enrolledTeamsData.find((t:any) => t.teamId === m.awayTeamId)?.players || [] }
                          ].map((tData, tIdx) => (
                            <div key={tIdx} className="flex flex-col gap-3 min-w-[1200px]">
                              <h4 className="font-black text-xl text-primary flex items-center gap-3">
                                {tData.team.logoUrl && <img src={tData.team.logoUrl} className="h-6" alt="" />}
                                Plantel de {tData.team.name}
                              </h4>
                              
                              {tData.roster.length === 0 ? (
                                <p className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 font-bold">
                                  Este equipo no tiene jugadores en el plantel. Ve a la pestaña "Equipos y Planteles" para agregarlos.
                                </p>
                              ) : (
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                                  <table className="w-full text-sm text-center">
                                    <thead className="bg-secondary/80 text-secondary-foreground border-b border-border">
                                      <tr>
                                        <th className="p-3 text-left w-48 sticky left-0 bg-secondary z-10 border-r border-border">Jugador</th>
                                        <th className="p-3" title="Minutos Jugados">MIN</th>
                                        <th className="p-3 text-red-500 font-black" title="Tarjetas Rojas">🟥 R</th>
                                        <th className="p-3 text-primary" title="Goles de Jugada (Normales)">G</th>
                                        <th className="p-3 text-yellow-500" title="Goles de Tiro Libre">TL</th>
                                        <th className="p-3 text-blue-500" title="Goles de Penal">PEN</th>
                                        <th className="p-3 text-primary" title="Asistencias">A</th>
                                        <th className="p-3 text-cyan-400" title="Minutos GK">M.GK</th>
                                        <th className="p-3" title="Valla Invicta">🛡️ VI</th>
                                        <th className="p-3 text-yellow-500" title="Tiros al Arco / Totales">Tiros</th>
                                        <th className="p-3 text-blue-400" title="Pases Correctos / Totales">Pases</th>
                                        <th className="p-3 text-green-500" title="Quites">Quites</th>
                                        <th className="p-3 text-red-400" title="Pérdidas">Pérdidas</th>
                                        <th className="p-3 text-orange-400" title="Faltas Hechas">Faltas H</th>
                                        <th className="p-3 text-purple-400" title="Faltas Recibidas">Faltas R</th>
                                        <th className="p-3" title="Offsides">Offside</th>
                                        <th className="p-3" title="Barridas Correctas / Totales">Barridas</th>
                                        <th className="p-3" title="Cabezazos Correctos / Totales">Cabezazos</th>
                                        <th className="p-3 text-cyan-400" title="Atajadas / Totales (Arqueros)">Atajadas</th>
                                        <th className="p-3 text-green-400" title="Penales Atajados">P. Atj</th>
                                        <th className="p-3 text-red-400" title="Penales Recibidos">P. Rec</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {tData.roster.map((r: any) => {
                                        const ps = m.stats?.find((s: any) => s.playerId === r.playerId) || {};
                                        return (
                                        <tr key={r.playerId} className="hover:bg-white/5 transition-colors">
                                          <td className="p-3 font-bold text-left sticky left-0 bg-card z-10 border-r border-border">
                                            {r.player.nick}
                                          </td>
                                          
                                          {/* MINUTOS Y ROJAS */}
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][matchTime]`} min="0" defaultValue={ps.matchTime ?? (m.status === 'PLAYED' ? "0" : "90")} className="w-14 bg-black border border-border rounded p-1.5 text-center focus:border-primary" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][redCards]`} min="0" defaultValue={ps.redCards ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center focus:border-red-500 font-bold text-red-500" /></td>
                                          
                                          {/* G, TL, PEN, A */}
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][goals]`} min="0" defaultValue={ps.goals ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center focus:border-primary font-bold text-primary" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][freeKickGoals]`} min="0" defaultValue={ps.freeKickGoals ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center focus:border-yellow-500 font-bold text-yellow-500" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][penaltyGoals]`} min="0" defaultValue={ps.penaltyGoals ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center focus:border-blue-500 font-bold text-blue-500" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][assists]`} min="0" defaultValue={ps.assists ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center focus:border-primary font-bold text-primary" /></td>
                                          
                                          {/* GK TIME */}
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][gkTime]`} min="0" defaultValue={ps.gkTime ?? "0"} className="w-14 bg-black border border-border rounded p-1.5 text-center focus:border-cyan-400 font-bold text-cyan-400" /></td>

                                          {/* VALLA INVICTA */}
                                          <td className="p-2">
                                            <input type="checkbox" name={`stats[${r.playerId}][cleanSheet]`} defaultChecked={ps.cleanSheet} className="w-5 h-5 accent-primary cursor-pointer" />
                                          </td>

                                          {/* TIROS (Arco / Total) */}
                                          <td className="p-2">
                                            <div className="flex items-center justify-center gap-1">
                                              <input type="number" name={`stats[${r.playerId}][shotsMade]`} min="0" defaultValue={ps.shotsMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                              <span className="text-muted-foreground">/</span>
                                              <input type="number" name={`stats[${r.playerId}][shotsTotal]`} min="0" defaultValue={ps.shotsTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                            </div>
                                          </td>

                                          {/* PASES (Correctos / Total) */}
                                          <td className="p-2">
                                            <div className="flex items-center justify-center gap-1">
                                              <input type="number" name={`stats[${r.playerId}][passesMade]`} min="0" defaultValue={ps.passesMade ?? "0"} className="w-12 bg-black border border-border rounded p-1 text-center text-xs" />
                                              <span className="text-muted-foreground">/</span>
                                              <input type="number" name={`stats[${r.playerId}][passesTotal]`} min="0" defaultValue={ps.passesTotal ?? "0"} className="w-12 bg-black border border-border rounded p-1 text-center text-xs" />
                                            </div>
                                          </td>

                                          {/* QUITES / PERDIDAS */}
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][tacklesWon]`} min="0" defaultValue={ps.tacklesWon ?? "0"} className="w-12 bg-black border border-border rounded p-1.5 text-center" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][ballLosses]`} min="0" defaultValue={ps.ballLosses ?? "0"} className="w-12 bg-black border border-border rounded p-1.5 text-center" /></td>

                                          {/* FALTAS / OFFSIDE */}
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][fouls]`} min="0" defaultValue={ps.fouls ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][fouled]`} min="0" defaultValue={ps.fouled ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][offsides]`} min="0" defaultValue={ps.offsides ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" /></td>

                                          {/* BARRIDAS Y CABEZAZOS */}
                                          <td className="p-2">
                                            <div className="flex items-center justify-center gap-1">
                                              <input type="number" name={`stats[${r.playerId}][slidingMade]`} min="0" defaultValue={ps.slidingMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                              <span className="text-muted-foreground">/</span>
                                              <input type="number" name={`stats[${r.playerId}][slidingTotal]`} min="0" defaultValue={ps.slidingTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                            </div>
                                          </td>
                                          <td className="p-2">
                                            <div className="flex items-center justify-center gap-1">
                                              <input type="number" name={`stats[${r.playerId}][headersMade]`} min="0" defaultValue={ps.headersMade ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                              <span className="text-muted-foreground">/</span>
                                              <input type="number" name={`stats[${r.playerId}][headersTotal]`} min="0" defaultValue={ps.headersTotal ?? "0"} className="w-10 bg-black border border-border rounded p-1 text-center text-xs" />
                                            </div>
                                          </td>

                                          {/* ATAJADAS Y PENALES */}
                                          <td className="p-2">
                                            <div className="flex items-center justify-center gap-1 bg-cyan-900/10 p-1 rounded">
                                              <input type="number" name={`stats[${r.playerId}][savesMade]`} min="0" defaultValue={ps.savesMade ?? "0"} className="w-10 bg-black border border-cyan-900/50 rounded p-1 text-center text-xs focus:border-cyan-400" />
                                              <span className="text-muted-foreground">/</span>
                                              <input type="number" name={`stats[${r.playerId}][savesTotal]`} min="0" defaultValue={ps.savesTotal ?? "0"} className="w-10 bg-black border border-cyan-900/50 rounded p-1 text-center text-xs focus:border-cyan-400" />
                                            </div>
                                          </td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][penaltiesSaved]`} min="0" defaultValue={ps.penaltiesSaved ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center text-xs" /></td>
                                          <td className="p-2"><input type="number" name={`stats[${r.playerId}][penaltiesConceded]`} min="0" defaultValue={ps.penaltiesConceded ?? "0"} className="w-10 bg-black border border-border rounded p-1.5 text-center text-xs" /></td>

                                        </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="sticky bottom-4 z-50 mt-4 flex justify-end px-4">
                          <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-4 px-12 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 text-xl shadow-[0_10px_40px_rgba(var(--primary),0.5)] border border-white/20">
                            {loading ? 'GUARDANDO...' : 'GUARDAR PARTIDO ✅'}
                          </button>
                        </div>
                        
                      </form>
                    </div>
                  )}
                </div>
              )})}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PREMIOS */}
      {activeTab === "PREMIOS" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-black text-primary uppercase mb-2">🏆 Asignación de Podio</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-2xl mx-auto">
              Selecciona los equipos que finalizaron en el podio. El sistema le entregará automáticamente la medalla correspondiente al club y a todos los jugadores anotados en su plantel.
            </p>
            
            <form onSubmit={handlePodiumSubmit} className="flex flex-col gap-6 max-w-xl mx-auto">
              
              <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl flex flex-col items-center">
                <span className="text-4xl mb-2">🏆</span>
                <label className="text-amber-500 font-black mb-2">CAMPEÓN (1er Puesto)</label>
                <select name="firstId" className="w-full bg-black border border-amber-500/50 rounded p-3 text-center font-bold focus:outline-none focus:border-amber-500">
                  <option value="">-- Seleccionar Equipo --</option>
                  {enrolledTeamsData.map((t: any) => (
                    <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-400/10 border border-gray-400/50 p-4 rounded-xl flex flex-col items-center">
                <span className="text-4xl mb-2">🥈</span>
                <label className="text-gray-300 font-black mb-2">SUBCAMPEÓN (2do Puesto)</label>
                <select name="secondId" className="w-full bg-black border border-gray-400/50 rounded p-3 text-center font-bold focus:outline-none focus:border-gray-400">
                  <option value="">-- Seleccionar Equipo --</option>
                  {enrolledTeamsData.map((t: any) => (
                    <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-700/10 border border-orange-700/50 p-4 rounded-xl flex flex-col items-center">
                <span className="text-4xl mb-2">🥉</span>
                <label className="text-orange-500 font-black mb-2">TERCER PUESTO</label>
                <select name="thirdId" className="w-full bg-black border border-orange-700/50 rounded p-3 text-center font-bold focus:outline-none focus:border-orange-500">
                  <option value="">-- Seleccionar Equipo --</option>
                  {enrolledTeamsData.map((t: any) => (
                    <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                  ))}
                </select>
              </div>

              <button disabled={loading} type="submit" className="mt-4 bg-primary text-primary-foreground font-black py-4 px-8 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 text-xl shadow-[0_10px_40px_rgba(var(--primary),0.3)]">
                {loading ? 'PROCESANDO...' : 'OTORGAR PREMIOS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AJUSTES */}
      {activeTab === "AJUSTES" as any && (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-2xl font-black text-primary mb-6">Ajustes del Torneo</h2>
            <form action={async (formData) => {
              setLoading(true);
              setError("");
              formData.append("tournamentId", tournament.id);
              const res = await updateTournament(formData);
              if (!res.success) setError((res as any).error || "Error al actualizar");
              else alert("Torneo actualizado correctamente.");
              setLoading(false);
              router.refresh();
            }} className="flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre del Torneo</label>
                <input name="name" type="text" defaultValue={tournament.name} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Formato</label>
                <select name="format" defaultValue={tournament.format} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                  <option value="LEAGUE">Liga (Todos contra Todos)</option>
                  <option value="CUP">Copa (Eliminatoria)</option>
                  <option value="PLAYOFF">Playoff</option>
                  <option value="CUSTOM">Personalizado (Suizo, Grupos, etc.)</option>
                </select>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <label className="block text-sm font-bold text-primary mb-1">Categoría Histórica</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Cambiar esto agrupará las estadísticas de este torneo junto a otros torneos que tengan la misma categoría en el Salón de la Fama.
                </p>
                <select name="categoryId" defaultValue={tournament.categoryId || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                  <option value="">-- Sin Categoría (General) --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(var(--primary),0.2)] mt-4">
                {loading ? 'GUARDANDO CAMBIOS...' : 'GUARDAR CAMBIOS'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
