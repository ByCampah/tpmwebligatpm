"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createAdminLog(action: string, details?: string) {
  const session = await auth();
  if (!session?.user) return;
  
  try {
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action,
        details
      }
    });
  } catch (e) {
    console.error("Failed to create admin log", e);
  }
}

export async function submitMatchStats(formData: any) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  const { matchId, homeScore, awayScore, homePenaltyScore, awayPenaltyScore, playerStats, eventsJson } = formData;

  if (session.user.role === "MODERATOR") {
    const matchData = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: { include: { season: true } } }
    });
    if (matchData?.tournament.isOfficial && !matchData?.tournament.season?.isActive) {
      return { success: false, error: "Los moderadores solo pueden editar partidos de la temporada actual." };
    }
  }

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
        homePenaltyScore: homePenaltyScore ? parseInt(homePenaltyScore) : null,
        awayPenaltyScore: awayPenaltyScore ? parseInt(awayPenaltyScore) : null,
        status: "PLAYED",
        events: events,
        matchDate: new Date()
      }
    });

    // 2. Insert/Update Player Stats
    for (const stat of playerStats) {
      if (!stat.playerId) continue;

      const mTime = parseInt(stat.matchTime) || 0;
      const gTime = parseInt(stat.gkTime) || 0;

      if (mTime === 0 && gTime === 0) {
        // Player did not play. Ensure they don't have stats for this match.
        await tx.matchStat.deleteMany({
          where: { matchId, playerId: stat.playerId }
        });
        continue;
      }

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
          matchTime: mTime,
          gkTime: gTime,
          cleanSheet: stat.cleanSheet === 'on' || stat.cleanSheet === true,
          redCards: parseInt(stat.redCards) || 0,
          freeKickGoals: parseInt(stat.freeKickGoals) || 0,
          penaltyGoals: parseInt(stat.penaltyGoals) || 0,
          penaltiesSaved: parseInt(stat.penaltiesSaved) || 0,
          penaltiesConceded: parseInt(stat.penaltiesConceded) || 0
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
          matchTime: mTime,
          gkTime: gTime,
          cleanSheet: stat.cleanSheet === 'on' || stat.cleanSheet === true,
          redCards: parseInt(stat.redCards) || 0,
          freeKickGoals: parseInt(stat.freeKickGoals) || 0,
          penaltyGoals: parseInt(stat.penaltyGoals) || 0,
          penaltiesSaved: parseInt(stat.penaltiesSaved) || 0,
          penaltiesConceded: parseInt(stat.penaltiesConceded) || 0
        }
      });
    }
  });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true }
  });
  await createAdminLog("Edición de Partido", `[${match?.homeTeam.name} ${homeScore} - ${awayScore} ${match?.awayTeam.name}](/partidos/${matchId}) - Resultado Cargado`);

  // --- CALCULAR PUNTOS DEL PRODE ---
  const hScore = parseInt(homeScore);
  const aScore = parseInt(awayScore);

  const predictions = await prisma.prodePrediction.findMany({
    where: { matchId }
  });

  for (const pred of predictions) {
    let points = 0;
    if (pred.homeScore === hScore && pred.awayScore === aScore) {
      points = 6;
    } else {
      const predDiff = pred.homeScore - pred.awayScore;
      const actualDiff = hScore - aScore;
      if ((predDiff > 0 && actualDiff > 0) || (predDiff < 0 && actualDiff < 0) || (predDiff === 0 && actualDiff === 0)) {
        points = 3;
      }
    }
    
    await prisma.prodePrediction.update({
      where: { id: pred.id },
      data: { pointsEarned: points }
    });
  }
  // ---------------------------------

  // 3. Revalidate cache
  revalidatePath("/liga");
  revalidatePath("/admin/partidos");
  revalidatePath("/jugadores");
  revalidatePath("/equipos");
  
  return { success: true };
}

export async function submitTrophy(formData: any) {
  const { name, type, tournamentId, teamId, playerId, excludedPlayerIds } = formData;

  await prisma.trophy.create({
    data: {
      name,
      type,
      tournamentId: tournamentId || null,
      teamId: teamId || null,
      playerId: playerId || null,
      ...(excludedPlayerIds && excludedPlayerIds.length > 0 ? {
        excludedPlayers: {
          connect: excludedPlayerIds.map((id: string) => ({ id }))
        }
      } : {})
    }
  });

  const session = await auth();
  if (session?.user) {
    await createAdminLog("Crear Trofeo", `Asignó el trofeo ${name} ${type === 'TEAM' ? 'al equipo '+teamId : 'al jugador '+playerId}`);
  }

  revalidatePath("/admin/premios");
  revalidatePath("/jugadores");
  revalidatePath("/equipos");

  return { success: true };
}

// ==========================================
// SEASON ACTIONS
// ==========================================

export async function setActiveSeason(seasonId: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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
  
  await createAdminLog("Temporada Activa", `Hizo activa la temporada ID: ${seasonId}`);
  
  return { success: true };
}

export async function deleteSeason(seasonId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };


  try {
    await prisma.season.delete({
      where: { id: seasonId }
    });
    
    await createAdminLog("Eliminar Temporada", `Eliminó la temporada ID: ${seasonId}`);
    
    revalidatePath("/admin/temporadas");
    revalidatePath("/liga");
    return { success: true };
  } catch (e: any) {
    console.error("deleteSeason error", e);
    return { success: false, error: "Error interno al eliminar la temporada" };
  }
}

export async function setActiveExtraTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  await prisma.$transaction(async (tx) => {
    // Set all extra tournaments to false
    await tx.tournament.updateMany({
      where: { isOfficial: false },
      data: { isActiveExtra: false }
    });
    // Set target to true
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { isActiveExtra: true }
    });
  });

  revalidatePath("/admin/torneos-extra");
  revalidatePath("/extras");
  
  await createAdminLog("Torneo Extra Activo", `Hizo activo el torneo extra ID: ${tournamentId}`);
  
  return { success: true };
}

// ==========================================
// TEAM ACTIONS
// ==========================================

export async function createTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  try {
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const bannerUrl = formData.get("bannerUrl") as string;
    const captainId = formData.get("captainId") as string;
    const isNationalTeam = formData.get("isNationalTeam") === "true";

    await prisma.team.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        captainId: captainId || null,
        isNationalTeam
      }
    });

    await createAdminLog("Crear Equipo", `Creó el equipo: ${name}`);

    revalidatePath("/admin/equipos");
    revalidatePath("/equipos");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe un equipo con ese nombre." };
    return { success: false, error: "Error interno" };
  }
}

export async function editTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const bannerUrl = formData.get("bannerUrl") as string;
    const captainId = formData.get("captainId") as string;
    const isNationalTeam = formData.get("isNationalTeam") === "true";

    await prisma.team.update({
      where: { id },
      data: {
        name,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        captainId: captainId || null,
        isNationalTeam
      }
    });

    await createAdminLog("Editar Equipo", `Editó el equipo: ${name}`);

    revalidatePath("/admin/equipos");
    revalidatePath("/equipos");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe otro equipo con ese nombre." };
    return { success: false, error: "Error interno" };
  }
}

export async function deleteTeam(teamId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

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

  await createAdminLog("Eliminar Equipo", `Eliminó el equipo: ${team.name}`);

  revalidatePath("/admin/equipos");
  revalidatePath("/equipos");
  return { success: true };
}

// ==========================================
// PLAYER ACTIONS
// ==========================================

export async function createPlayer(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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
    
    await createAdminLog("Crear Jugador", `Creó el jugador: ${nick}`);

    revalidatePath("/admin/jugadores");
    revalidatePath("/jugadores");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe un jugador con ese nick." };
    return { success: false, error: "Error interno" };
  }
}

export async function editPlayer(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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

    await createAdminLog("Editar Jugador", `Editó el jugador: ${nick}`);

    revalidatePath("/admin/jugadores");
    revalidatePath("/jugadores");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Ya existe otro jugador con ese nick." };
    return { success: false, error: "Error interno" };
  }
}

export async function deletePlayer(playerId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

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

  await createAdminLog("Eliminar Jugador", `Eliminó el jugador: ${player.nick}`);

  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  return { success: true };
}

// ==========================================
// SEASON / TOURNAMENT ACTIONS
// ==========================================

export async function createSeason(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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
  await createAdminLog("Crear Temporada", `Creó la temporada: ${name}`);
  return { success: true };
}

export async function createTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  const seasonId = formData.get("seasonId") as string;
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const categoryId = formData.get("categoryId") as string;
  const bracketImageUrl = formData.get("bracketImageUrl") as string;
  const isOfficialStr = formData.get("isOfficial") as string;

  const isOfficial = isOfficialStr === "false" ? false : true;

  await prisma.tournament.create({
    data: { 
      seasonId: seasonId || null, 
      name, 
      format, 
      categoryId: categoryId || null, 
      bracketImageUrl: bracketImageUrl || null,
      isOfficial
    }
  });

  revalidatePath("/admin/temporadas");
  revalidatePath("/admin/torneos-extra");
  await createAdminLog("Crear Torneo", `Creó el torneo: ${name} (Oficial: ${isOfficial})`);
  return { success: true };
}

export async function updateTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  const tournamentId = formData.get("tournamentId") as string;
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const categoryId = formData.get("categoryId") as string;
  const bracketImageUrl = formData.get("bracketImageUrl") as string;

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { name, format, categoryId: categoryId || null, bracketImageUrl: bracketImageUrl || null }
  });

  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/jugadores"); // Stats categories will change
  
  await createAdminLog("Actualizar Torneo", `Actualizó el torneo ID: ${tournamentId}`);
  return { success: true };
}

export async function deleteTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

  try {
    await prisma.tournament.delete({
      where: { id: tournamentId }
    });
    
    await createAdminLog("Eliminar Torneo", `Eliminó el torneo ID: ${tournamentId}`);
    
    revalidatePath("/admin/temporadas");
    revalidatePath("/admin/torneos-extra");
    revalidatePath("/liga");
    return { success: true };
  } catch (e: any) {
    console.error("deleteTournament error", e);
    return { success: false, error: "Error interno al eliminar el torneo" };
  }
}

// ==========================================
// TOURNAMENT MANAGEMENT ACTIONS
// ==========================================

export async function enrollTeamToTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  const tournamentId = formData.get("tournamentId") as string;
  const teamId = formData.get("teamId") as string;

  try {
    await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId
      }
    });
    await createAdminLog("Inscribir Equipo", `Inscribió equipo ${teamId} en torneo ${tournamentId}`);
    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "El equipo ya está inscrito." };
    return { success: false, error: "Error interno" };
  }
}

export async function removeTeamFromTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

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

  await createAdminLog("Desinscribir Equipo", `Desinscribió equipo ${teamId} de torneo ${tournamentId}`);
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  return { success: true };
}

export async function createManualMatch(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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

  await createAdminLog("Crear Partido Manual", `Partido ${homeTeamId} vs ${awayTeamId} en torneo ${tournamentId}`);
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/liga");
  return { success: true };
}

export async function generateRoundRobin(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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

  await createAdminLog("Generar Fixture", `Generó fixture para torneo ${tournamentId} (${doubleRound ? 'Ida y Vuelta' : 'Ida'})`);
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  revalidatePath("/liga");
  return { success: true };
}

// ==========================================
// ROSTER ACTIONS
// ==========================================

export async function addPlayerToRoster(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

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
    await createAdminLog("Fichar Jugador", `Fichó jugador ${playerId} en equipo ${teamId} para torneo ${tournamentId}`);
    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: "Error interno" };
  }
}

export async function removePlayerFromRoster(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

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

  await createAdminLog("Despedir Jugador", `Despidió jugador ${playerId} del equipo ${teamId} en torneo ${tournamentId}`);
  revalidatePath(`/admin/temporadas/${tournamentId}`);
  return { success: true };
}

// ==========================================
// PODIUM ACTIONS
// ==========================================

export async function saveBracketData(tournamentId: string, bracketData: any) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { bracketData }
    });
    revalidatePath("/admin/temporadas");
    revalidatePath("/admin/torneos-extra");
    revalidatePath("/historial");
    revalidatePath("/extras");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignTournamentPodium(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  const tournamentId = formData.get("tournamentId") as string;
  const firstIds = formData.getAll("firstId") as string[];
  const secondIds = formData.getAll("secondId") as string[];
  const thirdIds = formData.getAll("thirdId") as string[];

  const topScorerIds = formData.getAll("topScorerId") as string[];
  const topAssisterIds = formData.getAll("topAssisterId") as string[];
  const bestGkIds = formData.getAll("bestGkId") as string[];
  const mvpIds = formData.getAll("mvpId") as string[];
  const prodeWinnerIds = formData.getAll("prodeWinnerId") as string[];

  const firstExcludedIds = formData.getAll("firstExcludedIds") as string[];
  const secondExcludedIds = formData.getAll("secondExcludedIds") as string[];
  const thirdExcludedIds = formData.getAll("thirdExcludedIds") as string[];

  try {
    // 1. Delete all old podium and individual trophies for this tournament to allow fixing errors (efecto cascada)
    await prisma.trophy.deleteMany({
      where: {
        tournamentId,
        name: {
          in: [
            "Campeón", 
            "Campeón (1er Puesto)",
            "Subcampeón", 
            "Subcampeón (2do Puesto)",
            "Tercer Puesto",
            "Tercer Puesto (3ro)",
            "Máximo Goleador",
            "Máximo Asistidor",
            "Valla Invicta",
            "MVP",
            "Ganador del PRODE"
          ]
        }
      }
    });

    // 2. Team placements
    const placements = [
      { teamIds: firstIds, name: "Campeón (1er Puesto)", excludedIds: firstExcludedIds },
      { teamIds: secondIds, name: "Subcampeón (2do Puesto)", excludedIds: secondExcludedIds },
      { teamIds: thirdIds, name: "Tercer Puesto (3ro)", excludedIds: thirdExcludedIds }
    ];

    for (const place of placements) {
      if (!place.teamIds || place.teamIds.length === 0) continue;

      for (const teamId of place.teamIds) {
        if (!teamId) continue;
        await prisma.trophy.create({
          data: {
            name: place.name,
            type: "TEAM",
            tournamentId,
            teamId: teamId,
            ...(place.excludedIds && place.excludedIds.length > 0 ? {
              excludedPlayers: {
                connect: place.excludedIds.map((id: string) => ({ id }))
              }
            } : {})
          }
        });
      }
    }

    // 3. Individual Awards
    const individualAwards = [
      { playerIds: topScorerIds, name: "Máximo Goleador" },
      { playerIds: topAssisterIds, name: "Máximo Asistidor" },
      { playerIds: bestGkIds, name: "Valla Invicta" },
      { playerIds: mvpIds, name: "MVP" }
    ];

    for (const award of individualAwards) {
      if (!award.playerIds || award.playerIds.length === 0) continue;
      
      for (const playerId of award.playerIds) {
        if (!playerId) continue;
        await prisma.trophy.create({
          data: {
            name: award.name,
            type: "PLAYER",
            tournamentId,
            playerId: playerId
          }
        });
      }
    }

    if (prodeWinnerIds && prodeWinnerIds.length > 0) {
      for (const pId of prodeWinnerIds) {
        if (!pId) continue;
        await prisma.trophy.create({
          data: {
            name: "Ganador del PRODE",
            type: "USER",
            tournamentId,
            userId: pId
          }
        });
      }
    }

    revalidatePath(`/admin/temporadas/${tournamentId}`);
    revalidatePath("/admin/premios");
    revalidatePath("/jugadores");
    revalidatePath("/equipos");
    revalidatePath("/trofeos");
    
    await createAdminLog("Asignar Podio", `Asignó el podio del torneo ID: ${tournamentId}`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error interno al asignar el podio" };
  }
}

export async function toggleNationalTeamCallUp(playerId: string, isCalledUp: boolean) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.player.update({
      where: { id: playerId },
      data: { isNationalTeamCalledUp: isCalledUp }
    });
    
    await createAdminLog(
      isCalledUp ? "Convocó a jugador" : "Desconvocó a jugador",
      `Jugador ID: ${playerId}`
    );
    
    revalidatePath("/admin/selecciones");
    revalidatePath("/selecciones");
    return { success: true };
  } catch (e: any) {
    console.error("Toggle call up error:", e);
    return { success: false, error: e.message || "Error al cambiar estado de convocatoria" };
  }
}

export async function updateTournamentTeamGroups(tournamentId: string, teamGroups: {teamId: string, group: string | null}[]) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

  try {
    await prisma.$transaction(
      teamGroups.map(tg => prisma.tournamentTeam.update({
        where: {
          tournamentId_teamId: { tournamentId, teamId: tg.teamId }
        },
        data: {
          group: tg.group
        }
      }))
    );
    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al actualizar los grupos" };
  }
}

export async function generateGroupMatches(tournamentId: string, doubleRoundRobin: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

  try {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId, group: { not: null } },
      include: { team: true }
    });

    const groups: Record<string, typeof tournamentTeams> = {};
    for (const tt of tournamentTeams) {
      if (!groups[tt.group!]) groups[tt.group!] = [];
      groups[tt.group!].push(tt);
    }

    const matchesToCreate: any[] = [];

    for (const [groupName, teams] of Object.entries(groups)) {
       const isOdd = teams.length % 2 !== 0;
       const t = [...teams];
       if (isOdd) {
         t.push({ teamId: "BYE" } as any);
       }
       
       const totalRounds = t.length - 1;
       const half = t.length / 2;
       const firstHalfMatches = [];
       
       for (let round = 0; round < totalRounds; round++) {
         for (let i = 0; i < half; i++) {
           const home = t[i];
           const away = t[t.length - 1 - i];
           
           if (home.teamId !== "BYE" && away.teamId !== "BYE") {
             const m = {
               tournamentId,
               homeTeamId: home.teamId,
               awayTeamId: away.teamId,
               round: `Grupo ${groupName} - Fecha ${round + 1}`,
               status: "SCHEDULED"
             };
             matchesToCreate.push(m);
             firstHalfMatches.push(m);
           }
         }
         t.splice(1, 0, t.pop()!);
       }

       if (doubleRoundRobin) {
         for (const m of firstHalfMatches) {
           const fechaNum = parseInt(m.round.split(" - Fecha ")[1]);
           matchesToCreate.push({
             tournamentId,
             homeTeamId: m.awayTeamId,
             awayTeamId: m.homeTeamId,
             round: `Grupo ${groupName} - Fecha ${fechaNum + totalRounds}`,
             status: "SCHEDULED"
           });
         }
       }
    }

    if (matchesToCreate.length > 0) {
      await prisma.match.createMany({
        data: matchesToCreate
      });
    }

    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al generar partidos de grupos" };
  }
}

// ==============================
// PRODE ACTIONS
// ==============================

export async function toggleMatchProde(matchId: string, showInProde: boolean, prodeLocked: boolean) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return { success: false, error: "No autorizado" };

  try {
    await prisma.match.update({
      where: { id: matchId },
      data: { showInProde, prodeLocked }
    });
    revalidatePath("/admin/temporadas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar estado del Prode" };
  }
}

export async function submitProdePrediction(matchId: string, homeScore: number, awayScore: number) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Debes iniciar sesión para participar en el Prode" };

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.prodeLocked) return { success: false, error: "El partido ya no acepta pronósticos o no existe" };

  try {
    await prisma.prodePrediction.upsert({
      where: {
        userId_matchId: { userId: session.user.id, matchId }
      },
      update: {
        homeScore,
        awayScore,
        pointsEarned: null // Reset in case it was somehow scored
      },
      create: {
        userId: session.user.id,
        matchId,
        homeScore,
        awayScore,
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al guardar el pronóstico" };
  }
}

export async function renameSeason(id: string, newName: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, error: "No autorizado" };

  try {
    await prisma.season.update({
      where: { id },
      data: { name: newName }
    });
    revalidatePath("/admin/temporadas");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al renombrar temporada" };
  }
}

export async function addMultiplePlayersToRoster(tournamentId: string, teamId: string, textList: string) {
  try {
    const rawNicks = textList.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    const added: string[] = [];
    const notFound: string[] = [];
    const alreadyExists: string[] = [];

    const allPlayers = await prisma.player.findMany();
    
    // Get the specific tournamentTeam
    const tournamentTeam = await prisma.tournamentTeam.findFirst({
      where: { tournamentId, teamId }
    });

    if (!tournamentTeam) return { success: false, error: "Equipo no inscripto en torneo" };

    for (const rawNick of rawNicks) {
      const lowerNick = rawNick.toLowerCase();
      const player = allPlayers.find(p => p.nick.toLowerCase() === lowerNick);
      
      if (!player) {
        notFound.push(rawNick);
        continue;
      }

      const existing = await prisma.tournamentPlayer.findFirst({
        where: { tournamentTeamId: tournamentTeam.id, playerId: player.id }
      });

      if (existing) {
        alreadyExists.push(player.nick);
      } else {
        await prisma.tournamentPlayer.create({
          data: {
            tournamentTeamId: tournamentTeam.id,
            playerId: player.id
          }
        });
        added.push(player.nick);
      }
    }

    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true, added, notFound, alreadyExists };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enrollMultipleTeamsToTournament(tournamentId: string, textList: string) {
  try {
    const rawNames = textList.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    const added: string[] = [];
    const notFound: string[] = [];
    const alreadyExists: string[] = [];

    const allTeams = await prisma.team.findMany();
    
    for (const rawName of rawNames) {
      const lowerName = rawName.toLowerCase();
      const team = allTeams.find(t => t.name.toLowerCase() === lowerName);
      
      if (!team) {
        notFound.push(rawName);
        continue;
      }

      const existing = await prisma.tournamentTeam.findFirst({
        where: { tournamentId, teamId: team.id }
      });

      if (existing) {
        alreadyExists.push(team.name);
      } else {
        await prisma.tournamentTeam.create({
          data: {
            tournamentId,
            teamId: team.id
          }
        });
        added.push(team.name);
      }
    }

    revalidatePath(`/admin/temporadas/${tournamentId}`);
    return { success: true, added, notFound, alreadyExists };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
