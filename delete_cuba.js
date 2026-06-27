const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.team.deleteMany({ where: { name: 'Cuba' } })
  .then(() => console.log('Deleted Cuba'))
  .finally(() => prisma.$disconnect());
