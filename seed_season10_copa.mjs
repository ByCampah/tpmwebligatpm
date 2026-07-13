import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Temporada 10 Copa TPM...");

  // Find Category
  let cat = await prisma.category.findUnique({ where: { name: "Copa TPM" } });
  if (!cat) {
    cat = await prisma.category.create({ data: { name: "Copa TPM" } });
  }

  // Find Season
  const season = await prisma.season.findUnique({ where: { name: "Temporada 10 (2022)" } });
  if (!season) {
    console.error("Temporada 10 (2022) no existe! Correr seed_season10.mjs primero.");
    return;
  }

  // Find Liga TPM to copy rosters
  const ligaTpmCat = await prisma.category.findUnique({ where: { name: "Liga TPM" } });
  const ligaTor = await prisma.tournament.findFirst({
    where: { seasonId: season.id, categoryId: ligaTpmCat.id }
  });
  if (!ligaTor) {
    console.error("Torneo Liga TPM de Temporada 10 no existe!");
    return;
  }

  // Create or Find Copa Tournament
  let copaTor = await prisma.tournament.findFirst({
    where: { name: "Copa TPM", seasonId: season.id, categoryId: cat.id }
  });
  if (!copaTor) {
    copaTor = await prisma.tournament.create({
      data: {
        name: "Copa TPM",
        format: "CUP",
        season: { connect: { id: season.id } },
        category: { connect: { id: cat.id } },
        isOfficial: true,
      }
    });
  } else {
    // Clean up matches and tournament teams
    await prisma.match.deleteMany({ where: { tournamentId: copaTor.id } });
    await prisma.tournamentPlayer.deleteMany({ where: { tournamentTeam: { tournamentId: copaTor.id } } });
    await prisma.tournamentTeam.deleteMany({ where: { tournamentId: copaTor.id } });
  }

  const teamStats = [
    // GRUPO A
    { name: "Almagro", group: "A", pts: 8, j: 4, v: 2, e: 2, d: 0, gf: 6, gc: 4 },
    { name: "Dortmund", group: "A", pts: 7, j: 4, v: 2, e: 1, d: 1, gf: 8, gc: 5 },
    { name: "Warriors", group: "A", pts: 1, j: 4, v: 0, e: 1, d: 3, gf: 2, gc: 7 },
    // GRUPO B
    { name: "Coritiba", group: "B", pts: 7, j: 4, v: 2, e: 1, d: 1, gf: 13, gc: 7 },
    { name: "Bermudinha", group: "B", pts: 7, j: 4, v: 2, e: 1, d: 1, gf: 10, gc: 8 },
    { name: "Big Fish", group: "B", pts: 2, j: 4, v: 0, e: 2, d: 2, gf: 7, gc: 14 },
  ];

  for (const ts of teamStats) {
    const team = await prisma.team.findUnique({ where: { name: ts.name } });
    
    // Create TournamentTeam with manual stats
    const tTeam = await prisma.tournamentTeam.create({
      data: {
        tournament: { connect: { id: copaTor.id } },
        team: { connect: { id: team.id } },
        group: ts.group,
        manualPoints: ts.pts,
        manualGamesPlayed: ts.j,
        manualWins: ts.v,
        manualDraws: ts.e,
        manualLosses: ts.d,
        manualGoalsFor: ts.gf,
        manualGoalsAgainst: ts.gc
      }
    });

    // Copy roster from Liga TPM
    const ligaTTeam = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: ligaTor.id, teamId: team.id } },
      include: { players: { include: { player: true } } }
    });

    if (ligaTTeam) {
      for (const tPlayer of ligaTTeam.players) {
        await prisma.tournamentPlayer.create({
          data: {
            tournamentTeam: { connect: { id: tTeam.id } },
            player: { connect: { id: tPlayer.player.id } }
          }
        });
      }
    }
  }

  // Create Playoff Matches
  const playoffs = [
    { round: "Semifinal", h: "Almagro", a: "Bermudinha", hg: 0, ag: 0, hp: 3, ap: 4 },
    { round: "Semifinal", h: "Coritiba", a: "Dortmund", hg: 5, ag: 0 },
    { round: "Tercer Puesto", h: "Almagro", a: "Dortmund", hg: 1, ag: 0 },
    { round: "Final", h: "Coritiba", a: "Bermudinha", hg: 1, ag: 0 }
  ];

  for (const m of playoffs) {
    const hTeam = await prisma.team.findUnique({ where: { name: m.h } });
    const aTeam = await prisma.team.findUnique({ where: { name: m.a } });
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
        status: "PLAYED"
      }
    });
  }

  console.log("Copa TPM Temporada 10 seeded successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
