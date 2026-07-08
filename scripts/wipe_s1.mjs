import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Borrando Temporada 1...');
  
  const season = await prisma.season.findUnique({
    where: { name: 'Temporada 1 (2018)' }
  });

  if (season) {
    await prisma.season.delete({
      where: { id: season.id }
    });
    console.log('Temporada 1 eliminada por completo (con cascada).');
  } else {
    console.log('Temporada 1 no encontrada.');
  }

  // Just to be absolutely sure, clean up any orphan tournaments named "Liga TPM" that might not have a seasonId
  // The first bug might have created "Liga TPM" with seasonId NULL if something failed.
  await prisma.tournament.deleteMany({
    where: { name: 'Liga TPM' }
  });
  console.log('Torneos huerfanos Liga TPM eliminados.');

  console.log('Listo. Ahora puedes volver a correr seed_s1.mjs.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
