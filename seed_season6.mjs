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
    { name: "Coritiba", w: 10, d: 0, l: 0, gf: 48, gc: 8 },
    { name: "Spurs", w: 6, d: 1, l: 3, gf: 24, gc: 11 },
    { name: "Warrios", w: 4, d: 1, l: 5, gf: 19, gc: 12 },
    { name: "Almagro", w: 4, d: 0, l: 6, gf: 15, gc: 26 }, // Leeds is Almagro
    { name: "Vasco", w: 3, d: 2, l: 5, gf: 23, gc: 20 },
    { name: "Juventude", w: 1, d: 0, l: 9, gf: 10, gc: 62 },
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

  shuffle(wins);
  shuffle(losses);
  for (let i = 0; i < wins.length; i++) {
    if (wins[i] === losses[i]) {
      for (let j = i + 1; j < losses.length; j++) {
        if (losses[j] !== wins[i] && wins[j] !== losses[i]) {
          [losses[i], losses[j]] = [losses[j], losses[i]];
          break;
        }
      }
    }
    matches.push({ A: wins[i], B: losses[i], res: "W", gA: 1, gB: 0 });
  }

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

  for (let iter = 0; iter < 1000000; iter++) {
    let err = calculateError(matches);
    if (err < bestError) {
      bestError = err;
      bestMatches = JSON.parse(JSON.stringify(matches));
      if (err === 0) break;
    }

    let mIdx = Math.floor(Math.random() * matches.length);
    let m = matches[mIdx];
    let action = Math.floor(Math.random() * 4);
    
    let oldGA = m.gA;
    let oldGB = m.gB;

    if (action === 0) {
      if (m.res === "W") m.gA++;
      else if (m.res === "L") m.gB++;
      else { m.gA++; m.gB++; }
    } else if (action === 1) {
      m.gA++; m.gB++;
    } else if (action === 2) {
      if (m.res === "W" && m.gA - 1 > m.gB) m.gA--;
      else if (m.res === "L" && m.gB - 1 > m.gA) m.gB--;
      else if (m.res === "D" && m.gA > 0) { m.gA--; m.gB--; }
    } else if (action === 3) {
      if (m.gA > 0 && m.gB > 0) { m.gA--; m.gB--; }
    }

    let newErr = calculateError(matches);
    if (newErr <= err || Math.random() < 0.05) {
      // keep
    } else {
      m.gA = oldGA;
      m.gB = oldGB;
    }
  }
  
  console.log("Goal Matching Error:", bestError);
  return bestMatches;
}

const playerStatsInput = {
  "Coritiba": [
    { nick: "JulianWeigl", goals: 17, assists: 3, matches: 9 },
    { nick: "Diogosena", goals: 0, assists: 1, matches: 9 },
    { nick: "Harry Kane", goals: 3, assists: 7, matches: 8 },
    { nick: "Pedryn", goals: 1, assists: 0, matches: 7 },
    { nick: "KokePizza", goals: 2, assists: 4, matches: 6 },
    { nick: "Hazard", goals: 2, assists: 4, matches: 6 },
    { nick: "-Messi", goals: 4, assists: 1, matches: 4 },
    { nick: "Griezz", goals: 2, assists: 1, matches: 3 },
    { nick: "Rafard", goals: 1, assists: 1, matches: 3 },
    { nick: "PauloDyb", goals: 2, assists: 0, matches: 1 }
  ],
  "Spurs": [
    { nick: "Victorz", goals: 8, assists: 3, matches: 10 },
    { nick: "Bergwijin", goals: 1, assists: 4, matches: 10 },
    { nick: "Cebolinha", goals: 3, assists: 3, matches: 9 },
    { nick: "Zakaria", goals: 1, assists: 1, matches: 8 },
    { nick: "Bernd Leno", goals: 1, assists: 0, matches: 7 },
    { nick: "Fey", goals: 0, assists: 1, matches: 5 },
    { nick: "Sam", goals: 2, assists: 1, matches: 4 },
    { nick: "Muleke", goals: 2, assists: 0, matches: 3 },
    { nick: "Bergkamp", goals: 0, assists: 1, matches: 2 },
    { nick: "Joabe", goals: 1, assists: 2, matches: 1 }
  ],
  "Warrios": [
    { nick: "Mertens", goals: 6, assists: 1, matches: 10 },
    { nick: "Mutu", goals: 1, assists: 1, matches: 10 },
    { nick: "Kyrie", goals: 4, assists: 1, matches: 8 },
    { nick: "Monkey", goals: 0, assists: 0, matches: 7 },
    { nick: "Felipe Ronaldo", goals: 1, assists: 1, matches: 6 },
    { nick: "Filipe", goals: 5, assists: 2, matches: 7 },
    { nick: "Stan", goals: 1, assists: 6, matches: 7 },
    { nick: "-martinelli", goals: 4, assists: 0, matches: 3 },
    { nick: "Soneca", goals: 1, assists: 3, matches: 9 },
    { nick: "Aduriz", goals: 1, assists: 2, matches: 10 }
  ],
  "Almagro": [ // Leeds
    { nick: "Marmota", goals: 0, assists: 0, matches: 9 },
    { nick: "Aqua", goals: 1, assists: 2, matches: 9 },
    { nick: "Jadsun", goals: 1, assists: 1, matches: 7 },
    { nick: "Ruan404", goals: 1, assists: 1, matches: 7 },
    { nick: "Thomy", goals: 1, assists: 2, matches: 7 },
    { nick: "Pedro a", goals: 1, assists: 0, matches: 5 },
    { nick: "Campah", goals: 3, assists: 2, matches: 5 },
    { nick: "Mansi", goals: 1, assists: 1, matches: 4 },
    { nick: "Digne", goals: 4, assists: 3, matches: 4 },
    { nick: "David Silva", goals: 2, assists: 0, matches: 2 }
  ],
  "Vasco": [
    { nick: "Madru", goals: 2, assists: 3, matches: 9 },
    { nick: "Rashford", goals: 1, assists: 8, matches: 6 },
    { nick: "Toni", goals: 2, assists: 0, matches: 7 },
    { nick: "Ramonzin", goals: 4, assists: 1, matches: 7 },
    { nick: "Slade", goals: 7, assists: 0, matches: 5 },
    { nick: "Ceni", goals: 1, assists: 0, matches: 5 },
    { nick: "Rothen", goals: 2, assists: 0, matches: 4 },
    { nick: "Jeffguitar", goals: 1, assists: 0, matches: 3 },
    { nick: "Combado", goals: 1, assists: 0, matches: 3 },
    { nick: "Chino", goals: 1, assists: 0, matches: 2 }
  ],
  "Juventude": [
    { nick: "GWY", goals: 1, assists: 1, matches: 10 },
    { nick: "Lucas2000", goals: 1, assists: 0, matches: 8 },
    { nick: "Osman", goals: 2, assists: 1, matches: 6 },
    { nick: "Mascara", goals: 1, assists: 2, matches: 5 },
    { nick: "Enzowanted", goals: 0, assists: 0, matches: 5 },
    { nick: "DABI", goals: 2, assists: 0, matches: 4 },
    { nick: "Renan", goals: 0, assists: 0, matches: 3 },
    { nick: "PedroX", goals: 0, assists: 0, matches: 1 },
    { nick: "LeoMD", goals: 0, assists: 0, matches: 1 },
    { nick: "KyleDeJong", goals: 0, assists: 0, matches: 1 }
  ]
};

async function main() {
  console.log("Seeding Season 6...");

  const seasonName = "Temporada 6";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: false } });
  }

  const teamsData = ["Coritiba", "Spurs", "Warrios", "Almagro", "Vasco", "Juventude"];
  
  for (const tName of teamsData) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) {
      await prisma.team.create({ data: { name: tName } });
    }
  }

  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => allTeams.find(t => t.name.toLowerCase() === name.toLowerCase())?.id;

  // LIGA TPM
  let liga = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Liga TPM T6" } });
  if (!liga) {
    liga = await prisma.tournament.create({
      data: { seasonId: season.id, name: "Liga TPM T6", format: "LEAGUE", category: "Primera División" }
    });

    for (const tName of teamsData) {
      const tt = await prisma.tournamentTeam.create({ data: { tournamentId: liga.id, teamId: getTeamId(tName) } });
      for (const p of playerStatsInput[tName]) {
        let player = await prisma.player.findUnique({ where: { nick: p.nick } });
        if (!player) player = await prisma.player.create({ data: { nick: p.nick } });
        await prisma.tournamentPlayer.create({ data: { tournamentTeamId: tt.id, playerId: player.id } });
      }
    }

    const matchesData = generateMatchesData();
    const dbMatches = [];
    let roundIdx = 1;
    for (const m of matchesData) {
      const dbm = await prisma.match.create({
        data: {
          tournamentId: liga.id,
          homeTeamId: getTeamId(m.A), awayTeamId: getTeamId(m.B),
          homeScore: m.gA, awayScore: m.gB,
          status: "PLAYED", matchDate: new Date(),
          round: `Fecha ${Math.ceil(roundIdx / 3)}`
        }
      });
      dbMatches.push({ ...dbm, teamA: m.A, teamB: m.B });
      roundIdx++;
    }

    for (const [teamName, players] of Object.entries(playerStatsInput)) {
      const tId = getTeamId(teamName);
      const teamMatches = dbMatches.filter(m => m.homeTeamId === tId || m.awayTeamId === tId);

      for (const p of players) {
        let player = await prisma.player.findUnique({ where: { nick: p.nick } });
        let pMatches = [...teamMatches];
        shuffle(pMatches);
        pMatches = pMatches.slice(0, p.matches);

        let remainingGoals = p.goals, remainingAssists = p.assists;

        for (let i = 0; i < pMatches.length; i++) {
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
            data: { matchId: pMatches[i].id, playerId: player.id, goals: g, assists: a, matchTime: 90 }
          });
        }
      }
    }

    await prisma.trophy.createMany({
      data: [
        { name: "Campeón Liga TPM", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Coritiba") },
        { name: "Subcampeón Liga TPM", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Spurs") },
        { name: "Tercer Puesto Liga", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Warrios") },
      ]
    });
  }



  // COPA TPM
  let copa = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Copa TPM T6" } });
  if (!copa) {
    copa = await prisma.tournament.create({
      data: { seasonId: season.id, name: "Copa TPM T6", format: "KNOCKOUT", category: "Copa" }
    });

    for (const tName of teamsData) {
      await prisma.tournamentTeam.create({ data: { tournamentId: copa.id, teamId: getTeamId(tName) } });
    }

    const copaMatches = [
      { r: "Playoff Ida", h: "Warrios", a: "Juventude", hs: 6, as: 3 },
      { r: "Playoff Vuelta", h: "Juventude", a: "Warrios", hs: 4, as: 16 },
      { r: "Playoff Ida", h: "Almagro", a: "Vasco", hs: 1, as: 5 },
      { r: "Playoff Vuelta", h: "Vasco", a: "Almagro", hs: 1, as: 0 },
      { r: "Semi Ida", h: "Spurs", a: "Vasco", hs: 2, as: 1 },
      { r: "Semi Vuelta", h: "Vasco", a: "Spurs", hs: 0, as: 0 },
      { r: "Semi Ida", h: "Coritiba", a: "Warrios", hs: 6, as: 0 },
      { r: "Semi Vuelta", h: "Warrios", a: "Coritiba", hs: 2, as: 9 },
      { r: "Playoff Extra", h: "Almagro", a: "Juventude", hs: 7, as: 4 },
      { r: "3er Puesto", h: "Almagro", a: "Vasco", hs: 6, as: 3 },
      { r: "Final", h: "Coritiba", a: "Spurs", hs: 1, as: 1 } // Coritiba 1(5) Spurs 1(4)
    ];

    for (const cm of copaMatches) {
      await prisma.match.create({
        data: {
          tournamentId: copa.id,
          homeTeamId: getTeamId(cm.h), awayTeamId: getTeamId(cm.a),
          homeScore: cm.hs, awayScore: cm.as,
          status: "PLAYED", matchDate: new Date(), round: cm.r
        }
      });
    }

    await prisma.trophy.createMany({
      data: [
        { name: "Campeón Copa TPM", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Coritiba") },
        { name: "Subcampeón Copa TPM", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Spurs") },
        { name: "Tercer Puesto Copa", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Almagro") },
      ]
    });
  }

  console.log("Season 6 seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
