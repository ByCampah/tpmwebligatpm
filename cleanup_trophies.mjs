import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting duplicated player trophies...");
  
  const result = await prisma.trophy.deleteMany({
    where: {
      type: "PLAYER",
      name: {
        in: ["Campeón (1er Puesto)", "Subcampeón (2do Puesto)", "Tercer Puesto (3ro)"]
      }
    }
  });

  console.log(`Deleted ${result.count} duplicated player trophies.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
