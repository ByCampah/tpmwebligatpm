const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nationalTeams = [
    { name: "Argentina", logoUrl: "/img/banderas/argentina.svg" },
    { name: "Brasil", logoUrl: "/img/banderas/brazil.svg" },
    { name: "Uruguay", logoUrl: "/img/banderas/uruguay.svg" },
    { name: "Colombia", logoUrl: "https://flagcdn.com/w320/co.png" },
    { name: "Chile", logoUrl: "https://flagcdn.com/w320/cl.png" },
    { name: "Perú", logoUrl: "https://flagcdn.com/w320/pe.png" },
    { name: "Ecuador", logoUrl: "https://flagcdn.com/w320/ec.png" },
    { name: "Paraguay", logoUrl: "https://flagcdn.com/w320/py.png" },
    { name: "Bolivia", logoUrl: "https://flagcdn.com/w320/bo.png" },
    { name: "Venezuela", logoUrl: "https://flagcdn.com/w320/ve.png" },
    { name: "Cuba", logoUrl: "https://flagcdn.com/w320/cu.png" }
  ];

  for (const nt of nationalTeams) {
    await prisma.team.upsert({
      where: { name: nt.name },
      update: { isNationalTeam: true, logoUrl: nt.logoUrl },
      create: { name: nt.name, isNationalTeam: true, logoUrl: nt.logoUrl }
    });
    console.log("Upserted", nt.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
