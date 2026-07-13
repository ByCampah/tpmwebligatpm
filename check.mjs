import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const t1 = await prisma.season.findFirst({
    where:{name:'Temporada 1 x8 (2021)'},
    include:{tournaments:{include:{teams:{include:{team:true}}, matches:true}}}
  });
  console.log('T1 x8 teams:', t1.tournaments[0].teams.length, 'matches:', t1.tournaments[0].matches.length);
  
  const t11 = await prisma.season.findFirst({
    where:{name:'Temporada 11 (2023)'},
    include:{tournaments:{include:{teams:{include:{team:true}}, matches:true}}}
  });
  console.log('T11 teams:', t11.tournaments[0].teams.length, 'matches:', t11.tournaments[0].matches.length);
}
main().finally(()=>prisma.$disconnect());
