const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: {
        contains: 'Copa de Promesas',
        mode: 'insensitive'
      }
    }
  });

  if (tournament) {
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        isOfficial: false,
        seasonId: null
      }
    });
    console.log(`Tournament ${tournament.name} moved to extra tournaments successfully!`);
  } else {
    console.log("Tournament not found!");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
