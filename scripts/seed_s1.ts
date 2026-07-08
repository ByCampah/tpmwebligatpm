import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Creando Temporada 1...");

  // 1. Season & Tournament
  const season = await prisma.season.create({
    data: {
      name: "Temporada 1 (2018)",
      isActive: false,
    }
  });

  const tournament = await prisma.tournament.create({
    data: {
      name: "Liga TPM",
      format: "LEAGUE",
      seasonId: season.id,
      isOfficial: true,
      isActiveExtra: false,
    }
  });

  // 2. Teams
  const teamNames = [
    "Almagro", "Formandos", "Juventus", "Red Bull Haxball", "Milan", "Platense"
  ];
  const teamsMap = new Map();

  for (const tName of teamNames) {
    let team = await prisma.team.findFirst({ where: { name: { equals: tName, mode: 'insensitive' } } });
    if (!team) {
      team = await prisma.team.create({ data: { name: tName } });
    }
    teamsMap.set(tName, team);
  }

  // Add short alias for matching
  teamsMap.set("RBH", teamsMap.get("Red Bull Haxball"));

  // Create TournamentTeams
  const tTeamsMap = new Map();
  for (const tName of teamNames) {
    const tTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournament.id,
        teamId: teamsMap.get(tName).id
      }
    });
    tTeamsMap.set(tName, tTeam);
  }
  tTeamsMap.set("RBH", tTeamsMap.get("Red Bull Haxball"));

  // 3. Players and Stats
  const rawStats = {
    "Almagro": [
      { name: "Campah", g: 4, a: 4 },
      { name: "Brian", g: 2, a: 8 },
      { name: "JulianWeigl", g: 21, a: 3 },
      { name: "Zakaria", g: 0, a: 0 },
      { name: "Lixtinhos", g: 2, a: 2 },
      { name: "Harry Kane", g: 8, a: 3 },
      { name: "Haze", g: 5, a: 5 },
      { name: "Titolatola", g: 0, a: 0 },
      { name: "Zeus Cristovao", g: 0, a: 0 },
    ],
    "Juventus": [
      { name: "F.Totti", g: 9, a: 5 },
      { name: "Imperador", g: 13, a: 10 },
      { name: "CoutoAis", g: 0, a: 1 },
      { name: "Slade", g: 0, a: 1 },
      { name: "Bit", g: 0, a: 2 },
      { name: "Andrigo", g: 0, a: 0 },
      { name: "Tur-Sama", g: 0, a: 0 },
      { name: "M U T U", g: 1, a: 0 },
      { name: "Hazard", g: 2, a: 5 },
    ],
    "Formandos": [
      { name: "J.Valdivia", g: 0, a: 0 },
      { name: "Terry", g: 0, a: 1 },
      { name: "Mats Hummels", g: 0, a: 0 },
      { name: "Ze Elias", g: 3, a: 2 },
      { name: "Magossuel", g: 2, a: 3 },
      { name: "Juninho", g: 3, a: 2 },
      { name: "Victorz", g: 7, a: 1 },
      { name: "Amauri", g: 8, a: 6 },
    ],
    "Red Bull Haxball": [
      { name: "Rodri", g: 14, a: 3 },
      { name: "Digne", g: 8, a: 1 },
      { name: "Vinhas", g: 0, a: 3 },
      { name: "Marmota", g: 0, a: 0 },
      { name: "Bergkamp", g: 1, a: 3 },
      { name: "Beng", g: 5, a: 8 },
      { name: "Thiagow", g: 0, a: 0 },
      { name: "Bolivar", g: 0, a: 1 },
    ],
    "Milan": [
      { name: "Rafard", g: 2, a: 2 },
      { name: "Diogosena", g: 0, a: 1 },
      { name: "Fuinha", g: 2, a: 0 },
      { name: "Bernd Leno", g: 2, a: 0 },
      { name: "Baron", g: 1, a: 0 },
      { name: "Boop", g: 0, a: 2 },
      { name: "Trapp", g: 2, a: 2 },
      { name: "Jadsun", g: 0, a: 0 },
    ],
    "Platense": [
      { name: "GetLow", g: 1, a: 0 },
      { name: "Madru", g: 3, a: 5 },
      { name: "Sam", g: 1, a: 0 },
      { name: "Gonzaff", g: 0, a: 0 },
      { name: "Richarlison", g: 6, a: 0 },
      { name: "Thomy", g: 1, a: 1 },
      { name: "Thiago Almada", g: 1, a: 1 },
      { name: "Stuani", g: 0, a: 1 },
      { name: "Gunter", g: 2, a: 0 },
    ]
  };

  const playersMap = new Map();
  let dummyMatch;

  for (const [tName, players] of Object.entries(rawStats)) {
    for (const pData of players) {
      let player = await prisma.player.findFirst({ where: { nick: { equals: pData.name, mode: 'insensitive' } } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: pData.name } });
      }
      playersMap.set(pData.name, player);

      // Create TournamentPlayer
      await prisma.tournamentPlayer.create({
        data: {
          tournamentTeamId: tTeamsMap.get(tName).id,
          playerId: player.id
        }
      });
    }
  }

  // Create Dummy Match for Stats
  // We'll use Almagro vs Formandos as the teams for the match, it doesn't matter since the round name hides it.
  dummyMatch = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: teamsMap.get("Almagro").id,
      awayTeamId: teamsMap.get("Formandos").id,
      round: "Estadísticas Históricas",
      status: "PLAYED",
      homeScore: 0,
      awayScore: 0,
      matchDate: new Date("2018-10-13T00:00:00Z"), // Day after it ended
    }
  });

  // Inject MatchStats
  for (const [tName, players] of Object.entries(rawStats)) {
    for (const pData of players) {
      if (pData.g > 0 || pData.a > 0) {
        await prisma.matchStat.create({
          data: {
            matchId: dummyMatch.id,
            playerId: playersMap.get(pData.name).id,
            goals: pData.g,
            assists: pData.a,
            savesMade: 0,
            savesTotal: 0,
            cleanSheet: false
          }
        });
      }
    }
  }

  // 4. Matches (Results)
  const matchesText = `Fecha 1
Juventus 5 - 1 Milan
Formandos 2 - 0 RBH
Almagro 6 - 1 Platense

Fecha 2
Almagro 1 - 1 Formandos
Platense 2 - 5 Milan
Juventus 5 - 1 RBH

Fecha 3
Platense 1 - 5 RBH
Juventus 1 - 0 Formandos
Almagro 4 - 0 Milan

Fecha 4
Platense 1 - 9 Juventus
Almagro 2 - 2 RBH
Milan 2 - 6 Formandos

Fecha 5
Milan 1 - 5 RBH
Almagro 2 - 0 Juventus
Platense 1 - 2 Formandos

Fecha 6
Juventus 7 - 0 Milan
Formandos 1 - 0 RBH
Almagro 8 - 0 Platense

Fecha 7
Almagro 1 - 1 Formandos
Platense 2 - 4 Milan
Juventus 1 - 4 RBH

Fecha 8
Platense 2 - 6 RBH
Juventus 0 - 0 Formandos
Almagro 3 - 0 Milan

Fecha 9
Platense 1 - 6 Juventus
Almagro 4 - 3 RBH
Milan 0 - 7 Formandos

Fecha 10
Milan 2 - 4 RBH
Almagro 2 - 0 Juventus
Platense 2 - 1 Formandos`;

  const lines = matchesText.split('\n').filter(l => l.trim() !== '');
  let currentRound = "Fecha 1";
  
  for (const line of lines) {
    if (line.startsWith("Fecha")) {
      currentRound = line.trim();
    } else {
      // Parse matches: "TeamA X - Y TeamB"
      const matchRegex = /^(.*?)(\d+)\s*-\s*(\d+)(.*)$/;
      const match = line.match(matchRegex);
      if (match) {
        const homeName = match[1].trim();
        const homeScore = parseInt(match[2]);
        const awayScore = parseInt(match[3]);
        const awayName = match[4].trim();

        if (!teamsMap.has(homeName) || !teamsMap.has(awayName)) {
          console.error("UNKNOWN TEAM in match:", homeName, awayName);
          continue;
        }

        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homeTeamId: teamsMap.get(homeName).id,
            awayTeamId: teamsMap.get(awayName).id,
            homeScore: homeScore,
            awayScore: awayScore,
            round: currentRound,
            status: "PLAYED",
            matchDate: new Date("2018-09-01T00:00:00Z"), // Generic date
          }
        });
      }
    }
  }

  // 5. Trophies
  // Campeon: Almagro, Segundo: Formandos, Tercero: Juventus
  // Goleador: JulianWeigl, Asistidor: Imperador
  await prisma.trophy.createMany({
    data: [
      {
        name: "🏆 1° Puesto",
        tournamentId: tournament.id,
        teamId: teamsMap.get("Almagro").id
      },
      {
        name: "🥈 2° Puesto",
        tournamentId: tournament.id,
        teamId: teamsMap.get("Formandos").id
      },
      {
        name: "🥉 3° Puesto",
        tournamentId: tournament.id,
        teamId: teamsMap.get("Juventus").id
      },
      {
        name: "⚽ Botín de Oro",
        tournamentId: tournament.id,
        playerId: playersMap.get("JulianWeigl").id
      },
      {
        name: "👟 Máximo Asistidor",
        tournamentId: tournament.id,
        playerId: playersMap.get("Imperador").id
      }
    ]
  });

  console.log("Temporada 1 sembrada con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
