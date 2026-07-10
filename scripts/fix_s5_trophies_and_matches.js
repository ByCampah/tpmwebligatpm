const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Starting S5 Fix...");

    // 1. Get Temporada 5 Liga TPM
    const tournament = await prisma.tournament.findFirst({
      where: { season: { name: "Temporada 5" }, name: "Liga TPM" }
    });
    if (!tournament) throw new Error("No S5 tournament found");

    // 2. Remove INDIVIDUAL Champion/Subcampeón/Tercer Puesto trophies
    const oldTrophies = await prisma.trophy.findMany({
      where: {
        tournamentId: tournament.id,
        type: "INDIVIDUAL",
        name: { in: ["Campeón", "Subcampeón", "Tercer Puesto"] }
      }
    });
    console.log(`Deleting ${oldTrophies.length} individual old trophies`);
    await prisma.trophy.deleteMany({
      where: { id: { in: oldTrophies.map(t => t.id) } }
    });

    // 3. Create TEAM Trophies with exclusions
    const teamsToTrophy = [
      { name: "Insight", trophy: "Campeón", 
        champs: ["Harry Kane", "Hazard", "M U T U", "Rafard", "Douglas Vieira", "Bernd Leno", "Busquets", "Stan", "Amauri"] },
      { name: "Bragantino", trophy: "Subcampeón", 
        champs: ["Thigomovic", "Magossuel", "Bergkamp", "Fey", "David Silva", "Trapp", "Jadsun", "JulianWeigl", "Thiagow"] },
      { name: "Spurs", trophy: "Tercer Puesto", 
        champs: ["F.Totti", "Cebolinha", "digne", "Rashford", "Victorz", "Madru", "Vinhas", "Pedro a"] }
    ];

    for (const data of teamsToTrophy) {
      const team = await prisma.team.findUnique({ where: { name: data.name } });
      if (!team) continue;

      // Find all players in this team for the tournament
      const tt = await prisma.tournamentTeam.findFirst({
        where: { teamId: team.id, tournamentId: tournament.id },
        include: { players: { include: { player: true } } }
      });
      if (!tt) continue;

      // Exclude players not in the champs list
      const champNicksLower = data.champs.map(c => c.toLowerCase());
      const excludedPlayers = tt.players.filter(p => !champNicksLower.includes(p.player.nick.toLowerCase())).map(p => ({ id: p.player.id }));

      console.log(`Creating ${data.trophy} for ${data.name}. Excluded ${excludedPlayers.length} players out of ${tt.players.length}`);
      
      await prisma.trophy.create({
        data: {
          name: data.trophy,
          type: "TEAM",
          tournamentId: tournament.id,
          teamId: team.id,
          excludedPlayers: { connect: excludedPlayers }
        }
      });
    }

    // 4. Fix Historical Matches
    // Find "Estadísticas Históricas" matches
    const allDummyMatches = await prisma.match.findMany({
      where: { tournamentId: tournament.id, round: "Estadísticas Históricas" }
    });
    const dummyMatches = allDummyMatches.filter(m => m.homeTeamId === m.awayTeamId);
    
    // Check if we need to fix
    if (dummyMatches.length > 0) {
      console.log("Found dummy matches, fixing...");
      
      // Get all stats
      const stats = await prisma.matchStat.findMany({
        where: { matchId: { in: dummyMatches.map(m => m.id) } },
        include: { player: { include: { tournamentTeams: { where: { tournamentTeam: { tournamentId: tournament.id } }, include: { tournamentTeam: true } } } } }
      });

      // Teams in S5: Almagro, Lorient, Spurs, Vasco, Inter, Bragantino, Millwall, Coritiba, Insight, Warriors
      // 10 teams exactly! Let's pair them up.
      const pairings = [
        ["Almagro", "Insight"],
        ["Millwall", "Lorient"],
        ["Spurs", "Vasco"],
        ["Inter", "Bragantino"],
        ["Warriors", "Coritiba"]
      ];

      for (const pair of pairings) {
        let teamA = await prisma.team.findUnique({ where: { name: pair[0] } });
        let teamB = await prisma.team.findUnique({ where: { name: pair[1] } });
        
        if (!teamA && pair[0] === 'Warriors') teamA = await prisma.team.findUnique({ where: { name: 'Warrior' } });
        
        if (teamA && teamB) {
          const newMatch = await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              homeTeamId: teamA.id,
              awayTeamId: teamB.id,
              round: "Estadísticas Históricas",
              status: "PLAYED",
              homeScore: 0,
              awayScore: 0
            }
          });
          
          // Move stats for players in teamA or teamB
          const statsToMove = stats.filter(s => {
            const playerTeamId = s.player.tournamentTeams[0]?.tournamentTeam?.teamId;
            return playerTeamId === teamA.id || playerTeamId === teamB.id;
          });

          if (statsToMove.length > 0) {
            await prisma.matchStat.updateMany({
              where: { id: { in: statsToMove.map(s => s.id) } },
              data: { matchId: newMatch.id }
            });
          }
          console.log(`Created historical match ${teamA.name} vs ${teamB.name} with ${statsToMove.length} stats`);
        }
      }
      
      // Delete the big dummy match
      await prisma.match.deleteMany({ where: { id: { in: dummyMatches.map(m => m.id) } } });
      console.log("Deleted big dummy match.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log("Done");
    process.exit(0);
  }
}

run();
