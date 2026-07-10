const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const playersToCheck = [
    "Rashford", "Brian", "Zakaria", "Imperador", "Neymar", "Beng", "Victorz", "Sant", "JulianWeigl",
    "David Silva", "Harry Kane", "Hazard", "Daniel", "Rafard", "Leo Silva", "Gerard Pique", "GrafinhoSOHTAPA", "Thiagow",
    "Digne", "Rodri", "Amauri", "Fekirr", "Bolivar", "Bernd Leno", "Bergkamp", "Lsantos", "Griezz", "Griezman", "Mozer",
    "Campah", "Thomy", "Titolatola", "Vinhas", "Vlady", "Haze", "F.Totti", "M U T U", "Kante",
    "Osman", "Madru", "Cebolinha", "Lemes", "Ramonzin", "Ruan404", "J.Valdivia", "Brandon",
    "Trapp", "Diogosena", "Baron", "Richarlison", "Pedro A", "Xerdan", "Jadsun", "Anderson", "Marmota"
  ];

  const dbPlayers = await prisma.player.findMany({
    where: { nick: { in: playersToCheck } }
  });

  const found = dbPlayers.map(p => p.nick);
  const notFound = playersToCheck.filter(p => !found.includes(p));

  console.log("Found:", found.join(", "));
  console.log("Not found:", notFound.join(", "));
}

main().catch(console.error).finally(() => prisma.$disconnect());
