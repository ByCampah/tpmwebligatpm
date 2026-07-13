import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Temporada 1 x8 (2021) seeding...");

  let season = await prisma.season.findUnique({ where: { name: "Temporada 1 x8 (2021)" } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: "Temporada 1 x8 (2021)"
      }
    });
  }
  console.log(`Created Season: ${season.name}`);

  let cat = await prisma.category.findUnique({ where: { name: "Liga TPM" } });
  if (!cat) {
    cat = await prisma.category.create({ data: { name: "Liga TPM" } });
  }

  // Cleanup old tournament in this season to avoid duplicates
  const existingTors = await prisma.tournament.findMany({ where: { seasonId: season.id } });
  for (const t of existingTors) {
    await prisma.matchStat.deleteMany({ where: { match: { tournamentId: t.id } } });
    await prisma.match.deleteMany({ where: { tournamentId: t.id } });
    await prisma.tournamentPlayer.deleteMany({ where: { tournamentTeam: { tournamentId: t.id } } });
    await prisma.tournamentTeam.deleteMany({ where: { tournamentId: t.id } });
    await prisma.tournament.delete({ where: { id: t.id } });
  }

  const tournament = await prisma.tournament.create({
    data: {
      name: "Liga TPM",
      season: { connect: { id: season.id } },
      category: { connect: { id: cat.id } },
      format: "LEAGUE",
      isOfficial: true
    }
  });
  console.log(`Created Tournament: ${tournament.name}`);

  // 2. Resolve Teams
  const teamNames = [
    { name: "Red Bull Haxball", alias: "Red Bull Haxball" },
    { name: "Lyon", alias: "Lyon" },
    { name: "Warriors", alias: "Warriors" },
    { name: "Fiorentina", alias: "Fiorentina" },
    { name: "Vasco", alias: "Vasco" },
    { name: "Juventude", alias: "Juventude" }
  ];

  const teamIdMap = {};
  for (const t of teamNames) {
    let team = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { equals: t.name } },
          { name: { equals: t.alias } }
        ]
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: { name: t.name, isNationalTeam: false }
      });
      console.log(`Created Team: ${t.name}`);
    } else {
      console.log(`Found Team: ${team.name} for ${t.name}`);
    }
    teamIdMap[t.name] = team.id;
  }

  // Final Standings Data
  const standingsData = [
    { name: "Red Bull Haxball", pts: 25, j: 10, v: 8, e: 1, d: 1, gf: 41, gc: 8, dif: 33 },
    { name: "Lyon", pts: 20, j: 10, v: 6, e: 2, d: 2, gf: 29, gc: 5, dif: 24 },
    { name: "Vasco", pts: 16, j: 10, v: 5, e: 1, d: 4, gf: 8, gc: 28, dif: -20 },
    { name: "Fiorentina", pts: 16, j: 10, v: 5, e: 1, d: 4, gf: 25, gc: 17, dif: 8 },
    { name: "Juventude", pts: 3, j: 10, v: 1, e: 0, d: 9, gf: 9, gc: 50, dif: -41 },
    { name: "Warriors", pts: 6, j: 10, v: 1, e: 3, d: 6, gf: 4, gc: 7, dif: -3 }
  ];

  const tournamentTeamsMap = {};
  for (let i = 0; i < standingsData.length; i++) {
    const s = standingsData[i];
    const tTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournament.id,
        teamId: teamIdMap[s.name],
        group: "A", // single group for league
        manualPoints: s.pts,
        manualGamesPlayed: s.j,
        manualWins: s.v,
        manualDraws: s.e,
        manualLosses: s.d,
        manualGoalsFor: s.gf,
        manualGoalsAgainst: s.gc
      }
    });
    tournamentTeamsMap[s.name] = tTeam.id;
  }
  console.log("Registered teams to tournament and created final standings.");

  // 3. Resolve Players and load stats
  const rosters = {
    "Red Bull Haxball": [
      { nick: "Digne", g: 7, a: 1, pj: 9 },
      { nick: "Zakaria", g: 1, a: 2, pj: 9 },
      { nick: "Ruan404", g: 1, a: 1, pj: 9 },
      { nick: "KokePizzaiolo", g: 2, a: 1, pj: 9 },
      { nick: "Harry Kane", g: 5, a: 4, pj: 9 },
      { nick: "Campah", g: 4, a: 6, pj: 9 },
      { nick: "Griezz", g: 7, a: 1, pj: 8 },
      { nick: "Bernd Leno", g: 0, a: 0, pj: 4 },
      { nick: "Rafard", g: 0, a: 0, pj: 3 },
      { nick: "Thomy", g: 2, a: 0, pj: 3 },
      { nick: "Hazard", g: 2, a: 1, pj: 2 }
    ],
    "Lyon": [
      { nick: "Jadsun", g: 2, a: 3, pj: 7 },
      { nick: "Slade", g: 0, a: 0, pj: 7 },
      { nick: "Busquets", g: 0, a: 0, pj: 6 },
      { nick: "Kepa", g: 2, a: 0, pj: 6 },
      { nick: "JulianWeigl", g: 14, a: 3, pj: 6 },
      { nick: "Madru", g: 2, a: 0, pj: 5 },
      { nick: "Victorz", g: 0, a: 2, pj: 5 },
      { nick: "Vlady", g: 2, a: 4, pj: 5 },
      { nick: "Brian", g: 1, a: 0, pj: 4 },
      { nick: "Rashford", g: 0, a: 1, pj: 3 },
      { nick: "Halsey", g: 0, a: 2, pj: 1 }
    ],
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
      { nick: "GWY do acb", g: 1, a: 0, pj: 8 }, // Use GWY do ACB maybe? We will check if "GWY do acb" exists
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

  const allDbPlayers = await prisma.player.findMany();
  const playerMap = new Map();
  allDbPlayers.forEach(p => {
    playerMap.set(p.nick.toLowerCase(), p);
  });

  const allMatchStatsToInsert = [];

  for (const [teamName, players] of Object.entries(rosters)) {
    const teamId = teamIdMap[teamName];
    
    // Register players to team and get their DB entries
    const dbPlayers = [];
    for (const p of players) {
      const lowerNick = p.nick.toLowerCase();
      let dbPlayer = playerMap.get(lowerNick);
      
      if (!dbPlayer) {
        dbPlayer = await prisma.player.create({
          data: { nick: p.nick, nationality: "AR" }
        });
        playerMap.set(lowerNick, dbPlayer);
        console.log(`Created Player: ${p.nick}`);
      }
      dbPlayers.push({ req: p, db: dbPlayer });

      // Link player to tournament
      await prisma.tournamentPlayer.create({
        data: {
          player: { connect: { id: dbPlayer.id } },
          tournamentTeam: { connect: { id: tournamentTeamsMap[teamName] } }
        }
      });
    }

    // Stats match (Goles, Asistencias y PJ)
    const matchStats = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: teamId,
        awayTeamId: teamId,
        homeScore: players.reduce((sum, p) => sum + p.g, 0),
        awayScore: 0,
        status: "PLAYED",
        matchDate: new Date("2021-12-01T00:00:00Z"),
        round: "Estadísticas Históricas"
      }
    });

    for (const p of dbPlayers) {
      allMatchStatsToInsert.push({
        matchId: matchStats.id,
        playerId: p.db.id,
        goals: p.req.g,
        assists: p.req.a,
        matchTime: p.req.pj
      });
    }
  }

  // Insert all MatchStats at once
  await prisma.matchStat.createMany({
    data: allMatchStatsToInsert
  });

  console.log(`Inserted ${allMatchStatsToInsert.length} match stats in total.`);
  console.log("Temporada 1 x8 (2021) seeded successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
