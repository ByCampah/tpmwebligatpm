const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ARGENTINA = [
  "JulianWeigl", "Digne", "Campah", "Rodri", "-Messi", "Thomy", "Czerro", "Tobias",
  "Haze", "Mudryk", "Titolatola", "Baresi", "Lixtinhos", "Mimetico", "Thiago Almada",
  "Vargas", "Vlady", "Brian", "GetLow", "Mansi", "Santucho", "Viñas", "Andre",
  "Amielkpo", "Cervi", "Clonn", "EnzoWanted", "G.Martinez", "Gabito", "Gonzaff",
  "Nicosd", "Panda", "Santeh2V", "Watt"
];

const URUGUAY = ["Aqua", "Mate", "Mateo", "Frank Fabra", "Fabra"];
const CUBA = ["Ronin"];

async function updateNationalities() {
  console.log("Updating all players to Brasil...");
  await prisma.player.updateMany({
    data: { nationality: "Brasil" }
  });

  console.log("Updating Argentina players...");
  await prisma.player.updateMany({
    where: { nick: { in: ARGENTINA } },
    data: { nationality: "Argentina" }
  });

  console.log("Updating Uruguay players...");
  await prisma.player.updateMany({
    where: { nick: { in: URUGUAY } },
    data: { nationality: "Uruguay" }
  });

  console.log("Updating Cuba players...");
  await prisma.player.updateMany({
    where: { nick: { in: CUBA } },
    data: { nationality: "Cuba" }
  });

  console.log("Nationalities updated successfully!");
}

updateNationalities()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
