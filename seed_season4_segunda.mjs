import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateMatches() {
  const teams = ["Blacky", "Tigre", "Coloridos", "Paranaense", "Inter", "Coritiba"];
  const targetGF = { "Blacky": 44, "Tigre": 29, "Coloridos": 24, "Paranaense": 16, "Inter": 14, "Coritiba": 9 }; // Coritiba 9 to fix math
  
  const matches = [
    { A: "Blacky", B: "Tigre", res: "D" },
    { A: "Blacky", B: "Tigre", res: "W" },
    { A: "Blacky", B: "Coloridos", res: "W" },
    { A: "Blacky", B: "Coloridos", res: "W" },
    { A: "Blacky", B: "Paranaense", res: "W" },
    { A: "Blacky", B: "Paranaense", res: "W" },
    { A: "Blacky", B: "Inter", res: "W" },
    { A: "Blacky", B: "Inter", res: "W" },
    { A: "Blacky", B: "Coritiba", res: "W" },
    { A: "Blacky", B: "Coritiba", res: "W" },
    { A: "Tigre", B: "Coloridos", res: "W" },
    { A: "Tigre", B: "Coloridos", res: "L" },
    { A: "Tigre", B: "Paranaense", res: "W" },
    { A: "Tigre", B: "Paranaense", res: "W" },
    { A: "Tigre", B: "Inter", res: "W" },
    { A: "Tigre", B: "Inter", res: "W" },
    { A: "Tigre", B: "Coritiba", res: "W" },
    { A: "Tigre", B: "Coritiba", res: "W" },
    { A: "Coloridos", B: "Paranaense", res: "D" },
    { A: "Coloridos", B: "Paranaense", res: "W" },
    { A: "Coloridos", B: "Inter", res: "W" },
    { A: "Coloridos", B: "Inter", res: "L" },
    { A: "Coloridos", B: "Coritiba", res: "W" },
    { A: "Coloridos", B: "Coritiba", res: "L" },
    { A: "Paranaense", B: "Inter", res: "W" },
    { A: "Paranaense", B: "Inter", res: "L" },
    { A: "Paranaense", B: "Coritiba", res: "W" },
    { A: "Paranaense", B: "Coritiba", res: "W" },
    { A: "Inter", B: "Coritiba", res: "W" },
    { A: "Inter", B: "Coritiba", res: "L" }
  ];

  while (true) {
    // Initialize base goals
    matches.forEach(m => {
      if (m.res === "W") { m.gA = 1; m.gB = 0; }
      else if (m.res === "L") { m.gA = 0; m.gB = 1; }
      else { m.gA = 0; m.gB = 0; }
    });

    let stuck = false;
    let iterations = 0;
    while (true) {
      iterations++;
      if (iterations > 5000) {
        stuck = true; break;
      }

      let currentGF = { "Blacky": 0, "Tigre": 0, "Coloridos": 0, "Paranaense": 0, "Inter": 0, "Coritiba": 0 };
      matches.forEach(m => { currentGF[m.A] += m.gA; currentGF[m.B] += m.gB; });
      
      let def = {};
      let totalDef = 0;
      for (const t of teams) {
        def[t] = targetGF[t] - currentGF[t];
        totalDef += def[t];
      }

      if (totalDef === 0) return matches; // WE FOUND IT!

      // Pick a random match
      let m = matches[Math.floor(Math.random() * matches.length)];
      
      // We want to add a goal to a team that needs it.
      let needsA = def[m.A] > 0;
      let needsB = def[m.B] > 0;

      if (!needsA && !needsB) continue;

      let tryAddA = false, tryAddB = false;
      if (needsA && needsB) {
        if (Math.random() > 0.5) tryAddA = true; else tryAddB = true;
      } else if (needsA) tryAddA = true;
      else tryAddB = true;

      if (tryAddA) {
        if (m.res === "W") m.gA++;
        else if (m.res === "L") {
          if (m.gA + 1 < m.gB) m.gA++;
          else if (needsB) { m.gA++; m.gB++; }
        }
        else if (m.res === "D") {
          if (needsB) { m.gA++; m.gB++; }
        }
      } else if (tryAddB) {
        if (m.res === "L") m.gB++;
        else if (m.res === "W") {
          if (m.gB + 1 < m.gA) m.gB++;
          else if (needsA) { m.gA++; m.gB++; }
        }
        else if (m.res === "D") {
          if (needsA) { m.gA++; m.gB++; }
        }
      }
    }
  }
}

async function main() {
  console.log("Seeding Season 4 Segunda Division...");

  const seasonName = "Temporada 4";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: false } });
  }

  const teamNames = ["Blacky", "Tigre", "Coloridos", "Paranaense", "Inter", "Coritiba"];
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
      name: "Liga Segunda División T4",
      format: "LEAGUE",
      category: "Segunda División",
    }
  });

  for (const name of teamNames) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: liga.id, teamId: teamIds[name] }
    });
  }

  const generated = generateMatches();
  let roundIdx = 1;
  for (const m of generated) {
    let r = `Fecha ${Math.ceil(roundIdx / 3)}`;
    roundIdx++;
    await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: teamIds[m.A],
        awayTeamId: teamIds[m.B],
        homeScore: m.gA,
        awayScore: m.gB,
        status: "PLAYED",
        matchDate: new Date(),
        round: r
      }
    });
  }

  // Trophies
  await prisma.trophy.createMany({
    data: [
      { name: "Campeón (1er Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Blacky"] },
      { name: "Subcampeón (2do Puesto)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Tigre"] },
      { name: "Tercer Puesto (3ro)", type: "TEAM", tournamentId: liga.id, teamId: teamIds["Coloridos"] },
    ]
  });

  // ROSTERS & STATS
  const playerStats = {
    "Blacky": [
      { nick: "Felipe", goals: 8, assists: 2 },
      { nick: "Zabot", goals: 6, assists: 5 },
      { nick: "lSantos", goals: 3, assists: 5 },
      { nick: "Ruan", goals: 2, assists: 3 },
      { nick: "AndyCare", goals: 7, assists: 7 },
      { nick: "Richarlison", goals: 18, assists: 8 },
    ],
    "Paranaense": [
      { nick: "Ramonzin", goals: 2, assists: 2 },
      { nick: "Stan", goals: 4, assists: 1 },
      { nick: "Lemes", goals: 1, assists: 0 },
      { nick: "Traore", goals: 1, assists: 1 },
      { nick: "Cismado", goals: 6, assists: 2 },
      { nick: "Veiga", goals: 1, assists: 4 },
      { nick: "Osman", goals: 1, assists: 2 },
    ],
    "Coloridos": [
      { nick: "Ibra", goals: 0, assists: 0 },
      { nick: "Delaney", goals: 4, assists: 4 },
      { nick: "Fabra", goals: 6, assists: 3 },
      { nick: "Mateo", goals: 6, assists: 3 },
      { nick: "Doudou", goals: 1, assists: 0 },
      { nick: "Combado", goals: 0, assists: 0 },
      { nick: "Lucas 2000", goals: 5, assists: 1 },
    ],
    "Inter": [
      { nick: "Bonuccino", goals: 1, assists: 0 },
      { nick: "Eddy", goals: 3, assists: 4 },
      { nick: "Bnet", goals: 2, assists: 1 },
      { nick: "Jovirone", goals: 6, assists: 2 },
      { nick: "Menino", goals: 2, assists: 1 },
    ],
    "Tigre": [
      { nick: "Andre", goals: 6, assists: 2 },
      { nick: "Watt", goals: 6, assists: 7 },
      { nick: "Rodri", goals: 11, assists: 7 },
      { nick: "Mimetico", goals: 1, assists: 1 },
      { nick: "Honda", goals: 3, assists: 2 },
      { nick: "Deku", goals: 0, assists: 0 },
      { nick: "Sam", goals: 2, assists: 1 },
    ],
    "Coritiba": [
      { nick: "Lewandows", goals: 6, assists: 2 },
      { nick: "IG gamer", goals: 0, assists: 0 },
      { nick: "Aqua", goals: 1, assists: 1 },
      { nick: "Thales", goals: 1, assists: 0 },
      { nick: "Koke", goals: 0, assists: 1 },
      { nick: "A.Santos", goals: 0, assists: 0 },
      { nick: "Postinho", goals: 0, assists: 0 },
    ]
  };

  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: liga.id }
  });

  for (const teamName of Object.keys(playerStats)) {
    const tId = teamIds[teamName];
    const tt = tournamentTeams.find(x => x.teamId === tId);
    if (!tt) continue;

    // Create the dummy match for this team
    const dummyMatch = await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: tId,
        awayTeamId: tId,
        homeScore: 0,
        awayScore: 0,
        status: "PLAYED",
        round: "Estadísticas Históricas",
        matchDate: new Date()
      }
    });

    const players = playerStats[teamName];
    for (const p of players) {
      let player = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: p.nick } });
      }

      // Add to roster
      await prisma.tournamentPlayer.create({
        data: { tournamentTeamId: tt.id, playerId: player.id }
      });

      // Add dummy stats
      await prisma.matchStat.create({
        data: {
          matchId: dummyMatch.id,
          playerId: player.id,
          goals: p.goals,
          assists: p.assists,
          matchTime: 90
        }
      });
    }
  }

  console.log("Season 4 Segunda Division Seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
