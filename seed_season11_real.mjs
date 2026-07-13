import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Adding Real Matches for Temporada 11...");

  const season = await prisma.season.findUnique({ where: { name: "Temporada 11 (2023)" } });
  const cat = await prisma.category.findUnique({ where: { name: "Liga TPM" } });
  const tor = await prisma.tournament.findFirst({
    where: { seasonId: season.id, categoryId: cat.id }
  });

  if (!tor) {
    console.error("Torneo no encontrado");
    return;
  }

  // 1. Rename existing round names to "Estadísticas Históricas" so they hide properly in the frontend
  await prisma.match.updateMany({
    where: {
      tournamentId: tor.id,
      round: { in: ["Historico", "Ficticio (PJ)"] }
    },
    data: {
      round: "Estadísticas Históricas"
    }
  });
  console.log("Partidos ficticios actualizados a 'Estadísticas Históricas'");

  const realMatches = [
    // Fecha 1
    { r: "Fecha 1", h: "Fiorentina", a: "Inter Bujao", hg: 9, ag: 1 },
    { r: "Fecha 1", h: "Insight", a: "Big Fish", hg: 1, ag: 0 },
    { r: "Fecha 1", h: "Warriors", a: "Bermudinha", hg: 0, ag: 4 },
    // Fecha 2
    { r: "Fecha 2", h: "Bermudinha", a: "Insight", hg: 3, ag: 1 },
    { r: "Fecha 2", h: "Big Fish", a: "Fiorentina", hg: 1, ag: 3 },
    { r: "Fecha 2", h: "Inter Bujao", a: "Almagro", hg: 0, ag: 5 },
    // Fecha 3
    { r: "Fecha 3", h: "Almagro", a: "Big Fish", hg: 2, ag: 0 },
    { r: "Fecha 3", h: "Fiorentina", a: "Bermudinha", hg: 2, ag: 1 },
    { r: "Fecha 3", h: "Insight", a: "Warriors", hg: 5, ag: 0 },
    // Fecha 4
    { r: "Fecha 4", h: "Bermudinha", a: "Almagro", hg: 0, ag: 1 },
    { r: "Fecha 4", h: "Big Fish", a: "Inter Bujao", hg: 6, ag: 2 },
    { r: "Fecha 4", h: "Warriors", a: "Fiorentina", hg: 2, ag: 3 },
    // Fecha 5
    { r: "Fecha 5", h: "Bermudinha", a: "Big Fish", hg: 0, ag: 1 },
    { r: "Fecha 5", h: "Insight", a: "Almagro", hg: 2, ag: 1 },
    { r: "Fecha 5", h: "Warriors", a: "Inter Bujao", hg: 0, ag: 1 },
    // Fecha 6
    { r: "Fecha 6", h: "Almagro", a: "Warriors", hg: 2, ag: 1 },
    { r: "Fecha 6", h: "Fiorentina", a: "Insight", hg: 0, ag: 1 },
    { r: "Fecha 6", h: "Inter Bujao", a: "Bermudinha", hg: 0, ag: 1 },
    // Fecha 7
    { r: "Fecha 7", h: "Almagro", a: "Fiorentina", hg: 1, ag: 0 },
    { r: "Fecha 7", h: "Big Fish", a: "Warriors", hg: 3, ag: 0 },
    { r: "Fecha 7", h: "Inter Bujao", a: "Insight", hg: 0, ag: 7 },
  ];

  let matchStatsToInsert = [];

  for (const rm of realMatches) {
    const hTeam = await prisma.team.findUnique({ where: { name: rm.h } });
    const aTeam = await prisma.team.findUnique({ where: { name: rm.a } });
    if (!hTeam || !aTeam) {
      console.log("No se pudo encontrar equipo:", rm);
      continue;
    }

    const match = await prisma.match.create({
      data: {
        tournament: { connect: { id: tor.id } },
        homeTeam: { connect: { id: hTeam.id } },
        awayTeam: { connect: { id: aTeam.id } },
        homeScore: rm.hg,
        awayScore: rm.ag,
        round: rm.r,
        status: "PLAYED",
      }
    });

    const hTt = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tor.id, teamId: hTeam.id } },
      include: { players: { include: { player: true } } }
    });
    const aTt = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tor.id, teamId: aTeam.id } },
      include: { players: { include: { player: true } } }
    });

    if (hTt) {
      for (const tp of hTt.players) {
        matchStatsToInsert.push({
          matchId: match.id,
          playerId: tp.playerId,
          matchTime: 0,
          goals: 0,
          assists: 0
        });
      }
    }
    
    if (aTt) {
      for (const tp of aTt.players) {
        matchStatsToInsert.push({
          matchId: match.id,
          playerId: tp.playerId,
          matchTime: 0,
          goals: 0,
          assists: 0
        });
      }
    }
  }

  if (matchStatsToInsert.length > 0) {
    await prisma.matchStat.createMany({ data: matchStatsToInsert });
  }

  console.log("Real matches for Season 11 added successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
