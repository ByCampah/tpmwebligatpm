"use client";

import { useState, useRef, useCallback } from "react";
import { enrollTeamToTournament, removeTeamFromTournament, createManualMatch, generateRoundRobin, addPlayerToRoster, removePlayerFromRoster, submitMatchStats, assignTournamentPodium, updateTournament, updateTournamentTeamGroups, generateGroupMatches, toggleMatchProde, addMultiplePlayersToRoster, enrollMultipleTeamsToTournament, deleteMatch, updateScheduleNote } from "@/app/actions";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from 'html-to-image';
import { SeasonSummaryImage } from "@/components/SeasonSummaryImage";
import { FixtureSummaryImage } from "@/components/FixtureSummaryImage";
import { StandingsSummaryImage } from "@/components/StandingsSummaryImage";
import { BracketSummaryImage } from "@/components/BracketSummaryImage";
import { PlantelSummaryImage } from "@/components/PlantelSummaryImage";

import BracketBuilder from "./BracketBuilder";

export default function TournamentClient({ tournament, allTeams, allPlayers, categories, userRole, prodeLeaderboard = [] }: { tournament: any, allTeams: any[], allPlayers: any[], categories: any[], userRole: string, prodeLeaderboard?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabFromUrl = searchParams.get("tab") as any;
  const initialTab = initialTabFromUrl === "RESUMEN" ? "GRAFICOS" : (initialTabFromUrl || "PARTIDOS");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"EQUIPOS" | "PARTIDOS" | "PREMIOS" | "LLAVES" | "GRUPOS" | "AJUSTES" | "GRAFICOS">(initialTab);
  
  const [exportType, setExportType] = useState<"SEASON" | "FIXTURE" | "STANDINGS" | "BRACKET" | "PLANTEL">("FIXTURE");
  const [selectedRound, setSelectedRound] = useState<string>("ALL");
  const [imageLayout, setImageLayout] = useState<"vertical" | "square">("vertical");
  const [themeColor, setThemeColor] = useState<string>("emerald");
  
  const [plantelTeam, setPlantelTeam] = useState("ALL");
  const [showDiscord, setShowDiscord] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  
  const summaryRef = useRef<HTMLDivElement>(null);
  const fixtureRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const plantelRef = useRef<HTMLDivElement>(null);

  const downloadSummary = useCallback(() => {
    let targetRef = summaryRef;
    let fileName = `resumen-${tournament.name}.png`;
    
    if (exportType === "FIXTURE") {
        targetRef = fixtureRef;
        fileName = `fixture-${tournament.name}.png`;
    } else if (exportType === "STANDINGS") {
        targetRef = standingsRef;
        fileName = `posiciones-${tournament.name}.png`;
    } else if (exportType === "BRACKET") {
        targetRef = bracketRef;
        fileName = `llave-${tournament.name}.png`;
    } else if (exportType === "PLANTEL") {
        targetRef = plantelRef;
        fileName = `planteles-${tournament.name}.png`;
    }

    if (targetRef.current === null) return;
    setLoading(true);
    toPng(targetRef.current, { cacheBust: true, quality: 1, backgroundColor: '#0a0a0a' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo generar la imagen.");
        setLoading(false);
      });
  }, [summaryRef, fixtureRef, standingsRef, bracketRef, exportType, tournament.name, tournament.id, plantelTeam, showDiscord, themeColor]);
  
  // States for search/filters
  const [teamSearch, setTeamSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [bulkTeamText, setBulkTeamText] = useState("");
  const [bulkPlayerText, setBulkPlayerText] = useState("");

  const [groupAssignments, setGroupAssignments] = useState<Record<string, string>>(
    Object.fromEntries(tournament.teams.map((t: any) => [t.teamId, t.group || ""]))
  );

  const [firstTeamId, setFirstTeamId] = useState(tournament.trophies?.find((t:any) => t.name?.includes("Campeón"))?.teamId || "");
  const [secondTeamId, setSecondTeamId] = useState(tournament.trophies?.find((t:any) => t.name?.includes("Subcampeón"))?.teamId || "");
  const [thirdTeamId, setThirdTeamId] = useState(tournament.trophies?.find((t:any) => t.name?.includes("Tercer"))?.teamId || "");
  
  const [firstExcluded, setFirstExcluded] = useState<string[]>(
    tournament.trophies?.find((t:any) => t.name?.includes("Campeón (1er Puesto)"))?.excludedPlayers?.map((p:any) => p.id) || []
  );
  const [secondExcluded, setSecondExcluded] = useState<string[]>(
    tournament.trophies?.find((t:any) => t.name?.includes("Subcampeón (2do Puesto)"))?.excludedPlayers?.map((p:any) => p.id) || []
  );
  const [thirdExcluded, setThirdExcluded] = useState<string[]>(
    tournament.trophies?.find((t:any) => t.name?.includes("Tercer Puesto (3ro)"))?.excludedPlayers?.map((p:any) => p.id) || []
  );

  const [topScorerIds, setTopScorerIds] = useState<string[]>(
    tournament.trophies?.filter((t:any) => t.name?.includes("Goleador")).map((t:any) => t.playerId) || []
  );
  const [topAssisterIds, setTopAssisterIds] = useState<string[]>(
    tournament.trophies?.filter((t:any) => t.name?.includes("Asistidor")).map((t:any) => t.playerId) || []
  );
  const [bestGkIds, setBestGkIds] = useState<string[]>(
    tournament.trophies?.filter((t:any) => t.name?.includes("Invicta") || t.name?.includes("Arquero")).map((t:any) => t.playerId) || []
  );
  const [mvpIds, setMvpIds] = useState<string[]>(
    tournament.trophies?.filter((t:any) => t.name?.includes("MVP")).map((t:any) => t.playerId) || []
  );
  const [prodeIds, setProdeIds] = useState<string[]>(
    tournament.trophies?.filter((t:any) => t.name?.includes("PRODE")).map((t:any) => t.userId) || []
  );

  const handleSaveGroups = async () => {
    setLoading(true);
    const groupsToSave = Object.entries(groupAssignments).map(([teamId, group]) => ({
      teamId,
      group: group === "" ? null : group
    }));
    const res = await updateTournamentTeamGroups(tournament.id, groupsToSave);
    setLoading(false);
    if(res.success) {
      alert("Grupos guardados exitosamente");
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleGenerateGroupMatches = async (doubleRR: boolean) => {
    if(!confirm(`¿Generar partidos de grupos ${doubleRR ? "(Ida y Vuelta)" : "(Solo Ida)"}?`)) return;
    setLoading(true);
    const res = await generateGroupMatches(tournament.id, doubleRR);
    setLoading(false);
    if(res.success) {
      alert("¡Partidos de grupos generados!");
      router.refresh();
      setActiveTab("PARTIDOS");
    } else {
      alert(res.error);
    }
  };

  const [editingRosterTeam, setEditingRosterTeam] = useState<any>(null);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [editingEvents, setEditingEvents] = useState<any[]>([]);

  const handleToggleProde = async (matchId: string, showInProde: boolean, prodeLocked: boolean) => {
    setLoading(true);
    const res = await toggleMatchProde(matchId, showInProde, prodeLocked);
    setLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

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

  const handleBulkAddTeams = async () => {
    if (!bulkTeamText.trim()) return;
    setLoading(true);
    const res = await enrollMultipleTeamsToTournament(tournament.id, bulkTeamText);
    setLoading(false);
    if (res.success) {
      setBulkTeamText("");
      const added = res.added || [];
      const notFound = res.notFound || [];
      const alreadyExists = res.alreadyExists || [];
      
      let msg = `Se inscribieron ${added.length} equipos.`;
      if (notFound.length > 0) msg += `\n\nNo encontrados:\n${notFound.join(', ')}`;
      if (alreadyExists.length > 0) msg += `\n\nYa estaban inscriptos:\n${alreadyExists.join(', ')}`;
      alert(msg);
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleBulkAddPlayers = async (teamId: string) => {
    if (!bulkPlayerText.trim()) return;
    setLoading(true);
    const res = await addMultiplePlayersToRoster(tournament.id, teamId, bulkPlayerText);
    setLoading(false);
    if (res.success) {
      setBulkPlayerText("");
      const added = res.added || [];
      const notFound = res.notFound || [];
      const alreadyExists = res.alreadyExists || [];
      
      let msg = `Se añadieron ${added.length} jugadores al plantel.`;
      if (notFound.length > 0) msg += `\n\nNo encontrados:\n${notFound.join(', ')}`;
      if (alreadyExists.length > 0) msg += `\n\nYa estaban en el plantel:\n${alreadyExists.join(', ')}`;
      alert(msg);
      router.refresh();
    } else {
      alert("Error: " + res.error);
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

    firstExcluded.forEach(id => formData.append("firstExcludedIds", id));
    secondExcluded.forEach(id => formData.append("secondExcludedIds", id));
    thirdExcluded.forEach(id => formData.append("thirdExcludedIds", id));

    topScorerIds.forEach(id => formData.append("topScorerId", id));
    topAssisterIds.forEach(id => formData.append("topAssisterId", id));
    bestGkIds.forEach(id => formData.append("bestGkId", id));
    mvpIds.forEach(id => formData.append("mvpId", id));
    prodeIds.forEach(id => formData.append("prodeWinnerId", id));

    const res = await assignTournamentPodium(formData);
    setLoading(false);

    if (res.success) {
      alert("¡Podio asignado y trofeos entregados con éxito!");
      router.refresh();
    } else {
      setError(res.error || "Error al asignar podio");
    }
  };

  const getPlayerNick = (id: string) => {
    const p = tournament.teams?.flatMap((t:any) => t.players).find((p:any) => p.playerId === id);
    return p?.player?.nick || p?.player?.name || "Jugador Desconocido";
  };

  const getUserNick = (id: string) => {
    const u = prodeLeaderboard?.find((l:any) => l.user?.id === id);
    return u?.user?.nickName || u?.user?.name || "Usuario Desconocido";
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{tournament.season?.name || "Torneo Extra"}</span>
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
            onClick={() => setActiveTab("LLAVES")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "LLAVES" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Llaves (Brackets)
          </button>
        )}
        {userRole === "ADMIN" && (tournament.format === "CUP" || tournament.format === "PLAYOFF") && (
          <button 
            onClick={() => setActiveTab("GRUPOS")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "GRUPOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Grupos
          </button>
        )}
        {userRole === "ADMIN" && (
          <button 
            onClick={() => setActiveTab("PREMIOS")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "PREMIOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Podio y Premios
          </button>
        )}
        {(userRole === "ADMIN" || userRole === "MODERATOR") && (
          <button 
            onClick={() => setActiveTab("AJUSTES")}
            className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "AJUSTES" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
          >
            Ajustes
          </button>
        )}
        <button 
          onClick={() => setActiveTab("GRAFICOS")}
          className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "GRAFICOS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Gráficos 📸
        </button>
      </div>

      {/* TAB CONTENT: EQUIPOS */}
      {activeTab === "EQUIPOS" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* AÑADIR EQUIPOS */}
          <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/30 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="font-bold text-lg mb-4 text-blue-400 flex items-center gap-2">
              <span className="bg-blue-500/20 p-1.5 rounded-md text-blue-400">🛡️</span> Inscribir Nuevo Equipo al Torneo
            </h3>
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
                INSCRIBIR UNO
              </button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-blue-500/30 flex flex-col gap-2">
              <h4 className="font-bold text-sm text-blue-400 mb-1">Carga Masiva (Varios a la vez)</h4>
              <textarea 
                className="w-full bg-black border border-border p-2 rounded focus:outline-none focus:border-primary text-white text-sm min-h-[80px]"
                placeholder="Pega aquí los nombres de los equipos separados por comas o saltos de línea..."
                value={bulkTeamText}
                onChange={e => setBulkTeamText(e.target.value)}
              />
              <button 
                onClick={handleBulkAddTeams}
                disabled={loading || !bulkTeamText.trim()}
                className="bg-emerald-600 text-white font-bold px-4 py-2 rounded hover:bg-emerald-500 transition-colors w-fit text-sm"
              >
                Inscribir Lista de Equipos
              </button>
            </div>
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
                    {userRole === "ADMIN" && (
                      <button onClick={() => handleRemoveTeam(team.id, team.name)} disabled={loading} className="text-sm text-destructive hover:underline font-bold px-2">Quitar</button>
                    )}
                  </div>
                </div>

                {isEditingRoster && (
                  <div className="mt-6 pt-6 border-t border-border flex flex-col gap-6">
                    <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/30 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <h4 className="font-bold text-sm text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span className="bg-emerald-500/20 p-1 rounded-md">👤</span> Añadir Jugador
                      </h4>
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
                          AÑADIR UNO
                        </button>
                      </form>

                      <div className="mt-4 pt-4 border-t border-emerald-500/30 flex flex-col gap-2">
                        <h4 className="font-bold text-sm text-emerald-400 mb-1">Carga Masiva (Varios a la vez)</h4>
                        <textarea 
                          className="w-full bg-black border border-border p-2 rounded focus:outline-none focus:border-primary text-white text-sm min-h-[80px]"
                          placeholder="Pega aquí los nicks separados por comas o saltos de línea..."
                          value={bulkPlayerText}
                          onChange={e => setBulkPlayerText(e.target.value)}
                        />
                        <button 
                          onClick={() => handleBulkAddPlayers(team.id)}
                          disabled={loading || !bulkPlayerText.trim()}
                          className="bg-emerald-600 text-white font-bold px-4 py-2 rounded hover:bg-emerald-500 transition-colors w-fit text-sm"
                        >
                          Añadir Lista de Jugadores
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Plantel Actual</h4>
                      <div className="flex flex-wrap gap-2">
                        {roster.map((r: any) => (
                          <div key={r.id} className="bg-secondary/50 border border-border px-4 py-2 rounded-full text-sm flex items-center gap-3">
                            <span className="font-bold">{r.player.nick}</span>
                            {userRole === "ADMIN" && (
                              <button onClick={() => handleRemovePlayer(team.id, r.playerId, r.player.nick)} className="text-destructive font-black hover:text-red-400 hover:scale-125 transition-all">×</button>
                            )}
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
              <div className="bg-orange-900/10 p-6 rounded-xl border border-orange-500/30 flex flex-col gap-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <span className="bg-orange-500/20 p-1.5 rounded-md">🛠️</span> Partido Manual
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
                  <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white font-bold px-6 py-3 rounded-lg text-sm hover:bg-orange-500 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                    CREAR PARTIDO
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="font-bold text-2xl border-b border-border pb-2 flex items-center gap-3">
              <span className="text-3xl">📅</span> Calendario de Partidos
            </h3>
            
            {/* Agrupar Partidos por Fecha/Round */}
            {(() => {
              const matchesByRound = [...tournament.matches]
                .sort((a: any, b: any) => {
                  const numA = parseInt(a.round?.replace(/\D/g, '') || '0');
                  const numB = parseInt(b.round?.replace(/\D/g, '') || '0');
                  if (numA !== numB) return numA - numB;
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  if (timeA !== timeB) return timeA - timeB;
                  return String(a.id).localeCompare(String(b.id));
                })
                .reduce((acc: any, m: any) => {
                  const round = m.round || "Sin Etapa";
                  if (!acc[round]) acc[round] = [];
                  acc[round].push(m);
                  return acc;
                }, {});

              const rounds = Object.keys(matchesByRound).sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                if (numA !== numB) return numA - numB;
                return a.localeCompare(b);
              });

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

                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleProde(m.id, !m.showInProde, m.prodeLocked)}
                          className={`text-xs font-bold px-3 py-1 rounded transition-colors ${m.showInProde ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                          title="Mostrar en Portada para Prode"
                        >
                          {m.showInProde ? 'PRODE ON' : 'PRODE OFF'}
                        </button>
                        {m.showInProde && (
                          <button
                            onClick={() => handleToggleProde(m.id, m.showInProde, !m.prodeLocked)}
                            className={`text-xs font-bold px-3 py-1 rounded transition-colors ${m.prodeLocked ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                            title={m.prodeLocked ? 'Prode Bloqueado' : 'Prode Abierto'}
                          >
                            {m.prodeLocked ? '🔒 CERRADO' : '🔓 ABIERTO'}
                          </button>
                        )}
                        {userRole === "ADMIN" && (
                            <button 
                              onClick={async () => {
                                if(confirm("¿Estás seguro de eliminar este partido?")) {
                                  const res = await deleteMatch(m.id);
                                  if (res.success) {
                                    router.refresh();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-xs font-bold px-3 py-1 rounded transition-colors bg-red-900/50 border border-red-500 text-red-200 hover:bg-red-800"
                              title="Eliminar Partido"
                            >
                              🗑️
                            </button>
                        )}
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          placeholder="Nota (ej. Jueves 16)"
                          defaultValue={m.scheduleNote || ""}
                          onBlur={async (e) => {
                            if (e.target.value !== (m.scheduleNote || "")) {
                              await updateScheduleNote(m.id, e.target.value || null);
                              router.refresh();
                            }
                          }}
                          className="bg-black border border-border text-[10px] p-1 rounded text-muted-foreground focus:text-primary focus:border-primary outline-none"
                        />
                      </div>
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
                                  {ev.type === 'OWN_GOAL' && <span className="ml-2 text-xs text-red-500 uppercase">En Contra</span>}
                                  {ev.type === 'PENALTY_GOAL' && <span className="ml-2 text-xs text-blue-500 uppercase">Penal</span>}
                                  {ev.type === 'SHOOTOUT_GOAL' && <span className="ml-2 text-xs text-green-500 uppercase">Convirtió (Tanda)</span>}
                                  {ev.type === 'SHOOTOUT_MISS' && <span className="ml-2 text-xs text-red-500 uppercase">Erró (Tanda)</span>}
                                  {ev.assistName && ev.type !== 'OWN_GOAL' ? <span className="ml-2 text-muted-foreground font-normal text-sm">(Asistencia: {ev.assistName})</span> : ''}
                                </span>
                                <span className="text-xs uppercase font-bold text-muted-foreground mr-4">{isHome ? m.homeTeam.name : m.awayTeam.name}</span>
                                <button type="button" onClick={() => {
                                  // RESTAR ESTADÍSTICAS AL BORRAR
                                  if (ev.type === 'GOAL') {
                                    const inp = document.querySelector(`input[name="stats[${ev.playerId}][goals]"]`) as HTMLInputElement;
                                    if (inp) inp.value = Math.max(0, parseInt(inp.value || "0") - 1).toString();
                                  } else if (ev.type === 'FREE_KICK_GOAL') {
                                    const inp = document.querySelector(`input[name="stats[${ev.playerId}][freeKickGoals]"]`) as HTMLInputElement;
                                    if (inp) inp.value = Math.max(0, parseInt(inp.value || "0") - 1).toString();
                                  } else if (ev.type === 'PENALTY_GOAL') {
                                    const inp = document.querySelector(`input[name="stats[${ev.playerId}][penaltyGoals]"]`) as HTMLInputElement;
                                    if (inp) inp.value = Math.max(0, parseInt(inp.value || "0") - 1).toString();
                                  } else if (ev.type === 'RED') {
                                    const inp = document.querySelector(`input[name="stats[${ev.playerId}][redCards]"]`) as HTMLInputElement;
                                    if (inp) inp.value = Math.max(0, parseInt(inp.value || "0") - 1).toString();
                                  }

                                  if (ev.assistId && (ev.type === 'GOAL' || ev.type === 'FREE_KICK_GOAL' || ev.type === 'PENALTY_GOAL')) {
                                    const inp = document.querySelector(`input[name="stats[${ev.assistId}][assists]"]`) as HTMLInputElement;
                                    if (inp) inp.value = Math.max(0, parseInt(inp.value || "0") - 1).toString();
                                  }

                                  setEditingEvents(prev => prev.filter((_, i) => i !== idx));
                                }} className="text-destructive font-black hover:scale-110">×</button>
                              </div>
                            )})}
                            {editingEvents.length === 0 && <p className="text-muted-foreground italic text-sm">No hay eventos registrados.</p>}
                          </div>

                          <div className="mt-4 flex flex-col md:flex-row gap-2 bg-secondary/20 p-4 rounded-lg border border-border">
                            <select id={`type_${m.id}`} className="bg-black border border-border rounded p-2 focus:border-primary text-sm">
                              <option value="GOAL">⚽ Gol</option>
                              <option value="OWN_GOAL">🤦‍♂️ Gol en Contra</option>
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

                              // AUTO-COMPLETAR ESTADÍSTICAS
                              if (type === 'GOAL') {
                                const inp = document.querySelector(`input[name="stats[${playerId}][goals]"]`) as HTMLInputElement;
                                if (inp) inp.value = (parseInt(inp.value || "0") + 1).toString();
                              } else if (type === 'FREE_KICK_GOAL') {
                                const inp = document.querySelector(`input[name="stats[${playerId}][freeKickGoals]"]`) as HTMLInputElement;
                                if (inp) inp.value = (parseInt(inp.value || "0") + 1).toString();
                              } else if (type === 'PENALTY_GOAL') {
                                const inp = document.querySelector(`input[name="stats[${playerId}][penaltyGoals]"]`) as HTMLInputElement;
                                if (inp) inp.value = (parseInt(inp.value || "0") + 1).toString();
                              } else if (type === 'RED') {
                                const inp = document.querySelector(`input[name="stats[${playerId}][redCards]"]`) as HTMLInputElement;
                                if (inp) inp.value = (parseInt(inp.value || "0") + 1).toString();
                              }

                              if (assistId && (type === 'GOAL' || type === 'FREE_KICK_GOAL' || type === 'PENALTY_GOAL')) {
                                const inp = document.querySelector(`input[name="stats[${assistId}][assists]"]`) as HTMLInputElement;
                                if (inp) inp.value = (parseInt(inp.value || "0") + 1).toString();
                              }

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
            <h2 className="text-2xl font-black text-primary uppercase mb-2">🏆 Asignación de Podio y Premios</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-2xl mx-auto">
              Asigna los lugares del podio y los premios individuales. Los trofeos se entregarán de forma automática.
            </p>

            {prodeLeaderboard.length > 0 && (
              <div className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-xl max-w-xl mx-auto mb-8 text-left">
                <h3 className="font-black text-purple-400 flex items-center gap-2 mb-2">
                  <span className="text-xl">🔮</span> Sugerencia de Ganador del Prode
                </h3>
                <p className="text-sm text-purple-200 mb-2">
                  Basado en los puntos actuales, los usuarios líderes son:
                </p>
                <div className="flex flex-col gap-1">
                  {prodeLeaderboard.map((l, idx) => (
                    <div key={`plb_${l.user?.id || idx}`} className="flex justify-between items-center bg-black/30 px-3 py-2 rounded">
                      <span className="font-bold">#{idx + 1} {l.user?.nickName || l.user?.name || "Usuario Desconocido"}</span>
                      <span className="text-yellow-500 font-black">{l.points} pts</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  * Recuerda que el premio de Prode se otorga creando un "Trofeo Manual" en la sección general de Trofeos, o agregándolo como torneo especial.
                </p>
              </div>
            )}
            
            <form onSubmit={handlePodiumSubmit} className="flex flex-col gap-8 max-w-xl mx-auto">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold border-b border-border pb-2">Premios de Equipo</h3>
                {/* DEBUG ONLY */}
                <div className="text-xs text-muted-foreground break-all mb-4 bg-black/50 p-2 rounded">
                  DEBUG Trophies: {JSON.stringify(tournament.trophies?.map((t:any) => t.name))}
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl flex flex-col items-center w-full">
                  <span className="text-4xl mb-2">🏆</span>
                  <label className="text-amber-500 font-black mb-2">CAMPEÓN (1er Puesto)</label>
                  <select name="firstId" value={firstTeamId} onChange={e => { setFirstTeamId(e.target.value); setFirstExcluded([]); }} className="w-full bg-black border border-amber-500/50 rounded p-3 text-center font-bold focus:outline-none focus:border-amber-500">
                    <option value="">-- Seleccionar Equipo --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                    ) : null)}
                  </select>
                  {firstTeamId && (
                    <div className="w-full mt-4 bg-black/50 p-3 rounded border border-amber-500/30">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Desmarca a los jugadores que NO recibirán el trofeo.</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {enrolledTeamsData.find((t: any) => t.teamId === firstTeamId)?.players?.map((p: any) => {
                           const isExcluded = firstExcluded.includes(p.playerId);
                           return (
                             <label key={p.playerId} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer border transition-colors ${!isExcluded ? 'bg-amber-500/20 border-amber-500 text-amber-100' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                               <input type="checkbox" className="hidden" checked={!isExcluded} onChange={() => {
                                 if(isExcluded) setFirstExcluded(prev => prev.filter(id => id !== p.playerId));
                                 else setFirstExcluded(prev => [...prev, p.playerId]);
                               }} />
                               {p.player?.nick}
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-400/10 border border-gray-400/50 p-4 rounded-xl flex flex-col items-center w-full">
                  <span className="text-4xl mb-2">🥈</span>
                  <label className="text-gray-300 font-black mb-2">SUBCAMPEÓN (2do Puesto)</label>
                  <select name="secondId" value={secondTeamId} onChange={e => { setSecondTeamId(e.target.value); setSecondExcluded([]); }} className="w-full bg-black border border-gray-400/50 rounded p-3 text-center font-bold focus:outline-none focus:border-gray-400">
                    <option value="">-- Seleccionar Equipo --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                    ) : null)}
                  </select>
                  {secondTeamId && (
                    <div className="w-full mt-4 bg-black/50 p-3 rounded border border-gray-400/30">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Desmarca a los jugadores que NO recibirán el trofeo.</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {enrolledTeamsData.find((t: any) => t.teamId === secondTeamId)?.players?.map((p: any) => {
                           const isExcluded = secondExcluded.includes(p.playerId);
                           return (
                             <label key={p.playerId} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer border transition-colors ${!isExcluded ? 'bg-gray-400/20 border-gray-400 text-gray-100' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                               <input type="checkbox" className="hidden" checked={!isExcluded} onChange={() => {
                                 if(isExcluded) setSecondExcluded(prev => prev.filter(id => id !== p.playerId));
                                 else setSecondExcluded(prev => [...prev, p.playerId]);
                               }} />
                               {p.player?.nick}
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-orange-700/10 border border-orange-700/50 p-4 rounded-xl flex flex-col items-center w-full">
                  <span className="text-4xl mb-2">🥉</span>
                  <label className="text-orange-500 font-black mb-2">TERCER PUESTO</label>
                  <select name="thirdId" value={thirdTeamId} onChange={e => { setThirdTeamId(e.target.value); setThirdExcluded([]); }} className="w-full bg-black border border-orange-700/50 rounded p-3 text-center font-bold focus:outline-none focus:border-orange-500">
                    <option value="">-- Seleccionar Equipo --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <option key={t.team.id} value={t.team.id}>{t.team.name}</option>
                    ) : null)}
                  </select>
                  {thirdTeamId && (
                    <div className="w-full mt-4 bg-black/50 p-3 rounded border border-orange-700/30">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Desmarca a los jugadores que NO recibirán el trofeo.</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {enrolledTeamsData.find((t: any) => t.teamId === thirdTeamId)?.players?.map((p: any) => {
                           const isExcluded = thirdExcluded.includes(p.playerId);
                           return (
                             <label key={p.playerId} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer border transition-colors ${!isExcluded ? 'bg-orange-500/20 border-orange-500 text-orange-100' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                               <input type="checkbox" className="hidden" checked={!isExcluded} onChange={() => {
                                 if(isExcluded) setThirdExcluded(prev => prev.filter(id => id !== p.playerId));
                                 else setThirdExcluded(prev => [...prev, p.playerId]);
                               }} />
                               {p.player?.nick}
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-xl font-bold border-b border-border pb-2 text-purple-400">Premio PRODE</h3>
                
                <div className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-xl flex flex-col items-start text-left">
                  <label className="text-purple-400 font-black mb-2 w-full text-center">🔮 Ganador del PRODE</label>
                  <select 
                    value="" 
                    onChange={e => {
                      if (e.target.value && !prodeIds.includes(e.target.value)) {
                        setProdeIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full bg-black border border-purple-500/50 rounded p-3 font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Seleccionar Ganador --</option>
                    {prodeLeaderboard.map((l: any, idx: number) => (
                      <option key={`prode_${l.user?.id || idx}`} value={l.user?.id}>
                        {l.user?.nickName || l.user?.name || "Usuario Desconocido"} ({l.points} pts)
                      </option>
                    ))}
                  </select>
                  {prodeIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {prodeIds.map(id => (
                        <span key={id} className="bg-purple-500/20 border border-purple-500 text-purple-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {getUserNick(id)}
                          <button type="button" onClick={() => setProdeIds(prev => prev.filter(pId => pId !== id))} className="text-purple-400 hover:text-white font-bold ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-xl font-bold border-b border-border pb-2 text-blue-400">Premios Individuales</h3>
                
                <div className="bg-blue-500/10 border border-blue-500/50 p-4 rounded-xl flex flex-col items-start text-left">
                  <label className="text-blue-400 font-black mb-2 w-full text-center">⚽ Máximo Goleador</label>
                  <select 
                    value="" 
                    onChange={e => {
                      if (e.target.value && !topScorerIds.includes(e.target.value)) {
                        setTopScorerIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full bg-black border border-blue-500/50 rounded p-3 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar Jugador --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <optgroup key={`ts_${t.team.id}`} label={t.team.name}>
                        {t.players?.map((p: any) => (
                          <option key={`tsp_${p.playerId}`} value={p.playerId}>{p.player?.nick || p.player?.name || "Jugador Desconocido"}</option>
                        ))}
                      </optgroup>
                    ) : null)}
                  </select>
                  {topScorerIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {topScorerIds.map(id => (
                        <span key={id} className="bg-blue-500/20 border border-blue-500 text-blue-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {getPlayerNick(id)}
                          <button type="button" onClick={() => setTopScorerIds(prev => prev.filter(pId => pId !== id))} className="text-blue-400 hover:text-white font-bold ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex flex-col items-start text-left">
                  <label className="text-green-400 font-black mb-2 w-full text-center">👟 Máximo Asistidor</label>
                  <select 
                    value="" 
                    onChange={e => {
                      if (e.target.value && !topAssisterIds.includes(e.target.value)) {
                        setTopAssisterIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full bg-black border border-green-500/50 rounded p-3 font-bold focus:outline-none focus:border-green-500"
                  >
                    <option value="">-- Seleccionar Jugador --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <optgroup key={`ta_${t.team.id}`} label={t.team.name}>
                        {t.players?.map((p: any) => (
                          <option key={`tap_${p.playerId}`} value={p.playerId}>{p.player?.nick || p.player?.name || "Jugador Desconocido"}</option>
                        ))}
                      </optgroup>
                    ) : null)}
                  </select>
                  {topAssisterIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {topAssisterIds.map(id => (
                        <span key={id} className="bg-green-500/20 border border-green-500 text-green-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {getPlayerNick(id)}
                          <button type="button" onClick={() => setTopAssisterIds(prev => prev.filter(pId => pId !== id))} className="text-green-400 hover:text-white font-bold ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/50 p-4 rounded-xl flex flex-col items-start text-left">
                  <label className="text-cyan-400 font-black mb-2 w-full text-center">🧤 Mejor Arquero (Valla Invicta)</label>
                  <select 
                    value="" 
                    onChange={e => {
                      if (e.target.value && !bestGkIds.includes(e.target.value)) {
                        setBestGkIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full bg-black border border-cyan-500/50 rounded p-3 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Seleccionar Jugador --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <optgroup key={`gk_${t.team.id}`} label={t.team.name}>
                        {t.players?.map((p: any) => (
                          <option key={`bgk_${p.playerId}`} value={p.playerId}>{p.player?.nick || p.player?.name || "Jugador Desconocido"}</option>
                        ))}
                      </optgroup>
                    ) : null)}
                  </select>
                  {bestGkIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {bestGkIds.map(id => (
                        <span key={id} className="bg-cyan-500/20 border border-cyan-500 text-cyan-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {getPlayerNick(id)}
                          <button type="button" onClick={() => setBestGkIds(prev => prev.filter(pId => pId !== id))} className="text-cyan-400 hover:text-white font-bold ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-purple-500/10 border border-purple-500/50 p-4 rounded-xl flex flex-col items-start text-left">
                  <label className="text-purple-400 font-black mb-2 w-full text-center">⭐ MVP del Torneo</label>
                  <select 
                    value="" 
                    onChange={e => {
                      if (e.target.value && !mvpIds.includes(e.target.value)) {
                        setMvpIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full bg-black border border-purple-500/50 rounded p-3 font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Seleccionar Jugador --</option>
                    {enrolledTeamsData.map((t: any) => t.team ? (
                      <optgroup key={`mvp_${t.team.id}`} label={t.team.name}>
                        {t.players?.map((p: any) => (
                          <option key={`mvp_${p.playerId}`} value={p.playerId}>{p.player?.nick || p.player?.name || "Jugador Desconocido"}</option>
                        ))}
                      </optgroup>
                    ) : null)}
                  </select>
                  {mvpIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {mvpIds.map(id => (
                        <span key={id} className="bg-purple-500/20 border border-purple-500 text-purple-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {getPlayerNick(id)}
                          <button type="button" onClick={() => setMvpIds(prev => prev.filter(pId => pId !== id))} className="text-purple-400 hover:text-white font-bold ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button disabled={loading} type="submit" className="mt-4 bg-primary text-primary-foreground font-black py-4 px-8 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 text-xl shadow-[0_10px_40px_rgba(var(--primary),0.3)]">
                {loading ? 'PROCESANDO...' : 'OTORGAR PREMIOS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GRUPOS */}
      {activeTab === "GRUPOS" && (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-2xl font-black text-primary mb-2">Fase de Grupos</h2>
            <p className="text-muted-foreground mb-6">
              Asigna a cada equipo un grupo (A, B, C, etc.). Los equipos con grupo asignado podrán generar partidos automáticamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {enrolledTeamsData.map((t: any) => (
                <div key={t.id} className="bg-background border border-border p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={t.team.logoUrl || "/img/trophy-default.png"} className="w-8 h-8 object-contain" />
                    <span className="font-bold text-sm truncate max-w-[120px]" title={t.team.name}>{t.team.name}</span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={1}
                    placeholder="Ej: A"
                    className="w-12 h-10 bg-secondary border border-border rounded text-center font-black uppercase text-xl text-primary"
                    value={groupAssignments[t.teamId] || ""}
                    onChange={(e) => setGroupAssignments(prev => ({...prev, [t.teamId]: e.target.value.toUpperCase()}))}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleSaveGroups} 
              disabled={loading}
              className="bg-blue-600 text-white font-black py-3 px-6 rounded-xl hover:bg-blue-500 transition-colors w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "💾 Guardar Asignación de Grupos"}
            </button>
          </div>

          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-2xl font-black text-primary mb-2">Generar Fixture de Grupos</h2>
            <p className="text-muted-foreground mb-6">
              Genera automáticamente los partidos (Todos contra Todos) para los equipos que tienen grupo asignado. Si un grupo tiene número impar, habrá un equipo libre (BYE) por fecha.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleGenerateGroupMatches(false)} 
                disabled={loading}
                className="bg-primary text-primary-foreground font-black py-3 px-6 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_5px_20px_rgba(var(--primary),0.2)]"
              >
                🗓️ Generar Fixture (Ida Sola)
              </button>
              <button 
                onClick={() => handleGenerateGroupMatches(true)} 
                disabled={loading}
                className="bg-green-600 text-white font-black py-3 px-6 rounded-xl hover:bg-green-500 transition-transform hover:scale-105 shadow-[0_5px_20px_rgba(34,197,94,0.2)]"
              >
                🗓️ Generar Fixture (Ida y Vuelta)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LLAVES */}
      {activeTab === "LLAVES" && (
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border">
            <h2 className="text-2xl font-black text-primary mb-6">Constructor de Llaves</h2>
            <BracketBuilder 
              tournamentId={tournament.id} 
              participantsData={enrolledTeamsData} 
              initialData={typeof tournament.bracketData === 'string' ? JSON.parse(tournament.bracketData) : tournament.bracketData} 
              type="team"
            />
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
                  <option value="LEAGUE">Liga</option>
                  <option value="CUP">Copa</option>
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

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">URL de la Llave / Bracket (Opcional, para Copas)</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Pega un enlace directo a una imagen (jpg, png) con el formato de la llave. Si este torneo es formato Copa, la imagen se mostrará en la sección de Tablas.
                </p>
                <input name="bracketImageUrl" type="url" defaultValue={tournament.bracketImageUrl || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="https://ejemplo.com/llave.png" />
              </div>

              <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(var(--primary),0.2)] mt-4">
                {loading ? 'GUARDANDO CAMBIOS...' : 'GUARDAR CAMBIOS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GRAFICOS (IMAGEN) */}
      {activeTab === "GRAFICOS" as any && (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full items-center">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border w-full flex flex-col items-center text-center gap-6 shadow-xl">
            <h2 className="text-3xl font-black text-primary">Centro de Exportación Gráfica 📸</h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Selecciona qué gráfico deseas generar para descargar en alta calidad.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                <button onClick={() => setExportType("FIXTURE")} className={`px-6 py-3 rounded-lg font-bold transition-all ${exportType === "FIXTURE" ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:bg-white/5"}`}>Fixture / Partidos</button>
                <button onClick={() => { setExportType("STANDINGS"); }} className={`px-6 py-3 rounded-lg font-bold transition-all ${exportType === "STANDINGS" ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:bg-white/5"}`}>Posiciones / Grupos</button>
                <button onClick={() => { setExportType("BRACKET"); }} className={`px-6 py-3 rounded-lg font-bold transition-all ${exportType === "BRACKET" ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:bg-white/5"}`}>Llaves (Bracket)</button>
                <button onClick={() => { setExportType("SEASON"); }} className={`px-6 py-3 rounded-lg font-bold transition-all ${exportType === "SEASON" ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:bg-white/5"}`}>Resumen Completo</button>
                <button onClick={() => { setExportType("PLANTEL"); }} className={`px-6 py-3 rounded-lg font-bold transition-all ${exportType === "PLANTEL" ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-transparent text-muted-foreground hover:bg-white/5"}`}>Planteles (Equipos)</button>
            </div>
            
            {exportType === "SEASON" && (
                <div className="flex items-center gap-4 mt-2">
                <button 
                    onClick={() => setImageLayout(prev => prev === "vertical" ? "square" : "vertical")}
                    className="bg-secondary text-foreground font-bold px-6 py-4 rounded-xl hover:bg-secondary/80 border border-border transition-colors flex items-center gap-2"
                >
                    {imageLayout === "vertical" ? "🔄 Formato Cuadrado" : "🔄 Formato Vertical"}
                </button>
                </div>
            )}

            {exportType === "FIXTURE" && (
                <div className="flex items-center gap-4 mt-2">
                    <span className="font-bold text-muted-foreground">Filtrar Fecha:</span>
                    <select 
                        value={selectedRound} 
                        onChange={(e) => setSelectedRound(e.target.value)}
                        className="bg-black border border-border rounded-lg p-3 font-bold focus:border-primary focus:outline-none"
                    >
                        <option value="ALL">Todo el Fixture</option>
                        {Array.from(new Set(tournament.matches.map((m:any) => m.round || "Sin Etapa"))).filter((r: any) => !["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(r)).map((round: any) => (
                            <option key={round} value={round}>{round}</option>
                        ))}
                    </select>
                </div>
            )}

            {exportType === "PLANTEL" && (
                <div className="flex flex-col gap-4 mt-2 bg-black/50 p-4 rounded-xl border border-border w-full max-w-md">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="font-bold text-muted-foreground text-sm">Equipo:</label>
                        <select 
                            value={plantelTeam} 
                            onChange={(e) => { setPlantelTeam(e.target.value); }}
                            className="bg-black border border-border rounded-lg p-3 font-bold focus:border-primary focus:outline-none"
                        >
                            <option value="ALL">Todos los Equipos</option>
                            {enrolledTeamsData.map((t: any) => (
                                <option key={t.teamId} value={t.team.name}>{t.team.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={showDiscord} onChange={e => { setShowDiscord(e.target.checked); }} className="w-5 h-5 accent-primary" />
                            <span className="font-bold text-sm">Mostrar Discord de jugadores</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={showAvatar} onChange={e => { setShowAvatar(e.target.checked); }} className="w-5 h-5 accent-primary" />
                            <span className="font-bold text-sm">Mostrar Foto de Perfil</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mt-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-muted-foreground">Color de Fondo:</span>
                <select 
                    value={themeColor} 
                    onChange={(e) => { setThemeColor(e.target.value); }}
                    className="bg-black border border-border rounded-lg p-2 font-bold focus:border-primary focus:outline-none"
                >
                    <option value="emerald">Verde (TPM Clásico)</option>
                    <option value="red">Rojo Fuego</option>
                    <option value="blue">Azul Profundo</option>
                    <option value="purple">Violeta / Rosa</option>
                    <option value="gold">Dorado Campeón</option>
                </select>
            </div>

            <button 
                onClick={downloadSummary} 
                disabled={loading}
                className="bg-emerald-600 text-white font-black px-12 py-4 rounded-xl hover:bg-emerald-500 transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-2 mt-4 text-xl"
            >
                {loading ? "Generando Imagen HD..." : "📸 DESCARGAR IMAGEN HD"}
            </button>
          </div>

          <div className="w-full overflow-x-auto p-4 bg-black/50 border border-border rounded-xl">
            {/* The hidden/scaled container to capture */}
            <div style={{ width: exportType === "SEASON" ? (imageLayout === "square" ? "1280px" : "1080px") : (exportType === "BRACKET" ? "1920px" : (exportType === "PLANTEL" && plantelTeam === "ALL" ? "1600px" : (exportType === "PLANTEL" ? "800px" : "1200px"))), margin: "0 auto", transform: "scale(0.7)", transformOrigin: "top center" }}>
              {exportType === "SEASON" && <SeasonSummaryImage ref={summaryRef} tournament={tournament} layout={imageLayout} themeColor={themeColor} />}
              {exportType === "FIXTURE" && <FixtureSummaryImage ref={fixtureRef} tournament={tournament} selectedRound={selectedRound} themeColor={themeColor} />}
              {exportType === "STANDINGS" && <StandingsSummaryImage ref={standingsRef} tournament={tournament} themeColor={themeColor} />}
              {exportType === "BRACKET" && <BracketSummaryImage ref={bracketRef} tournament={tournament} themeColor={themeColor} />}
              {exportType === "PLANTEL" && <PlantelSummaryImage ref={plantelRef} tournament={tournament} themeColor={themeColor} selectedTeam={plantelTeam === "ALL" ? "" : plantelTeam} showDiscord={showDiscord} showAvatar={showAvatar} />}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
