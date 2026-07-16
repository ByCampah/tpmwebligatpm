"use client";

import { useState } from "react";

type Format = "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "ROUND_ROBIN" | "SWISS" | "GROUPS_AND_FINAL";

export default function TournamentGeneratorClient() {
  const [numTeams, setNumTeams] = useState<number>(8);
  const [format, setFormat] = useState<Format>("SINGLE_ELIMINATION");
  const [generated, setGenerated] = useState<boolean>(false);
  
  const [groupsCount, setGroupsCount] = useState<number>(2); // Only for Groups format

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

  const teams = Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);

  return (
    <div className="flex flex-col gap-8">
      {/* Settings Panel */}
      <form onSubmit={handleGenerate} className="bg-card border border-border p-6 rounded-xl flex flex-wrap gap-6 items-end shadow-md">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-sm font-bold text-muted-foreground uppercase">Formato del Torneo</label>
          <select 
            value={format} 
            onChange={(e) => { setFormat(e.target.value as Format); setGenerated(false); }}
            className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="SINGLE_ELIMINATION">Eliminación Simple</option>
            <option value="DOUBLE_ELIMINATION">Doble Eliminación</option>
            <option value="ROUND_ROBIN">Round Robin (Todos contra Todos)</option>
            <option value="SWISS">Sistema Suizo</option>
            <option value="GROUPS_AND_FINAL">Fase de Grupos + Final</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-32">
          <label className="text-sm font-bold text-muted-foreground uppercase">Equipos</label>
          <input 
            type="number" 
            min={2} 
            max={64} 
            value={numTeams} 
            onChange={(e) => { setNumTeams(parseInt(e.target.value) || 2); setGenerated(false); }}
            className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {format === "GROUPS_AND_FINAL" && (
          <div className="flex flex-col gap-2 w-full md:w-32 animate-in fade-in slide-in-from-left-4">
            <label className="text-sm font-bold text-muted-foreground uppercase">Grupos</label>
            <input 
              type="number" 
              min={1} 
              max={16} 
              value={groupsCount} 
              onChange={(e) => { setGroupsCount(parseInt(e.target.value) || 2); setGenerated(false); }}
              className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all w-full md:w-auto"
        >
          Generar Estructura
        </button>
      </form>

      {/* Generation Area */}
      {generated && (
        <div className="bg-card border border-border p-6 rounded-xl min-h-[400px]">
          {/* We will render the specific format here */}
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">Resultados Generados</h2>
          {format === "SINGLE_ELIMINATION" && <SingleEliminationGenerator teams={teams} />}
          {format === "DOUBLE_ELIMINATION" && <DoubleEliminationGenerator teams={teams} />}
          {format === "ROUND_ROBIN" && <RoundRobinGenerator teams={teams} />}
          {format === "SWISS" && <SwissGenerator teams={teams} />}
          {format === "GROUPS_AND_FINAL" && <GroupsGenerator teams={teams} groupsCount={groupsCount} />}
        </div>
      )}
    </div>
  );
}

// STUB COMPONENTS
function SingleEliminationGenerator({ teams }: { teams: string[] }) {
  // Calculate next power of 2
  let p = 1;
  while (p < teams.length) p *= 2;
  
  const byes = p - teams.length;
  const firstRoundMatches = (teams.length - byes) / 2;
  
  let currentRoundTeams = p;
  const rounds = [];
  let roundNum = 1;

  while (currentRoundTeams > 1) {
    const matchesInRound = currentRoundTeams / 2;
    let roundName = `Ronda ${roundNum}`;
    if (matchesInRound === 1) roundName = "Final";
    else if (matchesInRound === 2) roundName = "Semifinales";
    else if (matchesInRound === 4) roundName = "Cuartos de Final";
    else if (matchesInRound === 8) roundName = "Octavos de Final";
    else if (matchesInRound === 16) roundName = "Dieciseisavos";

    const matches = [];
    if (roundNum === 1) {
      let teamIdx = 1;
      for (let i = 0; i < matchesInRound; i++) {
        if (i < firstRoundMatches) {
          matches.push(`Team ${teamIdx} vs Team ${teamIdx + 1}`);
          teamIdx += 2;
        } else {
          matches.push(`Team ${teamIdx} (BYE) - Avanza Directo`);
          teamIdx += 1;
        }
      }
    } else {
      for (let i = 0; i < matchesInRound; i++) {
        matches.push(`Ganador llave ${i * 2 + 1} vs Ganador llave ${i * 2 + 2}`);
      }
    }

    rounds.push({ name: roundName, matches });
    currentRoundTeams /= 2;
    roundNum++;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
        <strong>Eliminación Simple:</strong> {teams.length} equipos, {byes} pases directos (BYEs) en la primera ronda. {rounds.length} rondas en total.
      </div>
      <div className="flex flex-col gap-4">
        {rounds.map((r, i) => (
          <div key={i} className="bg-secondary/20 border border-white/5 rounded-xl p-4">
            <h3 className="font-black text-emerald-400 uppercase mb-3 border-b border-white/10 pb-2">{r.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {r.matches.map((match, j) => (
                <div key={j} className="bg-black/30 border border-white/5 p-3 rounded-lg text-sm text-center font-semibold text-zinc-300">
                  <span className="block text-xs text-muted-foreground mb-1">Llave {j + 1}</span>
                  {match}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoubleEliminationGenerator({ teams }: { teams: string[] }) {
  let p = 1;
  while (p < teams.length) p *= 2;
  
  const byes = p - teams.length;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
        <strong>Doble Eliminación:</strong> {teams.length} equipos. {byes} BYEs en la primera ronda del Winner's Bracket.
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Winner's Bracket */}
        <div className="flex-1 bg-secondary/10 border border-white/5 rounded-xl p-4">
          <h3 className="font-black text-amber-400 uppercase mb-4 border-b border-white/10 pb-2">Winner's Bracket</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Estructura idéntica a eliminación simple. Los perdedores caen al Loser's Bracket.
          </p>
          <div className="space-y-2">
            <div className="bg-black/20 p-2 rounded text-xs font-semibold">Ronda 1 ({teams.length} equipos)</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold">Ronda 2</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold">...</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold">Final de Winners</div>
          </div>
        </div>

        {/* Loser's Bracket */}
        <div className="flex-1 bg-secondary/10 border border-white/5 rounded-xl p-4">
          <h3 className="font-black text-red-400 uppercase mb-4 border-b border-white/10 pb-2">Loser's Bracket</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Recibe a los perdedores del Winner's Bracket. Quien pierde aquí, queda eliminado definitivamente.
          </p>
          <div className="space-y-2">
            <div className="bg-black/20 p-2 rounded text-xs font-semibold text-red-200">Ronda 1 (Perdedores R1)</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold text-red-200">Ronda 2 (Ganadores LR1 vs Perdedores R2)</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold text-red-200">...</div>
            <div className="bg-black/20 p-2 rounded text-xs font-semibold text-red-200">Final de Losers</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
        <h3 className="font-black text-amber-500 uppercase mb-2">Gran Final</h3>
        <p className="text-sm text-muted-foreground">
          Ganador de Winner's Bracket vs Ganador de Loser's Bracket.<br/>
          (Si el ganador del Loser's Bracket gana el primer partido, se juega un "Bracket Reset").
        </p>
      </div>
    </div>
  );
}

function RoundRobinGenerator({ teams }: { teams: string[] }) {
  const isOdd = teams.length % 2 !== 0;
  const participants = isOdd ? [...teams, "LIBRE (BYE)"] : [...teams];
  const numRounds = participants.length - 1;
  const halfSize = participants.length / 2;

  const rounds = [];
  const teamIndices = participants.map((_, i) => i).slice(1);

  for (let round = 0; round < numRounds; round++) {
    const roundMatches = [];
    const newIndices = [0].concat(teamIndices);
    const firstHalf = newIndices.slice(0, halfSize);
    const secondHalf = newIndices.slice(halfSize).reverse();

    for (let i = 0; i < firstHalf.length; i++) {
      roundMatches.push({
        home: participants[firstHalf[i]],
        away: participants[secondHalf[i]]
      });
    }
    rounds.push(roundMatches);
    // Rotate indices for next round
    teamIndices.push(teamIndices.shift()!);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
        <strong>Sistema Round Robin:</strong> {teams.length} equipos, {numRounds} fechas, {halfSize} partidos por fecha.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rounds.map((matches, rIndex) => (
          <div key={rIndex} className="bg-secondary/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="bg-secondary/40 px-4 py-2 font-bold text-center border-b border-white/5">
              Fecha {rIndex + 1}
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {matches.map((match, mIndex) => (
                <div key={mIndex} className="px-4 py-3 flex justify-between items-center text-sm">
                  <span className={`w-1/2 text-right pr-3 font-semibold ${match.home.includes('BYE') ? 'text-muted-foreground italic' : ''}`}>{match.home}</span>
                  <span className="text-zinc-600 font-bold text-[10px]">VS</span>
                  <span className={`w-1/2 pl-3 font-semibold ${match.away.includes('BYE') ? 'text-muted-foreground italic' : ''}`}>{match.away}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SwissGenerator({ teams }: { teams: string[] }) {
  const numRounds = Math.ceil(Math.log2(teams.length));
  
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
        <strong>Sistema Suizo:</strong> {teams.length} equipos. Se jugarán {numRounds} rondas. <br/>
        En este sistema, los equipos se enfrentan a oponentes con su mismo historial de victorias/derrotas.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: numRounds }).map((_, i) => (
          <div key={i} className="bg-secondary/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="bg-cyan-900/40 px-4 py-2 font-bold text-center border-b border-white/5">
              Ronda {i + 1}
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              {i === 0 ? (
                <p>Emparejamientos iniciales aleatorios o por ranking (seeding). {Math.ceil(teams.length / 2)} partidos.</p>
              ) : (
                <p>Emparejamientos entre equipos con historial idéntico (ej. ganadores contra ganadores, perdedores contra perdedores).</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl text-center">
        <h3 className="font-bold text-cyan-400 uppercase mb-2">Clasificación Final</h3>
        <p className="text-sm text-muted-foreground">
          Al finalizar las {numRounds} rondas, los equipos con mejor historial (ej. X victorias) avanzan a una fase de playoffs o ganan el torneo.
        </p>
      </div>
    </div>
  );
}

function GroupsGenerator({ teams, groupsCount }: { teams: string[], groupsCount: number }) {
  const groups: string[][] = Array.from({ length: groupsCount }, () => []);
  
  teams.forEach((team, i) => {
    groups[i % groupsCount].push(team);
  });

  // Calculate knockout size. Usually top 2 from each group advance, so 2 * groupsCount
  let knockoutTeams = 2 * groupsCount;
  
  // Need to round down or up to nearest power of 2 for a clean bracket, but let's just use next power of 2
  let p = 1;
  while (p < knockoutTeams) p *= 2;
  const byes = p - knockoutTeams;

  return (
    <div className="flex flex-col gap-8">
      <div className="text-sm text-muted-foreground bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
        <strong>Fase de Grupos + Fase Final:</strong> {teams.length} equipos distribuidos en {groupsCount} grupos. 
        Asumiendo que clasifican los 2 mejores de cada grupo, la fase final tendrá {knockoutTeams} equipos.
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-black text-purple-400 uppercase border-b border-white/10 pb-2">Fase de Grupos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map((g, i) => (
            <div key={i} className="bg-secondary/20 border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-purple-900/40 px-4 py-2 font-bold text-center border-b border-white/5">
                Grupo {String.fromCharCode(65 + i)}
              </div>
              <div className="flex flex-col p-2 gap-1">
                {g.map((team, j) => (
                  <div key={j} className="px-3 py-2 bg-black/20 rounded-md text-sm font-semibold flex items-center justify-between">
                    <span>{j + 1}.</span>
                    <span>{team}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-black text-emerald-400 uppercase border-b border-white/10 pb-2 mt-4">Fase Final (Playoffs)</h3>
        <div className="bg-secondary/20 border border-white/5 p-4 rounded-xl text-center">
          <p className="text-muted-foreground mb-4">
            Estructura base para {knockoutTeams} clasificados.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {Array.from({ length: p / 2 }).map((_, i) => (
              <div key={i} className="bg-black/30 border border-white/5 p-3 rounded-lg text-sm font-semibold text-zinc-300">
                Llave {i + 1}: 1ro Grupo vs 2do Grupo
              </div>
            ))}
          </div>
          {byes > 0 && (
            <p className="text-xs text-amber-500 mt-4">
              Nota: {knockoutTeams} no es potencia de 2. Se requerirán {byes} pases directos (BYEs) en la primera ronda de playoffs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
