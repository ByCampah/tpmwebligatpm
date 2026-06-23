const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const matchData = {
  "Temporada 8": [
    { round: "Fecha 1", matches: [
      ["Brugge", 0, 5, "Spurs"], ["Insight", 3, 5, "Leipzig"], ["Warriors", 2, 3, "Almagro"]
    ]},
    { round: "Fecha 2", matches: [
      ["Warriors", 0, 6, "Bermudinha"], ["Almagro", 2, 1, "Brugge"], ["Leipzig", 5, 1, "Spurs"]
    ]},
    { round: "Fecha 3", matches: [
      ["Insight", 8, 1, "Warriors"], ["Almagro", 0, 3, "Bermudinha"], ["Leipzig", 7, 4, "Brugge"]
    ]},
    { round: "Fecha 4", matches: [
      ["Spurs", 3, 0, "Warriors"], ["Almagro", 1, 2, "Leipzig"], ["Insight", 1, 0, "Bermudinha"]
    ]},
    { round: "Fecha 5", matches: [
      ["Almagro", 0, 1, "Insight"], ["Spurs", 0, 2, "Bermudinha"], ["Warriors", 3, 1, "Brugge"]
    ]},
    { round: "Fecha 6", matches: [
      ["Warriors", 1, 0, "Leipzig"], ["Spurs", 1, 4, "Insight"], ["Brugge", 2, 3, "Bermudinha"]
    ]},
    { round: "Fecha 7", matches: [
      ["Insight", 7, 2, "Brugge"]
    ]},
    { round: "Fecha 8", matches: [
      ["Brugge", 1, 1, "Spurs"], ["Warriors", 2, 3, "Almagro"]
    ]},
    { round: "Fecha 9", matches: [
      ["Warriors", 0, 6, "Bermudinha"], ["Almagro", 6, 2, "Brugge"], ["Leipzig", 4, 0, "Spurs"]
    ]},
    { round: "Fecha 10", matches: [
      ["Insight", 6, 0, "Warriors"], ["Almagro", 1, 4, "Bermudinha"], ["Leipzig", 3, 2, "Brugge"]
    ]},
    { round: "Fecha 11", matches: [
      ["Spurs", 2, 3, "Warriors"], ["Almagro", 0, 1, "Leipzig"], ["Insight", 1, 0, "Bermudinha"]
    ]},
    { round: "Fecha 12", matches: [
      ["Almagro", 0, 1, "Insight"], ["Spurs", 0, 1, "Bermudinha"], ["Warriors", 11, 0, "Brugge"]
    ]},
    { round: "Fecha 13", matches: [
      ["Warriors", 3, 4, "Leipzig"], ["Spurs", 2, 4, "Insight"], ["Brugge", 3, 3, "Bermudinha"]
    ]},
    { round: "Fecha 14", matches: [
      ["Insight", 2, 0, "Brugge"]
    ]},
    { round: "4tos de Final", matches: [
      ["Bermudinha", 3, 2, "Warriors"], ["Leipzig", 7, 0, "Almagro"]
    ]},
    { round: "Semifinal", matches: [
      ["Bermudinha", 5, 2, "Leipzig"]
    ]},
    { round: "Final", matches: [
      ["Insight", 0, 1, "Bermudinha"]
    ]}
  ],
  "Temporada 9": [
    { round: "Fecha 1", matches: [
      ["Caldense", 9, 0, "Latenha"], ["Warriors", 1, 4, "Almagro"], ["Big Fish", 8, 1, "Ghoul"], ["Bermudinha", 4, 1, "Insight"]
    ]},
    { round: "Fecha 2", matches: [
      ["Warriors", 2, 1, "Big Fish"], ["Caldense", 6, 4, "Insight"], ["Almagro", 6, 0, "Latenha"], ["Bermudinha", 2, 2, "Ghoul"]
    ]},
    { round: "Fecha 3", matches: [
      ["Warriors", 3, 0, "Ghoul"], ["Insight", 4, 6, "Big Fish"], ["Caldense", 2, 0, "Almagro"]
    ]},
    { round: "Fecha 4", matches: [
      ["Almagro", 2, 1, "Insight"], ["Warriors", 1, 4, "Caldense"], ["Bermudinha", 4, 0, "Big Fish"]
    ]},
    { round: "Fecha 5", matches: [
      ["Warriors", 8, 1, "Latenha"], ["Almagro", 1, 0, "Bermudinha"], ["Ghoul", 0, 7, "Insight"], ["Big Fish", 2, 4, "Caldense"]
    ]},
    { round: "Fecha 6", matches: [
      ["Big Fish", 9, 0, "Latenha"], ["Warriors", 2, 5, "Insight"], ["Almagro", 8, 1, "Ghoul"], ["Bermudinha", 3, 1, "Caldense"]
    ]},
    { round: "Fecha 7", matches: [
      ["Big Fish", 1, 1, "Almagro"], ["Bermudinha", 7, 1, "Warriors"]
    ]},
    { round: "Fecha 8", matches: [
      ["Warriors", 1, 2, "Almagro"], ["Bermudinha", 4, 2, "Insight"]
    ]},
    { round: "Fecha 9", matches: [
      ["Warriors", 2, 3, "Big Fish"], ["Caldense", 2, 3, "Insight"]
    ]},
    { round: "Play Off", matches: [
      ["Bermudinha", 2, 0, "Big Fish"], ["Almagro", 2, 4, "Insight"]
    ]},
    { round: "Semifinal", matches: [
      ["Bermudinha", 3, 0, "Insight"]
    ]},
    { round: "Final", matches: [
      ["Caldense", 0, 2, "Bermudinha"]
    ]}
  ],
  "Temporada 10": [
    { round: "Fecha 1", matches: [
      ["Warriors", 1, 0, "Coritiba"], ["Bermudinha", 2, 0, "Dortmund"], ["Big Fish", 2, 1, "Almagro"]
    ]},
    { round: "Fecha 2", matches: [
      ["Big Fish", 1, 0, "Warriors"], ["Almagro", 1, 2, "Dortmund"], ["Coritiba", 1, 1, "Bermudinha"]
    ]},
    { round: "Fecha 3", matches: [
      ["Almagro", 3, 5, "Coritiba"], ["Dortmund", 0, 1, "Big Fish"], ["Bermudinha", 3, 1, "Warriors"]
    ]},
    { round: "Fecha 4", matches: [
      ["Dortmund", 1, 1, "Warriors"], ["Coritiba", 4, 2, "Big Fish"], ["Bermudinha", 0, 2, "Almagro"]
    ]},
    { round: "Fecha 5", matches: [
      ["Coritiba", 0, 0, "Dortmund"], ["Big Fish", 1, 2, "Bermudinha"], ["Almagro", 3, 2, "Warriors"]
    ]},
    { round: "Fecha 6", matches: [
      ["Almagro", 1, 3, "Big Fish"], ["Warriors", 1, 3, "Coritiba"], ["Dortmund", 0, 4, "Bermudinha"]
    ]},
    { round: "Fecha 7", matches: [
      ["Big Fish", 5, 1, "Warriors"], ["Almagro", 0, 1, "Dortmund"], ["Coritiba", 3, 3, "Bermudinha"]
    ]},
    { round: "Fecha 8", matches: [
      ["Warriors", 2, 3, "Bermudinha"], ["Almagro", 2, 3, "Coritiba"], ["Dortmund", 1, 2, "Big Fish"]
    ]},
    { round: "Fecha 9", matches: [
      ["Bermudinha", 2, 0, "Almagro"], ["Coritiba", 0, 0, "Big Fish"], ["Dortmund", 0, 1, "Warriors"]
    ]},
    { round: "Fecha 10", matches: [
      ["Almagro", 2, 2, "Warriors"], ["Coritiba", 1, 0, "Dortmund"], ["Bermudinha", 1, 3, "Big Fish"]
    ]},
    { round: "Semifinal", matches: [
      ["Bermudinha", 1, 0, "Coritiba"]
    ]},
    { round: "Final", matches: [
      ["Big Fish", 0, 1, "Bermudinha"]
    ]}
  ],
  "Temporada 11": [
    { round: "Fecha 1", matches: [
      ["Fiorentina", 9, 1, "Inter Bujao"], ["Insight", 1, 0, "Big Fish"], ["Warriors", 0, 4, "Bermudinha"]
    ]},
    { round: "Fecha 2", matches: [
      ["Bermudinha", 3, 1, "Insight"], ["Fiorentina", 2, 1, "Bermudinha"], ["Inter bujao", 0, 5, "Almagro"]
    ]},
    { round: "Fecha 3", matches: [
      ["Warriors", 0, 5, "Insight"], ["Fiorentina", 2, 1, "Bermudinha"], ["Almagro", 2, 0, "Big Fish"]
    ]},
    { round: "Fecha 4", matches: [
      ["Big Fish", 6, 2, "Inter Bujao"], ["Fiorentina", 3, 2, "Warriors"]
    ]},
    { round: "Fecha 5", matches: [
      ["Big Fish", 1, 0, "Bermudinha"], ["Almagro", 1, 0, "Insight"]
    ]},
    { round: "Fecha 6", matches: [
      ["Fiorentina", 1, 0, "Insight"]
    ]},
    { round: "Fecha 7", matches: [
      ["Big Fish", 3, 0, "Warriors"], ["Inter bujao", 0, 7, "Insight"]
    ]},
    { round: "Semifinal", matches: [
      ["Bermudinha", 1, 4, "Big Fish"]
    ]},
    { round: "Final", matches: [
      ["Insight", 0, 1, "Big Fish"]
    ]}
  ]
};

async function main() {
  const allTeams = await prisma.team.findMany();
  const getTeamByName = (name) => {
    const searchName = name.trim().toLowerCase();
    
    // Exact or direct include
    let found = allTeams.find(t => t.name.toLowerCase() === searchName);
    if (!found) found = allTeams.find(t => t.name.toLowerCase().includes(searchName) || searchName.includes(t.name.toLowerCase()));
    
    // Custom overrides mapping based on common misspellings
    if (!found && searchName === "inter bujao") found = allTeams.find(t => t.name.toLowerCase() === "inter de bujao");
    if (!found && searchName === "warrios") found = allTeams.find(t => t.name.toLowerCase() === "warriors");

    return found;
  };

  for (const [seasonName, rounds] of Object.entries(matchData)) {
    const season = await prisma.season.findUnique({ where: { name: seasonName } });
    if (!season) {
      console.log(`Season ${seasonName} not found.`);
      continue;
    }

    const tournament = await prisma.tournament.findFirst({
      where: { seasonId: season.id, name: "Primera Division" }
    });

    if (!tournament) {
      console.log(`Tournament Primera Division not found for ${seasonName}.`);
      continue;
    }

    const tTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: tournament.id },
      include: { team: true }
    });

    let count = 0;
    for (const roundInfo of rounds) {
      const { round, matches } = roundInfo;
      let dateOffset = 0;
      
      for (const m of matches) {
        const [homeName, homeScore, awayScore, awayName] = m;
        const homeTeam = getTeamByName(homeName);
        const awayTeam = getTeamByName(awayName);

        if (!homeTeam) { console.log(`[!] Team ${homeName} not found.`); continue; }
        if (!awayTeam) { console.log(`[!] Team ${awayName} not found.`); continue; }

        let tHome = tTeams.find(tt => tt.teamId === homeTeam.id);
        let tAway = tTeams.find(tt => tt.teamId === awayTeam.id);

        if (!tHome) {
          console.log(`[+] Adding ${homeTeam.name} to ${seasonName} Primera Division`);
          tHome = await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: homeTeam.id }});
          tTeams.push({ ...tHome, team: homeTeam });
        }
        if (!tAway) {
          console.log(`[+] Adding ${awayTeam.name} to ${seasonName} Primera Division`);
          tAway = await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: awayTeam.id }});
          tTeams.push({ ...tAway, team: awayTeam });
        }

        // Create match
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - (20 - parseInt(seasonName.replace(/\D/g, ''))));
        matchDate.setHours(12 + dateOffset, 0, 0, 0);
        dateOffset++;

        const existing = await prisma.match.findFirst({
          where: {
            tournamentId: tournament.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            round: round
          }
        });

        if (!existing) {
          await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              homeScore: homeScore,
              awayScore: awayScore,
              status: "PLAYED",
              round: round,
              matchDate: matchDate
            }
          });
          count++;
        }
      }
    }
    console.log(`Created ${count} matches for ${seasonName}`);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
