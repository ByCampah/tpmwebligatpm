const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO SEED TEMPORADA 4 ===");

  // 1. Temporada 4
  let season = await prisma.season.findFirst({ where: { name: "Temporada 4 (2019)" } });
  if (!season) {
    season = await prisma.season.create({
      data: { name: "Temporada 4 (2019)", isActive: false }
    });
    console.log("Temporada 4 (2019) creada.");
  }

  // 2. Categorías
  let catPrimera = await prisma.category.findFirst({ where: { name: "Primera División" } });
  if (!catPrimera) catPrimera = await prisma.category.create({ data: { name: "Primera División" } });

  let catNacionalB = await prisma.category.findFirst({ where: { name: { contains: "Nacional" } } });
  if (!catNacionalB) catNacionalB = await prisma.category.create({ data: { name: "B Nacional" } });

  // 3. Torneos
  let tLiga = await prisma.tournament.findFirst({
    where: { name: "Liga TPM", seasonId: season.id }
  });
  if (!tLiga) {
    tLiga = await prisma.tournament.create({
      data: { name: "Liga TPM", format: "LEAGUE", isOfficial: true, categoryId: catPrimera.id, seasonId: season.id }
    });
    console.log("Torneo Liga TPM creado.");
  }

  let tNacionalB = await prisma.tournament.findFirst({
    where: { name: "Nacional B", seasonId: season.id }
  });
  if (!tNacionalB) {
    tNacionalB = await prisma.tournament.create({
      data: { name: "Nacional B", format: "LEAGUE", isOfficial: true, categoryId: catNacionalB.id, seasonId: season.id }
    });
    console.log("Torneo Nacional B creado.");
  }

  // 4. Plantillas
  const plantillasPrimera = {
    "Almagro": [
      { nick: "Amauri", goals: 1, assists: 3 },
      { nick: "Vlady", goals: 4, assists: 0 },
      { nick: "M U T U", goals: 1, assists: 1 },
      { nick: "Thomy", goals: 0, assists: 2 },
      { nick: "Jeffguitar", goals: 0, assists: 0 },
      { nick: "Rafard", goals: 0, assists: 0 },
      { nick: "Leo Silva", goals: 0, assists: 0 }
    ],
    "Galaxy": [
      { nick: "JulianWeigl", goals: 10, assists: 5 },
      { nick: "Pedro A", goals: 3, assists: 2 },
      { nick: "Beng", goals: 6, assists: 6 },
      { nick: "Rashford", goals: 1, assists: 3 },
      { nick: "Zakaria", goals: 1, assists: 2 },
      { nick: "Trapp", goals: 0, assists: 0 }
    ],
    "Leipzig": [
      { nick: "Brian", goals: 0, assists: 4 },
      { nick: "Jadsun", goals: 2, assists: 2 },
      { nick: "Harry Kane", goals: 5, assists: 1 },
      { nick: "Slade", goals: 0, assists: 0 },
      { nick: "Daniel", goals: 2, assists: 2 },
      { nick: "Victorz", goals: 2, assists: 1 },
      { nick: "Bernd Leno", goals: 0, assists: 0 }
    ],
    "Borussia": [
      { nick: "Rodrigo", goals: 1, assists: 0 },
      { nick: "Piszczek", goals: 3, assists: 2 },
      { nick: "Witsel", goals: 1, assists: 0 },
      { nick: "Hummels", goals: 0, assists: 1 },
      { nick: "Sancho", goals: 1, assists: 3 }
    ],
    "Spurs": [
      { nick: "F.Totti", goals: 0, assists: 2 },
      { nick: "Not Found", goals: 2, assists: 1 },
      { nick: "Boop", goals: 0, assists: 0 },
      { nick: "Diogosena", goals: 1, assists: 0 },
      { nick: "Digne", goals: 3, assists: 0 },
      { nick: "Bergkamp", goals: 0, assists: 1 },
      { nick: "Cebolinha", goals: 0, assists: 0 }
    ],
    "Botijas": [] // No stats, but we need to create the team
  };

  const plantillasNacionalB = {
    "Blacky": [
      { nick: "Felipe Ronaldo", goals: 8, assists: 2 },
      { nick: "Zabot", goals: 6, assists: 5 },
      { nick: "lSantos", goals: 3, assists: 5 },
      { nick: "Ruan404", goals: 2, assists: 3 },
      { nick: "AndyCare", goals: 7, assists: 7 },
      { nick: "Richarlison", goals: 18, assists: 8 }
    ],
    "Paranaense": [
      { nick: "Ramonzin", goals: 2, assists: 2 },
      { nick: "Stan", goals: 4, assists: 1 },
      { nick: "Lemes", goals: 1, assists: 0 },
      { nick: "Traore", goals: 1, assists: 1 },
      { nick: "Cismado", goals: 6, assists: 2 },
      { nick: "Veiga", goals: 1, assists: 4 },
      { nick: "Osman", goals: 1, assists: 2 }
    ],
    "Coloridos": [
      { nick: "Ibra", goals: 0, assists: 0 },
      { nick: "Delaney", goals: 4, assists: 4 },
      { nick: "Frank Fabra", goals: 6, assists: 3 },
      { nick: "Mate", goals: 6, assists: 3 },
      { nick: "Doudou", goals: 1, assists: 0 },
      { nick: "Combado", goals: 0, assists: 0 },
      { nick: "Lucas2000", goals: 5, assists: 1 }
    ],
    "Inter": [
      { nick: "Bonuccino", goals: 1, assists: 0 },
      { nick: "Eddy", goals: 3, assists: 4 },
      { nick: "Bnet", goals: 2, assists: 1 },
      { nick: "Jovirone", goals: 6, assists: 2 },
      { nick: "Menino", goals: 2, assists: 1 }
    ],
    "Tigre": [
      { nick: "Andre", goals: 6, assists: 2 },
      { nick: "Watt", goals: 6, assists: 7 },
      { nick: "Rodri", goals: 11, assists: 7 },
      { nick: "Vinhas", goals: 1, assists: 1 },
      { nick: "Honda", goals: 3, assists: 2 },
      { nick: "Deku", goals: 0, assists: 0 },
      { nick: "Sam", goals: 2, assists: 1 }
    ],
    "Coritiba": [
      { nick: "Lewandows", goals: 6, assists: 2 },
      { nick: "IG gamer", goals: 0, assists: 0 },
      { nick: "Aqua", goals: 1, assists: 1 },
      { nick: "Thales", goals: 1, assists: 0 },
      { nick: "KokePizzaiolo", goals: 0, assists: 1 },
      { nick: "A.Santos", goals: 0, assists: 0 },
      { nick: "Postinho", goals: 0, assists: 0 }
    ]
  };

  const teamIds = {};

  async function processPlantillas(plantillas, tournament) {
    for (const [teamName, players] of Object.entries(plantillas)) {
      console.log("Procesando equipo:", teamName);
      let team = await prisma.team.findFirst({ where: { name: teamName } });
      if (!team) {
        team = await prisma.team.create({ data: { name: teamName } });
      }
      teamIds[teamName] = team.id;

      let tt = await prisma.tournamentTeam.findUnique({
        where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id } }
      });
      if (!tt) {
        tt = await prisma.tournamentTeam.create({
          data: { tournamentId: tournament.id, teamId: team.id }
        });
      }

      console.log("  Procesando", players.length, "jugadores para", teamName);
      for (const p of players) {
        let player = await prisma.player.findFirst({ where: { nick: p.nick } });
        if (!player) {
          player = await prisma.player.create({ data: { nick: p.nick } });
        }
        p.id = player.id;

        let tp = await prisma.tournamentPlayer.findUnique({
          where: { tournamentTeamId_playerId: { tournamentTeamId: tt.id, playerId: player.id } }
        });
        if (!tp) {
          await prisma.tournamentPlayer.create({
            data: { tournamentTeamId: tt.id, playerId: player.id }
          });
        }
      }
    }
  }

  await processPlantillas(plantillasPrimera, tLiga);
  await processPlantillas(plantillasNacionalB, tNacionalB);

  // Helper de partidos
  async function ensureMatch(tournamentId, homeTeamName, awayTeamName, round, homeScore, awayScore, penHome=null, penAway=null) {
    const homeTeamId = teamIds[homeTeamName];
    const awayTeamId = teamIds[awayTeamName];
    if (!homeTeamId || !awayTeamId) {
        console.warn("Equipos no encontrados:", homeTeamName, awayTeamName);
        return null;
    }
    console.log(`  Procesando partido: ${homeTeamName} vs ${awayTeamName} (${round})`);
    let match = await prisma.match.findFirst({
      where: { tournamentId, homeTeamId, awayTeamId, round }
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId,
          homeTeamId,
          awayTeamId,
          round,
          homeScore,
          awayScore,
          homePenaltyScore: penHome,
          awayPenaltyScore: penAway,
          status: "PLAYED",
          matchDate: new Date()
        }
      });
    } else {
      await prisma.match.update({
        where: { id: match.id },
        data: { homeScore, awayScore, homePenaltyScore: penHome, awayPenaltyScore: penAway, status: "PLAYED" }
      });
    }
    return match;
  }

  // Partidos Primera
  console.log("Step 5: Creando Partidos Primera");
  await ensureMatch(tLiga.id, "Almagro", "Galaxy", "Fecha 1", 2, 5);
  await ensureMatch(tLiga.id, "Botijas", "Spurs", "Fecha 1", 0, 1);
  await ensureMatch(tLiga.id, "Leipzig", "Borussia", "Fecha 1", 1, 0);

  await ensureMatch(tLiga.id, "Leipzig", "Botijas", "Fecha 2", 1, 0);
  await ensureMatch(tLiga.id, "Galaxy", "Borussia", "Fecha 2", 8, 2);
  await ensureMatch(tLiga.id, "Almagro", "Spurs", "Fecha 2", 1, 2);

  await ensureMatch(tLiga.id, "Almagro", "Leipzig", "Fecha 3", 0, 1);
  await ensureMatch(tLiga.id, "Spurs", "Galaxy", "Fecha 3", 1, 2);
  await ensureMatch(tLiga.id, "Borussia", "Botijas", "Fecha 3", 1, 0);

  await ensureMatch(tLiga.id, "Almagro", "Borussia", "Fecha 4", 4, 0);
  await ensureMatch(tLiga.id, "Spurs", "Leipzig", "Fecha 4", 0, 0);
  await ensureMatch(tLiga.id, "Galaxy", "Botijas", "Fecha 4", 1, 0);

  await ensureMatch(tLiga.id, "Almagro", "Botijas", "Fecha 5", 1, 0);
  await ensureMatch(tLiga.id, "Spurs", "Borussia", "Fecha 5", 3, 0);
  await ensureMatch(tLiga.id, "Leipzig", "Galaxy", "Fecha 5", 3, 1);

  await ensureMatch(tLiga.id, "Almagro", "Galaxy", "Fecha 6", 1, 1);
  await ensureMatch(tLiga.id, "Botijas", "Spurs", "Fecha 6", 0, 1);
  await ensureMatch(tLiga.id, "Leipzig", "Borussia", "Fecha 6", 1, 0);

  await ensureMatch(tLiga.id, "Leipzig", "Botijas", "Fecha 7", 1, 0);
  await ensureMatch(tLiga.id, "Galaxy", "Borussia", "Fecha 7", 9, 1);
  await ensureMatch(tLiga.id, "Almagro", "Spurs", "Fecha 7", 2, 2);

  await ensureMatch(tLiga.id, "Almagro", "Leipzig", "Fecha 8", 0, 4);
  await ensureMatch(tLiga.id, "Spurs", "Galaxy", "Fecha 8", 1, 10);
  await ensureMatch(tLiga.id, "Borussia", "Botijas", "Fecha 8", 1, 0);

  await ensureMatch(tLiga.id, "Almagro", "Borussia", "Fecha 9", 4, 2);
  await ensureMatch(tLiga.id, "Spurs", "Leipzig", "Fecha 9", 1, 2);
  await ensureMatch(tLiga.id, "Galaxy", "Botijas", "Fecha 9", 1, 0);

  await ensureMatch(tLiga.id, "Almagro", "Botijas", "Fecha 10", 1, 0);
  await ensureMatch(tLiga.id, "Spurs", "Borussia", "Fecha 10", 11, 1);
  await ensureMatch(tLiga.id, "Leipzig", "Galaxy", "Fecha 10", 1, 2);

  // Desempate Primera
  await ensureMatch(tLiga.id, "Galaxy", "Leipzig", "Final", 1, 0);

  // Partidos Segunda
  console.log("Step 6: Creando Partidos Segunda");
  await ensureMatch(tNacionalB.id, "Blacky", "Coritiba", "Fecha 1", 2, 0);
  await ensureMatch(tNacionalB.id, "Inter", "Coloridos", "Fecha 1", 3, 2);
  await ensureMatch(tNacionalB.id, "Tigre", "Paranaense", "Fecha 1", 4, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Inter", "Fecha 2", 5, 0);
  await ensureMatch(tNacionalB.id, "Tigre", "Coritiba", "Fecha 2", 6, 1);
  await ensureMatch(tNacionalB.id, "Coloridos", "Paranaense", "Fecha 2", 3, 3);

  await ensureMatch(tNacionalB.id, "Blacky", "Coloridos", "Fecha 3", 6, 1);
  await ensureMatch(tNacionalB.id, "Tigre", "Inter", "Fecha 3", 3, 1);
  await ensureMatch(tNacionalB.id, "Coritiba", "Paranaense", "Fecha 3", 1, 0);

  await ensureMatch(tNacionalB.id, "Blacky", "Tigre", "Fecha 4", 1, 1);
  await ensureMatch(tNacionalB.id, "Coloridos", "Coritiba", "Fecha 4", 2, 1);
  await ensureMatch(tNacionalB.id, "Paranaense", "Inter", "Fecha 4", 2, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Paranaense", "Fecha 5", 4, 2);
  await ensureMatch(tNacionalB.id, "Coloridos", "Tigre", "Fecha 5", 6, 2);
  await ensureMatch(tNacionalB.id, "Inter", "Coritiba", "Fecha 5", 3, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Coritiba", "Fecha 6", 2, 1);
  await ensureMatch(tNacionalB.id, "Coloridos", "Inter", "Fecha 6", 1, 2);
  await ensureMatch(tNacionalB.id, "Tigre", "Paranaense", "Fecha 6", 4, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Inter", "Fecha 7", 6, 2);
  await ensureMatch(tNacionalB.id, "Tigre", "Coritiba", "Fecha 7", 3, 0);
  await ensureMatch(tNacionalB.id, "Coloridos", "Paranaense", "Fecha 7", 3, 0);

  await ensureMatch(tNacionalB.id, "Blacky", "Coloridos", "Fecha 8", 5, 2);
  await ensureMatch(tNacionalB.id, "Tigre", "Inter", "Fecha 8", 3, 1);
  await ensureMatch(tNacionalB.id, "Paranaense", "Coritiba", "Fecha 8", 3, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Tigre", "Fecha 9", 1, 0);
  await ensureMatch(tNacionalB.id, "Coloridos", "Coritiba", "Fecha 9", 2, 0);
  await ensureMatch(tNacionalB.id, "Paranaense", "Inter", "Fecha 9", 2, 1);

  await ensureMatch(tNacionalB.id, "Blacky", "Paranaense", "Fecha 10", 13, 2);
  await ensureMatch(tNacionalB.id, "Coloridos", "Tigre", "Fecha 10", 2, 3);
  await ensureMatch(tNacionalB.id, "Inter", "Coritiba", "Fecha 10", 0, 2);

  // Estadísticas históricas
  async function loadHistoricStats(tournament, plantillas) {
    let histMatch = await prisma.match.findFirst({
      where: { tournamentId: tournament.id, round: "Estadísticas Históricas" }
    });
    if (!histMatch) {
      const keys = Object.keys(plantillas);
      histMatch = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: teamIds[keys[0]],
          awayTeamId: teamIds[keys[1]],
          homeScore: 0,
          awayScore: 0,
          round: "Estadísticas Históricas",
          status: "PLAYED",
          matchDate: new Date()
        }
      });
    }

    for (const [teamName, players] of Object.entries(plantillas)) {
      for (const p of players) {
        if (p.goals > 0 || p.assists > 0) {
          let st = await prisma.matchStat.findUnique({
            where: { matchId_playerId: { matchId: histMatch.id, playerId: p.id } }
          });
          if (!st) {
            await prisma.matchStat.create({
              data: {
                matchId: histMatch.id,
                playerId: p.id,
                goals: p.goals,
                assists: p.assists,
                matchTime: 90
              }
            });
          } else {
            await prisma.matchStat.update({
              where: { id: st.id },
              data: { goals: p.goals, assists: p.assists }
            });
          }
        }
      }
    }
  }

  console.log("Step 7: Estadísticas históricas Primera");
  await loadHistoricStats(tLiga, plantillasPrimera);
  console.log("Step 8: Estadísticas históricas Segunda");
  await loadHistoricStats(tNacionalB, plantillasNacionalB);

  // Trofeos
  async function assignTrophy(tournamentId, name, type, teamName, playerName=null) {
    const teamId = teamName ? teamIds[teamName] : null;
    let playerId = null;
    if (playerName) {
      const p = await prisma.player.findFirst({ where: { nick: playerName } });
      if (p) playerId = p.id;
    }

    let tr = await prisma.trophy.findFirst({
      where: { tournamentId, name, type, teamId, playerId }
    });
    if (!tr) {
      await prisma.trophy.create({
        data: { tournamentId, name, type, teamId, playerId }
      });
    }
  }

  console.log("Step 9: Trofeos");
  // Liga TPM
  await assignTrophy(tLiga.id, "Campeón", "TEAM", "Galaxy");
  await assignTrophy(tLiga.id, "Subcampeón", "TEAM", "Leipzig");
  await assignTrophy(tLiga.id, "Tercer Puesto", "TEAM", "Spurs");

  await assignTrophy(tLiga.id, "Goleador", "PLAYER", "Galaxy", "JulianWeigl");
  await assignTrophy(tLiga.id, "Asistidor", "PLAYER", "Galaxy", "Beng");

  // Nacional B
  await assignTrophy(tNacionalB.id, "Campeón", "TEAM", "Blacky");
  await assignTrophy(tNacionalB.id, "Subcampeón", "TEAM", "Tigre");
  await assignTrophy(tNacionalB.id, "Tercer Puesto", "TEAM", "Coloridos");

  console.log("=== FIN ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
