import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Temporada 11...");

  // 1. Encontrar o crear la Categoria y Temporada
  let cat = await prisma.category.findUnique({ where: { name: "Liga TPM" } });
  if (!cat) {
    cat = await prisma.category.create({ data: { name: "Liga TPM" } });
  }

  let season = await prisma.season.findUnique({ where: { name: "Temporada 11 (2023)" } });
  if (!season) {
    season = await prisma.season.create({ data: { name: "Temporada 11 (2023)" } });
  }

  // 2. Torneo Liga TPM
  
  // Limpiar posible Copa TPM o Liga TPM antigua de Temporada 11
  const existingTors = await prisma.tournament.findMany({ where: { seasonId: season.id } });
  for (const t of existingTors) {
    console.log(`Limpiando datos existentes del torneo ${t.name}...`);
    await prisma.matchStat.deleteMany({ where: { match: { tournamentId: t.id } } });
    await prisma.match.deleteMany({ where: { tournamentId: t.id } });
    await prisma.tournamentPlayer.deleteMany({ where: { tournamentTeam: { tournamentId: t.id } } });
    await prisma.tournamentTeam.deleteMany({ where: { tournamentId: t.id } });
    await prisma.tournament.delete({ where: { id: t.id } });
  }

  let copaTor = await prisma.tournament.create({
    data: {
      name: "Liga TPM",
      format: "LEAGUE",
      season: { connect: { id: season.id } },
      category: { connect: { id: cat.id } },
      isOfficial: true,
    }
  });

  // Plantillas de la Temporada 11
  const teamsData = [
    {
      name: "Warriors",
      players: [
        { nick: "Joabe", g: 1, a: 0, pj: 4 },
        { nick: "JulianWeigl", g: 1, a: 0, pj: 3 },
        { nick: "Mertens", g: 0, a: 1, pj: 5 },
        { nick: "Nerinho", g: 0, a: 0, pj: 3 },
        { nick: "Razor", g: 0, a: 0, pj: 1 },
        { nick: "Slade", g: 0, a: 0, pj: 5 },
        { nick: "Soneca", g: 0, a: 0, pj: 4 },
        { nick: "Cebolinha", g: 1, a: 0, pj: 1 }
      ]
    },
    {
      name: "Big Fish",
      players: [
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
      ]
    },
    {
      name: "Almagro",
      players: [
        { nick: "Aqua", g: 0, a: 0, pj: 3 },
        { nick: "Campah", g: 5, a: 0, pj: 4 },
        { nick: "Zakaria", g: 0, a: 2, pj: 3 },
        { nick: "Digne", g: 1, a: 0, pj: 2 },
        { nick: "Pedro a", g: 1, a: 2, pj: 2 },
        { nick: "Sanjiro", g: 1, a: 1, pj: 3 },
        { nick: "Thomy", g: 0, a: 0, pj: 4 },
        { nick: "Haze", g: 0, a: 0, pj: 1 },
        { nick: "Richarlison", g: 1, a: 0, pj: 1 }
      ]
    },
    {
      name: "Fiorentina",
      players: [
        { nick: "Rashford", g: 1, a: 1, pj: 3 },
        { nick: "Baron", g: 1, a: 1, pj: 4 },
        { nick: "Bernd Leno", g: 4, a: 3, pj: 5 },
        { nick: "Jadsun", g: 1, a: 1, pj: 4 },
        { nick: "Mate", g: 0, a: 0, pj: 3 },
        { nick: "Natanzinho", g: 3, a: 2, pj: 4 },
        { nick: "Shelby", g: 1, a: 0, pj: 4 },
        { nick: "Toni", g: 1, a: 1, pj: 2 }
      ]
    },
    {
      name: "Bermudinha",
      players: [
        { nick: "-Martinelli", g: 2, a: 0, pj: 3 },
        { nick: "Alex Chen", g: 0, a: 1, pj: 2 },
        { nick: "Felipe Ronaldo", g: 0, a: 0, pj: 1 },
        { nick: "Kyrie Develing", g: 3, a: 1, pj: 5 },
        { nick: "M U T U", g: 0, a: 1, pj: 5 },
        { nick: "Mateushholz", g: 0, a: 0, pj: 3 },
        { nick: "Stan", g: 0, a: 2, pj: 4 },
        { nick: "Victorz", g: 3, a: 1, pj: 5 },
        { nick: "Douglas Vieira", g: 0, a: 0, pj: 1 }
      ]
    },
    {
      name: "Insight",
      players: [
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
    },
    {
      name: "Inter Bujao",
      players: [
        { nick: "Diego Hernandez", g: 0, a: 0, pj: 0 },
        { nick: "Eddithecavas", g: 0, a: 0, pj: 0 },
        { nick: "Joaozito", g: 0, a: 1, pj: 4 },
        { nick: "Levios", g: 1, a: 0, pj: 2 },
        { nick: "Mexes", g: 0, a: 1, pj: 2 },
        { nick: "Mascara", g: 0, a: 0, pj: 4 },
        { nick: "remboletiti", g: 0, a: 0, pj: 2 },
        { nick: "Segovinha", g: 1, a: 0, pj: 3 },
        { nick: "Trophy_skywalker", g: 0, a: 1, pj: 2 },
        { nick: "Urubu_", g: 0, a: 0, pj: 2 },
        { nick: "VitinhoCruz", g: 1, a: 0, pj: 1 },
        { nick: "Socrattes", g: 0, a: 0, pj: 1 }
      ]
    }
  ];

  const tableStats = [
    { name: "Insight", group: "A", pts: 15, j: 6, v: 5, e: 0, d: 1, gf: 17, gc: 4 },
    { name: "Fiorentina", group: "A", pts: 15, j: 6, v: 5, e: 0, d: 1, gf: 17, gc: 6 },
    { name: "Bermudinha", group: "A", pts: 12, j: 6, v: 4, e: 0, d: 2, gf: 8, gc: 4 },
    { name: "Big Fish", group: "A", pts: 9, j: 6, v: 3, e: 0, d: 3, gf: 11, gc: 8 },
    { name: "Almagro", group: "A", pts: 9, j: 6, v: 3, e: 0, d: 3, gf: 10, gc: 3 },
    { name: "Warriors", group: "A", pts: 3, j: 6, v: 1, e: 0, d: 5, gf: 3, gc: 16 },
    { name: "Inter Bujao", group: "A", pts: 0, j: 6, v: 0, e: 0, d: 6, gf: 3, gc: 27 },
  ];

  const dbTeams = {};

  // 3. Crear Equipos, Jugadores, e insertarlos al torneo
  for (const t of teamsData) {
    let team = await prisma.team.findUnique({ where: { name: t.name } });
    if (!team) {
      team = await prisma.team.create({ data: { name: t.name } });
    }
    dbTeams[t.name] = team;

    const tStats = tableStats.find(ts => ts.name === t.name);

    const tt = await prisma.tournamentTeam.create({
      data: {
        tournament: { connect: { id: copaTor.id } },
        team: { connect: { id: team.id } },
        group: "A", // Unico grupo / tabla general
        manualPoints: tStats ? tStats.pts : 0,
        manualGamesPlayed: tStats ? tStats.j : 0,
        manualWins: tStats ? tStats.v : 0,
        manualDraws: tStats ? tStats.e : 0,
        manualLosses: tStats ? tStats.d : 0,
        manualGoalsFor: tStats ? tStats.gf : 0,
        manualGoalsAgainst: tStats ? tStats.gc : 0
      }
    });

    for (const p of t.players) {
      let pEnt = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!pEnt) {
        pEnt = await prisma.player.create({ data: { nick: p.nick } });
      }
      await prisma.tournamentPlayer.create({
        data: {
          tournamentTeam: { connect: { id: tt.id } },
          player: { connect: { id: pEnt.id } }
        }
      });
    }
  }

  // 4. Crear Partidos Ficticios para PJ y Partido Historico
  let matchStatsToInsert = [];

  for (const t of teamsData) {
    const teamEnt = dbTeams[t.name];
    let maxPj = 0;
    for (const p of t.players) {
      if (p.pj > maxPj) maxPj = p.pj;
    }

    const playerCurrentPj = {};
    for (const p of t.players) {
      playerCurrentPj[p.nick] = 0;
    }

    // Crear N partidos ficticios
    for (let i = 0; i < maxPj; i++) {
      const dummyMatch = await prisma.match.create({
        data: {
          tournament: { connect: { id: copaTor.id } },
          homeTeam: { connect: { id: teamEnt.id } },
          awayTeam: { connect: { id: teamEnt.id } },
          homeScore: 0,
          awayScore: 0,
          round: "Ficticio (PJ)",
          status: "PLAYED"
        }
      });

      for (const p of t.players) {
        let mt = 0;
        if (playerCurrentPj[p.nick] < p.pj) {
          mt = 90;
          playerCurrentPj[p.nick]++;
        }
        
        const pEnt = await prisma.player.findUnique({ where: { nick: p.nick } });
        // Lo asignamos 1 sola vez (al homeTeam)
        matchStatsToInsert.push({
          matchId: dummyMatch.id,
          playerId: pEnt.id,
          goals: 0,
          assists: 0,
          matchTime: mt
        });
      }
    }

    // Crear 1 partido historico para Goles y Asistencias
    const histMatch = await prisma.match.create({
      data: {
        tournament: { connect: { id: copaTor.id } },
        homeTeam: { connect: { id: teamEnt.id } },
        awayTeam: { connect: { id: teamEnt.id } },
        homeScore: t.players.reduce((sum, p) => sum + p.g, 0),
        awayScore: 0,
        round: "Historico",
        status: "PLAYED"
      }
    });

    for (const p of t.players) {
      const pEnt = await prisma.player.findUnique({ where: { nick: p.nick } });
      matchStatsToInsert.push({
        matchId: histMatch.id,
        playerId: pEnt.id,
        goals: p.g,
        assists: p.a,
        matchTime: 0
      });
    }
  }

  // Insert all stats at once
  if (matchStatsToInsert.length > 0) {
    await prisma.matchStat.createMany({ data: matchStatsToInsert });
  }

  // 5. Crear Partidos Reales de Playoff
  const playoffs = [
    { round: "Desempate", h: "Insight", a: "Fiorentina", hg: null, ag: null, status: "SCHEDULED" },
    { round: "Playoff", h: "Almagro", a: "Fiorentina", hg: null, ag: null, status: "SCHEDULED" },
    { round: "Playoff", h: "Big Fish", a: "Bermudinha", hg: 4, ag: 1, status: "PLAYED" },
    { round: "Semifinal", h: "Big Fish", a: "Almagro", hg: null, ag: null, status: "SCHEDULED" },
    { round: "Final", h: "Big Fish", a: "Insight", hg: 0, ag: 0, hp: 5, ap: 4, status: "PLAYED" }
  ];

  for (const m of playoffs) {
    const hTeam = dbTeams[m.h];
    const aTeam = dbTeams[m.a];
    if (!hTeam || !aTeam) {
      console.error("No se encontro el equipo para el partido", m);
      continue;
    }
    await prisma.match.create({
      data: {
        tournament: { connect: { id: copaTor.id } },
        homeTeam: { connect: { id: hTeam.id } },
        awayTeam: { connect: { id: aTeam.id } },
        homeScore: m.hg,
        awayScore: m.ag,
        homePenaltyScore: m.hp || null,
        awayPenaltyScore: m.ap || null,
        round: m.round,
        status: m.status
      }
    });
  }

  console.log("Temporada 11 seeded successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
