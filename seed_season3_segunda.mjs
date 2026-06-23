import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Season 3 Segunda Division...");

  const seasonName = "Temporada 3";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: false } });
  }

  const teamNames = ["Borussia", "Botijas", "Paranaense", "Inter", "Voxed", "Manchester"];
  const teamIds = {};

  for (const name of teamNames) {
    let team = await prisma.team.findFirst({ where: { name } });
    if (!team) {
      team = await prisma.team.create({ data: { name } });
      console.log(`Created team: ${name}`);
    }
    teamIds[name] = team.id;
  }

  // 1. LIGA DE SEGUNDA DIVISIÓN
  const liga = await prisma.tournament.create({
    data: {
      seasonId: season.id,
      name: "Liga Segunda División T3",
      format: "LEAGUE",
      category: "Segunda División",
    }
  });

  for (const name of teamNames) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: liga.id, teamId: teamIds[name] }
    });
  }

  // Matches for Liga (invented, approximating stats)
  const ligaMatches = [
    { home: "Borussia", away: "Botijas", hScore: 2, aScore: 2, round: "Fecha 1" },
    { home: "Paranaense", away: "Inter", hScore: 2, aScore: 2, round: "Fecha 1" },
    { home: "Voxed", away: "Manchester", hScore: 4, aScore: 2, round: "Fecha 1" },

    { home: "Botijas", away: "Inter", hScore: 4, aScore: 2, round: "Fecha 2" },
    { home: "Manchester", away: "Borussia", hScore: 0, aScore: 9, round: "Fecha 2" },
    { home: "Voxed", away: "Paranaense", hScore: 1, aScore: 4, round: "Fecha 2" },

    { home: "Borussia", away: "Voxed", hScore: 4, aScore: 2, round: "Fecha 3" },
    { home: "Botijas", away: "Paranaense", hScore: 5, aScore: 3, round: "Fecha 3" },
    { home: "Inter", away: "Manchester", hScore: 7, aScore: 2, round: "Fecha 3" },

    { home: "Paranaense", away: "Borussia", hScore: 1, aScore: 4, round: "Fecha 4" },
    { home: "Manchester", away: "Botijas", hScore: 1, aScore: 10, round: "Fecha 4" },
    { home: "Inter", away: "Voxed", hScore: 3, aScore: 1, round: "Fecha 4" },

    { home: "Borussia", away: "Inter", hScore: 3, aScore: 0, round: "Fecha 5" },
    { home: "Botijas", away: "Voxed", hScore: 3, aScore: 2, round: "Fecha 5" },
    { home: "Manchester", away: "Paranaense", hScore: 1, aScore: 9, round: "Fecha 5" },

    // Desempate
    { home: "Borussia", away: "Botijas", hScore: 2, aScore: 1, round: "Final Desempate" },
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
      { name: "Campeón (1er Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Borussia"] },
      { name: "Subcampeón (2do Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Botijas"] },
    ]
  });


  // 2. COPA DE SEGUNDA DIVISIÓN
  const copa = await prisma.tournament.create({
    data: {
      seasonId: season.id,
      name: "Copa Segunda División T3",
      format: "CUP",
      category: "Copa TPM", 
    }
  });

  for (const name of teamNames) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: copa.id, teamId: teamIds[name] }
    });
  }

  const copaMatches = [
    { home: "Paranaense", away: "Manchester", hScore: 1, aScore: 0, round: "Playoff" },
    { home: "Inter", away: "Voxed", hScore: 1, aScore: 0, round: "Playoff" },
    { home: "Botijas", away: "Paranaense", hScore: 5, aScore: 4, round: "Semifinal" },
    { home: "Borussia", away: "Inter", hScore: 2, aScore: 0, round: "Semifinal" },
    { home: "Paranaense", away: "Inter", hScore: 0, aScore: 3, round: "Tercer Puesto" },
    { home: "Borussia", away: "Botijas", hScore: 0, aScore: 0, round: "Final" }, 
  ];

  for (const m of copaMatches) {
    await prisma.match.create({
      data: {
        tournamentId: copa.id,
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

  // Trophies for Copa
  await prisma.trophy.createMany({
    data: [
      { name: "Campeón (1er Puesto)", type: "TEAM", tournamentId: copa.id, teamId: teamIds["Borussia"] },
      { name: "Subcampeón (2do Puesto)", type: "TEAM", tournamentId: copa.id, teamId: teamIds["Botijas"] },
      { name: "Tercer Puesto (3ro)", type: "TEAM", tournamentId: copa.id, teamId: teamIds["Inter"] },
    ]
  });

  console.log("Season 3 Segunda Division Seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
