const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO SEED TEMPORADA 3 (NACIONAL B Y COPA NACIONAL B) ===");

  // 1. Verificar Temporada 3
  console.log("Step 1");
  const season = await prisma.season.findFirst({
    where: { name: "Temporada 3 (2019)" }
  });
  if (!season) {
    console.error("Temporada 3 (2019) no existe. Asegúrate de haber corrido seed_s3.js");
    process.exit(1);
  }

  // 2. Crear Categoría "Copa Nacional B"
  console.log("Step 2");
  let catCopaB = await prisma.category.findFirst({ where: { name: "Copa Nacional B" } });
  if (!catCopaB) {
    catCopaB = await prisma.category.create({ data: { name: "Copa Nacional B" } });
    console.log("Categoría Copa Nacional B creada");
  }

  console.log("Step 3");
  let catNacionalB = await prisma.category.findFirst({ where: { name: "B Nacional" } });
  if (!catNacionalB) {
    catNacionalB = await prisma.category.findFirst({ where: { name: { contains: "Nacional B" } } });
  }

  // 3. Crear Torneos (isOfficial: true pero son B)
  console.log("Step 4");
  let tNacionalB = await prisma.tournament.findFirst({
    where: { name: "Nacional B", seasonId: season.id }
  });
  if (!tNacionalB) {
    tNacionalB = await prisma.tournament.create({
      data: {
        name: "Nacional B",
        seasonId: season.id,
        format: "LEAGUE",
        isOfficial: true,
        categoryId: catNacionalB?.id
      }
    });
    console.log("Torneo Nacional B creado.");
  } else {
    // Asegurar isOfficial y category
    await prisma.tournament.update({
      where: { id: tNacionalB.id },
      data: { isOfficial: true, categoryId: catNacionalB?.id }
    });
  }

  let tCopaB = await prisma.tournament.findFirst({
    where: { name: "Copa Nacional B", seasonId: season.id }
  });
  if (!tCopaB) {
    tCopaB = await prisma.tournament.create({
      data: {
        name: "Copa Nacional B",
        seasonId: season.id,
        format: "CUP",
        isOfficial: true,
        categoryId: catCopaB.id
      }
    });
    console.log("Torneo Copa Nacional B creado.");
  } else {
    await prisma.tournament.update({
      where: { id: tCopaB.id },
      data: { isOfficial: true, categoryId: catCopaB.id }
    });
  }

  // 4. Equipos y Jugadores
  const plantillas = {
    "Botijas": [
      { nick: "Frank Fabra", goals: 12, assists: 4 },
      { nick: "Clonn", goals: 3, assists: 0 },
      { nick: "Mate", goals: 0, assists: 3 },
      { nick: "Cerviyb", goals: 1, assists: 3 },
      { nick: "Yuqii", goals: 7, assists: 0 },
      { nick: "G.Martinez", goals: 0, assists: 0 }
    ],
    "Voxed": [
      { nick: "Sabellubi", goals: 4, assists: 1 },
      { nick: "Carita", goals: 1, assists: 3 },
      { nick: "Angelichad", goals: 1, assists: 1 },
      { nick: "Voxero", goals: 0, assists: 1 }
    ],
    "Borussia": [
      { nick: "A Witsel", goals: 3, assists: 1 },
      { nick: "J Sancho", goals: 2, assists: 6 },
      { nick: "L Piszczek", goals: 11, assists: 4 },
      { nick: "Reus", goals: 2, assists: 3 },
      { nick: "Akanji", goals: 1, assists: 0 }
    ],
    "Paranaense": [
      { nick: "Cismado", goals: 8, assists: 2 },
      { nick: "BadVibes", goals: 0, assists: 2 },
      { nick: "Van Dijk", goals: 5, assists: 4 },
      { nick: "Veiga", goals: 3, assists: 2 },
      { nick: "Nero", goals: 0, assists: 1 },
      { nick: "Halland", goals: 1, assists: 0 },
      { nick: "Aqua", goals: 2, assists: 1 }
    ],
    "Manchester": [
      { nick: "ValBaiano", goals: 2, assists: 1 },
      { nick: "Valdiviajorg", goals: 2, assists: 0 },
      { nick: "Lingardinho", goals: 1, assists: 1 },
      { nick: "Luis Fabiano", goals: 1, assists: 2 }
    ],
    "Inter": [
      { nick: "MeninoNey", goals: 3, assists: 5 },
      { nick: "Bonuccinho", goals: 0, assists: 2 },
      { nick: "Eriksen", goals: 3, assists: 1 },
      { nick: "Javi Entregas", goals: 4, assists: 3 },
      { nick: "KokePizzaiolo", goals: 4, assists: 1 }
    ]
  };

  const teamIds = {};
  for (const [teamName, players] of Object.entries(plantillas)) {
    console.log("Procesando equipo:", teamName);
    let team = await prisma.team.findFirst({ where: { name: teamName } });
    if (!team) {
      team = await prisma.team.create({ data: { name: teamName } });
    }
    teamIds[teamName] = team.id;

    // Inscribir en Nacional B
    let ttNacB = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tNacionalB.id, teamId: team.id } }
    });
    if (!ttNacB) {
      ttNacB = await prisma.tournamentTeam.create({
        data: { tournamentId: tNacionalB.id, teamId: team.id }
      });
    }

    // Inscribir en Copa Nacional B
    let ttCopaB = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tCopaB.id, teamId: team.id } }
    });
    if (!ttCopaB) {
      ttCopaB = await prisma.tournamentTeam.create({
        data: { tournamentId: tCopaB.id, teamId: team.id }
      });
    }

    // Asegurar jugadores
    console.log("  Procesando", players.length, "jugadores para", teamName);
    for (const p of players) {
      let player = await prisma.player.findFirst({ where: { nick: p.nick } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: p.nick } });
      }
      p.id = player.id; // guardar ID para estadísticas

      // Inscribir jugador en el team del torneo Nacional B
      let tpNacB = await prisma.tournamentPlayer.findUnique({
        where: { tournamentTeamId_playerId: { tournamentTeamId: ttNacB.id, playerId: player.id } }
      });
      if (!tpNacB) {
        await prisma.tournamentPlayer.create({
          data: { tournamentTeamId: ttNacB.id, playerId: player.id }
        });
      }

      // Inscribir jugador en el team del torneo Copa Nacional B
      let tpCopaB = await prisma.tournamentPlayer.findUnique({
        where: { tournamentTeamId_playerId: { tournamentTeamId: ttCopaB.id, playerId: player.id } }
      });
      if (!tpCopaB) {
        await prisma.tournamentPlayer.create({
          data: { tournamentTeamId: ttCopaB.id, playerId: player.id }
        });
      }
    }
  }

  console.log("Equipos y jugadores procesados.");

  // Helper para crear partidos
  async function ensureMatch(tournamentId, homeTeamName, awayTeamName, round, homeScore, awayScore, penHome=null, penAway=null) {
    console.log(`  ensureMatch: ${homeTeamName} vs ${awayTeamName} (${round})`);
    const homeTeamId = teamIds[homeTeamName];
    const awayTeamId = teamIds[awayTeamName];
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

  // Partidos Nacional B
  console.log("Step 5: Creando Partidos Nacional B");
  await ensureMatch(tNacionalB.id, "Borussia", "Botijas", "Fecha 1", 1, 1);
  await ensureMatch(tNacionalB.id, "Paranaense", "Inter", "Fecha 1", 3, 3);
  await ensureMatch(tNacionalB.id, "Voxed", "Manchester", "Fecha 1", 7, 3);

  await ensureMatch(tNacionalB.id, "Borussia", "Paranaense", "Fecha 2", 4, 1);
  await ensureMatch(tNacionalB.id, "Botijas", "Voxed", "Fecha 2", 4, 1);
  await ensureMatch(tNacionalB.id, "Inter", "Manchester", "Fecha 2", 6, 0);

  await ensureMatch(tNacionalB.id, "Borussia", "Inter", "Fecha 3", 4, 1);
  await ensureMatch(tNacionalB.id, "Botijas", "Manchester", "Fecha 3", 10, 1);
  await ensureMatch(tNacionalB.id, "Paranaense", "Voxed", "Fecha 3", 4, 0);

  await ensureMatch(tNacionalB.id, "Borussia", "Voxed", "Fecha 4", 4, 1);
  await ensureMatch(tNacionalB.id, "Botijas", "Inter", "Fecha 4", 4, 2);
  await ensureMatch(tNacionalB.id, "Paranaense", "Manchester", "Fecha 4", 7, 1);

  await ensureMatch(tNacionalB.id, "Borussia", "Manchester", "Fecha 5", 9, 1);
  await ensureMatch(tNacionalB.id, "Botijas", "Paranaense", "Fecha 5", 5, 4);
  await ensureMatch(tNacionalB.id, "Inter", "Voxed", "Fecha 5", 2, 1);

  // Playoff (Final de Desempate Nacional B)
  console.log("Step 6: Playoff Nacional B");
  await ensureMatch(tNacionalB.id, "Borussia", "Botijas", "Final", 2, 1);

  // Partidos Copa Nacional B
  console.log("Step 7: Partidos Copa Nacional B");
  await ensureMatch(tCopaB.id, "Borussia", "Inter", "Semifinal", 2, 0);
  await ensureMatch(tCopaB.id, "Botijas", "Paranaense", "Semifinal", 5, 4);
  await ensureMatch(tCopaB.id, "Inter", "Paranaense", "3er Puesto", 3, 0);
  await ensureMatch(tCopaB.id, "Borussia", "Botijas", "Final", 0, 0, 5, 4);

  // Estadísticas Históricas en Nacional B
  console.log("Step 8: Estadisticas Historicas");
  let histMatch = await prisma.match.findFirst({
    where: { tournamentId: tNacionalB.id, round: "Estadísticas Históricas" }
  });
  if (!histMatch) {
    histMatch = await prisma.match.create({
      data: {
        tournamentId: tNacionalB.id,
        homeTeamId: teamIds["Borussia"],
        awayTeamId: teamIds["Botijas"],
        homeScore: 0,
        awayScore: 0,
        round: "Estadísticas Históricas",
        status: "PLAYED",
        matchDate: new Date()
      }
    });
  }

  // Cargar stats de jugadores en histMatch
  console.log("Step 9: Cargar MatchStats");
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

  console.log("Partidos y estadísticas cargados.");

  console.log("Partidos y estadísticas cargados.");

  // Helper para Trofeos
  async function assignTrophy(tournamentId, name, type, teamName) {
    const teamId = teamIds[teamName];
    if (!teamId) return;
    let t = await prisma.trophy.findFirst({
      where: { tournamentId, name, type, teamId }
    });
    if (!t) {
      await prisma.trophy.create({
        data: {
          tournamentId,
          name,
          type,
          teamId
        }
      });
    }
  }

  // Trofeos Nacional B
  await assignTrophy(tNacionalB.id, "Campeón", "TEAM", "Borussia");
  await assignTrophy(tNacionalB.id, "Subcampeón", "TEAM", "Botijas");
  await assignTrophy(tNacionalB.id, "Tercer Puesto", "TEAM", "Paranaense");

  // Trofeos Copa Nacional B
  await assignTrophy(tCopaB.id, "Campeón", "TEAM", "Borussia");
  await assignTrophy(tCopaB.id, "Subcampeón", "TEAM", "Botijas");
  await assignTrophy(tCopaB.id, "Tercer Puesto", "TEAM", "Inter");

  console.log("Trofeos asignados.");
  console.log("=== FIN ===");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
