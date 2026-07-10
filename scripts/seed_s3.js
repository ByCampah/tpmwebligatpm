const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Temporada 3 (2019) seed...");

  console.log("1. Checking season...");
  // 1. Season & Tournament
  let season = await prisma.season.findFirst({ where: { name: 'Temporada 3 (2019)' } });
  if (!season) {
    season = await prisma.season.create({ data: { name: 'Temporada 3 (2019)', isActive: false } });
  }

  let category = await prisma.category.findFirst({ where: { name: 'Liga TPM' } });
  if (!category) category = await prisma.category.create({ data: { name: 'Liga TPM' } });

  let tournament = await prisma.tournament.findFirst({ where: { name: 'Liga TPM', seasonId: season.id } });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: { name: 'Liga TPM', season: { connect: { id: season.id } }, category: { connect: { id: category.id } }, format: 'LEAGUE' }
    });
  }
  
  console.log("2. Checking teams...");

  // 2. Teams
  const teamsData = ["Galaxy", "Insight", "Red Bull Haxball", "Almagro", "Dreamers", "Fiorentina"];
  const dbTeams = {};
  for (const tName of teamsData) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) team = await prisma.team.create({ data: { name: tName } });
    dbTeams[tName] = team;

    // Enroll in tournament
    let tt = await prisma.tournamentTeam.findFirst({ where: { tournamentId: tournament.id, teamId: team.id } });
    if (!tt) await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: team.id } });
  }

  const getTtId = async (tName) => {
    const tt = await prisma.tournamentTeam.findFirst({ where: { tournamentId: tournament.id, teamId: dbTeams[tName].id } });
    return tt.id;
  };

  // 3. Players & Stats Map
  const squads = {
    "Galaxy": [
      { name: "Rashford", g: 0, a: 2 }, { name: "Brian", g: 1, a: 2 }, { name: "Zakaria", g: 1, a: 0 },
      { name: "Imperador", g: 7, a: 2 }, { name: "Beng", g: 4, a: 4 }, { name: "Victorz", g: 8, a: 4 },
      { name: "Sant", g: 1, a: 2 }, { name: "JulianWeigl", g: 5, a: 3 }
    ],
    "Insight": [
      { name: "David Silva", g: 0, a: 0 }, { name: "Harry Kane", g: 3, a: 6 }, { name: "Hazard", g: 4, a: 1 },
      { name: "Daniel", g: 2, a: 0 }, { name: "Rafard", g: 1, a: 0 }, { name: "Leo Silva", g: 2, a: 1 },
      { name: "Gerard Pique", g: 1, a: 1 }, { name: "GrafinhoSOHTAPA", g: 3, a: 1 }, { name: "Thiagow", g: 0, a: 1 }
    ],
    "Red Bull Haxball": [
      { name: "Digne", g: 10, a: 3 }, { name: "Rodri", g: 7, a: 3 }, { name: "Fekirr", g: 2, a: 3 },
      { name: "Bolivar", g: 1, a: 4 }, { name: "Bernd Leno", g: 0, a: 0 }, { name: "Bergkamp", g: 1, a: 4 },
      { name: "Lsantos", g: 0, a: 0 }, { name: "Griezman", g: 1, a: 0 }, { name: "Mozer", g: 0, a: 1 }
    ],
    "Almagro": [
      { name: "Campah", g: 1, a: 1 }, { name: "Thomy", g: 1, a: 0 }, { name: "Titolatola", g: 1, a: 1 },
      { name: "Vinhas", g: 1, a: 2 }, { name: "Vlady", g: 0, a: 1 }, { name: "Haze", g: 3, a: 0 },
      { name: "F.Totti", g: 6, a: 2 }, { name: "M U T U", g: 0, a: 0 }, { name: "Kante", g: 0, a: 2 }
    ],
    "Dreamers": [
      { name: "Osman", g: 2, a: 0 }, { name: "Madru", g: 0, a: 1 }, { name: "Cebolinha", g: 0, a: 0 },
      { name: "Lemes", g: 3, a: 0 }, { name: "Ramonzin", g: 0, a: 3 }, { name: "Ruan404", g: 1, a: 0 },
      { name: "J.Valdivia", g: 1, a: 0 }, { name: "Brandon", g: 0, a: 0 }
    ],
    "Fiorentina": [
      { name: "Trapp", g: 3, a: 3 }, { name: "Diogosena", g: 4, a: 2 }, { name: "Baron", g: 1, a: 0 },
      { name: "Richarlison", g: 11, a: 0 }, { name: "Pedro A", g: 4, a: 4 }, { name: "Xerdan", g: 0, a: 0 },
      { name: "Jadsun", g: 0, a: 2 }, { name: "Anderson", g: 0, a: 0 }, { name: "Marmota", g: 0, a: 0 }
    ]
  };

  console.log("3. Enrolling players...");

  const dbPlayers = {};
  for (const [tName, players] of Object.entries(squads)) {
    console.log("Enrolling players for team: " + tName);
    const ttId = await getTtId(tName);
    for (const p of players) {
      console.log("  - " + p.name);
      let player = await prisma.player.findFirst({ where: { nick: p.name } });
      if (!player) player = await prisma.player.create({ data: { nick: p.name } });
      dbPlayers[p.name] = player;

      // Enroll in team
      let tp = await prisma.tournamentPlayer.findFirst({ where: { tournamentTeamId: ttId, playerId: player.id } });
      if (!tp) await prisma.tournamentPlayer.create({ data: { tournamentTeamId: ttId, playerId: player.id } });
    }
  }

  // 4. Matches
  const realMatches = [
    { round: "Fecha 1", home: "Red Bull Haxball", away: "Galaxy", hs: 1, as: 0 },
    { round: "Fecha 1", home: "Fiorentina", away: "Insight", hs: 1, as: 2 },
    { round: "Fecha 1", home: "Dreamers", away: "Almagro", hs: 2, as: 5 },

    { round: "Fecha 2", home: "Almagro", away: "Fiorentina", hs: 0, as: 2 },
    { round: "Fecha 2", home: "Red Bull Haxball", away: "Dreamers", hs: 3, as: 0 },
    { round: "Fecha 2", home: "Insight", away: "Galaxy", hs: 1, as: 4 },

    { round: "Fecha 3", home: "Fiorentina", away: "Dreamers", hs: 8, as: 3 },
    { round: "Fecha 3", home: "Red Bull Haxball", away: "Insight", hs: 2, as: 3 },
    { round: "Fecha 3", home: "Galaxy", away: "Almagro", hs: 3, as: 1 },

    { round: "Fecha 4", home: "Galaxy", away: "Dreamers", hs: 9, as: 0 },
    { round: "Fecha 4", home: "Insight", away: "Almagro", hs: 1, as: 0 },
    { round: "Fecha 4", home: "Red Bull Haxball", away: "Fiorentina", hs: 0, as: 3 },

    { round: "Fecha 5", home: "Almagro", away: "Red Bull Haxball", hs: 1, as: 2 },
    { round: "Fecha 5", home: "Dreamers", away: "Insight", hs: 1, as: 8 },
    { round: "Fecha 5", home: "Fiorentina", away: "Galaxy", hs: 2, as: 5 },

    { round: "Fecha 6", home: "Red Bull Haxball", away: "Galaxy", hs: 2, as: 3 },
    { round: "Fecha 6", home: "Fiorentina", away: "Insight", hs: 1, as: 0 },
    { round: "Fecha 6", home: "Dreamers", away: "Almagro", hs: 0, as: 5 },

    { round: "Fecha 7", home: "Almagro", away: "Fiorentina", hs: 0, as: 1 },
    { round: "Fecha 7", home: "Red Bull Haxball", away: "Dreamers", hs: 4, as: 2 },
    { round: "Fecha 7", home: "Insight", away: "Galaxy", hs: 2, as: 0 },

    { round: "Fecha 8", home: "Fiorentina", away: "Dreamers", hs: 1, as: 0 },
    { round: "Fecha 8", home: "Red Bull Haxball", away: "Insight", hs: 1, as: 0 },
    { round: "Fecha 8", home: "Galaxy", away: "Almagro", hs: 1, as: 0 },

    { round: "Fecha 9", home: "Galaxy", away: "Dreamers", hs: 4, as: 0 },
    { round: "Fecha 9", home: "Insight", away: "Almagro", hs: 1, as: 0 },
    { round: "Fecha 9", home: "Red Bull Haxball", away: "Fiorentina", hs: 4, as: 2 },

    { round: "Fecha 10", home: "Almagro", away: "Red Bull Haxball", hs: 1, as: 3 },
    { round: "Fecha 10", home: "Dreamers", away: "Insight", hs: 0, as: 1 },
    { round: "Fecha 10", home: "Fiorentina", away: "Galaxy", hs: 1, as: 1 }
  ];

  console.log("4. Creating matches...");

  for (const m of realMatches) {
    console.log("Creating match: " + m.home + " vs " + m.away);
    let match = await prisma.match.findFirst({
      where: {
        tournamentId: tournament.id,
        round: m.round,
        homeTeamId: dbTeams[m.home].id,
        awayTeamId: dbTeams[m.away].id
      }
    });

    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          round: m.round,
          matchDate: new Date(),
          homeTeamId: dbTeams[m.home].id,
          awayTeamId: dbTeams[m.away].id,
          homeScore: m.hs,
          awayScore: m.as,
          status: 'PLAYED'
        }
      });
    } else {
      match = await prisma.match.update({
        where: { id: match.id },
        data: { homeScore: m.hs, awayScore: m.as }
      });
    }

    // Assign 90 minutes to all enrolled players of both teams for this match
    const homeTtId = await getTtId(m.home);
    const awayTtId = await getTtId(m.away);

    const homePlayers = await prisma.tournamentPlayer.findMany({ where: { tournamentTeamId: homeTtId } });
    const awayPlayers = await prisma.tournamentPlayer.findMany({ where: { tournamentTeamId: awayTtId } });

    const allPlayers = [...homePlayers, ...awayPlayers];
    const uniquePlayers = Array.from(new Map(allPlayers.map(p => [p.playerId, p])).values());

    for (const p of uniquePlayers) {
      let stat = await prisma.matchStat.findFirst({ where: { matchId: match.id, playerId: p.playerId } });
      if (!stat) {
        try {
          await prisma.matchStat.create({
            data: {
              matchId: match.id,
              playerId: p.playerId,
              matchTime: 90
            }
          });
        } catch(e) {
          console.error("Failed to create stat for player", p.playerId, "match", match.id);
          throw e;
        }
      }
    }
  }

  console.log("5. Historical Match...");

  // 5. Historical Stats Match
  let histMatch = await prisma.match.findFirst({
    where: { tournamentId: tournament.id, round: "Estadísticas Históricas" }
  });
  if (!histMatch) {
    histMatch = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        round: "Estadísticas Históricas",
        matchDate: new Date(),
        homeTeamId: dbTeams["Galaxy"].id,
        awayTeamId: dbTeams["Insight"].id,
        homeScore: 0,
        awayScore: 0,
        status: 'PLAYED'
      }
    });
  }

  for (const [tName, players] of Object.entries(squads)) {
    for (const p of players) {
      let stat = await prisma.matchStat.findFirst({ where: { matchId: histMatch.id, playerId: dbPlayers[p.name].id } });
      if (!stat) {
        await prisma.matchStat.create({
          data: {
            matchId: histMatch.id,
            playerId: dbPlayers[p.name].id,
            matchTime: 0,
            goals: p.g,
            assists: p.a
          }
        });
      } else {
        await prisma.matchStat.update({
          where: { id: stat.id },
          data: { goals: p.g, assists: p.a }
        });
      }
    }
  }

  // 6. Trophies
  const existingTrophies = await prisma.trophy.count({ where: { tournamentId: tournament.id } });
  if (existingTrophies === 0) {
    await prisma.trophy.createMany({
      data: [
        { name: "🏆 1° Puesto", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Galaxy"].id },
        { name: "🥈 2° Puesto", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Insight"].id },
        { name: "🥉 3° Puesto", type: "TEAM", tournamentId: tournament.id, teamId: dbTeams["Red Bull Haxball"].id },
        { name: "⚽ Botín de Oro", type: "PLAYER", tournamentId: tournament.id, playerId: dbPlayers["Richarlison"].id },
        { name: "👟 Máximo Asistidor", type: "PLAYER", tournamentId: tournament.id, playerId: dbPlayers["Harry Kane"].id }
      ]
    });
  }

  console.log("Temporada 3 Liga TPM seed completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
