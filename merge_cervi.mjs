import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.player.findUnique({ where: { nick: 'Cervi' } });
  const p2 = await prisma.player.findUnique({ where: { nick: 'Cerviyb' } });

  if (!p1 && !p2) {
    console.log("Neither player exists yet. No merge needed.");
    return;
  }

  if (p1 && !p2) {
    console.log("Only Cervi exists. Renaming to Cerviyb.");
    await prisma.player.update({
      where: { id: p1.id },
      data: { nick: 'Cerviyb' }
    });
    return;
  }

  if (!p1 && p2) {
    console.log("Only Cerviyb exists. All good.");
    return;
  }

  // Both exist. Merge Cervi into Cerviyb.
  console.log("Merging Cervi into Cerviyb...");
  
  // Reassign MatchStats
  await prisma.matchStat.updateMany({
    where: { playerId: p1.id },
    data: { playerId: p2.id }
  });

  // Reassign TournamentPlayers
  // Since a player could theoretically be registered to the same tournament twice (if they changed teams, though rare), 
  // we just move them over if Cerviyb isn't already registered for that tournament.
  const p1Tournaments = await prisma.tournamentPlayer.findMany({ where: { playerId: p1.id } });
  for (const t of p1Tournaments) {
    const existing = await prisma.tournamentPlayer.findUnique({
      where: {
        tournamentId_playerId: { tournamentId: t.tournamentId, playerId: p2.id }
      }
    });
    if (!existing) {
      await prisma.tournamentPlayer.update({
        where: { id: t.id },
        data: { playerId: p2.id }
      });
    } else {
      // Just delete the duplicate registration
      await prisma.tournamentPlayer.delete({ where: { id: t.id } });
    }
  }

  // Same for trophies if they exist
  await prisma.trophy.updateMany({
    where: { playerId: p1.id },
    data: { playerId: p2.id }
  });

  // Finally delete Cervi
  await prisma.player.delete({ where: { id: p1.id } });
  console.log("Merge complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
