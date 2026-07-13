import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const t1x8Rosters = {
  "Warriors": [
    { nick: "Osman", g: 0, a: 0, pj: 4 },
    { nick: "-Martinelli", g: 0, a: 0, pj: 4 },
    { nick: "Mertens", g: 2, a: 0, pj: 5 },
    { nick: "Felipe Ronaldo", g: 1, a: 0, pj: 3 },
    { nick: "Aduriz", g: 0, a: 0, pj: 4 },
    { nick: "M U T U", g: 0, a: 0, pj: 5 },
    { nick: "Kyrie Develing", g: 1, a: 0, pj: 3 },
    { nick: "Stan", g: 0, a: 0, pj: 2 },
    { nick: "Soneca", g: 0, a: 0, pj: 3 },
    { nick: "Postinho", g: 0, a: 0, pj: 3 },
    { nick: "Toni", g: 0, a: 0, pj: 1 },
    { nick: "Aqua", g: 0, a: 0, pj: 1 }
  ],
  "Fiorentina": [
    { nick: "Diogosena", g: 0, a: 2, pj: 7 },
    { nick: "Richarlison", g: 9, a: 1, pj: 7 },
    { nick: "Insigne", g: 3, a: 1, pj: 7 },
    { nick: "Pedro a", g: 1, a: 2, pj: 6 },
    { nick: "Baroniesta", g: 0, a: 1, pj: 6 },
    { nick: "KepArrizabalaga", g: 0, a: 0, pj: 4 },
    { nick: "Daring", g: 1, a: 1, pj: 4 },
    { nick: "PauloDybala", g: 0, a: 1, pj: 2 },
    { nick: "Magic Jonsen", g: 0, a: 0, pj: 2 },
    { nick: "Paulinho", g: 1, a: 1, pj: 2 },
    { nick: "Jeffguitar", g: 0, a: 0, pj: 2 },
    { nick: "Mertersacker", g: 0, a: 0, pj: 1 }
  ],
  "Vasco": [
    { nick: "Ramonzin", g: 0, a: 0, pj: 6 },
    { nick: "DeLigt", g: 0, a: 0, pj: 5 },
    { nick: "VitinhoCruz", g: 0, a: 1, pj: 4 },
    { nick: "Mansi", g: 1, a: 0, pj: 4 },
    { nick: "lSantos", g: 0, a: 0, pj: 2 },
    { nick: "Mate", g: 0, a: 0, pj: 2 },
    { nick: "Cerviyb", g: 2, a: 0, pj: 2 },
    { nick: "Frank Fabra", g: 2, a: 2, pj: 2 },
    { nick: "SSJBald", g: 0, a: 0, pj: 2 },
    { nick: "GabZa", g: 0, a: 0, pj: 1 },
    { nick: "F.Torres", g: 0, a: 0, pj: 1 },
    { nick: "Gabo Moreti", g: 0, a: 0, pj: 1 }
  ],
  "Juventude": [
    { nick: "Lucas2000", g: 0, a: 1, pj: 8 },
    { nick: "GWY do acb", g: 1, a: 0, pj: 8 }, 
    { nick: "Mascara", g: 3, a: 2, pj: 7 },
    { nick: "IsaacBatata", g: 0, a: 1, pj: 7 },
    { nick: "Renan", g: 2, a: 0, pj: 7 },
    { nick: "Kjaer", g: 0, a: 1, pj: 3 },
    { nick: "Damascenos", g: 0, a: 0, pj: 3 },
    { nick: "Joazito", g: 0, a: 0, pj: 3 },
    { nick: "PedroX", g: 0, a: 0, pj: 2 },
    { nick: "Manoel", g: 0, a: 0, pj: 1 },
    { nick: "Logan_", g: 0, a: 0, pj: 1 }
  ]
};

const t11Rosters = {
  "Big Fish": [
    { nick: "Diogosena", g: 2, a: 1, pj: 7 },
    { nick: "ElderAC", g: 0, a: 0, pj: 6 },
    { nick: "Gabriel JR", g: 3, a: 2, pj: 8 },
    { nick: "Gwy do acb", g: 2, a: 0, pj: 6 },
    { nick: "Lucas2000", g: 0, a: 0, pj: 3 },
    { nick: "Ruan404", g: 0, a: 0, pj: 4 },
    { nick: "Skorps", g: 0, a: 0, pj: 8 },
    { nick: "Leleg", g: 0, a: 0, pj: 1 },
    { nick: "Amielkpo", g: 0, a: 0, pj: 1 },
    { nick: "Kokepizzaiolo", g: 1, a: 1, pj: 3 }
  ],
  "Almagro": [
    { nick: "Aqua", g: 0, a: 0, pj: 3 },
    { nick: "Campah", g: 5, a: 0, pj: 4 },
    { nick: "Zakaria", g: 0, a: 2, pj: 3 },
    { nick: "Digne", g: 1, a: 0, pj: 2 },
    { nick: "Pedro a", g: 1, a: 2, pj: 2 },
    { nick: "Sanjiro", g: 1, a: 1, pj: 3 },
    { nick: "Thomy", g: 0, a: 0, pj: 4 },
    { nick: "Haze", g: 0, a: 0, pj: 1 },
    { nick: "Richarlison", g: 1, a: 0, pj: 1 }
  ],
  "Insight": [
    { nick: "F.Totti", g: 1, a: 4, pj: 6 },
    { nick: "Harry Kane", g: 4, a: 2, pj: 7 },
    { nick: "Hazard", g: 3, a: 0, pj: 6 },
    { nick: "LeoMD", g: 0, a: 0, pj: 3 },
    { nick: "Madru", g: 0, a: 0, pj: 2 },
    { nick: "Marmota", g: 0, a: 1, pj: 7 },
    { nick: "Mansi", g: 4, a: 1, pj: 6 },
    { nick: "Veiga", g: 0, a: 0, pj: 1 },
    { nick: "Moutinho", g: 0, a: 0, pj: 1 },
    { nick: "Oliveira", g: 0, a: 0, pj: 1 }
  ]
};

async function createMissing(seasonName, rosters) {
  const s = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!s) return;
  const tor = await prisma.tournament.findFirst({ where: { seasonId: s.id } });
  if (!tor) return;

  console.log(`Checking ${seasonName}...`);

  for (const [teamName, players] of Object.entries(rosters)) {
    let team = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { equals: teamName, mode: 'insensitive' } }
        ]
      }
    });

    if (!team) continue;

    const existing = await prisma.match.findFirst({
      where: {
        tournamentId: tor.id,
        homeTeamId: team.id,
        round: "Estadísticas Históricas"
      }
    });

    if (existing) {
      console.log(`- ${teamName} already has match`);
      continue;
    }

    console.log(`- Creating match for ${teamName}...`);
    
    const m = await prisma.match.create({
      data: {
        tournamentId: tor.id,
        homeTeamId: team.id,
        awayTeamId: team.id,
        homeScore: 0,
        awayScore: 0,
        status: "PLAYED",
        matchDate: new Date(),
        round: "Estadísticas Históricas"
      }
    });

    let tTeam = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tor.id, teamId: team.id } }
    });

    if (!tTeam) {
       tTeam = await prisma.tournamentTeam.create({
         data: { tournamentId: tor.id, teamId: team.id, group: "A" }
       });
    }

    let statsToInsert = [];
    let tPlayersToInsert = [];

    for (const p of players) {
      let dbPlayer = await prisma.player.findFirst({
        where: { nick: { equals: p.nick, mode: 'insensitive' } }
      });
      if (!dbPlayer) {
        dbPlayer = await prisma.player.create({ data: { nick: p.nick } });
      }

      const tp = await prisma.tournamentPlayer.findUnique({
        where: { tournamentTeamId_playerId: { tournamentTeamId: tTeam.id, playerId: dbPlayer.id } }
      });
      if (!tp) {
        tPlayersToInsert.push({ tournamentTeamId: tTeam.id, playerId: dbPlayer.id });
      }

      statsToInsert.push({
        matchId: m.id,
        playerId: dbPlayer.id,
        goals: p.g || 0,
        assists: p.a || 0,
        matchTime: p.pj || 0
      });
    }
    
    if (tPlayersToInsert.length > 0) {
      await prisma.tournamentPlayer.createMany({ data: tPlayersToInsert, skipDuplicates: true });
    }
    
    if (statsToInsert.length > 0) {
      await prisma.matchStat.createMany({ data: statsToInsert });
    }
  }
}

async function main() {
  await createMissing("Temporada 1 x8 (2021)", t1x8Rosters);
  await createMissing("Temporada 11 (2023)", t11Rosters);
  console.log("Done!");
}
main().finally(() => prisma.$disconnect());
