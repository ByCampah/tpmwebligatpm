import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Season 5 Primera Division Teams & Rosters...");

  const seasonName = "Temporada 5";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: false } });
  }

  const teamsData = {
    "Almagro": ["Campah", "Oliver Kahn", "lsantos", "Pache", "Vlady", "Frank Fabra", "Getlow", "Thomy", "Juninho", "Richarlison", "Titolatola", "Gabito"],
    "Lorient": ["Ruan404", "Zakaria", "Tobias", "Marmota", "Neymar", "Brian", "Jeffin", "Mozer", "griezz", "Sam"],
    "Spurs": ["Bergwijin", "E. Cebolinha", "digne", "Rashford", "Reusinho", "Madru", "Mimetico", "Pedro a", "Razor", "J.Valdivia"],
    "Vasco": ["Combado", "Shaw", "Benatia", "Felipe Ronaldo", "Ramonzin", "Mateo", "Toni", "Baron", "Johaennes Cryuff", "Diogosena", "Slade", "Lemes"],
    "Coritiba": ["Aqua", "Gab", "PauloDybala", "Kokepizzaiolo", "Pedryn", "G. Buffon", "Afonso", "Ronin", "Brenobr"],
    "Millwall": ["lSantos", "Imperador", "Kirye Deveiling", "Slade", "Lemes", "Juninho", "Gullit", "J.Valdivia", "Emerson"],
    "Bragantino": ["Thigomovic", "Magossuel", "Bergkamp", "Fey", "David Silva", "Kepa", "Jadsun", "JulianWeigl", "Thiagow"],
    "Insight": ["Harry Kane", "Hazard", "Mutu", "Rafard", "Douglas", "Bernd Leno", "Busquets", "Stan", "Amauri"],
    "Warrios": ["Filipe Patricio", "Mertens", "Nero", "-Martinelli", "P.Lahm", "Joabe", "Keylor", "Kedric", "Lucas 2000", "Kyrie Develing", "Renan", "Osman"],
    "Inter": ["Logan_", "Joazito", "Zak", "Masc4ra", "Dogo", "Goiano", "Caiothebr", "drtrophyrr", "Paolo Maldini", "VitinhoCruz", "Levios", "Enzowanted"]
  };

  const teamNames = Object.keys(teamsData);
  const teamIds = {};

  for (const name of teamNames) {
    let team = await prisma.team.findFirst({ where: { name } });
    if (!team) {
      team = await prisma.team.create({ data: { name } });
      console.log(`Created team: ${name}`);
    }
    teamIds[name] = team.id;
  }

  // 1. LIGA DE PRIMERA DIVISIÓN
  const liga = await prisma.tournament.create({
    data: {
      seasonId: season.id,
      name: "Liga Primera División T5",
      format: "LEAGUE",
      category: "Primera División",
    }
  });

  for (const name of teamNames) {
    const tt = await prisma.tournamentTeam.create({
      data: { tournamentId: liga.id, teamId: teamIds[name] }
    });

    const players = teamsData[name];
    for (const nick of players) {
      let player = await prisma.player.findUnique({ where: { nick } });
      if (!player) {
        player = await prisma.player.create({ data: { nick } });
      }

      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: tt.id, playerId: player.id }
      });
    }
  }

  console.log("Season 5 Teams and Rosters seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
