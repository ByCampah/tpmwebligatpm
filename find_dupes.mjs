import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.player.findMany();
  const t = await prisma.team.findMany();
  
  console.log('--- PLAYERS ---');
  p.forEach(x => {
    if (x.nick.toLowerCase().includes('gwy') || x.nick.toLowerCase().includes('latenha')) {
      console.log(`ID: ${x.id} | Nick: '${x.nick}'`);
    }
  });
  
  console.log('--- TEAMS ---');
  t.forEach(x => {
    if (x.name.toLowerCase().includes('gwy') || x.name.toLowerCase().includes('latenha')) {
      console.log(`ID: ${x.id} | Name: '${x.name}'`);
    }
  });
}
main().finally(() => prisma.$disconnect());
