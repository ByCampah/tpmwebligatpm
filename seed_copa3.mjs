import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const season = await prisma.season.findUnique({
    where: { name: "Temporada 3" }
  });

  if (!season) {
    console.error("Temporada 3 not found");
    return;
  }

  let tournament = await prisma.tournament.findFirst({
    where: { name: "Copa T3", seasonId: season.id }
  });

  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: "Copa T3",
        format: "CUP",
        category: "Copa TPM",
        seasonId: season.id
      }
    });
  }

  const teams = ["Almagro", "Fiorentina", "RBH", "Dreamers", "Insight", "Galaxy"];
  const dbTeams = {};
  
  for (const tName of teams) {
    let t = await prisma.team.findUnique({ where: { name: tName } });
    if (!t) {
      t = await prisma.team.create({ data: { name: tName } });
    }
    dbTeams[tName] = t;

    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: t.id } },
      update: {},
      create: { tournamentId: tournament.id, teamId: t.id }
    });
  }

  const matches = [
    { round: "PlayOff", home: "Almagro", away: "Fiorentina", homeScore: 1, awayScore: 1 },
    { round: "PlayOff", home: "RBH", away: "Dreamers", homeScore: 7, awayScore: 1 },
    { round: "Semifinal", home: "Insight", away: "RBH", homeScore: 2, awayScore: 1 },
    { round: "Semifinal", home: "Galaxy", away: "Almagro", homeScore: 4, awayScore: 0 },
    { round: "Final", home: "Insight", away: "Galaxy", homeScore: 1, awayScore: 1 },
    { round: "3er Puesto", home: "Almagro", away: "RBH", homeScore: 1, awayScore: 0 },
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: dbTeams[m.home].id,
        awayTeamId: dbTeams[m.away].id,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        round: m.round,
        status: "PLAYED",
        matchDate: new Date()
      }
    });
  }

  console.log("Copa T3 matches added successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
