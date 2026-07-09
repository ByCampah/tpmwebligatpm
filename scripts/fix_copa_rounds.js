const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: 'Copa TPM', season: { name: 'Temporada 2 (2019)' } }
  });

  if (!tournament) return console.log("Tournament not found");

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id },
    include: { homeTeam: true, awayTeam: true }
  });

  const groupA = ["Insight", "Red Bull Haxball", "Platense", "Fiorentina"];
  const groupB = ["Almagro", "Juventus", "Astros", "Blacky"];

  for (const match of matches) {
    if (match.round.startsWith("Fecha")) {
      // Determine group based on homeTeam
      const teamName = match.homeTeam.name;
      const group = groupA.includes(teamName) ? "Grupo A" : "Grupo B";
      const newRound = `${group} - ${match.round}`;

      await prisma.match.update({
        where: { id: match.id },
        data: { round: newRound }
      });
      console.log(`Updated match ${teamName} vs ${match.awayTeam.name}: ${match.round} -> ${newRound}`);
    }
  }

  console.log("Copa TPM match rounds updated successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
