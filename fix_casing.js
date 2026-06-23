const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fix DB - Teams
  const teams = await prisma.team.findMany();
  for (const t of teams) {
    if (t.logoUrl && t.logoUrl.includes('/IMG/')) {
      await prisma.team.update({
        where: { id: t.id },
        data: { logoUrl: t.logoUrl.replace(/\/IMG\//g, '/img/') }
      });
      console.log(`Updated Team ${t.name} logoUrl`);
    }
  }

  // Fix DB - Trophies
  const trophies = await prisma.trophy.findMany();
  for (const t of trophies) {
    if (t.imageUrl && t.imageUrl.includes('/IMG/')) {
      await prisma.trophy.update({
        where: { id: t.id },
        data: { imageUrl: t.imageUrl.replace(/\/IMG\//g, '/img/') }
      });
      console.log(`Updated Trophy ${t.id} imageUrl`);
    }
  }

  // Fix files
  const files = [
    'src/app/layout.tsx',
    'src/lib/colors.ts'
  ];

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('/IMG/')) {
      content = content.replace(/\/IMG\//g, '/img/');
      fs.writeFileSync(file, content);
      console.log(`Updated file ${file}`);
    }
  }

  console.log("Done fixing casing!");
}

main().finally(() => prisma.$disconnect());
