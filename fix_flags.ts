import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.team.updateMany({
    where: { name: 'Argentina Sub-21' },
    data: { logoUrl: '/img/banderas/argentina.svg', isNationalTeam: true }
  });

  await prisma.team.updateMany({
    where: { name: 'Brasil Sub-21' },
    data: { logoUrl: '/img/banderas/brazil.svg', isNationalTeam: true }
  });

  await prisma.team.updateMany({
    where: { name: 'Mexico' },
    data: { logoUrl: 'https://flagcdn.com/w320/mx.png', isNationalTeam: true }
  });

  await prisma.team.updateMany({
    where: { name: 'México' },
    data: { logoUrl: 'https://flagcdn.com/w320/mx.png', isNationalTeam: true }
  });
  
  const usaExists = await prisma.team.findUnique({
    where: { name: 'Estados Unidos' }
  });

  if (!usaExists) {
    await prisma.team.create({
      data: {
        name: 'Estados Unidos',
        logoUrl: 'https://flagcdn.com/w320/us.png',
        isNationalTeam: true
      }
    });
    console.log("Created Estados Unidos");
  } else {
    await prisma.team.update({
      where: { name: 'Estados Unidos' },
      data: { logoUrl: 'https://flagcdn.com/w320/us.png', isNationalTeam: true }
    });
    console.log("Updated Estados Unidos");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
