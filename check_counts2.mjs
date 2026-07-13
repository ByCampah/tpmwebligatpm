import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const stats = await prisma.matchStat.count();
  const tp = await prisma.tournamentPlayer.count();
  console.log('MatchStats:', stats, 'TournamentPlayers:', tp);
}
main().finally(() => prisma.$disconnect());
