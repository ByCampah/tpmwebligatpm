const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Copa TPM', season: { name: 'Temporada 2 (2019)' } }
  });

  if (!tournament) return console.log("Tournament not found");

  const teams = await prisma.team.findMany();
  const getTeamId = (name) => teams.find(t => t.name === name)?.id;

  const bracketData = {
    rounds: [
      {
        name: "Semifinal",
        matches: [
          {
            id: "semi1",
            teamA: getTeamId("Insight"),
            teamB: getTeamId("Juventus"),
            scoreA: 9,
            scoreB: 2,
            label: "Global (6-1 | 3-1)"
          },
          {
            id: "semi2",
            teamA: getTeamId("Almagro"),
            teamB: getTeamId("Red Bull Haxball"),
            scoreA: 3,
            scoreB: 3,
            penA: 5,
            penB: 3,
            label: "Global (2-1 | 1-2)"
          }
        ]
      },
      {
        name: "Final",
        matches: [
          {
            id: "final",
            teamA: getTeamId("Insight"),
            teamB: getTeamId("Almagro"),
            scoreA: "C",
            scoreB: "C",
            label: "No se jugó"
          }
        ]
      }
    ]
  };

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { bracketData: bracketData }
  });

  console.log("Bracket data updated successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
