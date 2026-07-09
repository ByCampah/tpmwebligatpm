const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Season 2 seed fast...");

  let season = await prisma.season.findFirst({ where: { name: 'Temporada 2' } });
  if (!season) season = await prisma.season.create({ data: { name: 'Temporada 2' } });

  let tpmCategory = await prisma.category.findFirst({ where: { name: 'Liga TPM' } });
  if (!tpmCategory) tpmCategory = await prisma.category.create({ data: { name: 'Liga TPM' } });

  let tournament = await prisma.tournament.findFirst({ where: { name: 'Liga TPM', seasonId: season.id } });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: { name: 'Liga TPM', season: { connect: { id: season.id } }, category: { connect: { id: tpmCategory.id } } }
    });
  }

  const teamData = {
    "Almagro": [
      { nick: "Haze", goals: 7, assists: 0 },
      { nick: "JulianWeigl", goals: 6, assists: 4 },
      { nick: "Brian", goals: 0, assists: 4 },
      { nick: "Campah", goals: 0, assists: 0 },
      { nick: "Sam", goals: 0, assists: 0 },
      { nick: "Zakaria", goals: 0, assists: 0 },
      { nick: "Benatia", goals: 0, assists: 0 }
    ],
    "Juventus": [
      { nick: "F.Totti", goals: 1, assists: 3 },
      { nick: "Imperador", goals: 4, assists: 2 },
      { nick: "Kante", goals: 0, assists: 0 },
      { nick: "Richarlison", goals: 1, assists: 0 },
      { nick: "Lixtinhos", goals: 0, assists: 0 },
      { nick: "Magossuel", goals: 1, assists: 2 },
      { nick: "Van dijk", goals: 0, assists: 0 }
    ],
    "Platense": [
      { nick: "Thiago Almada", goals: 1, assists: 0 },
      { nick: "GetLow", goals: 0, assists: 1 },
      { nick: "Thomy", goals: 0, assists: 0 },
      { nick: "Nicosd", goals: 0, assists: 0 },
      { nick: "Vinhas", goals: 0, assists: 0 },
      { nick: "JuninhoPlay", goals: 0, assists: 0 },
      { nick: "Trapp", goals: 0, assists: 0 }
    ],
    "Red Bull Haxball": [
      { nick: "Rodri", goals: 3, assists: 2 },
      { nick: "Amauri", goals: 5, assists: 0 },
      { nick: "Reinaldo", goals: 0, assists: 0 },
      { nick: "M U T U", goals: 0, assists: 0 },
      { nick: "Mats Hummels", goals: 0, assists: 0 },
      { nick: "Roberto Carlos", goals: 0, assists: 3 },
      { nick: "Bergkamp", goals: 0, assists: 0 },
      { nick: "Digne", goals: 3, assists: 0 }
    ],
    "Fiorentina": [
      { nick: "Madru", goals: 0, assists: 3 }
    ],
    "Insight": [
      { nick: "Chamito300ml", goals: 0, assists: 0 },
      { nick: "Harry Kane", goals: 7, assists: 4 },
      { nick: "Hazard", goals: 0, assists: 2 },
      { nick: "GrafinhoSOHTAPA", goals: 5, assists: 2 },
      { nick: "GuisinhoCEARA", goals: 0, assists: 0 },
      { nick: "Fuinha", goals: 0, assists: 0 },
      { nick: "Gerard Pique", goals: 0, assists: 0 }
    ],
    "Blacky": [
      { nick: "lsantos", goals: 0, assists: 0 },
      { nick: "Andy Care", goals: 0, assists: 0 },
      { nick: "Zabot", goals: 0, assists: 0 }
    ],
    "Astros": []
  };

  // 1. Create missing players in bulk
  const allNicks = [];
  for (const t of Object.keys(teamData)) {
    for (const p of teamData[t]) allNicks.push(p.nick);
  }
  const existingPlayers = await prisma.player.findMany({ where: { nick: { in: allNicks } } });
  const existingNicks = new Set(existingPlayers.map(p => p.nick));
  const newPlayers = allNicks.filter(n => !existingNicks.has(n)).map(n => ({ nick: n }));
  if (newPlayers.length > 0) {
    await prisma.player.createMany({ data: newPlayers, skipDuplicates: true });
  }

  // 2. Map all players
  const allDbPlayers = await prisma.player.findMany({ where: { nick: { in: allNicks } } });
  const playerMap = {};
  for (const p of allDbPlayers) playerMap[p.nick] = p;

  // 3. Ensure teams & tournament teams
  const dbTeams = {};
  const tourneyTeamsMap = {};
  for (const tName of Object.keys(teamData)) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) team = await prisma.team.create({ data: { name: tName, logoUrl: 'https://via.placeholder.com/150' } });
    dbTeams[tName] = team;

    let tt = await prisma.tournamentTeam.findFirst({ where: { tournamentId: tournament.id, teamId: team.id } });
    if (!tt) tt = await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: team.id } });
    tourneyTeamsMap[tName] = tt;
  }

  // 4. Ensure tournament players in bulk
  const tpToCreate = [];
  for (const tName of Object.keys(teamData)) {
    const ttId = tourneyTeamsMap[tName].id;
    for (const p of teamData[tName]) {
      const pId = playerMap[p.nick].id;
      tpToCreate.push({ tournamentTeamId: ttId, playerId: pId });
    }
  }
  if (tpToCreate.length > 0) {
    await prisma.tournamentPlayer.createMany({ data: tpToCreate, skipDuplicates: true });
  }

  console.log("Teams and Players setup complete");

  // 5. Matches Data
  const matchesData = [
    { round: "Fecha 1", home: "Almagro", away: "Red Bull Haxball", hs: 0, as: 3 },
    { round: "Fecha 1", home: "Juventus", away: "Platense", hs: 7, as: 1 },
    { round: "Fecha 1", home: "Astros", away: "Insight", hs: 0, as: 4 },
    { round: "Fecha 1", home: "Blacky", away: "Fiorentina", hs: 0, as: 2 },
    { round: "Fecha 2", home: "Almagro", away: "Platense", hs: 9, as: 1 },
    { round: "Fecha 2", home: "Red Bull Haxball", away: "Insight", hs: 2, as: 2 },
    { round: "Fecha 2", home: "Juventus", away: "Fiorentina", hs: 3, as: 3 },
    { round: "Fecha 2", home: "Astros", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 3", home: "Almagro", away: "Insight", hs: 2, as: 0 },
    { round: "Fecha 3", home: "Platense", away: "Fiorentina", hs: 0, as: 1 },
    { round: "Fecha 3", home: "Red Bull Haxball", away: "Blacky", hs: 8, as: 0 },
    { round: "Fecha 3", home: "Juventus", away: "Astros", hs: 0, as: 1 },
    { round: "Fecha 4", home: "Almagro", away: "Juventus", hs: 3, as: 1 },
    { round: "Fecha 4", home: "Astros", away: "Red Bull Haxball", hs: 2, as: 3 },
    { round: "Fecha 4", home: "Blacky", away: "Platense", hs: 0, as: 0 },
    { round: "Fecha 4", home: "Fiorentina", away: "Insight", hs: 1, as: 4 },
    { round: "Fecha 5", home: "Almagro", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 5", home: "Blacky", away: "Juventus", hs: 0, as: 0 },
    { round: "Fecha 5", home: "Fiorentina", away: "Red Bull Haxball", hs: 1, as: 1 },
    { round: "Fecha 5", home: "Insight", away: "Platense", hs: 15, as: 2 },
    { round: "Fecha 6", home: "Almagro", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 6", home: "Fiorentina", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 6", home: "Insight", away: "Juventus", hs: 4, as: 1 },
    { round: "Fecha 6", home: "Platense", away: "Red Bull Haxball", hs: 0, as: 1 },
    { round: "Fecha 7", home: "Almagro", away: "Fiorentina", hs: 5, as: 1 },
    { round: "Fecha 7", home: "Insight", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 7", home: "Platense", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 7", home: "Red Bull Haxball", away: "Juventus", hs: 2, as: 0 },
    { round: "Fecha 8", home: "Almagro", away: "Red Bull Haxball", hs: 1, as: 0 },
    { round: "Fecha 8", home: "Juventus", away: "Platense", hs: 0, as: 0 },
    { round: "Fecha 8", home: "Astros", away: "Insight", hs: 0, as: 0 },
    { round: "Fecha 8", home: "Blacky", away: "Fiorentina", hs: 0, as: 0 },
    { round: "Fecha 9", home: "Almagro", away: "Platense", hs: 0, as: 0 },
    { round: "Fecha 9", home: "Red Bull Haxball", away: "Insight", hs: 1, as: 1 },
    { round: "Fecha 9", home: "Juventus", away: "Fiorentina", hs: 0, as: 0 },
    { round: "Fecha 9", home: "Astros", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 10", home: "Almagro", away: "Insight", hs: 2, as: 1 },
    { round: "Fecha 10", home: "Platense", away: "Fiorentina", hs: 0, as: 0 },
    { round: "Fecha 10", home: "Red Bull Haxball", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 10", home: "Juventus", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 11", home: "Almagro", away: "Juventus", hs: 1, as: 1 },
    { round: "Fecha 11", home: "Astros", away: "Red Bull Haxball", hs: 0, as: 0 },
    { round: "Fecha 11", home: "Blacky", away: "Platense", hs: 0, as: 0 },
    { round: "Fecha 11", home: "Fiorentina", away: "Insight", hs: 2, as: 2 },
    { round: "Fecha 12", home: "Almagro", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 12", home: "Blacky", away: "Juventus", hs: 0, as: 0 },
    { round: "Fecha 12", home: "Fiorentina", away: "Red Bull Haxball", hs: 0, as: 2 },
    { round: "Fecha 12", home: "Insight", away: "Platense", hs: 6, as: 2 },
    { round: "Fecha 13", home: "Almagro", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 13", home: "Fiorentina", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 13", home: "Insight", away: "Juventus", hs: 1, as: 0 },
    { round: "Fecha 13", home: "Platense", away: "Red Bull Haxball", hs: 0, as: 0 },
    { round: "Fecha 14", home: "Almagro", away: "Fiorentina", hs: 4, as: 2 },
    { round: "Fecha 14", home: "Insight", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 14", home: "Platense", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 14", home: "Red Bull Haxball", away: "Juventus", hs: 3, as: 2 }
  ];

  const dbMatches = [];
  for (let i = 0; i < matchesData.length; i++) {
    const m = matchesData[i];
    console.log(`Processing match ${i+1}/${matchesData.length}: ${m.home} vs ${m.away}`);
    let match = await prisma.match.findFirst({
      where: { tournamentId: tournament.id, round: m.round, homeTeamId: dbTeams[m.home].id, awayTeamId: dbTeams[m.away].id }
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId: tournament.id, homeTeamId: dbTeams[m.home].id, awayTeamId: dbTeams[m.away].id,
          round: m.round, homeScore: m.hs, awayScore: m.as, status: "PLAYED"
        }
      });
    }
    dbMatches.push({ ...m, id: match.id });
  }

  // Generate stats bulk
  const allTPlayers = await prisma.tournamentPlayer.findMany({ where: { tournamentTeam: { tournamentId: tournament.id } } });
  const matchStatsToCreate = [];
  
  for (const m of dbMatches) {
    const homeTTId = tourneyTeamsMap[m.home].id;
    const awayTTId = tourneyTeamsMap[m.away].id;
    
    const playersForMatch = allTPlayers.filter(p => p.tournamentTeamId === homeTTId || p.tournamentTeamId === awayTTId);
    for (const tp of playersForMatch) {
      matchStatsToCreate.push({
        matchId: m.id,
        playerId: tp.playerId,
        goals: 0, assists: 0, matchTime: 90
      });
    }
  }

  if (matchStatsToCreate.length > 0) {
    console.log("Creating real match stats:", matchStatsToCreate.length);
    // Ignore duplicates if they exist, but skipDuplicates ignores conflicts on compound unique keys
    try {
      await prisma.matchStat.createMany({ data: matchStatsToCreate, skipDuplicates: true });
    } catch(e) { console.error("Error bulk stats:", e); }
  }

  // 6. Dummy Matches
  const dummyPairs = [
    { home: "Almagro", away: "Insight" },
    { home: "Red Bull Haxball", away: "Juventus" },
    { home: "Platense", away: "Fiorentina" },
    { home: "Blacky", away: "Astros" }
  ];

  const dummyMatchStatsToCreate = [];
  for (const pair of dummyPairs) {
    let match = await prisma.match.findFirst({
      where: { tournamentId: tournament.id, round: "Estadísticas Históricas", homeTeamId: dbTeams[pair.home].id, awayTeamId: dbTeams[pair.away].id }
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId: tournament.id, homeTeamId: dbTeams[pair.home].id, awayTeamId: dbTeams[pair.away].id,
          round: "Estadísticas Históricas", status: "PLAYED", homeScore: 0, awayScore: 0
        }
      });
    }

    for (const tName of [pair.home, pair.away]) {
      for (const pData of teamData[tName]) {
        if (pData.goals > 0 || pData.assists > 0) {
          dummyMatchStatsToCreate.push({
            matchId: match.id,
            playerId: playerMap[pData.nick].id,
            goals: pData.goals,
            assists: pData.assists,
            matchTime: 0
          });
        }
      }
    }
  }

  if (dummyMatchStatsToCreate.length > 0) {
    console.log("Creating dummy match stats:", dummyMatchStatsToCreate.length);
    try {
      await prisma.matchStat.createMany({ data: dummyMatchStatsToCreate, skipDuplicates: true });
    } catch(e) { console.error("Error bulk dummy stats:", e); }
  }

  // --- 7. Trofeos ---
  await prisma.trophy.createMany({
    data: [
      { name: "🏆 Campeón", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Red Bull Haxball"].id },
      { name: "🥈 Subcampeón", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Almagro"].id },
      { name: "🥉 Tercer Puesto", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Insight"].id },
      { name: "⚽ Máximo Goleador", type: "PLAYER", tournamentId: tournament.id, playerId: playerMap["Harry Kane"].id },
      { name: "⚽ Máximo Goleador", type: "PLAYER", tournamentId: tournament.id, playerId: playerMap["Haze"].id },
      { name: "🎯 Máximo Asistidor", type: "PLAYER", tournamentId: tournament.id, playerId: playerMap["Harry Kane"].id },
      { name: "🎯 Máximo Asistidor", type: "PLAYER", tournamentId: tournament.id, playerId: playerMap["Brian"].id },
      { name: "🎯 Máximo Asistidor", type: "PLAYER", tournamentId: tournament.id, playerId: playerMap["JulianWeigl"].id }
    ],
    skipDuplicates: true
  }).catch(() => {});

  console.log("Season 2 completely seeded fast!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
