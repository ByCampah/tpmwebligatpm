import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teamsData = [
  {
    name: "Almagro",
    players: [
      { nick: "Haze", goals: 7, assists: 0 },
      { nick: "JulianWeigl", goals: 6, assists: 4 },
      { nick: "Baresi", goals: 0, assists: 4 },
      { nick: "Campah", goals: 0, assists: 0 },
      { nick: "Sam", goals: 0, assists: 0 },
      { nick: "De Gea", goals: 0, assists: 0 },
      { nick: "Benatia", goals: 0, assists: 0 },
    ]
  },
  {
    name: "Juventus",
    players: [
      { nick: "Dybala", goals: 1, assists: 3 },
      { nick: "Imperador", goals: 4, assists: 2 },
      { nick: "Kante", goals: 0, assists: 0 },
      { nick: "Coutinho", goals: 1, assists: 0 },
      { nick: "Lixtinhos", goals: 0, assists: 0 },
      { nick: "Magossuel", goals: 1, assists: 2 },
      { nick: "Van dijk", goals: 0, assists: 0 },
    ]
  },
  {
    name: "Platense",
    players: [
      { nick: "Vargas", goals: 1, assists: 0 },
      { nick: "GetLow", goals: 0, assists: 1 },
      { nick: "Thomy", goals: 0, assists: 0 },
      { nick: "Nicosd", goals: 0, assists: 0 },
      { nick: "Santucho", goals: 0, assists: 0 },
      { nick: "JuninhoPlay", goals: 0, assists: 0 },
      { nick: "Trapp", goals: 0, assists: 0 },
    ]
  },
  {
    name: "RBH",
    players: [
      { nick: "Rodri", goals: 3, assists: 2 },
      { nick: "Bergkamp", goals: 0, assists: 0 },
      { nick: "Amauri", goals: 5, assists: 0 },
      { nick: "Reinaldo", goals: 0, assists: 0 },
      { nick: "Mutu", goals: 0, assists: 0 },
      { nick: "Hummels", goals: 0, assists: 0 },
      { nick: "Roberto Carlos", goals: 0, assists: 3 },
      { nick: "Digne", goals: 3, assists: 0 },
    ]
  },
  {
    name: "Fiorentina",
    players: [
      { nick: "Madru", goals: 0, assists: 3 },
    ]
  },
  {
    name: "Insight",
    players: [
      { nick: "Chamito", goals: 0, assists: 0 },
      { nick: "Harry Kane", goals: 7, assists: 4 },
      { nick: "Hazard", goals: 0, assists: 2 },
      { nick: "Grafinho", goals: 5, assists: 2 },
      { nick: "Guisinho", goals: 0, assists: 0 },
      { nick: "Fuinha", goals: 0, assists: 0 },
      { nick: "Pique", goals: 0, assists: 0 },
    ]
  },
  {
    name: "Astros",
    players: []
  },
  {
    name: "Blacky",
    players: []
  }
];

const matchesRaw = `Fecha 1		
Almagro	0 - 3	RBH
Juventus	7 - 1	Platense
Astros	0 - 4	Insight
Blacky	0 - 2	Fiorentina
Team 1		Team 2
Fecha 2		
Almagro	9 - 1	Platense
RBH	2 - 2	Insight
Juventus	3 - 3	Fiorentina
Astros	0 - 0	Blacky
Team 1		Team 2
Fecha 3		
Almagro	2 - 0	Insight
Platense	0 - 1	Fiorentina
RBH	8 - 0	Blacky
Juventus	0 - 1	Astros
Team 1		Team 2
Fecha 4		
Almagro	3 - 1	Juventus
Astros	2 - 3	RBH
Blacky	0 - 0	Platense
Fiorentina	1 - 4	Insight
Team 1		Team 2
Fecha 5		
Almagro	0 - 0	Astros
Blacky	0 - 0	Juventus
Fiorentina	1 - 1	RBH
Insight	15 - 2	Platense
Team 1		Team 2
Fecha 6		
Almagro	0 - 0	Blacky
Fiorentina	0 - 0	Astros
Insight	4 - 1	Juventus
Platense	0 - 1	RBH
Team 1		Team 2
Fecha 7		
Almagro	5 - 1	Fiorentina
Insight	0 - 0	Blacky
Platense	0 - 0	Astros
RBH	2 - 0	Juventus
Team 1		Team 2
Fecha 8		
Almagro	1 - 0	RBH
Juventus	0 - 0	Platense
Astros	0 - 0	Insight
Blacky	0 - 0	Fiorentina
Team 1		Team 2
Fecha 9		
Almagro	0 - 0	Platense
RBH	1 - 1	Insight
Juventus	0 - 0	Fiorentina
Astros	0 - 0	Blacky
Team 1		Team 2
Fecha 10		
Almagro	2 - 1	Insight
Platense	0 - 0	Fiorentina
RBH	0 - 0	Blacky
Juventus	0 - 0	Astros
Team 1		Team 2
Fecha 11		
Almagro	1 - 1	Juventus
Astros	0 - 0	RBH
Blacky	0 - 0	Platense
Fiorentina	2 - 2	Insight
Team 1		Team 2
Fecha 12		
Almagro	0 - 0	Astros
Blacky	0 - 0	Juventus
Fiorentina	0 - 2	RBH
Insight	6 - 2	Platense
Team 1		Team 2
Fecha 13		
Almagro	0 - 0	Blacky
Fiorentina	0 - 0	Astros
Insight	1 - 0	Juventus
Platense	0 - 0	RBH
Team 1		Team 2
Fecha 14		
Almagro	4 - 2	Fiorentina
Insight	0 - 0	Blacky
Platense	0 - 0	Astros
RBH	3 - 2	Juventus`;

async function main() {
  console.log("Deactivating old seasons...");
  await prisma.season.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  console.log("Creating Season 2...");
  const season2 = await prisma.season.create({
    data: { name: "Temporada 2", isActive: true }
  });

  const ligaT2 = await prisma.tournament.create({
    data: { name: "Liga T2", format: "LIGA", seasonId: season2.id }
  });

  const copaT2 = await prisma.tournament.create({
    data: { name: "Copa T2", format: "COPA", seasonId: season2.id }
  });

  console.log("Upserting Teams and Players...");
  for (const tData of teamsData) {
    let team = await prisma.team.findUnique({
      where: { name: tData.name }
    });

    if (!team) {
      team = await prisma.team.create({
        data: { name: tData.name }
      });
      console.log(`Created Team: ${team.name}`);
    }

    const ligaTeam = await prisma.tournamentTeam.create({
      data: { tournamentId: ligaT2.id, teamId: team.id }
    });
    const copaTeam = await prisma.tournamentTeam.create({
      data: { tournamentId: copaT2.id, teamId: team.id }
    });

    for (const pData of tData.players) {
      let player = await prisma.player.findUnique({
        where: { nick: pData.nick }
      });

      if (!player) {
        player = await prisma.player.create({
          data: { nick: pData.nick }
        });
      }

      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: ligaTeam.id, playerId: player.id }
      });
      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: copaTeam.id, playerId: player.id }
      });
    }
  }

  // Create Dummy Matches
  console.log("Creating Historical Dummy Matches...");
  const tMap = new Map();
  const dbTeams = await prisma.team.findMany();
  for (const t of dbTeams) {
    tMap.set(t.name, t);
  }

  const pairs = [
    ["Almagro", "Juventus"],
    ["Platense", "RBH"],
    ["Fiorentina", "Insight"],
    ["Astros", "Blacky"]
  ];

  for (const pair of pairs) {
    const homeTeam = tMap.get(pair[0]);
    const awayTeam = tMap.get(pair[1]);

    if (!homeTeam || !awayTeam) continue;

    const match = await prisma.match.create({
      data: {
        tournamentId: ligaT2.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        status: "PLAYED",
        round: "Estadísticas Históricas",
        matchDate: new Date("2024-03-01T12:00:00Z"),
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
  }

  console.log("Creating Real Matches...");
  const lines = matchesRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let currentRound = "Fecha 1";

  for (const line of lines) {
    if (line.toLowerCase().startsWith('fecha')) {
      currentRound = line;
      continue;
    }
    if (line.includes("Team 1")) continue;

    const matchRegex = /^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)$/;
    const parsed = matchRegex.exec(line.replace(/\t/g, ' '));
    if (!parsed) {
      console.warn("Could not parse line:", line);
      continue;
    }

    const homeTeamStr = parsed[1].trim();
    const homeScore = parseInt(parsed[2], 10);
    const awayScore = parseInt(parsed[3], 10);
    const awayTeamStr = parsed[4].trim();

    const homeTeam = dbTeams.find(t => t.name.toLowerCase() === homeTeamStr.toLowerCase());
    const awayTeam = dbTeams.find(t => t.name.toLowerCase() === awayTeamStr.toLowerCase());

    if (!homeTeam || !awayTeam) {
      console.warn(`Team not found: ${homeTeamStr} or ${awayTeamStr}`);
      continue;
    }

    await prisma.match.create({
      data: {
        tournamentId: ligaT2.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore,
        awayScore,
        round: currentRound,
        status: "PLAYED",
        matchDate: new Date("2024-03-02T12:00:00Z")
      }
    });

    console.log(`Created: ${currentRound} | ${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}`);
  }

  console.log("Season 2 Seed Complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
