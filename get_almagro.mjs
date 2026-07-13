import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.team.findFirst({where: {name: 'Almagro'}}).then(t => console.log(t.id)).finally(() => prisma.$disconnect());
