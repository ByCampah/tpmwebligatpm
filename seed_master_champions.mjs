import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const masterData = [
  {
    seasonName: "Temporada 1",
    liga: {
      champion: "Almagro",
      roster: ["Campah", "Brian", "JulianWeigl", "Zakaria", "Lixtinhos", "Harry Kane", "Tobias", "Titolatola", "Zeus", "Thomy", "Hazard"],
      goleador: "JulianWeigl",
      asistidor: "Imperador"
    },
    copa: null
  },
  {
    seasonName: "Temporada 2",
    liga: {
      champion: "Insight",
      roster: ["J.Valdivia", "Terry", "Mats Hummels", "Ze Elias", "Magossuel", "Juninho", "Victorz", "Amauri", "Cristovao", "Rashford"],
      goleador: "Harry Kane",
      asistidor: "Harry Kane"
    },
    copa: {
      champions: [
        { team: "Insight", roster: ["David Silva", "Harry Kane", "Diogosena", "Vlahovic", "M U T U", "Jadsun", "Paulo Dybala", "Victorz", "-Messi", "Chamito300ml"] },
        { team: "Almagro", roster: ["Tobias", "Brian", "Hazard", "Zakaria", "Daniel", "Trapp", "Sam", "Digne", "Thiagow"] }
      ],
      goleador: "JulianWeigl",
      asistidor: "Harry Kane"
    }
  },
  {
    seasonName: "Temporada 3",
    liga: {
      champion: "Galaxy",
      roster: ["Bergwijin", "Imperador", "CoutoAis", "Slade", "Bit", "Andrigo", "Tur-Sama", "M U T U", "Thiagow"],
      goleador: "Tobias",
      asistidor: "Brian"
    },
    copa: {
      champion: "Galaxy",
      roster: ["Campah", "Brian", "Diogosena", "Vlahovic", "M U T U", "Jadsun", "Sam", "Digne", "Thiagow"],
      goleador: "Rashford",
      asistidor: "Thomy"
    }
  },
  {
    seasonName: "Temporada 4",
    liga: {
      champion: "Insight",
      roster: ["Rodri", "Bergkamp", "Amauri", "Reinaldo", "M U T U", "Mats Hummels", "Digne", "Mozer"],
      goleador: "Jadsun",
      asistidor: "Thomy"
    },
    copa: null
  },
  {
    seasonName: "Temporada 5",
    liga: {
      champion: "Galaxy",
      roster: ["Tobias", "JulianWeigl", "Brian", "Campah", "Sam", "Zakaria", "Lsantos", "Thiagow"],
      goleador: "Harry Kane",
      asistidor: "Italo"
    },
    copa: {
      champion: "Galaxy",
      roster: ["Chamito300ml", "Harry Kane", "GrafinhoSOHTAPA", "GuisinhoCEARA", "Fuinha", "Bernd Leno", "Soneca"],
      goleador: "Harry Kane",
      asistidor: "Hazard"
    }
  },
  {
    seasonName: "Temporada 6",
    liga: {
      champion: "Leipzig",
      roster: ["Chamito300ml", "Harry Kane", "Hazard", "GrafinhoSOHTAPA", "GuisinhoCEARA", "Fuinha", "Gerard Pique", "Griezz", "Soneca", "Vlahovic"],
      goleador: "JulianWeigl",
      asistidor: "Diogosena"
    },
    copa: {
      champion: "Coritiba",
      roster: ["JulianWeigl", "-Martinelli", "M U T U", "Jadsun", "Victorz", "Alex Chen"],
      goleador: "Victorz",
      asistidor: "Bergwijin"
    }
  },
  {
    seasonName: "Temporada 7",
    liga: {
      champion: "Coritiba",
      roster: ["Rashford", "Brian", "Zakaria", "Imperador", "Daniel", "Victorz", "Sant", "Stan", "Pedryn", "JulianWeigl"],
      goleador: "Harry Kane",
      asistidor: "Aqua"
    },
    copa: {
      champion: "Coritiba",
      roster: ["Marmota", "Vlahovic", "Slade", "-Martinelli", "Mate", "Brian", "Hazard", "Zakaria"],
      goleador: "Harry Kane",
      asistidor: "E. Cebolinha"
    }
  },
  {
    seasonName: "Temporada 8",
    liga: {
      champion: "Insight",
      roster: ["David Silva", "Harry Kane", "Hazard", "Daniel Bolivar", "Digne", "Leo Silva", "Gerard Pique", "JulianWeigl", "Alex Chen"],
      goleador: "Harry Kane",
      asistidor: "E. Cebolinha"
    },
    copa: {
      champion: "Almagro",
      roster: ["Harry Kane", "E. Cebolinha", "Diogosena", "Slade", "Rafard", "Aqua", "Razor", "KokePizzaiolo"],
      goleador: "Kyrie Develing",
      asistidor: "Jadsun"
    }
  },
  {
    seasonName: "Temporada 9",
    liga: {
      champion: "Almagro",
      roster: ["Digne", "Rodri", "Amauri", "Rashford", "Douglas Vieira", "Bergkamp", "Lsantos", "Pedro a", "Alex Chen", "Neymar"],
      goleador: "Kyrie Develing",
      asistidor: "Victorz"
    },
    copa: null
  },
  {
    seasonName: "Temporada 10",
    liga: {
      champion: "Big Fish",
      roster: ["JulianWeigl", "Pedro A", "Neymar", "Slade", "David Silva", "Trapp", "Bernd Leno", "Griezz", "Baron", "Rashford"],
      goleador: "Kyrie Develing",
      asistidor: "Harry Kane"
    },
    copa: {
      champion: "Dortmund",
      roster: ["Bergwijin", "-Martinelli", "M U T U", "Jadsun", "JulianWeigl", "Victorz", "Alex Chen"],
      goleador: "Richarlison",
      asistidor: "Harry Kane"
    }
  },
  {
    seasonName: "Temporada 11",
    liga: {
      champion: "Insight",
      roster: ["Brian", "Jadsun", "Harry Kane", "Diogosena", "Victorz", "Madru", "E. Cebolinha", "Muleke", "Rafard"],
      goleador: "Campah",
      asistidor: "F.Totti"
    },
    copa: {
      champion: "Caldense",
      roster: ["Thigomovic", "Mertens", "Hazard", "KokePizzaiolo", "Mansi", "Marmota", "Rafard", "Mateuhholz"],
      goleador: "Campah",
      asistidor: "JulianWeigl"
    }
  },
  {
    seasonName: "Liga 1 x8",
    liga: {
      champion: "Lyon",
      roster: ["Bergwijin", "Not Found", "Boop", "Rafard", "Hazard", "Busquets", "-martinelli", "Brian", "F.Totti"],
      goleador: "-Martinelli",
      asistidor: "Campah"
    },
    copa: null
  }
];

async function getOrCreatePlayer(nick) {
  let p = await prisma.player.findUnique({ where: { nick } });
  if (!p) p = await prisma.player.create({ data: { nick } });
  return p.id;
}

async function getOrCreateTeam(name) {
  let t = await prisma.team.findUnique({ where: { name } });
  if (!t) t = await prisma.team.create({ data: { name } });
  return t.id;
}

async function getOrCreateTournamentTeam(tournamentId, teamId) {
  let tt = await prisma.tournamentTeam.findUnique({ where: { tournamentId_teamId: { tournamentId, teamId } } });
  if (!tt) tt = await prisma.tournamentTeam.create({ data: { tournamentId, teamId } });
  return tt.id;
}

async function setRoster(tournamentId, teamName, rosterNicks) {
  const teamId = await getOrCreateTeam(teamName);
  const ttId = await getOrCreateTournamentTeam(tournamentId, teamId);

  // Clear existing roster
  await prisma.tournamentPlayer.deleteMany({ where: { tournamentTeamId: ttId } });

  const uniqueNicks = Array.from(new Set(rosterNicks));
  for (const nick of uniqueNicks) {
    const pId = await getOrCreatePlayer(nick);
    await prisma.tournamentPlayer.create({
      data: { tournamentTeamId: ttId, playerId: pId }
    });
  }
}

async function createAwards(tournamentId, data) {
  if (data.goleador) {
    const pId = await getOrCreatePlayer(data.goleador);
    await prisma.trophy.create({
      data: { name: "Goleador", type: "PLAYER", tournamentId, playerId: pId }
    });
  }
  if (data.asistidor) {
    const pId = await getOrCreatePlayer(data.asistidor);
    await prisma.trophy.create({
      data: { name: "Mejor Asistidor", type: "PLAYER", tournamentId, playerId: pId }
    });
  }
}

async function main() {
  console.log("Cleaning up all existing trophies...");
  await prisma.trophy.deleteMany({});
  
  for (const sData of masterData) {
    let season = await prisma.season.findFirst({ where: { name: sData.seasonName } });
    if (!season) {
      season = await prisma.season.create({ data: { name: sData.seasonName } });
      console.log(`Created Season: ${sData.seasonName}`);
    }

    if (sData.liga) {
      let liga = await prisma.tournament.findFirst({ where: { seasonId: season.id, format: { in: ["LEAGUE", "LEAGUE_PLAYOFF", "LIGA_CON_PLAYOFFS"] } } });
      if (!liga) {
        liga = await prisma.tournament.create({
          data: { seasonId: season.id, name: `Liga TPM`, format: "LEAGUE", category: "Primera División" }
        });
      }
      
      const teamId = await getOrCreateTeam(sData.liga.champion);
      await prisma.trophy.create({
        data: { name: "Campeón Liga", type: "TEAM", tournamentId: liga.id, teamId }
      });
      await setRoster(liga.id, sData.liga.champion, sData.liga.roster);
      await createAwards(liga.id, sData.liga);
    }

    if (sData.copa) {
      let copa = await prisma.tournament.findFirst({ where: { seasonId: season.id, format: { in: ["KNOCKOUT", "GROUP_KNOCKOUT"] } } });
      if (!copa) {
        copa = await prisma.tournament.create({
          data: { seasonId: season.id, name: `Copa TPM`, format: "GROUP_KNOCKOUT", category: "Copa" }
        });
      }

      if (sData.copa.champions) {
        // T2 special case
        for (const champ of sData.copa.champions) {
          const tId = await getOrCreateTeam(champ.team);
          await prisma.trophy.create({
            data: { name: "Campeón Copa", type: "TEAM", tournamentId: copa.id, teamId: tId }
          });
          await setRoster(copa.id, champ.team, champ.roster);
        }
      } else {
        const teamId = await getOrCreateTeam(sData.copa.champion);
        await prisma.trophy.create({
          data: { name: "Campeón Copa", type: "TEAM", tournamentId: copa.id, teamId }
        });
        await setRoster(copa.id, sData.copa.champion, sData.copa.roster);
      }
      await createAwards(copa.id, sData.copa);
    }
  }

  console.log("All trophies and champion rosters updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
