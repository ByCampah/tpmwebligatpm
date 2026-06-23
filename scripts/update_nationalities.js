const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const argentinos = [
  "JulianWeigl", "Digne", "Campah", "Rodri-Messi", "Thomy", "Czerro", "Tobias", 
  "Haze", "Mudryk", "Titolatola", "Baresi", "Lixtinhos", "Mimetico", "Thiago Almada", 
  "Vargas", "Vlady", "Brian", "GetLow", "Mansi", "Santucho", "Viñas", "Andre", 
  "Amielkpo", "Cervi", "Clonn", "EnzoWanted", "G.Martinez", "Gabito", "Gonzaff", 
  "Nicosd", "Panda", "Santeh2V", "Watt"
];

const uruguayos = ["Aqua"];

async function main() {
  console.log("Setting everyone to Brasil...");
  await prisma.player.updateMany({
    data: { nationality: "Brasil" }
  });

  console.log("Setting Argentinians...");
  for (const nick of argentinos) {
    const res = await prisma.player.updateMany({
      where: { nick: nick },
      data: { nationality: "Argentina" }
    });
    if (res.count === 0) {
      console.log(`Argentino no encontrado: ${nick}`);
    }
  }

  console.log("Setting Uruguayans...");
  for (const nick of uruguayos) {
    const res = await prisma.player.updateMany({
      where: { nick: nick },
      data: { nationality: "Uruguay" }
    });
    if (res.count === 0) {
      console.log(`Uruguayo no encontrado: ${nick}`);
    }
  }

  console.log("Done updating nationalities.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
