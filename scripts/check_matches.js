const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({ 
    where: { tournament: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } } }, 
    include: { homeTeam: true, awayTeam: true } 
  });
  console.log(matches.map(match => ({ id: match.id, round: match.round, home: match.homeTeam.name, away: match.awayTeam.name })));
}
main().finally(() => prisma.$disconnect());
