import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function mergePlayers(targetName, namesToMerge) {
  // Find target player
  let target = await prisma.player.findFirst({
    where: { nick: targetName }
  });
  
  if (!target) {
    // If target name doesn't exist exactly, maybe it exists with different casing, just grab the first one that matches
    target = await prisma.player.findFirst({
      where: { nick: { equals: targetName, mode: 'insensitive' } }
    });
    if (!target) {
      target = await prisma.player.create({ data: { nick: targetName } });
    }
  }

  // Find players to merge
  const playersToMerge = await prisma.player.findMany({
    where: { 
      nick: { in: namesToMerge, mode: 'insensitive' },
      id: { not: target.id }
    }
  });

  if (playersToMerge.length === 0) {
    console.log(`No players found to merge for ${targetName}`);
    return;
  }

  for (const p of playersToMerge) {
    console.log(`Merging player: ${p.nick} (ID: ${p.id}) -> ${target.nick}`);
    
    // Move matchStats
    await prisma.matchStat.updateMany({
      where: { playerId: p.id },
      data: { playerId: target.id }
    });

    // Move tournamentPlayers
    const tps = await prisma.tournamentPlayer.findMany({ where: { playerId: p.id } });
    for (const tp of tps) {
      // Check if target already is in this tournament team
      const existing = await prisma.tournamentPlayer.findFirst({
        where: { playerId: target.id, tournamentTeamId: tp.tournamentTeamId }
      });
      if (!existing) {
        await prisma.tournamentPlayer.update({
          where: { id: tp.id },
          data: { playerId: target.id }
        });
      } else {
        await prisma.tournamentPlayer.delete({ where: { id: tp.id } });
      }
    }

    // Finally delete the old player
    await prisma.player.delete({ where: { id: p.id } });
  }
}

async function mergeTeams(targetName, namesToMerge) {
  let target = await prisma.team.findFirst({
    where: { name: targetName }
  });
  if (!target) {
    target = await prisma.team.findFirst({
      where: { name: { equals: targetName, mode: 'insensitive' } }
    });
  }

  if (!target) {
    console.log(`Target team ${targetName} not found!`);
    return;
  }

  const teamsToMerge = await prisma.team.findMany({
    where: { 
      name: { in: namesToMerge, mode: 'insensitive' },
      id: { not: target.id }
    }
  });

  for (const t of teamsToMerge) {
    console.log(`Merging team: ${t.name} (ID: ${t.id}) -> ${target.name}`);

    // Update matches where team is home or away
    await prisma.match.updateMany({
      where: { homeTeamId: t.id },
      data: { homeTeamId: target.id }
    });
    await prisma.match.updateMany({
      where: { awayTeamId: t.id },
      data: { awayTeamId: target.id }
    });

    // Update tournamentTeam
    const tts = await prisma.tournamentTeam.findMany({ where: { teamId: t.id } });
    for (const tt of tts) {
      const existing = await prisma.tournamentTeam.findFirst({
        where: { teamId: target.id, tournamentId: tt.tournamentId }
      });
      if (!existing) {
        await prisma.tournamentTeam.update({
          where: { id: tt.id },
          data: { teamId: target.id }
        });
      } else {
        // Move players first
        await prisma.tournamentPlayer.updateMany({
          where: { tournamentTeamId: tt.id },
          data: { tournamentTeamId: existing.id }
        });
        await prisma.tournamentTeam.delete({ where: { id: tt.id } });
      }
    }

    // Update trophies
    await prisma.trophy.updateMany({
      where: { teamId: t.id },
      data: { teamId: target.id }
    });

    // Finally delete the old team
    await prisma.team.delete({ where: { id: t.id } });
  }
}

async function findSimilarPlayers() {
  const players = await prisma.player.findMany();
  const names = players.map(p => p.nick);
  const similarGroups = [];
  const processed = new Set();

  for (let i = 0; i < names.length; i++) {
    if (processed.has(names[i])) continue;
    const group = [names[i]];
    const base = names[i].toLowerCase().replace(/[^a-z0-9]/g, '');

    for (let j = i + 1; j < names.length; j++) {
      if (processed.has(names[j])) continue;
      const compare = names[j].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // If alphanumeric stripped strings match completely
      if (base === compare) {
        group.push(names[j]);
        processed.add(names[j]);
      } else if (base.length > 4 && compare.length > 4) {
        // Check for slight differences like trailing numbers
        if (base.startsWith(compare) || compare.startsWith(base)) {
          if (Math.abs(base.length - compare.length) <= 3) {
            group.push(names[j]);
            processed.add(names[j]);
          }
        }
      }
    }
    
    if (group.length > 1) {
      similarGroups.push(group);
    }
  }
  
  console.log("\nPotential duplicate players found:");
  for (const group of similarGroups) {
    console.log("- " + group.join('  |  '));
  }
}

async function main() {
  await mergePlayers("Griez", ["Griezman"]);
  await mergePlayers("Menino", ["MeninoNey"]);
  await mergePlayers("Doudougou", ["Doudou"]);
  console.log("Custom merges complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());
