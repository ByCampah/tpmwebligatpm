import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Creando Temporada 1...");

  let season = await prisma.season.findUnique({ where: { name: "Temporada 1 (2018)" } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: "Temporada 1 (2018)",
        isActive: false,
      }
    });
  }

  let tpmCategory = await prisma.category.findFirst({ where: { name: 'Liga TPM' } });
  if (!tpmCategory) {
    tpmCategory = await prisma.category.create({ data: { name: 'Liga TPM' } });
  }

  let tournament = await prisma.tournament.findFirst({
    where: { name: 'Liga TPM', seasonId: season.id }
  });

  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: 'Liga TPM',
        seasonId: season.id,
        format: 'LEAGUE',
        isOfficial: true,
        categoryId: tpmCategory.id,
        isActiveExtra: false,
      }
    });
  }

  const teamNames = ["Almagro", "Formandos", "Juventus", "Red Bull Haxball", "Milan", "Platense"];
  const teamsMap = new Map();

  for (const tName of teamNames) {
    let team = await prisma.team.findFirst({ where: { name: { equals: tName, mode: 'insensitive' } } });
    if (!team) {
      team = await prisma.team.create({ data: { name: tName } });
    }
    teamsMap.set(tName, team);
  }

  teamsMap.set("RBH", teamsMap.get("Red Bull Haxball"));

  const tTeamsMap = new Map();
  for (const tName of teamNames) {
    let tTeam = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId: tournament.id,
          teamId: teamsMap.get(tName).id
        }
      }
    });
    if (!tTeam) {
      tTeam = await prisma.tournamentTeam.create({
        data: {
          tournamentId: tournament.id,
          teamId: teamsMap.get(tName).id
        }
      });
    }
    tTeamsMap.set(tName, tTeam);
  }
  tTeamsMap.set("RBH", tTeamsMap.get("Red Bull Haxball"));

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

  for (const [tName, players] of Object.entries(rawStats)) {
    for (const pData of players) {
      let player = await prisma.player.findFirst({ where: { nick: { equals: pData.name, mode: 'insensitive' } } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: pData.name } });
      }
      playersMap.set(pData.name, player);

      const existingTPlayer = await prisma.tournamentPlayer.findUnique({
        where: {
          tournamentTeamId_playerId: {
            tournamentTeamId: tTeamsMap.get(tName).id,
            playerId: player.id
          }
        }
      });

      if (!existingTPlayer) {
        await prisma.tournamentPlayer.create({
          data: {
            tournamentTeamId: tTeamsMap.get(tName).id,
            playerId: player.id
          }
        });
      }
    }
  }

  let dummyMatch1 = await prisma.match.findFirst({ where: { tournamentId: tournament.id, round: "Estadísticas Históricas", homeTeamId: teamsMap.get("Almagro").id } });
  if (!dummyMatch1) {
    dummyMatch1 = await prisma.match.create({
      data: { tournamentId: tournament.id, homeTeamId: teamsMap.get("Almagro").id, awayTeamId: teamsMap.get("Formandos").id, round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
    });
  }

  let dummyMatch2 = await prisma.match.findFirst({ where: { tournamentId: tournament.id, round: "Estadísticas Históricas", homeTeamId: teamsMap.get("Red Bull Haxball").id } });
  if (!dummyMatch2) {
    dummyMatch2 = await prisma.match.create({
      data: { tournamentId: tournament.id, homeTeamId: teamsMap.get("Red Bull Haxball").id, awayTeamId: teamsMap.get("Juventus").id, round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
    });
  }

  let dummyMatch3 = await prisma.match.findFirst({ where: { tournamentId: tournament.id, round: "Estadísticas Históricas", homeTeamId: teamsMap.get("Platense").id } });
  if (!dummyMatch3) {
    dummyMatch3 = await prisma.match.create({
      data: { tournamentId: tournament.id, homeTeamId: teamsMap.get("Platense").id, awayTeamId: teamsMap.get("Milan").id, round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0, matchDate: new Date("2018-10-13T00:00:00Z") }
    });
  }

  for (const [tName, players] of Object.entries(rawStats)) {
    for (const pData of players) {
      if (pData.g > 0 || pData.a > 0) {
        const playerRec = playersMap.get(pData.name);
        let targetMatch = dummyMatch1;
        if (tName === "Red Bull Haxball" || tName === "Juventus") targetMatch = dummyMatch2;
        if (tName === "Platense" || tName === "Milan") targetMatch = dummyMatch3;

        const statExists = await prisma.matchStat.findFirst({
          where: { matchId: targetMatch.id, playerId: playerRec.id }
        });
        if (!statExists) {
          await prisma.matchStat.create({
            data: {
              matchId: targetMatch.id,
              playerId: playerRec.id,
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
  }

  const matchesText = `Fecha 1\nJuventus 5 - 1 Milan\nFormandos 2 - 0 RBH\nAlmagro 6 - 1 Platense\nFecha 2\nAlmagro 1 - 1 Formandos\nPlatense 2 - 5 Milan\nJuventus 5 - 1 RBH\nFecha 3\nPlatense 1 - 5 RBH\nJuventus 1 - 0 Formandos\nAlmagro 4 - 0 Milan\nFecha 4\nPlatense 1 - 9 Juventus\nAlmagro 2 - 2 RBH\nMilan 2 - 6 Formandos\nFecha 5\nMilan 1 - 5 RBH\nAlmagro 2 - 0 Juventus\nPlatense 1 - 2 Formandos\nFecha 6\nJuventus 7 - 0 Milan\nFormandos 1 - 0 RBH\nAlmagro 8 - 0 Platense\nFecha 7\nAlmagro 1 - 1 Formandos\nPlatense 2 - 4 Milan\nJuventus 1 - 4 RBH\nFecha 8\nPlatense 2 - 6 RBH\nJuventus 0 - 0 Formandos\nAlmagro 3 - 0 Milan\nFecha 9\nPlatense 1 - 6 Juventus\nAlmagro 4 - 3 RBH\nMilan 0 - 7 Formandos\nFecha 10\nMilan 2 - 4 RBH\nAlmagro 2 - 0 Juventus\nPlatense 2 - 1 Formandos`;
  const lines = matchesText.split('\n').filter(l => l.trim() !== '');
  let currentRound = "Fecha 1";
  
  for (const line of lines) {
    if (line.startsWith("Fecha")) {
      currentRound = line.trim();
    } else {
      const matchRegex = /^(.*?)(\d+)\s*-\s*(\d+)(.*)$/;
      const match = line.match(matchRegex);
      if (match) {
        const homeName = match[1].trim();
        const homeScore = parseInt(match[2]);
        const awayScore = parseInt(match[3]);
        const awayName = match[4].trim();

        const existingMatch = await prisma.match.findFirst({
          where: {
            tournamentId: tournament.id,
            homeTeamId: teamsMap.get(homeName).id,
            awayTeamId: teamsMap.get(awayName).id,
            round: currentRound
          }
        });

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              homeTeamId: teamsMap.get(homeName).id,
              awayTeamId: teamsMap.get(awayName).id,
              homeScore: homeScore,
              awayScore: awayScore,
              round: currentRound,
              status: "PLAYED",
              matchDate: new Date("2018-09-01T00:00:00Z"),
            }
          });
        }
      }
    }
  }

  const existingTrophies = await prisma.trophy.count({ where: { tournamentId: tournament.id } });
  if (existingTrophies === 0) {
    await prisma.trophy.createMany({
      data: [
        { name: "Campeón", type: "TEAM", tournamentId: tournament.id, teamId: teamsMap.get("Almagro").id },
        { name: "Subcampeón", type: "TEAM", tournamentId: tournament.id, teamId: teamsMap.get("Formandos").id },
        { name: "Tercer Puesto", type: "TEAM", tournamentId: tournament.id, teamId: teamsMap.get("Juventus").id },
        { name: "Máximo Goleador", type: "PLAYER", tournamentId: tournament.id, playerId: playersMap.get("JulianWeigl").id },
        { name: "Máximo Asistidor", type: "PLAYER", tournamentId: tournament.id, playerId: playersMap.get("Imperador").id }
      ]
    });
  }

  console.log("Temporada 1 sembrada con éxito!");
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1) });
