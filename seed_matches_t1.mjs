import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawData = `Fecha 1		
Juventus	5 - 1	Milan
Formandos	2 - 0	RBH
Almagro	6 - 1	Platense
		
Fecha 2		
Almagro	1 - 1	Formandos
Platense	2 - 5	Milan
Juventus	5 - 1	RBH
		
Fecha 3		
Platense	1 - 5	RBH
Juventus	1 - 0	Formandos
Almagro	4 - 0	Milan
		
Fecha 4		
Platense	1 - 9	Juventus
Almagro	2 - 2	RBH
Milan	2 - 6	Formandos
		
Fecha 5		
Milan	1 - 5	RBH
Almagro	2 - 0	Juventus
Platense	1 - 2	Formandos
		
Fecha 6		
Juventus	7 - 0	Milan
Formandos	1 - 0	RBH
Almagro	8 - 0	Platense
		
Fecha 7		
Almagro	1 - 1	Formandos
Platense	2 - 4	Milan
Juventus	1 - 4	RBH
		
Fecha 8		
Platense	2 - 6	RBH
Juventus	0 - 0	Formandos
Almagro	3 - 0	Milan
		
Fecha 9		
Platense	1 - 6	Juventus
Almagro	4 - 3	RBH
Milan	0 - 7	Formandos
		
Fecha 10		
Milan	2 - 4	RBH
Almagro	2 - 0	Juventus
Platense	2 - 1	Formandos`;

async function main() {
  console.log("Loading Liga T1...");
  const liga = await prisma.tournament.findFirst({
    where: { name: "Liga T1" }
  });

  if (!liga) {
    throw new Error("Liga T1 not found");
  }

  const teams = await prisma.team.findMany();
  const teamMap = new Map();
  for (const t of teams) {
    teamMap.set(t.name.toLowerCase(), t.id);
  }

  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentRound = "Fecha 1";

  for (const line of lines) {
    if (line.toLowerCase().startsWith('fecha')) {
      currentRound = line;
      continue;
    }

    // Match line: e.g. "Juventus 5 - 1 Milan"
    // Since there are tabs or spaces, we can use a regex to parse
    const matchRegex = /^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)$/;
    const parsed = matchRegex.exec(line.replace(/\t/g, ' '));
    if (!parsed) {
      console.warn("Could not parse line:", line);
      continue;
    }

    const homeTeamStr = parsed[1].trim();
    const homeScore = parseInt(parsed[2], 10);
    const awayScore = parseInt(parsed[3], 10);
    const awayTeamStr = parsed[4].trim();

    const homeId = teamMap.get(homeTeamStr.toLowerCase());
    const awayId = teamMap.get(awayTeamStr.toLowerCase());

    if (!homeId || !awayId) {
      console.warn(`Team not found: ${homeTeamStr} or ${awayTeamStr}`);
      continue;
    }

    await prisma.match.create({
      data: {
        tournamentId: liga.id,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore,
        awayScore,
        round: currentRound,
        status: "PLAYED",
        matchDate: new Date("2024-02-01T12:00:00Z")
      }
    });

    console.log(`Created: ${currentRound} | ${homeTeamStr} ${homeScore} - ${awayScore} ${awayTeamStr}`);
  }

  console.log("All matches seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
