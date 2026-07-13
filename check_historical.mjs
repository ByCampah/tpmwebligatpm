import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const t1 = await prisma.season.findFirst({
    where:{name:'Temporada 1 x8 (2021)'},
    include:{tournaments:{include:{matches:{include:{homeTeam:true}}}}}
  });
  console.log("Temporada 1 x8:", t1.tournaments[0]?.matches.map(m=>({r:m.round, t:m.homeTeam.name, id:m.id})));

  const t11 = await prisma.season.findFirst({
    where:{name:'Temporada 11 (2023)'},
    include:{tournaments:{include:{matches:{include:{homeTeam:true}}}}}
  });
  console.log("Temporada 11:", t11.tournaments[0]?.matches.map(m=>({r:m.round, t:m.homeTeam.name, id:m.id})));
}
main().finally(()=>prisma.$disconnect());
