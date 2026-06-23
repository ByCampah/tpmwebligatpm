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
    { name: "Coritiba", w: 9, d: 1, l: 0, gf: 40, gc: 9 },
    { name: "Spurs", w: 7, d: 1, l: 2, gf: 24, gc: 9 },
    { name: "Goat", w: 6, d: 1, l: 3, gf: 17, gc: 12 },
    { name: "Red Bull", w: 4, d: 1, l: 5, gf: 23, gc: 13 },
    { name: "Flamengo", w: 1, d: 0, l: 9, gf: 14, gc: 23 },
    { name: "Juventude", w: 1, d: 0, l: 9, gf: 5, gc: 55 },
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

  let stuckCounter = 0;
  for (let iter = 0; iter < 500000; iter++) {
    let err = calculateError(matches);
    if (err < bestError) {
      bestError = err;
      bestMatches = JSON.parse(JSON.stringify(matches));
      stuckCounter = 0;
      if (err === 0) break;
    } else {
      stuckCounter++;
    }

    if (stuckCounter > 50000) {
      // restart loop
      matches.forEach(m => {
        if (m.res === "W") { m.gA = 1; m.gB = 0; }
        else if (m.res === "L") { m.gA = 0; m.gB = 1; }
        else { m.gA = 0; m.gB = 0; }
      });
      stuckCounter = 0;
      continue;
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
    { nick: "Inzaghi", goals: 9, assists: 3, matches: 8 },
    { nick: "JulianWeigl", goals: 9, assists: 2, matches: 5 },
    { nick: "Dybala", goals: 1, assists: 2, matches: 3 },
    { nick: "Jadsun", goals: 2, assists: 1, matches: 6 },
    { nick: "Fey", goals: 1, assists: 2, matches: 5 },
    { nick: "Madru", goals: 18, assists: 5, matches: 10 }
  ],
  "Spurs": [
    { nick: "Kane", goals: 10, assists: 7, matches: 8 },
    { nick: "Koke", goals: 3, assists: 2, matches: 8 },
    { nick: "Felipe Ronaldo", goals: 2, assists: 3, matches: 4 },
    { nick: "Viñas", goals: 1, assists: 2, matches: 2 },
    { nick: "Bergwijin", goals: 8, assists: 3, matches: 10 }
  ],
  "Goat": [
    { nick: "Reus", goals: 5, assists: 2, matches: 7 },
    { nick: "Kyrie", goals: 5, assists: 2, matches: 8 },
    { nick: "Mertens", goals: 2, assists: 5, matches: 8 },
    { nick: "Valdivia", goals: 5, assists: 1, matches: 7 }
  ],
  "Red Bull": [
    { nick: "Rodri", goals: 4, assists: 2, matches: 6 },
    { nick: "Digne", goals: 3, assists: 1, matches: 8 },
    { nick: "Pedro a", goals: 2, assists: 3, matches: 6 },
    { nick: "Cebolinha", goals: 14, assists: 5, matches: 10 }
  ],
  "Flamengo": [
    { nick: "Fuinha", goals: 4, assists: 0, matches: 8 },
    { nick: "Diogosena", goals: 3, assists: 0, matches: 6 },
    { nick: "Thomy", goals: 7, assists: 2, matches: 10 }
  ],
  "Juventude": [
    { nick: "Doudougou", goals: 4, assists: 1, matches: 10 },
    { nick: "LeoMD", goals: 1, assists: 1, matches: 3 }
  ]
};

async function main() {
  console.log("Seeding Season 7...");

  const seasonName = "Temporada 7";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: true } });
  }

  const teamsData = ["Coritiba", "Spurs", "Goat", "Red Bull", "Flamengo", "Juventude"];
  
  for (const tName of teamsData) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) {
      await prisma.team.create({ data: { name: tName } });
    }
  }

  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => allTeams.find(t => t.name.toLowerCase() === name.toLowerCase())?.id;

  // LIGA TPM
  let liga = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Liga TPM T7" } });
  if (!liga) {
    liga = await prisma.tournament.create({
      data: { seasonId: season.id, name: "Liga TPM T7", format: "LEAGUE", category: "Primera División" }
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
        { name: "Tercer Puesto Liga", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Goat") },
      ]
    });
  }

  // COPA TPM
  let copa = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Copa TPM T7" } });
  if (!copa) {
    copa = await prisma.tournament.create({
      data: { seasonId: season.id, name: "Copa TPM T7", format: "KNOCKOUT", category: "Copa" }
    });

    for (const tName of teamsData) {
      await prisma.tournamentTeam.create({ data: { tournamentId: copa.id, teamId: getTeamId(tName) } });
    }

    const copaMatches = [
      { r: "Playoff", h: "Goat", a: "Juventude", hs: 6, as: 0 },
      { r: "Playoff", h: "Red Bull", a: "Flamengo", hs: 5, as: 0 },
      { r: "Semi", h: "Spurs", a: "Goat", hs: 4, as: 0 },
      { r: "Semi", h: "Coritiba", a: "Red Bull", hs: 1, as: 1 }, // Penalties 3-1
      { r: "3er Puesto", h: "Goat", a: "Red Bull", hs: 1, as: 0 },
      { r: "Final", h: "Coritiba", a: "Spurs", hs: 2, as: 0 }
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
        { name: "Tercer Puesto Copa", type: "TEAM", tournamentId: copa.id, teamId: getTeamId("Goat") },
      ]
    });
  }

  // Deactivate other seasons just to make T7 the active one as a bonus
  await prisma.season.updateMany({
    where: { id: { not: season.id } },
    data: { isActive: false }
  });

  console.log("Season 7 seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
