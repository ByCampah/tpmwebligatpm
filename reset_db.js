const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Borrando base de datos...");
  await prisma.matchStat.deleteMany();
  await prisma.match.deleteMany();
  await prisma.trophy.deleteMany();
  await prisma.tournamentPlayer.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.season.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  console.log("Base de datos borrada a 0 exitosamente.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
