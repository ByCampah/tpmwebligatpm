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
    { name: "Caldense", w: 9, d: 0, l: 2, gf: 35, gc: 18 },
    { name: "Bermudinha", w: 7, d: 1, l: 3, gf: 40, gc: 17 },
    { name: "Almagro", w: 6, d: 1, l: 4, gf: 27, gc: 17 },
    { name: "Insight", w: 6, d: 0, l: 5, gf: 43, gc: 31 },
    { name: "Big Fish", w: 4, d: 1, l: 6, gf: 26, gc: 41 },
    { name: "Warriors", w: 2, d: 0, l: 9, gf: 20, gc: 43 },
    { name: "Ghoul", w: 0, d: 1, l: 5, gf: 4, gc: 28 },
    { name: "Latenha", w: 0, d: 0, l: 0, gf: 0, gc: 0 },
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
  for (let iter = 0; iter < 1000000; iter++) {
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
  "Caldense": [
    { nick: "JulianWeigl", goals: 23, assists: 1, matches: 11 },
    { nick: "Shelby", goals: 1, assists: 5, matches: 7 },
    { nick: "Jadsun", goals: 3, assists: 5, matches: 10 },
    { nick: "Aldair", goals: 5, assists: 4, matches: 11 },
    { nick: "Alan", goals: 1, assists: 4, matches: 9 },
    { nick: "Buzuca", goals: 2, assists: 3, matches: 9 },
    { nick: "Trapp", goals: 0, assists: 0, matches: 3 },
    { nick: "Carvajal", goals: 0, assists: 0, matches: 2 }
  ],
  "Bermudinha": [
    { nick: "Kyrie Develing", goals: 21, assists: 6, matches: 11 },
    { nick: "Victorz", goals: 13, assists: 8, matches: 11 },
    { nick: "M U T U", goals: 1, assists: 2, matches: 11 },
    { nick: "Stan", goals: 1, assists: 3, matches: 7 },
    { nick: "Marmota", goals: 0, assists: 0, matches: 11 },
    { nick: "Alex Chen", goals: 2, assists: 6, matches: 8 },
    { nick: "-Martinelli", goals: 2, assists: 0, matches: 4 },
    { nick: "Vinhas", goals: 0, assists: 0, matches: 1 }
  ],
  "Almagro": [
    { nick: "Campah", goals: 11, assists: 7, matches: 12 },
    { nick: "Digne", goals: 7, assists: 3, matches: 11 },
    { nick: "Zakaria", goals: 2, assists: 5, matches: 12 },
    { nick: "Aqua", goals: 0, assists: 0, matches: 9 },
    { nick: "Mate", goals: 1, assists: 1, matches: 11 },
    { nick: "pescadito", goals: 6, assists: 4, matches: 9 },
    { nick: "Titolatola", goals: 0, assists: 1, matches: 3 },
    { nick: "Thomy", goals: 0, assists: 0, matches: 2 }
  ],
  "Insight": [
    { nick: "Harry Kane", goals: 1, assists: 6, matches: 10 },
    { nick: "Hazard", goals: 5, assists: 7, matches: 9 },
    { nick: "Richarlison", goals: 34, assists: 2, matches: 10 },
    { nick: "Madru", goals: 0, assists: 0, matches: 9 },
    { nick: "Joao Felix", goals: 0, assists: 0, matches: 10 },
    { nick: "-Messi", goals: 0, assists: 0, matches: 1 },
    { nick: "Kokepizzaiolo", goals: 1, assists: 0, matches: 2 },
    { nick: "Rafard", goals: 2, assists: 2, matches: 5 }
  ],
  "Big Fish": [
    { nick: "Don Cruyff", goals: 6, assists: 2, matches: 10 },
    { nick: "Verissimo", goals: 2, assists: 0, matches: 8 },
    { nick: "Skorps", goals: 1, assists: 0, matches: 12 },
    { nick: "Gwy do acb", goals: 4, assists: 7, matches: 12 },
    { nick: "Diogosena", goals: 1, assists: 5, matches: 9 },
    { nick: "Cavalo Furioso", goals: 0, assists: 0, matches: 9 },
    { nick: "Calleri", goals: 10, assists: 2, matches: 8 },
    { nick: "Leonardo MD", goals: 2, assists: 1, matches: 4 }
  ],
  "Warriors": [
    { nick: "Soneca", goals: 3, assists: 2, matches: 10 },
    { nick: "Eden Hazard", goals: 0, assists: 0, matches: 2 },
    { nick: "Sanjiro", goals: 0, assists: 1, matches: 7 },
    { nick: "Mertens", goals: 8, assists: 5, matches: 12 },
    { nick: "Vini Jr.", goals: 7, assists: 2, matches: 10 },
    { nick: "Ruan404", goals: 1, assists: 2, matches: 10 },
    { nick: "Patrinho", goals: 0, assists: 0, matches: 3 },
    { nick: "Pitoco", goals: 1, assists: 0, matches: 2 }
  ],
  "Ghoul": [
    { nick: "Joabe.exe", goals: 2, assists: 0, matches: 5 },
    { nick: "Lucas.2000", goals: 1, assists: 1, matches: 5 },
    { nick: "Raphina", goals: 1, assists: 0, matches: 4 },
    { nick: "Nero", goals: 0, assists: 0, matches: 5 },
    { nick: "Muleke", goals: 0, assists: 1, matches: 3 }
  ],
  "Latenha": []
};

async function main() {
  console.log("Seeding Season 9...");

  const seasonName = "Temporada 9";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: true } });
  }

  const teamsData = ["Caldense", "Bermudinha", "Almagro", "Insight", "Big Fish", "Warriors", "Ghoul", "Latenha"];
  
  for (const tName of teamsData) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) {
      await prisma.team.create({ data: { name: tName } });
    }
  }

  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => allTeams.find(t => t.name.toLowerCase() === name.toLowerCase())?.id;

  // LIGA TPM
  let liga = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Liga TPM T9" } });
  if (!liga) {
    liga = await prisma.tournament.create({
      data: { seasonId: season.id, name: "Liga TPM T9", format: "LEAGUE_PLAYOFF", category: "Primera División" }
    });

    for (const tName of teamsData) {
      const tt = await prisma.tournamentTeam.create({ data: { tournamentId: liga.id, teamId: getTeamId(tName) } });
      if (playerStatsInput[tName]) {
        for (const p of playerStatsInput[tName]) {
          let player = await prisma.player.findUnique({ where: { nick: p.nick } });
          if (!player) player = await prisma.player.create({ data: { nick: p.nick } });
          await prisma.tournamentPlayer.create({ data: { tournamentTeamId: tt.id, playerId: player.id } });
        }
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
          round: `Fecha ${Math.ceil(roundIdx / 4)}`
        }
      });
      dbMatches.push({ ...dbm, teamA: m.A, teamB: m.B });
      roundIdx++;
    }

    // PlayOff matches for Liga
    const playoffMatches = [
      { r: "PlayOff", h: "Insight", a: "Big Fish", hs: 7, as: 0 },
      { r: "PlayOff", h: "Almagro", a: "Warriors", hs: 4, as: 1 },
      { r: "Semifinal", h: "Almagro", a: "Insight", hs: 2, as: 1 },
      { r: "Semifinal", h: "Bermudinha", a: "Caldense", hs: 2, as: 0 },
      { r: "3er Puesto", h: "Caldense", a: "Insight", hs: 2, as: 0 },
      { r: "Final", h: "Almagro", a: "Bermudinha", hs: 1, as: 0 }
    ];

    for (const pm of playoffMatches) {
      await prisma.match.create({
        data: {
          tournamentId: liga.id,
          homeTeamId: getTeamId(pm.h), awayTeamId: getTeamId(pm.a),
          homeScore: pm.hs, awayScore: pm.as,
          status: "PLAYED", matchDate: new Date(), round: pm.r
        }
      });
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
        { name: "Campeón Liga TPM", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Almagro") },
        { name: "Subcampeón Liga TPM", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Bermudinha") },
        { name: "Tercer Puesto Liga", type: "TEAM", tournamentId: liga.id, teamId: getTeamId("Caldense") },
      ]
    });
  }

  await prisma.season.updateMany({
    where: { id: { not: season.id } },
    data: { isActive: false }
  });

  console.log("Season 9 seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
