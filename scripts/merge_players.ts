import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function mergePlayers(targetNick: string, aliasesToMerge: string[]) {
  console.log(`Starting merge into ${targetNick}...`);
  
  // Find all players
  const allAliases = [...aliasesToMerge, targetNick];
  const players = await prisma.player.findMany({
    where: {
      nick: { in: allAliases }
    }
  });

  if (players.length === 0) {
    console.log("No players found.");
    return;
  }

  console.log("Found players:");
  players.forEach(p => console.log(`- ${p.nick} (${p.id})`));

  // Determine the primary player. If targetNick exists, use it. Otherwise, use the first one and rename it.
  let primaryPlayer = players.find(p => p.nick.toLowerCase() === targetNick.toLowerCase());
  
  if (!primaryPlayer) {
    primaryPlayer = players[0];
    console.log(`Target player ${targetNick} not found. Renaming ${primaryPlayer.nick} to ${targetNick}.`);
    primaryPlayer = await prisma.player.update({
      where: { id: primaryPlayer.id },
      data: { nick: targetNick }
    });
  } else {
    console.log(`Primary player is ${primaryPlayer.nick} (${primaryPlayer.id})`);
  }

  const secondaryPlayers = players.filter(p => p.id !== primaryPlayer!.id);

  if (secondaryPlayers.length === 0) {
    console.log("No secondary players to merge. Done.");
    return;
  }

  for (const sp of secondaryPlayers) {
    console.log(`Merging ${sp.nick} (${sp.id}) into ${primaryPlayer.id}...`);

    // Merge TournamentPlayer
    const spTPs = await prisma.tournamentPlayer.findMany({ where: { playerId: sp.id } });
    for (const tp of spTPs) {
      // Check if primary already has this TournamentTeam
      const existing = await prisma.tournamentPlayer.findUnique({
        where: {
          tournamentTeamId_playerId: {
            tournamentTeamId: tp.tournamentTeamId,
            playerId: primaryPlayer.id
          }
        }
      });
      if (!existing) {
        await prisma.tournamentPlayer.update({
          where: { id: tp.id },
          data: { playerId: primaryPlayer.id }
        });
      } else {
        // Already exists, just delete the duplicate
        await prisma.tournamentPlayer.delete({ where: { id: tp.id } });
      }
    }

    // Merge MatchStat
    const spStats = await prisma.matchStat.findMany({ where: { playerId: sp.id } });
    for (const st of spStats) {
      const existing = await prisma.matchStat.findUnique({
        where: {
          matchId_playerId: {
            matchId: st.matchId,
            playerId: primaryPlayer.id
          }
        }
      });
      if (!existing) {
        await prisma.matchStat.update({
          where: { id: st.id },
          data: { playerId: primaryPlayer.id }
        });
      } else {
        // Merge stats if they both have entries for the same match? 
        // This is extremely rare, but if it happens, we'll just delete the secondary for now, 
        // or add them up. Let's add them up to be safe.
        await prisma.matchStat.update({
          where: { id: existing.id },
          data: {
            matchTime: existing.matchTime + st.matchTime,
            goals: existing.goals + st.goals,
            assists: existing.assists + st.assists,
            cleanSheet: existing.cleanSheet || st.cleanSheet
          }
        });
        await prisma.matchStat.delete({ where: { id: st.id } });
      }
    }

    // Merge Trophies
    await prisma.trophy.updateMany({
      where: { playerId: sp.id },
      data: { playerId: primaryPlayer.id }
    });

    // Delete User association if any (rare)
    await prisma.user.updateMany({
      where: { playerId: sp.id },
      data: { playerId: primaryPlayer.id }
    });

    // Finally delete the player
    await prisma.player.delete({ where: { id: sp.id } });
    console.log(`Deleted player ${sp.nick}`);
  }

  console.log("Merge complete!");
}

const target = "Victorz";
const aliases = ["M.Reus", "Reusinho", "Reus"];

mergePlayers(target, aliases)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
