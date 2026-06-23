import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fixtureText = `
Fecha 1
RBH 1 - 0 Galaxy
Fiorentina 1 - 2 Insight
Dreamers 2 - 5 Almagro

Fecha 2
Almagro 0 - 2 Fiorentina
RBH 3 - 0 Dreamers
Insight 1 - 4 Galaxy

Fecha 3
Fiorentina 8 - 3 Dreamers
RBH 2 - 3 Insight
Galaxy 3 - 1 Almagro

Fecha 4
Galaxy 9 - 0 Dreamers
Insight 1 - 0 Almagro
RBH 0 - 3 Fiorentina

Fecha 5
Almagro 1 - 2 RBH
Dreamers 1 - 8 Insight
Fiorentina 2 - 5 Galaxy

Fecha 6
RBH 2 - 3 Galaxy
Fiorentina 1 - 0 Insight
Dreamers 0 - 5 Almagro

Fecha 7
Almagro 0 - 1 Fiorentina
RBH 4 - 2 Dreamers
Insight 2 - 0 Galaxy

Fecha 8
Fiorentina 1 - 0 Dreamers
RBH 1 - 0 Insight
Galaxy 0 - 0 Almagro

Fecha 9
Galaxy 4 - 0 Dreamers
Insight 1 - 0 Almagro
RBH 4 - 2 Fiorentina

Fecha 10
Almagro 1 - 3 RBH
Dreamers 0 - 1 Insight
Fiorentina 1 - 1 Galaxy
`;

const teamsData = {
  Almagro: [
    ['Campah', 1, 1],
    ['Thomy', 1, 0],
    ['Titolatola', 1, 1],
    ['Santucho', 1, 2],
    ['Vlady', 0, 1],
    ['Haze', 3, 0],
    ['Dybala', 6, 2],
    ['Mutu', 0, 0],
    ['Kante', 0, 2],
  ],
  Insight: [
    ['David Silva', 0, 0],
    ['Harry Kane', 3, 6],
    ['Hazard', 4, 1],
    ['Daniel', 2, 0],
    ['Rafard', 1, 0],
    ['Leo Silva', 2, 1],
    ['Pique', 1, 1],
    ['Graf', 3, 1],
    ['Thiagow', 0, 1],
  ],
  Dreamers: [
    ['Osman', 2, 0],
    ['Madru', 0, 1],
    ['Cebolinha', 0, 0],
    ['Lemes', 3, 0],
    ['Ramonzin', 0, 3],
    ['Ruan', 1, 0],
    ['Valdivia', 1, 0],
    ['Brandon', 0, 0],
  ],
  RBH: [
    ['Digne', 10, 3],
    ['Rodri', 7, 3],
    ['Fekirr', 2, 3],
    ['Bolivar', 1, 4],
    ['Bernd Leno', 0, 0],
    ['Bergkamp', 1, 4],
    ['Lsantos', 0, 0],
    ['Griezman', 1, 0],
    ['Mozer', 0, 1],
  ],
  Fiorentina: [
    ['Trapp', 3, 3],
    ['Diogosena', 4, 2],
    ['Baron', 1, 0],
    ['Richalison', 11, 0],
    ['Pedro A', 4, 4],
    ['Xerdan', 0, 0],
    ['Jadsun', 0, 2],
    ['Anderson', 0, 0],
    ['Marmota', 0, 0],
  ],
  Galaxy: [
    ['Rashford', 0, 2],
    ['Brian', 1, 2],
    ['De Gea', 1, 0],
    ['Imperador', 7, 2],
    ['Beng', 4, 4],
    ['Reus', 8, 4],
    ['Sant', 1, 2],
    ['JulianWeigl', 5, 3],
  ]
};

async function main() {
  // 1. Season & Tournament
  let season = await prisma.season.upsert({
    where: { name: "Temporada 3" },
    update: { isActive: true },
    create: { name: "Temporada 3", isActive: true }
  });

  await prisma.season.updateMany({
    where: { NOT: { id: season.id } },
    data: { isActive: false }
  });

  let tournament = await prisma.tournament.findFirst({
    where: { name: "Liga T3", seasonId: season.id }
  });

  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: "Liga T3",
        format: "LEAGUE",
        category: "Primera División",
        seasonId: season.id
      }
    });
  }

  // 2. Teams
  const dbTeams = {};
  for (const teamName of Object.keys(teamsData)) {
    let t = await prisma.team.findUnique({ where: { name: teamName } });
    if (!t) {
      t = await prisma.team.create({ data: { name: teamName } });
    }
    dbTeams[teamName] = t;
    
    // Enroll team
    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: t.id } },
      update: {},
      create: { tournamentId: tournament.id, teamId: t.id }
    });
  }

  // 3. Players
  for (const [teamName, roster] of Object.entries(teamsData)) {
    const tTeam = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: dbTeams[teamName].id } }
    });

    for (const [nick, goals, assists] of roster) {
      let p = await prisma.player.findUnique({ where: { nick } });
      if (!p) {
        p = await prisma.player.create({ data: { nick } });
      }

      // Enroll player
      await prisma.tournamentPlayer.upsert({
        where: { tournamentTeamId_playerId: { tournamentTeamId: tTeam.id, playerId: p.id } },
        update: {},
        create: { tournamentTeamId: tTeam.id, playerId: p.id }
      });
    }
  }

  // 4. Matches
  const lines = fixtureText.trim().split('\n').filter(l => l.trim() !== '');
  let currentRound = '';

  for (const line of lines) {
    if (line.startsWith('Fecha')) {
      currentRound = line.trim();
      continue;
    }

    // e.g. "RBH 1 - 0 Galaxy"
    const matchMatch = line.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);
    if (matchMatch) {
      const homeName = matchMatch[1].trim();
      const homeScore = parseInt(matchMatch[2]);
      const awayScore = parseInt(matchMatch[3]);
      const awayName = matchMatch[4].trim();

      const homeId = dbTeams[homeName].id;
      const awayId = dbTeams[awayName].id;

      await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore,
          awayScore,
          round: currentRound,
          status: "PLAYED",
          matchDate: new Date()
        }
      });
    }
  }

  // 5. Dummy Historical Stats Matches
  // We'll create one dummy match per team against itself (or against BYE) 
  // just to store the stats without messing up the actual matches.
  for (const [teamName, roster] of Object.entries(teamsData)) {
    const teamId = dbTeams[teamName].id;
    const dummyMatch = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: teamId,
        awayTeamId: teamId, // play vs itself
        homeScore: 0,
        awayScore: 0,
        round: "Estadísticas Históricas",
        status: "PLAYED",
        matchDate: new Date()
      }
    });

    for (const [nick, goals, assists] of roster) {
      const p = await prisma.player.findUnique({ where: { nick } });
      
      // Calculate total matches for this team
      const matchesCount = 10; // since it's a 10-match league
      
      await prisma.matchStat.create({
        data: {
          matchId: dummyMatch.id,
          playerId: p.id,
          goals,
          assists,
          matchTime: 90 * matchesCount // arbitrary match time just to count the minutes
        }
      });
    }
  }

  console.log("Seeded Season 3 successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
