import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const teams = await prisma.team.findMany({ select: { id: true, name: true }});
  console.log(teams);
}
main().finally(() => prisma.$disconnect());
