const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trophy.findMany({
  where: { player: { nick: 'JulianWeigl' } },
  include: { tournament: { include: { season: true } } }
}).then(t => console.log(JSON.stringify(t, null, 2))).finally(() => prisma.$disconnect());
