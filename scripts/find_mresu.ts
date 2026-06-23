import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findMResu() {
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { nick: { contains: "M.Resu" } },
        { nick: { contains: "M.Reus" } },
        { nick: { contains: "Resu" } },
        { nick: { contains: "Reus" } },
        { nick: { contains: "Victor" } }
      ]
    }
  });
  console.log("Found players:");
  players.forEach(p => console.log(`- ${p.nick}`));
}

findMResu()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
