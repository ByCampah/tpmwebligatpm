import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany();
  console.log("Tournaments in DB:");
  tournaments.forEach(t => console.log(`- ${t.name} (Format: ${t.format})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
