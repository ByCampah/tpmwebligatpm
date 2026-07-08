const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.findFirst({ where: { name: 'Liga TPM' } });
  if (cat) {
    await prisma.tournament.updateMany({
      where: { name: 'Liga TPM', season: { name: 'Temporada 1 (2018)' } },
      data: { categoryId: cat.id }
    });
    console.log("Category assigned.");
  } else {
    console.log("Category 'Liga TPM' not found");
  }

  // Delete historic orphan trophies
  const deleted = await prisma.trophy.deleteMany({
    where: { tournamentId: null }
  });
  console.log("Deleted orphan trophies:", deleted.count);
}

main().finally(() => prisma.$disconnect());
