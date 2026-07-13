import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p1Nick = await prisma.player.findMany({where:{nick:{contains:'gwy', mode:'insensitive'}}});
  const p2Nick = await prisma.player.findMany({where:{nick:{contains:'latenha', mode:'insensitive'}}});
  const p3Nick = await prisma.player.findMany({where:{nick:{contains:'rodri', mode:'insensitive'}}});

  console.log('GWY:', p1Nick.map(p=>({id: p.id, nick: p.nick})));
  console.log('Latenha:', p2Nick.map(p=>({id: p.id, nick: p.nick})));
  console.log('Rodri:', p3Nick.map(p=>({id: p.id, nick: p.nick})));
}
main().finally(() => prisma.$disconnect());
