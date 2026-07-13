import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.team.findFirst({
    where: {name: 'Almagro'},
    include: {
      homeMatches: { include: { tournament: true } },
      awayMatches: { include: { tournament: true } }
    }
  });
  console.log('Almagro matches without tournament:');
  t.homeMatches.forEach(m => {
    if (!m.tournament) console.log('Home match', m.id, m.round);
  });
  t.awayMatches.forEach(m => {
    if (!m.tournament) console.log('Away match', m.id, m.round);
  });
}
main().finally(() => prisma.$disconnect());
