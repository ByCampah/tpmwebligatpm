const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const squads = {
  Insight: [
    { name: "David Silva", g: 0, a: 0 },
    { name: "Harry Kane", g: 0, a: 0 },
    { name: "Hazard", g: 0, a: 0 },
    { name: "Daniel", g: 0, a: 0 },
    { name: "Rafard", g: 0, a: 0 },
    { name: "Leo Silva", g: 0, a: 0 },
    { name: "Gerard Pique", g: 0, a: 0 },
    { name: "GrafinhoSOHTAPA", g: 0, a: 0 },
    { name: "Thiagow", g: 0, a: 0 },
  ],
  Galaxy: [
    { name: "Rashford", g: 0, a: 0 },
    { name: "Brian", g: 0, a: 0 },
    { name: "Zakaria", g: 0, a: 0 },
    { name: "Imperador", g: 0, a: 0 },
    { name: "Beng", g: 0, a: 0 },
    { name: "Victorz", g: 0, a: 0 },
    { name: "Sant", g: 0, a: 0 },
    { name: "JulianWeigl", g: 0, a: 0 },
  ],
  Almagro: [
    { name: "Campah", g: 0, a: 0 },
    { name: "Thomy", g: 0, a: 0 },
    { name: "Titolatola", g: 0, a: 0 },
    { name: "Vinhas", g: 0, a: 0 },
    { name: "Vlady", g: 0, a: 0 },
    { name: "Haze", g: 0, a: 0 },
    { name: "F.Totti", g: 0, a: 0 },
    { name: "M U T U", g: 0, a: 0 },
    { name: "Kante", g: 0, a: 0 },
  ],
  "Red Bull Haxball": [],
  Fiorentina: [],
  Dreamers: []
};

const matches = [
  // Playoff
  { home: "Almagro", away: "Fiorentina", hg: 1, ag: 1, hp: 3, ap: 1, round: "Playoff" },
  { home: "Red Bull Haxball", away: "Dreamers", hg: 7, ag: 1, round: "Playoff" },
  // Semifinal
  { home: "Insight", away: "Red Bull Haxball", hg: 2, ag: 1, round: "Semifinal" },
  { home: "Galaxy", away: "Almagro", hg: 4, ag: 0, round: "Semifinal" },
  // 3er Puesto
  { home: "Almagro", away: "Red Bull Haxball", hg: 1, ag: 0, round: "3er Puesto" },
  // Final
  { home: "Insight", away: "Galaxy", hg: 1, ag: 1, hp: 5, ap: 3, round: "Final" }
];

async function main() {
  console.log("Starting Temporada 3 Copa TPM seed...");

  let season = await prisma.season.findFirst({ where: { name: 'Temporada 3 (2019)' } });
  if (!season) {
    season = await prisma.season.create({ data: { name: 'Temporada 3 (2019)' } });
  }

  let tournament = await prisma.tournament.findFirst({
    where: { seasonId: season.id, name: 'Copa TPM' }
  });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: 'Copa TPM',
        format: 'COPA',
        isOfficial: true,
        seasonId: season.id
      }
    });
  }

  const teamIds = {};
  for (const tName of Object.keys(squads)) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) {
      team = await prisma.team.create({ data: { name: tName } });
    }
    teamIds[tName] = team.id;
  }

  const ttIds = {};
  for (const tName of Object.keys(squads)) {
    let tt = await prisma.tournamentTeam.findFirst({
      where: { tournamentId: tournament.id, teamId: teamIds[tName] }
    });
    if (!tt) {
      tt = await prisma.tournamentTeam.create({
        data: { tournamentId: tournament.id, teamId: teamIds[tName] }
      });
    }
    ttIds[tName] = tt.id;
  }

  for (const m of matches) {
    console.log("Match: " + m.home + " vs " + m.away);
    const homeTtId = ttIds[m.home];
    const awayTtId = ttIds[m.away];
    console.log("TT IDs:", homeTtId, awayTtId);

    let match = await prisma.match.findFirst({
      where: {
        tournamentId: tournament.id,
        homeTeamId: teamIds[m.home],
        awayTeamId: teamIds[m.away],
        round: m.round
      }
    });

    if (!match) {
      match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: teamIds[m.home],
          awayTeamId: teamIds[m.away],
          homeScore: m.hg,
          awayScore: m.ag,
          homePenaltyScore: m.hp || null,
          awayPenaltyScore: m.ap || null,
          round: m.round,
          status: 'FINISHED'
        }
      });
    }
  }

  // Trophies
  const trophies = [
    { team: "Insight", name: "1st Place" },
    { team: "Galaxy", name: "2nd Place" },
    { team: "Almagro", name: "3rd Place" }
  ];

  for (const t of trophies) {
    let trophy = await prisma.trophy.findFirst({
      where: {
        tournamentId: tournament.id,
        teamId: teamIds[t.team],
        name: t.name
      }
    });
    if (!trophy) {
      trophy = await prisma.trophy.create({
        data: {
          tournamentId: tournament.id,
          teamId: teamIds[t.team],
          name: t.name,
          type: "TEAM"
        }
      });
    }

    const players = squads[t.team];
    for (const p of players) {
      let player = await prisma.player.findFirst({ where: { nick: p.name } });
      if (!player) player = await prisma.player.create({ data: { nick: p.name } });

      let pt = await prisma.trophy.findFirst({
        where: {
          tournamentId: tournament.id,
          playerId: player.id,
          name: t.name
        }
      });
      if (!pt) {
        await prisma.trophy.create({
          data: {
            tournamentId: tournament.id,
            playerId: player.id,
            name: t.name,
            type: "PLAYER"
          }
        });
      }
    }
  }

  console.log("Copa TPM Temporada 3 seeded.");
}

main().catch(console.error);
