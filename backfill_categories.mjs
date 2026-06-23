import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany();
  for (const t of tournaments) {
    if (t.name.toLowerCase().includes("liga")) {
      await prisma.tournament.update({
        where: { id: t.id },
        data: { category: "Primera División" }
      });
      console.log(`Updated ${t.name} to 'Primera División'`);
    } else if (t.name.toLowerCase().includes("copa")) {
      await prisma.tournament.update({
        where: { id: t.id },
        data: { category: "Copa TPM" }
      });
      console.log(`Updated ${t.name} to 'Copa TPM'`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
