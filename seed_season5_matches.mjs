import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateMatchesData() {
  const teams = [
    { name: "Insight", w: 15, d: 1, l: 2, gf: 56, gc: 14 },
    { name: "Bragantino", w: 13, d: 3, l: 2, gf: 60, gc: 13 },
    { name: "Spurs", w: 12, d: 2, l: 4, gf: 57, gc: 19 },
    { name: "Almagro", w: 10, d: 2, l: 6, gf: 32, gc: 29 },
    { name: "Lorient", w: 9, d: 4, l: 5, gf: 35, gc: 20 },
    { name: "Vasco", w: 8, d: 2, l: 8, gf: 28, gc: 27 },
    { name: "Coritiba", w: 6, d: 2, l: 10, gf: 27, gc: 24 },
    { name: "Millwall", w: 3, d: 2, l: 13, gf: 15, gc: 23 },
    { name: "Warrios", w: 3, d: 2, l: 13, gf: 20, gc: 57 }, // User spelled it Warrior/Warrios, we created Warrios
    { name: "Inter", w: 1, d: 0, l: 17, gf: 12, gc: 116 } // GC adjusted from 115 to 116 to balance GF
  ];

  let wins = [];
  let losses = [];
  let draws = [];

  teams.forEach(t => {
    for (let i = 0; i < t.w; i++) wins.push(t.name);
    for (let i = 0; i < t.l; i++) losses.push(t.name);
    for (let i = 0; i < t.d; i++) draws.push(t.name);
  });

  let matches = [];

  // Pair wins and losses
  shuffle(wins);
  shuffle(losses);
  for (let i = 0; i < wins.length; i++) {
    if (wins[i] === losses[i]) {
      // swap with next available
      for (let j = i + 1; j < losses.length; j++) {
        if (losses[j] !== wins[i] && wins[j] !== losses[i]) {
          [losses[i], losses[j]] = [losses[j], losses[i]];
          break;
        }
      }
    }
    matches.push({ A: wins[i], B: losses[i], res: "W", gA: 1, gB: 0 });
  }

  // Pair draws
  shuffle(draws);
  for (let i = 0; i < draws.length; i += 2) {
    if (draws[i] === draws[i+1]) {
      for (let j = i + 2; j < draws.length; j++) {
        if (draws[j] !== draws[i]) {
          [draws[i+1], draws[j]] = [draws[j], draws[i+1]];
          break;
        }
      }
    }
    matches.push({ A: draws[i], B: draws[i+1], res: "D", gA: 0, gB: 0 });
  }

  // Initialize base goals
  matches.forEach(m => {
    if (m.res === "W") { m.gA = 1; m.gB = 0; }
    else if (m.res === "L") { m.gA = 0; m.gB = 1; }
    else { m.gA = 0; m.gB = 0; }
  });

  const targetGF = {};
  const targetGC = {};
  teams.forEach(t => { targetGF[t.name] = t.gf; targetGC[t.name] = t.gc; });

  let bestMatches = JSON.parse(JSON.stringify(matches));
  let bestError = Infinity;

  function calculateError(currentMatches) {
    let currentGF = {};
    let currentGC = {};
    teams.forEach(t => { currentGF[t.name] = 0; currentGC[t.name] = 0; });
    currentMatches.forEach(m => { 
      currentGF[m.A] += m.gA; currentGC[m.A] += m.gB; 
      currentGF[m.B] += m.gB; currentGC[m.B] += m.gA; 
    });
    
    let err = 0;
    teams.forEach(t => {
      err += Math.abs(targetGF[t.name] - currentGF[t.name]);
      err += Math.abs(targetGC[t.name] - currentGC[t.name]);
    });
    return err;
  }

  for (let iter = 0; iter < 500000; iter++) {
    let err = calculateError(matches);
    if (err < bestError) {
      bestError = err;
      bestMatches = JSON.parse(JSON.stringify(matches));
      if (err === 0) break;
    }

    // Mutate
    let mIdx = Math.floor(Math.random() * matches.length);
    let m = matches[mIdx];
    
    // Pick an action: +1 to winner, +1 to both (keeps margin), -1 to winner, -1 to both
    let action = Math.floor(Math.random() * 4);
    
    let oldGA = m.gA;
    let oldGB = m.gB;

    if (action === 0) { // +1 to winner
      if (m.res === "W") m.gA++;
      else if (m.res === "L") m.gB++;
      else { m.gA++; m.gB++; } // Draw
    } else if (action === 1) { // +1 to both
      m.gA++; m.gB++;
    } else if (action === 2) { // -1 to winner
      if (m.res === "W" && m.gA - 1 > m.gB) m.gA--;
      else if (m.res === "L" && m.gB - 1 > m.gA) m.gB--;
      else if (m.res === "D" && m.gA > 0) { m.gA--; m.gB--; }
    } else if (action === 3) { // -1 to both
      if (m.gA > 0 && m.gB > 0) { m.gA--; m.gB--; }
    }

    let newErr = calculateError(matches);
    // Simulated annealing: accept if better, or with small probability if worse
    if (newErr <= err || Math.random() < 0.05) {
      // Keep
    } else {
      // Revert
      m.gA = oldGA;
      m.gB = oldGB;
    }
  }

  console.log("Finished matching goals. Final Error:", bestError);
  return bestMatches;
}

const playerStatsInput = {
  "Almagro": [
    { nick: "Campah", goals: 3, assists: 2, matches: 14 },
    { nick: "Oliver Kahn", goals: 1, assists: 0, matches: 14 },
    { nick: "lsantos", goals: 1, assists: 2, matches: 14 },
    { nick: "Pache", goals: 5, assists: 0, matches: 12 },
    { nick: "Vlady", goals: 2, assists: 0, matches: 10 },
    { nick: "Frank Fabra", goals: 0, assists: 2, matches: 10 },
    { nick: "Getlow", goals: 0, assists: 1, matches: 9 },
    { nick: "Thomy", goals: 0, assists: 0, matches: 8 },
    { nick: "Juninho", goals: 0, assists: 3, matches: 8 },
    { nick: "Richarlison", goals: 2, assists: 2, matches: 6 },
    { nick: "Titolatola", goals: 0, assists: 0, matches: 5 },
    { nick: "Gabito", goals: 0, assists: 0, matches: 1 }
  ],
  "Lorient": [
    { nick: "Ruan404", goals: 1, assists: 1, matches: 12 },
    { nick: "Zakaria", goals: 5, assists: 1, matches: 11 },
    { nick: "Tobias", goals: 4, assists: 1, matches: 5 },
    { nick: "Marmota", goals: 0, assists: 0, matches: 14 },
    { nick: "Neymar", goals: 2, assists: 3, matches: 13 },
    { nick: "Brian", goals: 0, assists: 4, matches: 16 },
    { nick: "Jeffin", goals: 5, assists: 2, matches: 12 },
    { nick: "Mozer", goals: 0, assists: 1, matches: 1 },
    { nick: "griezz", goals: 3, assists: 0, matches: 4 },
    { nick: "Sam", goals: 2, assists: 0, matches: 4 }
  ],
  "Spurs": [
    { nick: "Bergwijin", goals: 1, assists: 7, matches: 16 },
    { nick: "E. Cebolinha", goals: 12, assists: 1, matches: 16 },
    { nick: "digne", goals: 8, assists: 1, matches: 15 },
    { nick: "Rashford", goals: 0, assists: 11, matches: 14 },
    { nick: "Reusinho", goals: 11, assists: 3, matches: 14 },
    { nick: "Madru", goals: 0, assists: 1, matches: 10 },
    { nick: "Mimetico", goals: 2, assists: 1, matches: 6 },
    { nick: "Pedro a", goals: 1, assists: 0, matches: 4 },
    { nick: "Razor", goals: 0, assists: 0, matches: 2 },
    { nick: "J.Valdivia", goals: 0, assists: 0, matches: 2 } // Assuming J.Valdivia is Spurs here as listed
  ],
  "Vasco": [
    { nick: "Combado", goals: 0, assists: 1, matches: 9 },
    { nick: "Shaw", goals: 0, assists: 1, matches: 9 },
    { nick: "Benatia", goals: 0, assists: 0, matches: 6 },
    { nick: "Felipe Ronaldo", goals: 6, assists: 1, matches: 16 },
    { nick: "Ramonzin", goals: 0, assists: 1, matches: 15 },
    { nick: "Mateo", goals: 0, assists: 0, matches: 3 },
    { nick: "Toni", goals: 2, assists: 0, matches: 6 },
    { nick: "Baron", goals: 0, assists: 2, matches: 13 },
    { nick: "Johaennes Cryuff", goals: 0, assists: 0, matches: 3 },
    { nick: "Diogosena", goals: 2, assists: 1, matches: 10 },
    { nick: "Slade", goals: 1, assists: 1, matches: 12 },
    { nick: "Lemes", goals: 2, assists: 0, matches: 8 }
  ],
  "Coritiba": [
    { nick: "Aqua", goals: 2, assists: 4, matches: 18 },
    { nick: "Gab", goals: 4, assists: 0, matches: 7 },
    { nick: "PauloDybala", goals: 10, assists: 2, matches: 16 },
    { nick: "Kokepizzaiolo", goals: 1, assists: 2, matches: 18 },
    { nick: "Pedryn", goals: 0, assists: 2, matches: 18 },
    { nick: "G. Buffon", goals: 0, assists: 1, matches: 17 },
    { nick: "Afonso", goals: 0, assists: 0, matches: 8 },
    { nick: "Ronin", goals: 2, assists: 0, matches: 6 },
    { nick: "Brenobr", goals: 1, assists: 0, matches: 3 }
  ],
  "Millwall": [
    { nick: "lSantos", goals: 0, assists: 2, matches: 9 },
    { nick: "Imperador", goals: 3, assists: 1, matches: 4 },
    { nick: "Kirye Deveiling", goals: 2, assists: 0, matches: 9 }, // Will map to existing player if exists
    { nick: "Gullit", goals: 1, assists: 0, matches: 4 },
    { nick: "Emerson", goals: 0, assists: 0, matches: 1 }
  ],
  "Bragantino": [
    { nick: "Thigomovic", goals: 1, assists: 2, matches: 11 },
    { nick: "Magossuel", goals: 2, assists: 3, matches: 11 },
    { nick: "Bergkamp", goals: 1, assists: 3, matches: 8 },
    { nick: "Fey", goals: 6, assists: 4, matches: 13 },
    { nick: "David Silva", goals: 2, assists: 2, matches: 14 },
    { nick: "Kepa", goals: 0, assists: 0, matches: 16 },
    { nick: "Jadsun", goals: 2, assists: 7, matches: 13 },
    { nick: "JulianWeigl", goals: 24, assists: 7, matches: 14 },
    { nick: "Thiagow", goals: 1, assists: 1, matches: 4 }
  ],
  "Insight": [
    { nick: "Harry Kane", goals: 8, assists: 9, matches: 15 },
    { nick: "Hazard", goals: 11, assists: 5, matches: 13 },
    { nick: "Mutu", goals: 2, assists: 4, matches: 14 },
    { nick: "Rafard", goals: 5, assists: 1, matches: 10 },
    { nick: "Douglas", goals: 0, assists: 1, matches: 4 },
    { nick: "Bernd Leno", goals: 1, assists: 0, matches: 12 },
    { nick: "Busquets", goals: 4, assists: 4, matches: 12 },
    { nick: "Stan", goals: 0, assists: 1, matches: 9 },
    { nick: "Amauri", goals: 4, assists: 5, matches: 7 }
  ],
  "Warrios": [
    { nick: "Filipe Patricio", goals: 1, assists: 1, matches: 14 },
    { nick: "Mertens", goals: 5, assists: 3, matches: 14 },
    { nick: "Nero", goals: 6, assists: 1, matches: 14 },
    { nick: "-Martinelli", goals: 0, assists: 1, matches: 12 },
    { nick: "P.Lahm", goals: 0, assists: 0, matches: 9 },
    { nick: "Joabe", goals: 0, assists: 0, matches: 2 },
    { nick: "Keylor", goals: 0, assists: 0, matches: 2 },
    { nick: "Kedric", goals: 0, assists: 0, matches: 1 },
    { nick: "Lucas 2000", goals: 0, assists: 0, matches: 7 },
    { nick: "Kyrie Develing", goals: 0, assists: 2, matches: 14 },
    { nick: "Renan", goals: 0, assists: 0, matches: 1 },
    { nick: "Osman", goals: 0, assists: 0, matches: 7 }
  ],
  "Inter": [
    { nick: "Logan_", goals: 0, assists: 1, matches: 15 },
    { nick: "Joazito", goals: 0, assists: 2, matches: 16 },
    { nick: "Zak", goals: 0, assists: 1, matches: 3 },
    { nick: "Masc4ra", goals: 3, assists: 2, matches: 15 },
    { nick: "Dogo", goals: 0, assists: 0, matches: 4 },
    { nick: "Goiano", goals: 0, assists: 1, matches: 11 },
    { nick: "Caiothebr", goals: 0, assists: 0, matches: 2 },
    { nick: "drtrophyrr", goals: 0, assists: 0, matches: 5 },
    { nick: "Paolo Maldini", goals: 0, assists: 0, matches: 2 },
    { nick: "VitinhoCruz", goals: 6, assists: 0, matches: 10 },
    { nick: "Levios", goals: 1, assists: 1, matches: 7 },
    { nick: "Enzowanted", goals: 0, assists: 0, matches: 1 }
  ]
};

async function main() {
  console.log("Seeding Season 5 Primera Division Matches and Stats...");

  const season = await prisma.season.findFirst({ where: { name: "Temporada 5" } });
  const liga = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Liga Primera División T5" } });
  
  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => allTeams.find(t => t.name.toLowerCase() === name.toLowerCase())?.id;

  const matchesData = generateMatchesData();

  const dbMatches = [];
  let roundIdx = 1;
  for (const m of matchesData) {
    let r = `Fecha ${Math.ceil(roundIdx / 5)}`;
    roundIdx++;
    const dbm = await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: getTeamId(m.A),
        awayTeamId: getTeamId(m.B),
        homeScore: m.gA,
        awayScore: m.gB,
        status: "PLAYED",
        matchDate: new Date(),
        round: r
      }
    });
    dbMatches.push({ ...dbm, teamA: m.A, teamB: m.B });
  }

  // Assign stats
  for (const [teamName, players] of Object.entries(playerStatsInput)) {
    const tId = getTeamId(teamName);
    const teamMatches = dbMatches.filter(m => m.homeTeamId === tId || m.awayTeamId === tId);

    for (const p of players) {
      let player = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!player) {
        player = await prisma.player.create({ data: { nick: p.nick } });
      }

      // Pick P matches randomly
      let pMatches = [...teamMatches];
      shuffle(pMatches);
      pMatches = pMatches.slice(0, p.matches);

      if (pMatches.length === 0) continue;

      let remainingGoals = p.goals;
      let remainingAssists = p.assists;

      for (let i = 0; i < pMatches.length; i++) {
        const m = pMatches[i];
        
        // Give goals and assists
        let g = 0, a = 0;
        if (remainingGoals > 0) {
          g = Math.min(remainingGoals, Math.floor(Math.random() * 3) + 1);
          if (i === pMatches.length - 1) g = remainingGoals;
          remainingGoals -= g;
        }
        if (remainingAssists > 0) {
          a = Math.min(remainingAssists, Math.floor(Math.random() * 3) + 1);
          if (i === pMatches.length - 1) a = remainingAssists;
          remainingAssists -= a;
        }

        await prisma.matchStat.create({
          data: {
            matchId: m.id,
            playerId: player.id,
            goals: g,
            assists: a,
            matchTime: 90
          }
        });
      }
    }
  }

  // Trophies
  await prisma.trophy.createMany({
    data: [
      { name: "Campeón (1er Puesto)", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Insight") },
      { name: "Subcampeón (2do Puesto)", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Bragantino") },
      { name: "Tercer Puesto (3ro)", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Spurs") },
    ]
  });

  console.log("Season 5 Primera Division Matches and Stats Seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
