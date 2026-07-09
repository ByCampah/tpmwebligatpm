const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Copa TPM Season 2 seed fast...");

  // Rename season
  let season = await prisma.season.findFirst({ where: { name: 'Temporada 2' } });
  if (season) {
    season = await prisma.season.update({ where: { id: season.id }, data: { name: 'Temporada 2 (2019)' } });
  } else {
    season = await prisma.season.findFirst({ where: { name: 'Temporada 2 (2019)' } });
  }

  // Category
  let category = await prisma.category.findFirst({ where: { name: 'Copa TPM' } });
  if (!category) category = await prisma.category.create({ data: { name: 'Copa TPM' } });

  // Tournament
  let tournament = await prisma.tournament.findFirst({ where: { name: 'Copa TPM', seasonId: season.id } });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: { name: 'Copa TPM', season: { connect: { id: season.id } }, category: { connect: { id: category.id } }, format: 'CUP' }
    });
  }

  console.log("Tournament done", tournament.id);

  // 1. Teams and Groups
  const groupA = ["Insight", "Red Bull Haxball", "Platense", "Fiorentina"];
  const groupB = ["Almagro", "Juventus", "Astros", "Blacky"];

  const dbTeams = {};
  const tourneyTeamsMap = {};
  for (const tName of [...groupA, ...groupB]) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    dbTeams[tName] = team;

    let tt = await prisma.tournamentTeam.findFirst({ where: { tournamentId: tournament.id, teamId: team.id } });
    const group = groupA.includes(tName) ? "A" : "B";
    if (!tt) {
      tt = await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: team.id, group } });
    } else {
      tt = await prisma.tournamentTeam.update({ where: { id: tt.id }, data: { group } });
    }
    tourneyTeamsMap[tName] = tt;
  }
  console.log("Teams done");

  // 2. Tournament Players (copy from Liga TPM)
  const ligaTournament = await prisma.tournament.findFirst({ where: { name: 'Liga TPM', seasonId: season.id } });
  const allLigaTPlayers = await prisma.tournamentPlayer.findMany({ 
    where: { tournamentTeam: { tournamentId: ligaTournament.id } },
    include: { player: true, tournamentTeam: { include: { team: true } } }
  });

  const tpToCreate = [];
  for (const ltp of allLigaTPlayers) {
    const tName = ltp.tournamentTeam.team.name;
    const pId = ltp.playerId;
    const ttId = tourneyTeamsMap[tName].id;
    tpToCreate.push({ tournamentTeamId: ttId, playerId: pId });
  }
  
  if (tpToCreate.length > 0) {
    await prisma.tournamentPlayer.createMany({ data: tpToCreate, skipDuplicates: true });
  }
  console.log("Players done");

  // 3. Matches
  const matchesData = [
    { round: "Fecha 1", home: "Red Bull Haxball", away: "Fiorentina", hs: 2, as: 1 },
    { round: "Fecha 1", home: "Insight", away: "Platense", hs: 2, as: 1 }, // Note: user wrote Platense, assuming Platense
    { round: "Fecha 1", home: "Almagro", away: "Juventus", hs: 5, as: 3 },
    { round: "Fecha 1", home: "Astros", away: "Blacky", hs: 11, as: 0 },
    { round: "Fecha 2", home: "Insight", away: "Red Bull Haxball", hs: 2, as: 0 },
    { round: "Fecha 2", home: "Fiorentina", away: "Platense", hs: 0, as: 3 },
    { round: "Fecha 2", home: "Almagro", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 2", home: "Juventus", away: "Blacky", hs: 4, as: 0 },
    { round: "Fecha 3", home: "Insight", away: "Fiorentina", hs: 4, as: 1 },
    { round: "Fecha 3", home: "Red Bull Haxball", away: "Platense", hs: 7, as: 0 },
    { round: "Fecha 3", home: "Almagro", away: "Blacky", hs: 12, as: 0 },
    { round: "Fecha 3", home: "Juventus", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 4", home: "Insight", away: "Platense", hs: 0, as: 0 },
    { round: "Fecha 4", home: "Red Bull Haxball", away: "Fiorentina", hs: 2, as: 0 },
    { round: "Fecha 4", home: "Almagro", away: "Juventus", hs: 3, as: 2 },
    { round: "Fecha 4", home: "Blacky", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 5", home: "Red Bull Haxball", away: "Insight", hs: 1, as: 2 },
    { round: "Fecha 5", home: "Platense", away: "Fiorentina", hs: 0, as: 0 },
    { round: "Fecha 5", home: "Almagro", away: "Astros", hs: 0, as: 0 },
    { round: "Fecha 5", home: "Blacky", away: "Juventus", hs: 0, as: 0 },
    { round: "Fecha 6", home: "Fiorentina", away: "Insight", hs: 0, as: 5 },
    { round: "Fecha 6", home: "Red Bull Haxball", away: "Platense", hs: 7, as: 0 },
    { round: "Fecha 6", home: "Almagro", away: "Blacky", hs: 0, as: 0 },
    { round: "Fecha 6", home: "Astros", away: "Juventus", hs: 0, as: 0 },
    // Semifinal 1
    { round: "Semifinal Ida", home: "Insight", away: "Juventus", hs: 6, as: 1 },
    { round: "Semifinal Vuelta", home: "Juventus", away: "Insight", hs: 1, as: 3 },
    // Semifinal 2
    { round: "Semifinal Ida", home: "Almagro", away: "Red Bull Haxball", hs: 2, as: 1 },
    { round: "Semifinal Vuelta", home: "Red Bull Haxball", away: "Almagro", hs: 2, as: 1, hp: 3, ap: 5 },
    // Final
    { round: "Final", home: "Almagro", away: "Insight", hs: 0, as: 0, status: "CANCELLED" }
  ];

  const dbMatches = [];
  for (const m of matchesData) {
    let match = await prisma.match.findFirst({
      where: { tournamentId: tournament.id, round: m.round, homeTeamId: dbTeams[m.home].id, awayTeamId: dbTeams[m.away].id }
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId: tournament.id, homeTeamId: dbTeams[m.home].id, awayTeamId: dbTeams[m.away].id,
          round: m.round, homeScore: m.hs, awayScore: m.as, status: m.status || "PLAYED",
          homePenaltyScore: m.hp || null, awayPenaltyScore: m.ap || null
        }
      });
    }
    dbMatches.push({ ...m, id: match.id });
  }

  // Generate stats bulk with 0 mins
  const allTPlayersCopa = await prisma.tournamentPlayer.findMany({ where: { tournamentTeam: { tournamentId: tournament.id } } });
  const matchStatsToCreate = [];
  
  for (const m of dbMatches) {
    const homeTTId = tourneyTeamsMap[m.home].id;
    const awayTTId = tourneyTeamsMap[m.away].id;
    
    const playersForMatch = allTPlayersCopa.filter(p => p.tournamentTeamId === homeTTId || p.tournamentTeamId === awayTTId);
    for (const tp of playersForMatch) {
      matchStatsToCreate.push({
        matchId: m.id,
        playerId: tp.playerId,
        goals: 0, assists: 0, matchTime: 0
      });
    }
  }

  if (matchStatsToCreate.length > 0) {
    try {
      await prisma.matchStat.createMany({ data: matchStatsToCreate, skipDuplicates: true });
    } catch(e) { console.error("Error bulk stats:", e); }
  }

  // 4. Trofeos
  await prisma.trophy.createMany({
    data: [
      { name: "🏆 Campeón", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Almagro"].id },
      { name: "🏆 Campeón", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Insight"].id },
    ],
    skipDuplicates: true
  }).catch(() => {});

  console.log("Copa TPM Season 2 seeded successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
