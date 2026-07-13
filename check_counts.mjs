import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tId = 'cmrhof8vz0000ukwkpnpe6u9a';
  const teams = await prisma.tournamentTeam.count({ where: { tournamentId: tId } });
  const matches = await prisma.match.count({ where: { tournamentId: tId } });
  console.log('Teams:', teams, 'Matches:', matches);
}

main().finally(() => prisma.$disconnect());
