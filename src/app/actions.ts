"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitMatchStats(formData: any) {
  const { matchId, homeScore, awayScore, playerStats, eventsJson } = formData;

  let events = [];
  try {
    if (eventsJson) events = JSON.parse(eventsJson);
  } catch (e) {
    console.error("Failed to parse events JSON", e);
  }

  // 1. Update Match Score and Status
  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        status: "PLAYED",
        events: events,
        matchDate: new Date()
      }
    });

    // 2. Insert/Update Player Stats
    for (const stat of playerStats) {
      if (!stat.playerId) continue;

      await tx.matchStat.upsert({
        where: {
          matchId_playerId: { matchId, playerId: stat.playerId }
        },
        update: {
          goals: parseInt(stat.goals) || 0,
          assists: parseInt(stat.assists) || 0,
          fouls: parseInt(stat.fouls) || 0,
          fouled: parseInt(stat.fouled) || 0,
          offsides: parseInt(stat.offsides) || 0,
          ballLosses: parseInt(stat.ballLosses) || 0,
          tacklesWon: parseInt(stat.tacklesWon) || 0,
          passesMade: parseInt(stat.passesMade) || 0,
          passesTotal: parseInt(stat.passesTotal) || 0,
          slidingMade: parseInt(stat.slidingMade) || 0,
          slidingTotal: parseInt(stat.slidingTotal) || 0,
          shotsMade: parseInt(stat.shotsMade) || 0,
          shotsTotal: parseInt(stat.shotsTotal) || 0,
          headersMade: parseInt(stat.headersMade) || 0,
          headersTotal: parseInt(stat.headersTotal) || 0,
          savesMade: parseInt(stat.savesMade) || 0,
          savesTotal: parseInt(stat.savesTotal) || 0,
          matchTime: parseInt(stat.matchTime) || 90,
          cleanSheet: stat.cleanSheet === 'on' || stat.cleanSheet === true
        },
        create: {
          matchId,
          playerId: stat.playerId,
          goals: parseInt(stat.goals) || 0,
          assists: parseInt(stat.assists) || 0,
          fouls: parseInt(stat.fouls) || 0,
          fouled: parseInt(stat.fouled) || 0,
          offsides: parseInt(stat.offsides) || 0,
          ballLosses: parseInt(stat.ballLosses) || 0,
          tacklesWon: parseInt(stat.tacklesWon) || 0,
          passesMade: parseInt(stat.passesMade) || 0,
          passesTotal: parseInt(stat.passesTotal) || 0,
          slidingMade: parseInt(stat.slidingMade) || 0,
          slidingTotal: parseInt(stat.slidingTotal) || 0,
          shotsMade: parseInt(stat.shotsMade) || 0,
          shotsTotal: parseInt(stat.shotsTotal) || 0,
          headersMade: parseInt(stat.headersMade) || 0,
          headersTotal: parseInt(stat.headersTotal) || 0,
          savesMade: parseInt(stat.savesMade) || 0,
          savesTotal: parseInt(stat.savesTotal) || 0,
          matchTime: parseInt(stat.matchTime) || 90,
          cleanSheet: stat.cleanSheet === 'on' || stat.cleanSheet === true
        }
      });
    }
  });

  // 3. Revalidate cache
  revalidatePath("/liga");
  revalidatePath("/admin/partidos");
  revalidatePath("/jugadores");
  revalidatePath("/equipos");
  
  return { success: true };
}

export async function submitTrophy(formData: any) {
  const { name, type, tournamentId, teamId, playerId } = formData;

  await prisma.trophy.create({
    data: {
      name,
      type,
      tournamentId: tournamentId || null,
      teamId: teamId || null,
      playerId: playerId || null
    }
  });

  revalidatePath("/admin/premios");
  revalidatePath("/jugadores");
  revalidatePath("/equipos");

  return { success: true };
}

// ==========================================
// SEASON ACTIONS
// ==========================================

export async function setActiveSeason(seasonId: string) {
  await prisma.$transaction(async (tx) => {
    // Set all to false
    await tx.season.updateMany({
      data: { isActive: false }
    });
    // Set target to true
    await tx.season.update({
      where: { id: seasonId },
      data: { isActive: true }
    });
  });

  revalidatePath("/admin/temporadas");
  revalidatePath("/liga");
  return { success: true };
}

// ==========================================
// TEAM ACTIONS
// ==========================================

export async function createTeam(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const captainId = formData.get("captainId") as string;

    await prisma.team.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        captainId: captainId || null
      }
    });

    revalidatePath("/admin/equipos");
    revalidatePath("/equipos");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe un equipo con ese nombre." };
    return { success: false, error: "Error interno" };
  }
}

export async function editTeam(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const captainId = formData.get("captainId") as string;

    await prisma.team.update({
      where: { id },
      data: {
        name,
        logoUrl: logoUrl || null,
        captainId: captainId || null
      }
    });

    revalidatePath("/admin/equipos");
    revalidatePath("/equipos");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe otro equipo con ese nombre." };
    return { success: false, error: "Error interno" };
  }
}

export async function deleteTeam(teamId: string) {
  // Check if team has matches
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { _count: { select: { homeMatches: true, awayMatches: true } } }
  });

  if (!team) return { success: false, error: "Equipo no encontrado" };
  
  if (team._count.homeMatches > 0 || team._count.awayMatches > 0) {
    return { success: false, error: "No se puede eliminar un equipo que ya tiene partidos jugados o programados." };
  }

  // Delete team dependencies (tournament participations, trophies without cascade)
  await prisma.tournamentTeam.deleteMany({ where: { teamId } });
  await prisma.trophy.deleteMany({ where: { teamId } });
  
  await prisma.team.delete({ where: { id: teamId } });

  revalidatePath("/admin/equipos");
  revalidatePath("/equipos");
  return { success: true };
}

// ==========================================
// PLAYER ACTIONS
// ==========================================

export async function createPlayer(formData: FormData) {
  try {
    const nick = formData.get("nick") as string;
    const nationality = formData.get("nationality") as string || "Desconocida";
    const userId = formData.get("userId") as string;

    const player = await prisma.player.create({
      data: {
        nick,
        nationality
      }
    });

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { playerId: player.id }
      });
    }

    revalidatePath("/admin/jugadores");
    revalidatePath("/jugadores");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe un jugador con ese nick." };
    return { success: false, error: "Error interno" };
  }
}

export async function editPlayer(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const nick = formData.get("nick") as string;
    const nationality = formData.get("nationality") as string || "Desconocida";
    const userId = formData.get("userId") as string;

    await prisma.player.update({
      where: { id },
      data: { nick, nationality }
    });

    // Remove this player from all users first
    await prisma.user.updateMany({
      where: { playerId: id },
      data: { playerId: null }
    });

    if (userId) {
      // Check if user is already linked elsewhere
      await prisma.user.update({
        where: { id: userId },
        data: { playerId: id }
      });
    }

    revalidatePath("/admin/jugadores");
    revalidatePath("/jugadores");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe otro jugador con ese nick." };
    return { success: false, error: "Error interno" };
  }
}

export async function deletePlayer(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { _count: { select: { matchStats: true } } }
  });

  if (!player) return { success: false, error: "Jugador no encontrado" };
  
  if (player._count.matchStats > 0) {
    return { success: false, error: "No se puede eliminar un jugador que ya tiene estadísticas." };
  }

  await prisma.user.updateMany({
    where: { playerId: playerId },
    data: { playerId: null }
  });

  await prisma.tournamentPlayer.deleteMany({ where: { playerId } });
  await prisma.trophy.deleteMany({ where: { playerId } });
  await prisma.player.delete({ where: { id: playerId } });

  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  return { success: true };
}

// ==========================================
// SEASON / TOURNAMENT ACTIONS
// ==========================================

export async function createSeason(formData: FormData) {
  const name = formData.get("name") as string;
  const isActive = formData.get("isActive") === "true";

  if (isActive) {
    await prisma.season.updateMany({ data: { isActive: false } });
  }

  await prisma.season.create({
    data: { name, isActive }
  });

  revalidatePath("/admin/temporadas");
  revalidatePath("/liga");
  return { success: true };
}

export async function createTournament(formData: FormData) {
  const seasonId = formData.get("seasonId") as string;
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const categoryId = formData.get("categoryId") as string;

  await prisma.tournament.create({
    data: { seasonId, name, format, categoryId: categoryId || null }
  });

  revalidatePath("/admin/temporadas");
  return { success: true };
}

export async function updateTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const categoryId = formData.get("categoryId") as string;

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { name, format, categoryId: categoryId || null }
  });

  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/jugadores"); // Stats categories will change
  return { success: true };
}

// ==========================================
// TOURNAMENT MANAGEMENT ACTIONS
// ==========================================

export async function enrollTeamToTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const teamId = formData.get("teamId") as string;

  try {
    await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId
      }
    });
    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "El equipo ya está inscrito." };
    return { success: false, error: "Error interno" };
  }
}

export async function removeTeamFromTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const teamId = formData.get("teamId") as string;

  // Check if team has matches in this tournament
  const matches = await prisma.match.count({
    where: {
      tournamentId,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }]
    }
  });

  if (matches > 0) {
    return { success: false, error: "No se puede desinscribir porque el equipo ya tiene partidos programados o jugados en este torneo." };
  }

  await prisma.tournamentTeam.delete({
    where: {
      tournamentId_teamId: { tournamentId, teamId }
    }
  });

  revalidatePath(`/admin/temporadas/${tournamentId}`);
  return { success: true };
}

export async function createManualMatch(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const homeTeamId = formData.get("homeTeamId") as string;
  const awayTeamId = formData.get("awayTeamId") as string;
  const round = formData.get("round") as string || "Amistoso";

  if (homeTeamId === awayTeamId) {
    return { success: false, error: "Un equipo no puede jugar contra sí mismo." };
  }

  await prisma.match.create({
    data: {
      tournamentId,
      homeTeamId,
      awayTeamId,
      status: "SCHEDULED",
      round
    }
  });

  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/liga");
  return { success: true };
}

export async function generateRoundRobin(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const doubleRound = formData.get("doubleRound") === "true";

  const enrolled = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true }
  });

  if (enrolled.length < 2) {
    return { success: false, error: "Se necesitan al menos 2 equipos inscritos para generar un fixture." };
  }

  let teamIds = enrolled.map(e => e.teamId);
  
  // If odd number of teams, add a 'BYE' (dummy) team
  const hasBye = teamIds.length % 2 !== 0;
  if (hasBye) {
    teamIds.push("BYE");
  }

  const numTeams = teamIds.length;
  const rounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const matchesToCreate = [];

  // Generate Single Round Robin
  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const home = (r + m) % (numTeams - 1);
      let away = (numTeams - 1 - m + r) % (numTeams - 1);
      if (m === 0) {
        away = numTeams - 1;
      }

      const homeTeamId = teamIds[home];
      const awayTeamId = teamIds[away];

      if (homeTeamId !== "BYE" && awayTeamId !== "BYE") {
        matchesToCreate.push({
          tournamentId,
          homeTeamId: r % 2 === 0 ? homeTeamId : awayTeamId,
          awayTeamId: r % 2 === 0 ? awayTeamId : homeTeamId,
          status: "SCHEDULED",
          round: `Fecha ${r + 1}`
        });
      }
    }
  }

  // Generate Double Round Robin
  if (doubleRound) {
    const singleMatches = [...matchesToCreate];
    for (const match of singleMatches) {
      // Extract number from "Fecha X"
      const roundNum = parseInt(match.round.split(" ")[1]);
      matchesToCreate.push({
        tournamentId,
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        status: "SCHEDULED",
        round: `Fecha ${roundNum + rounds}`
      });
    }
  }

  await prisma.match.createMany({
    data: matchesToCreate
  });

  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/liga");
  return { success: true };
}

// ==========================================
// ROSTER ACTIONS
// ==========================================

export async function addPlayerToRoster(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const teamId = formData.get("teamId") as string;
  const playerId = formData.get("playerId") as string;

  try {
    const tt = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId, teamId } }
    });
    
    if (!tt) return { success: false, error: "Equipo no inscrito en torneo" };

    // Check if player is already in ANY team in this tournament
    const existingEnrollment = await prisma.tournamentPlayer.findFirst({
      where: {
        playerId,
        tournamentTeam: {
          tournamentId: tournamentId
        }
      }
    });

    if (existingEnrollment) {
      return { success: false, error: "El jugador ya está fichado en un equipo para este torneo." };
    }

    await prisma.tournamentPlayer.create({
      data: { tournamentTeamId: tt.id, playerId }
    });
    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: "Error interno" };
  }
}

export async function removePlayerFromRoster(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const teamId = formData.get("teamId") as string;
  const playerId = formData.get("playerId") as string;

  const tt = await prisma.tournamentTeam.findUnique({
    where: { tournamentId_teamId: { tournamentId, teamId } }
  });

  if (tt) {
    await prisma.tournamentPlayer.deleteMany({
      where: { tournamentTeamId: tt.id, playerId }
    });
  }

  revalidatePath(`/admin/temporadas/${tournamentId}`);
  return { success: true };
}

// ==========================================
// PODIUM ACTIONS
// ==========================================

export async function assignTournamentPodium(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const firstId = formData.get("firstId") as string | null;
  const secondId = formData.get("secondId") as string | null;
  const thirdId = formData.get("thirdId") as string | null;

  try {
    // 1. Delete all old podium trophies for this tournament to allow fixing errors (efecto cascada)
    await prisma.trophy.deleteMany({
      where: {
        tournamentId,
        name: {
          in: ["Campeón (1er Puesto)", "Subcampeón (2do Puesto)", "Tercer Puesto (3ro)"]
        }
      }
    });

    const placements = [
      { teamId: firstId, name: "Campeón (1er Puesto)" },
      { teamId: secondId, name: "Subcampeón (2do Puesto)" },
      { teamId: thirdId, name: "Tercer Puesto (3ro)" }
    ];

    for (const place of placements) {
      if (!place.teamId) continue;

      // Give trophy to the team
      await prisma.trophy.create({
        data: {
          name: place.name,
          type: "TEAM",
          tournamentId,
          teamId: place.teamId
        }
      });

      // Find the roster
      const tt = await prisma.tournamentTeam.findUnique({
        where: { tournamentId_teamId: { tournamentId, teamId: place.teamId } },
        include: { players: true }
      });

      // No need to create individual trophies because the player profile automatically 
      // fetches team trophies via collectiveTrophies (which also adds the "con Equipo" label).
    }

    revalidatePath(`/admin/temporadas/${tournamentId}`);
    revalidatePath("/admin/premios");
    revalidatePath("/jugadores");
    revalidatePath("/equipos");
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error interno al asignar el podio" };
  }
}

