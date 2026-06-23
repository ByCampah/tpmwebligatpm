const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const firstUser = users[0];
    const updatedUser = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' },
    });
    console.log(`¡Éxito! El usuario ${updatedUser.name} ha sido hecho Administrador.`);
  } else {
    console.log("No se encontraron usuarios en la base de datos.");
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
