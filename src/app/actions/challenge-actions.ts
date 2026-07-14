"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChallengeTournament(data: { name: string, type: string }) {
  try {
    const t = await prisma.challengeTournament.create({
      data: {
        name: data.name,
        type: data.type,
      }
    });
    revalidatePath("/admin/challenges");
    return { success: true, id: t.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteChallengeTournament(id: string) {
  try {
    await prisma.challengeTournament.delete({ where: { id } });
    revalidatePath("/admin/challenges");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setActiveChallenge(id: string) {
  try {
    // Primero, desactivar todos los challenges
    await prisma.challengeTournament.updateMany({
      data: { isActiveChallenge: false }
    });
    
    // Segundo, activar el elegido
    await prisma.challengeTournament.update({
      where: { id },
      data: { isActiveChallenge: true }
    });
    
    revalidatePath("/admin/challenges");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addChallengeParticipant(tournamentId: string, playerId: string) {
  try {
    await prisma.challengeParticipant.create({
      data: {
        tournamentId,
        playerId
      }
    });
    revalidatePath(`/admin/challenges/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeChallengeParticipant(participantId: string, tournamentId: string) {
  try {
    await prisma.challengeParticipant.delete({ where: { id: participantId } });
    revalidatePath(`/admin/challenges/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveChallengeBracketData(tournamentId: string, bracketData: any) {
  try {
    await prisma.challengeTournament.update({
      where: { id: tournamentId },
      data: { bracketData: JSON.stringify(bracketData) }
    });
    revalidatePath(`/admin/challenges/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveChallengeGroupsData(tournamentId: string, groupsData: any) {
  try {
    await prisma.challengeTournament.update({
      where: { id: tournamentId },
      data: { groupsData: JSON.stringify(groupsData) }
    });
    revalidatePath(`/admin/challenges/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateChallengeSettings(tournamentId: string, data: { name: string, type: string, status: string }) {
  try {
    await prisma.challengeTournament.update({
      where: { id: tournamentId },
      data
    });
    revalidatePath(`/admin/challenges/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function awardChallengeTrophy(tournamentId: string, playerId: string, rank: 1 | 2 | 3) {
  try {
    const t = await prisma.challengeTournament.findUnique({ where: { id: tournamentId } });
    if (!t) throw new Error("Torneo no encontrado");

    let trophyName = "";
    if (rank === 1) trophyName = `Campeón ${t.name}`;
    if (rank === 2) trophyName = `2do Puesto ${t.name}`;
    if (rank === 3) trophyName = `3er Puesto ${t.name}`;

    // Find existing trophy for this rank and challenge
    const existing = await prisma.trophy.findFirst({
      where: {
        challengeId: tournamentId,
        name: trophyName
      }
    });

    if (existing) {
      await prisma.trophy.update({
        where: { id: existing.id },
        data: {
          playerId: playerId,
          type: "PLAYER" // ensure it's correct
        }
      });
    } else {
      await prisma.trophy.create({
        data: {
          name: trophyName,
          type: "PLAYER", // Must be PLAYER so it shows up in TrofeosJugadoresView
          challengeId: tournamentId,
          playerId: playerId
        }
      });
    }

    revalidatePath(`/admin/challenges/${tournamentId}`);
    revalidatePath("/challenges");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function finishChallenge(tournamentId: string) {
  try {
    await prisma.challengeTournament.update({
      where: { id: tournamentId },
      data: {
        status: "FINISHED",
        isActiveChallenge: false
      }
    });

    revalidatePath(`/admin/challenges/${tournamentId}`);
    revalidatePath("/challenges");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addMultipleChallengeParticipants(challengeId: string, textList: string) {
  try {
    const rawNicks = textList.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    const added: string[] = [];
    const notFound: string[] = [];
    const alreadyExists: string[] = [];

    const allPlayers = await prisma.player.findMany();
    
    for (const rawNick of rawNicks) {
      const lowerNick = rawNick.toLowerCase();
      const player = allPlayers.find(p => p.nick.toLowerCase() === lowerNick);
      
      if (!player) {
        notFound.push(rawNick);
        continue;
      }

      // Check if already in challenge
      const existing = await prisma.challengeParticipant.findFirst({
        where: { playerId: player.id, tournamentId: challengeId }
      });

      if (existing) {
        alreadyExists.push(player.nick);
      } else {
        await prisma.challengeParticipant.create({
          data: {
            playerId: player.id,
            tournamentId: challengeId
          }
        });
        added.push(player.nick);
      }
    }

    revalidatePath(`/admin/challenges/${challengeId}`);
    return { success: true, added, notFound, alreadyExists };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
