import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const players = await prisma.player.findMany();
  console.log(players.map(p=>p.nick).join('\n'));
}
main().finally(() => prisma.$disconnect());
