import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const t1 = await prisma.team.findMany({where:{name:{contains:'gwy', mode:'insensitive'}}});
  const t2 = await prisma.team.findMany({where:{name:{contains:'latenha', mode:'insensitive'}}});
  const t3 = await prisma.team.findMany({where:{name:{contains:'rodri', mode:'insensitive'}}});
  console.log('GWY:', t1.map(t=>t.name));
  console.log('Latenha:', t2.map(t=>t.name));
  console.log('Rodri:', t3.map(t=>t.name));
}
main().finally(() => prisma.$disconnect());
