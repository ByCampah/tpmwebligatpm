import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teamsData = [
  {
    name: "Almagro",
    players: [
      { nick: "Campah", goals: 4, assists: 4 },
      { nick: "Baresi", goals: 2, assists: 8 },
      { nick: "JulianWeigl", goals: 21, assists: 3 },
      { nick: "De Gea", goals: 0, assists: 0 },
      { nick: "Lixtinhos", goals: 2, assists: 2 },
      { nick: "Harry Kane", goals: 8, assists: 3 },
      { nick: "Haze", goals: 5, assists: 5 },
      { nick: "Titolatola", goals: 0, assists: 0 },
      { nick: "Zeus", goals: 0, assists: 0 },
    ]
  },
  {
    name: "Juventus",
    players: [
      { nick: "Dybala", goals: 9, assists: 5 },
      { nick: "Imperador", goals: 13, assists: 10 },
      { nick: "CoutoAis", goals: 0, assists: 1 },
      { nick: "Slade", goals: 0, assists: 1 },
      { nick: "Bit", goals: 0, assists: 2 },
      { nick: "Andrigo", goals: 0, assists: 0 },
      { nick: "Tur-Sama", goals: 0, assists: 0 },
      { nick: "Mutu", goals: 1, assists: 0 },
      { nick: "Hazard", goals: 2, assists: 5 },
    ]
  },
  {
    name: "Formandos",
    players: [
      { nick: "Valdivia", goals: 0, assists: 0 },
      { nick: "Terry", goals: 0, assists: 1 },
      { nick: "Hummels", goals: 0, assists: 0 },
      { nick: "Ze Elias", goals: 3, assists: 2 },
      { nick: "Magossuel", goals: 2, assists: 3 },
      { nick: "Juninho", goals: 3, assists: 2 },
      { nick: "Reus", goals: 7, assists: 1 },
      { nick: "Amauri", goals: 8, assists: 6 },
    ]
  },
  {
    name: "RBH",
    players: [
      { nick: "Rodri", goals: 14, assists: 3 },
      { nick: "Digne", goals: 8, assists: 1 },
      { nick: "Santucho", goals: 0, assists: 3 },
      { nick: "Marmota", goals: 0, assists: 0 },
      { nick: "Bergkamp", goals: 1, assists: 3 },
      { nick: "Beng", goals: 5, assists: 8 },
      { nick: "Thiagow", goals: 0, assists: 0 },
      { nick: "Bolivar", goals: 0, assists: 1 },
    ]
  },
  {
    name: "Milan",
    players: [
      { nick: "Rafard", goals: 2, assists: 2 },
      { nick: "Diogo", goals: 0, assists: 1 },
      { nick: "Fuinha", goals: 2, assists: 0 },
      { nick: "Suave", goals: 2, assists: 0 },
      { nick: "Baron", goals: 1, assists: 0 },
      { nick: "Boop", goals: 0, assists: 2 },
      { nick: "Trapp", goals: 2, assists: 2 },
      { nick: "Jadsun", goals: 0, assists: 0 },
    ]
  },
  {
    name: "Platense",
    players: [
      { nick: "GetLow", goals: 1, assists: 0 },
      { nick: "Madru", goals: 3, assists: 5 },
      { nick: "Sam", goals: 1, assists: 0 },
      { nick: "Gonzaff", goals: 0, assists: 0 },
      { nick: "Coutinho", goals: 6, assists: 0 },
      { nick: "Thomy", goals: 1, assists: 1 },
      { nick: "Vargas", goals: 1, assists: 1 },
      { nick: "Stuani", goals: 0, assists: 1 },
      { nick: "Gunter", goals: 2, assists: 0 },
    ]
  }
];

async function main() {
  console.log("Wiping Database...");
  await prisma.matchStat.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.tournamentPlayer.deleteMany({});
  await prisma.tournamentTeam.deleteMany({});
  await prisma.trophy.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.season.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.team.deleteMany({});

  console.log("Creating Season and Tournaments...");
  const season1 = await prisma.season.create({
    data: { name: "Temporada 1" }
  });

  const ligaT1 = await prisma.tournament.create({
    data: { name: "Liga T1", format: "LIGA", seasonId: season1.id }
  });

  const copaT1 = await prisma.tournament.create({
    data: { name: "Copa T1", format: "COPA", seasonId: season1.id }
  });

  console.log("Creating Teams and Players...");
  for (const tData of teamsData) {
    const team = await prisma.team.create({
      data: { name: tData.name }
    });

    const ligaTeam = await prisma.tournamentTeam.create({
      data: { tournamentId: ligaT1.id, teamId: team.id }
    });
    const copaTeam = await prisma.tournamentTeam.create({
      data: { tournamentId: copaT1.id, teamId: team.id }
    });

    console.log(`Created Team: ${team.name}`);

    for (const pData of tData.players) {
      const player = await prisma.player.create({
        data: { nick: pData.nick }
      });

      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: ligaTeam.id, playerId: player.id }
      });
      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: copaTeam.id, playerId: player.id }
      });
    }
  }

  const createdTeams = await prisma.team.findMany();
  const pairs = [
    [createdTeams[0], createdTeams[1]], // Almagro vs Juventus
    [createdTeams[2], createdTeams[3]], // Formandos vs RBH
    [createdTeams[4], createdTeams[5]]  // Milan vs Platense
  ];

  console.log("Creating Historical Matches and Stats...");

  for (const pair of pairs) {
    const homeTeam = pair[0];
    const awayTeam = pair[1];

    const match = await prisma.match.create({
      data: {
        tournamentId: ligaT1.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        status: "PLAYED",
        round: "Estadísticas Históricas",
        matchDate: new Date("2024-01-01T12:00:00Z"),
      }
    });

    let homeScore = 0;
    let awayScore = 0;

    for (const teamObj of [homeTeam, awayTeam]) {
      const isHome = teamObj.id === homeTeam.id;
      const tData = teamsData.find(t => t.name === teamObj.name);
      
      const players = await prisma.player.findMany({
        where: { nick: { in: tData.players.map(p => p.nick) } }
      });

      for (const p of tData.players) {
        const dbPlayer = players.find(x => x.nick === p.nick);
        if (dbPlayer) {
          if (isHome) homeScore += p.goals;
          if (!isHome) awayScore += p.goals;

          await prisma.matchStat.create({
            data: {
              matchId: match.id,
              playerId: dbPlayer.id,
              goals: p.goals,
              assists: p.assists,
              matchTime: 90,
              cleanSheet: false
            }
          });
        }
      }
    }

    await prisma.match.update({
      where: { id: match.id },
      data: { homeScore, awayScore }
    });

    console.log(`Match created: ${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}`);
  }

  console.log("Seeding Complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
