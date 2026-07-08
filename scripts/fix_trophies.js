const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.trophy.updateMany({
    where: { name: "🏆 1° Puesto" },
    data: { name: "Campeón" }
  });
  await prisma.trophy.updateMany({
    where: { name: "🥈 2° Puesto" },
    data: { name: "Subcampeón" }
  });
  await prisma.trophy.updateMany({
    where: { name: "🥉 3° Puesto" },
    data: { name: "Tercer Puesto" }
  });
  await prisma.trophy.updateMany({
    where: { name: "⚽ Botín de Oro" },
    data: { name: "Máximo Goleador" }
  });
  await prisma.trophy.updateMany({
    where: { name: "👟 Máximo Asistidor" },
    data: { name: "Máximo Asistidor" } // Was the same but just in case
  });
  console.log("Trophies updated!");
}

main().finally(() => prisma.$disconnect());
