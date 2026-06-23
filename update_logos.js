const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const clubesDir = path.join(__dirname, 'public', 'IMG', 'clubes');
  const files = fs.readdirSync(clubesDir);
  
  const teams = await prisma.team.findMany();
  
  for (const team of teams) {
    const normalizedTeamName = team.name.toLowerCase().replace(/\s+/g, '');
    
    const matchedFile = files.find(f => {
      const nameWithoutExt = f.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, '');
      return nameWithoutExt === normalizedTeamName || normalizedTeamName.includes(nameWithoutExt);
    });
    
    if (matchedFile) {
      const logoUrl = `/IMG/clubes/${matchedFile}`;
      console.log(`Matching ${team.name} -> ${logoUrl}`);
      await prisma.team.update({
        where: { id: team.id },
        data: { logoUrl }
      });
    } else {
      console.log(`No match for ${team.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
