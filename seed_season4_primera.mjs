import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Season 4 Primera Division...");

  const seasonName = "Temporada 4";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: false } });
  }

  const teamNames = ["Almagro", "Galaxy", "Botijas", "Spurs", "Leipzig", "Borussia"];
  const teamIds = {};

  for (const name of teamNames) {
    let team = await prisma.team.findFirst({ where: { name } });
    if (!team) {
      team = await prisma.team.create({ data: { name } });
      console.log(`Created team: ${name}`);
    }
    teamIds[name] = team.id;
  }

  // 1. LIGA DE PRIMERA DIVISIÓN
  const liga = await prisma.tournament.create({
    data: {
      seasonId: season.id,
      name: "Liga Primera División T4",
      format: "LEAGUE",
      category: "Primera División",
    }
  });

  for (const name of teamNames) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: liga.id, teamId: teamIds[name] }
    });
  }

  const ligaMatches = [
    // Fecha 1
    { home: "Almagro", away: "Galaxy", hScore: 2, aScore: 5, round: "Fecha 1" },
    { home: "Botijas", away: "Spurs", hScore: 0, aScore: 1, round: "Fecha 1" },
    { home: "Leipzig", away: "Borussia", hScore: 1, aScore: 0, round: "Fecha 1" },
    
    // Fecha 2
    { home: "Leipzig", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 2" },
    { home: "Galaxy", away: "Borussia", hScore: 8, aScore: 2, round: "Fecha 2" },
    { home: "Almagro", away: "Spurs", hScore: 1, aScore: 2, round: "Fecha 2" },

    // Fecha 3
    { home: "Almagro", away: "Leipzig", hScore: 0, aScore: 1, round: "Fecha 3" },
    { home: "Spurs", away: "Galaxy", hScore: 1, aScore: 2, round: "Fecha 3" },
    { home: "Borussia", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 3" },

    // Fecha 4
    { home: "Almagro", away: "Borussia", hScore: 4, aScore: 0, round: "Fecha 4" },
    { home: "Spurs", away: "Leipzig", hScore: 0, aScore: 0, round: "Fecha 4" },
    { home: "Galaxy", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 4" },

    // Fecha 5
    { home: "Almagro", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 5" },
    { home: "Spurs", away: "Borussia", hScore: 3, aScore: 0, round: "Fecha 5" },
    { home: "Leipzig", away: "Galaxy", hScore: 3, aScore: 1, round: "Fecha 5" },

    // Fecha 6
    { home: "Almagro", away: "Galaxy", hScore: 1, aScore: 1, round: "Fecha 6" },
    { home: "Botijas", away: "Spurs", hScore: 0, aScore: 1, round: "Fecha 6" },
    { home: "Leipzig", away: "Borussia", hScore: 1, aScore: 0, round: "Fecha 6" },

    // Fecha 7
    { home: "Leipzig", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 7" },
    { home: "Galaxy", away: "Borussia", hScore: 9, aScore: 1, round: "Fecha 7" },
    { home: "Almagro", away: "Spurs", hScore: 2, aScore: 2, round: "Fecha 7" },

    // Fecha 8
    { home: "Almagro", away: "Leipzig", hScore: 0, aScore: 4, round: "Fecha 8" },
    { home: "Spurs", away: "Galaxy", hScore: 1, aScore: 10, round: "Fecha 8" },
    { home: "Borussia", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 8" },

    // Fecha 9
    { home: "Almagro", away: "Borussia", hScore: 4, aScore: 2, round: "Fecha 9" },
    { home: "Spurs", away: "Leipzig", hScore: 1, aScore: 2, round: "Fecha 9" },
    { home: "Galaxy", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 9" },

    // Fecha 10
    { home: "Almagro", away: "Botijas", hScore: 1, aScore: 0, round: "Fecha 10" },
    { home: "Spurs", away: "Borussia", hScore: 11, aScore: 1, round: "Fecha 10" },
    { home: "Leipzig", away: "Galaxy", hScore: 1, aScore: 2, round: "Fecha 10" },

    // Final Desempate
    { home: "Galaxy", away: "Leipzig", hScore: 1, aScore: 0, round: "Final Desempate" }
  ];

  for (const m of ligaMatches) {
    await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: teamIds[m.home],
        awayTeamId: teamIds[m.away],
        homeScore: m.hScore,
        awayScore: m.aScore,
        status: "PLAYED",
        matchDate: new Date(),
        round: m.round
      }
    });
  }

  // Trophies for Liga
  await prisma.trophy.createMany({
    data: [
      { name: "Campeón (1er Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Galaxy"] },
      { name: "Subcampeón (2do Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Leipzig"] },
    ]
  });

  // ROSTERS & STATS
  const playerStats = {
    "Almagro": [
      { nick: "Amauri", goals: 1, assists: 3 },
      { nick: "Messi", goals: 4, assists: 0 },
      { nick: "MUTU", goals: 1, assists: 1 },
      { nick: "Thomy", goals: 0, assists: 2 },
      { nick: "Jeffguitar", goals: 0, assists: 0 },
      { nick: "Rafard", goals: 0, assists: 0 },
      { nick: "Leo Silva", goals: 0, assists: 0 },
    ],
    "Galaxy": [
      { nick: "JulianWeigl", goals: 10, assists: 5 },
      { nick: "Pedro A", goals: 3, assists: 2 },
      { nick: "Neymar", goals: 6, assists: 6 },
      { nick: "Rashford", goals: 1, assists: 3 },
      { nick: "Zakaria", goals: 1, assists: 2 },
      { nick: "Trapp", goals: 0, assists: 0 },
    ],
    "Leipzig": [
      { nick: "Brian", goals: 0, assists: 4 },
      { nick: "Jadsun", goals: 2, assists: 2 },
      { nick: "Harry Kane", goals: 5, assists: 1 },
      { nick: "Slade", goals: 0, assists: 0 },
      { nick: "Daniel", goals: 2, assists: 2 },
      { nick: "Reus", goals: 2, assists: 1 },
      { nick: "Bernd Leno", goals: 0, assists: 0 },
    ],
    "Borussia": [
      { nick: "Rodrigo", goals: 1, assists: 0 },
      { nick: "Piszczek", goals: 3, assists: 2 },
      { nick: "Witsel", goals: 1, assists: 0 },
      { nick: "Hummels", goals: 0, assists: 1 },
      { nick: "Sancho", goals: 1, assists: 3 },
    ],
    "Spurs": [
      { nick: "Tanganga", goals: 0, assists: 2 },
      { nick: "Not Found", goals: 2, assists: 1 },
      { nick: "Boop", goals: 0, assists: 0 },
      { nick: "Diogosena", goals: 1, assists: 0 },
      { nick: "Digne", goals: 3, assists: 0 },
      { nick: "Bergkamp", goals: 0, assists: 1 },
      { nick: "Cebolinha", goals: 0, assists: 0 },
    ]
  };

  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: liga.id }
  });

  for (const teamName of Object.keys(playerStats)) {
    const tId = teamIds[teamName];
    const tt = tournamentTeams.find(x => x.teamId === tId);
    if (!tt) continue;

    // Create the dummy match for this team
    const dummyMatch = await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: tId,
        awayTeamId: tId,
        homeScore: 0,
        awayScore: 0,
        status: "PLAYED",
        round: "Estadísticas Históricas",
        matchDate: new Date()
      }
    });

    const players = playerStats[teamName];
    for (const p of players) {
      let player = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: p.nick } });
      }

      // Add to roster
      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: tt.id, playerId: player.id }
      });

      // Add dummy stats
      await prisma.matchStat.create({
        data: {
          matchId: dummyMatch.id,
          playerId: player.id,
          goals: p.goals,
          assists: p.assists,
          matchTime: 90
        }
      });
    }
  }

  console.log("Season 4 Primera Division Seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
