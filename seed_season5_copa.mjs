import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Season 5 Copa TPM...");

  const season = await prisma.season.findFirst({ where: { name: "Temporada 5" } });

  // Create teams if missing
  const teamsData = ["Insight", "Bragantino", "Coritiba", "Almagro", "Empoli", "Vasco", "Galaxy", "Spurs", "Millwall"];
  for (const tName of teamsData) {
    const existing = await prisma.team.findFirst({ where: { name: tName } });
    if (!existing) {
      await prisma.team.create({ data: { name: tName } });
    }
  }

  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => allTeams.find(t => t.name.toLowerCase() === name.toLowerCase())?.id;

  const copa = await prisma.tournament.create({
    data: {
      seasonId: season.id,
      name: "Copa TPM T5",
      format: "GROUP_KNOCKOUT",
      category: "Copa",
    }
  });

  for (const tName of teamsData) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: copa.id, teamId: getTeamId(tName) }
    });
  }

  const matches = [
    { round: "Grupo A", home: "Coritiba", away: "Bragantino", homeScore: 0, awayScore: 3 },
    { round: "Grupo A", home: "Insight", away: "Coritiba", homeScore: 0, awayScore: 0 },
    { round: "Grupo A", home: "Bragantino", away: "Insight", homeScore: 0, awayScore: 1 },

    { round: "Grupo B", home: "Almagro", away: "Empoli", homeScore: 2, awayScore: 1 },
    { round: "Grupo B", home: "Almagro", away: "Vasco", homeScore: 3, awayScore: 2 },
    { round: "Grupo B", home: "Vasco", away: "Empoli", homeScore: 0, awayScore: 1 },

    { round: "Grupo C", home: "Galaxy", away: "Spurs", homeScore: 1, awayScore: 0 },
    { round: "Grupo C", home: "Spurs", away: "Millwall", homeScore: 3, awayScore: 0 },
    { round: "Grupo C", home: "Galaxy", away: "Millwall", homeScore: 5, awayScore: 1 },

    { round: "Play Off 2do", home: "Bragantino", away: "Empoli", homeScore: 6, awayScore: 2 },
    { round: "Play Off 2do", home: "Empoli", away: "Spurs", homeScore: 0, awayScore: 2 },
    { round: "Play Off 2do", home: "Spurs", away: "Bragantino", homeScore: 1, awayScore: 1 },

    { round: "Semi", home: "Almagro", away: "Bragantino", homeScore: 2, awayScore: 1 },
    { round: "Semi", home: "Insight", away: "Galaxy", homeScore: 0, awayScore: 1 },

    { round: "3er", home: "Bragantino", away: "Insight", homeScore: 0, awayScore: 1 },

    { round: "Final", home: "Almagro", away: "Galaxy", homeScore: 0, awayScore: 4 },
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: {
        tournamentId: copa.id,
        homeTeamId: getTeamId(m.home),
        awayTeamId: getTeamId(m.away),
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: "PLAYED",
        matchDate: new Date(),
        round: m.round
      }
    });
  }

  // Trophies
  await prisma.trophy.createMany({
    data: [
      { name: "Campeón Copa TPM", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Galaxy") },
      { name: "Subcampeón Copa TPM", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Almagro") },
      { name: "Tercer Puesto Copa", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Insight") },
    ]
  });

  console.log("Season 5 Copa TPM seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
