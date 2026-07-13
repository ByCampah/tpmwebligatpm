import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany();
  console.log(seasons.map(s=>s.name).join('\n'));
}
main().finally(() => prisma.$disconnect());
