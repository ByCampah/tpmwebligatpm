const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.tournament.findFirst({ 
    where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
    include: { teams: { include: { team: true } } }
  });
  if (!t) return console.log("Tournament not found");

  const teamsMap = {};
  t.teams.forEach(tt => { teamsMap[tt.team.name] = tt.team.id; });

  const rbhId = teamsMap['Red Bull Haxball'];
  const juventusId = teamsMap['Juventus'];
  const platenseId = teamsMap['Platense'];
  const milanId = teamsMap['Milan'];

  if (!rbhId || !juventusId || !platenseId || !milanId) {
    return console.log("One or more teams missing. Teams:", Object.keys(teamsMap));
  }

  const match1 = await prisma.match.create({
    data: {
      tournamentId: t.id,
      homeTeamId: rbhId,
      awayTeamId: juventusId,
      round: "Estadísticas Históricas",
      status: "PLAYED",
      homeScore: 0,
      awayScore: 0,
      matchDate: new Date("2018-10-13T00:00:00Z"),
    }
  });

  const match2 = await prisma.match.create({
    data: {
      tournamentId: t.id,
      homeTeamId: platenseId,
      awayTeamId: milanId,
      round: "Estadísticas Históricas",
      status: "PLAYED",
      homeScore: 0,
      awayScore: 0,
      matchDate: new Date("2018-10-13T00:00:00Z"),
    }
  });

  const stats = await prisma.matchStat.findMany({
    where: { match: { tournamentId: t.id, round: 'Estadísticas Históricas' } },
    include: { player: { include: { tournamentTeams: { include: { tournamentTeam: { include: { team: true } } } } } } }
  });

  for (const stat of stats) {
    const teamName = stat.player.tournamentTeams.find(tt => tt.tournamentTeam.tournamentId === t.id)?.tournamentTeam.team.name;
    if (teamName === 'Red Bull Haxball' || teamName === 'Juventus') {
      await prisma.matchStat.update({ where: { id: stat.id }, data: { matchId: match1.id } });
    } else if (teamName === 'Platense' || teamName === 'Milan') {
      await prisma.matchStat.update({ where: { id: stat.id }, data: { matchId: match2.id } });
    }
  }

  console.log("Matches fixed!");
}

main().finally(() => prisma.$disconnect());
