import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany();
  console.log(teams.map(t=>t.name).join('\n'));
}
main().finally(() => prisma.$disconnect());
