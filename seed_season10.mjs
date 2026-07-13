import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const text_data = `Temporada 10 (2022)
Liga TPM
PLANTILLAS
Club: Warriors
Mertens	3	0	9
Sanjiro	1	2	9
Slade	0	0	9
Gabriel JR.	2	1	9
Rafard	3	1	5
Nerinho	0	1	5
Eden Hazard	2	0	2
Joabe	0	0	1
Rony	0	0	1

Club: Big Fish
Skorps	0	0	10
Jadsun	1	2	9
Richarlison	11	1	8
Ruan404	1	0	7
Diogosena	0	2	6
Cebolinha	2	4	5
Pedro a	2	2	5
Gwy do ACB	2	2	5
Baron	0	1	4

Club: Almagro
Aqua	0	0	10
Campah	9	2	10
Mate	0	0	9
Beng	3	3	9
Italo	1	3	8
Thomy	1	2	6
Thiago Almada	1	1	4
LeoMD	0	0	4
Titolatola	0	0	0

Club: Dortmund
Victorz	2	1	8
Keylor Navas	0	0	8
Mansi	1	0	7
Zakaria	1	2	6
Alan	0	1	5
Razor	0	0	4
Lucas2000	0	0	4
Pitoco	1	0	4
Insigne	0	0	1

Club: Bermudinha
Kyrie Develing	7	1	10
M U T U	4	3	9
Stan	0	0	8
Luciano	0	4	6
Bernd Leno	7	3	6
Marmota	1	0	5
-Martinelli	1	3	5
Mateuhholz	0	0	5
Alex Chen	1	2	3

Club: Coritiba
KokePizzaiolo	2	0	8
Harry Kane	6	5	8
JulianWeigl	3	3	8
F.Totti	1	1	8
Maginan	0	0	6
Digne	5	1	6
Hazard	1	4	3
Pedryn	0	0	2
Toni	0	0	1

PARTIDOS
FECHA 
1
Coritiba	0 - 1	Warriors
Dortmund	0 - 2	Bermudinha
Almagro	1 - 2	Big Fish

2
Almagro	1 - 2	Dortmund
Warriors	0 - 1	Big Fish
Bermudinha	1 - 1	Coritiba

3
Coritiba	5 - 3	Almagro
Dortmund	0 - 1	Big Fish
Bermudinha	3 - 1	Warriors

4
Almagro	2 - 0	Bermudinha
Dortmund	1 - 1	Warriors
Big Fish	2 - 4	Coritiba

5
Coritiba	0 - 0	Dortmund
Warriors	2 - 3	Almagro
Bermudinha	2 - 1	Big Fish

6
Dortmund	0 -4	Bermudinha
Almagro	1 - 3	Big Fish
Coritiba	3 - 1	Warriors

7
Warriors	1 - 5	Big Fish
Bermudinha	3 - 3	Coritiba
Almagro	0 - 1	Dortmund

8
Dortmund	1 - 2	Big Fish
Bermudinha	3 - 2	Warriors
Coritiba	3 - 2	Almagro

9
Dortmund	0-1	Warriors
Big Fish	0 - 0	Coritiba
Almagro	0 - 2	Bermudinha
Almagro	1-0	Dortmund

10
Warriors	2 - 2	Almagro
Bermudinha	1 - 3	Big Fish
Coritiba	1-0	Dortmund
Bermudinha	0 - 1	Coritiba

Semifinal
Coritiba	0 - 1	Bermudinha

Final
Big Fish	0 - 1	Bermudinha`;

function parseData() {
  const lines = text_data.split('\n').map(l => l.trim()).filter(l => l !== '');
  let mode = "plantillas";
  let currentRoundName = "Fecha 1";
  
  const matches = [];
  const teamsData = {};
  let currentTeam = null;

  for (const line of lines) {
    if (line === "PARTIDOS") {
      mode = "matches";
      continue;
    }
    
    if (mode === "matches") {
      if (line === "FECHA") continue;
      
      if (/^\d+$/.test(line)) {
        currentRoundName = "Fecha " + line;
      } else if (line.startsWith("Playoff") || line.startsWith("PlayOff")) {
        currentRoundName = "PlayOff";
      } else if (line.startsWith("Semifinal")) {
        currentRoundName = "Semifinal";
      } else if (line.startsWith("Final")) {
        currentRoundName = "Final";
      } else {
        if (line.includes("DF")) {
          const parts = line.split("DF");
          matches.push({
            round: currentRoundName,
            home: parts[0].trim(),
            away: parts[1].trim(),
            hs: 0,
            as: 3
          });
        } else {
          const matchRegex = /(\d+)\s*-\s*(\d+)/;
          const matchResult = line.match(matchRegex);
          if (matchResult) {
            const hs = parseInt(matchResult[1]);
            const as = parseInt(matchResult[2]);
            const parts = line.split(matchResult[0]);
            matches.push({
              round: currentRoundName,
              home: parts[0].trim(),
              away: parts[1].trim(),
              hs: hs,
              as: as
            });
          }
        }
      }
    } else if (mode === "plantillas") {
      if (line.startsWith("Club:")) {
        currentTeam = line.replace("Club:", "").trim();
        if (currentTeam.toLowerCase() === "catadores de latenha") currentTeam = "Latenha";
        teamsData[currentTeam] = [];
      } else if (currentTeam && !line.startsWith("Temporada") && !line.startsWith("Liga TPM") && !line.startsWith("PLANTILLAS")) {
        const parts = line.split(/[\s\t]+/);
        if (parts.length >= 4) {
          const pj = parseInt(parts.pop());
          const a = parseInt(parts.pop());
          const g = parseInt(parts.pop());
          const name = parts.join(" ");
          teamsData[currentTeam].push({ nick: name, g, a, pj });
        }
      }
    }
  }
  return { matches, teamsData };
}

async function getTeamId(teamName) {
  let team = await prisma.team.findFirst({
    where: { name: { equals: teamName, mode: 'insensitive' } }
  });
  if (!team) {
    team = await prisma.team.create({ data: { name: teamName } });
  }
  return team.id;
}

async function main() {
  console.log("Seeding Temporada 10 (Real)...");

  const { matches, teamsData } = parseData();

  // Create or Find Entities
  // 1. Season
  let season = await prisma.season.findFirst({ where: { name: "Temporada 10 (2022)" } });
  if (!season) {
    season = await prisma.season.create({
      data: { name: "Temporada 10 (2022)", isActive: false }
    });
  }

  // 2. Tournament
  let category = await prisma.category.findFirst({ where: { name: "Liga TPM" } });
  if (!category) category = await prisma.category.create({ data: { name: "Liga TPM" } });

  let liga = await prisma.tournament.findFirst({ where: { season: { id: season.id }, name: "Liga TPM" } });
  if (!liga) {
    liga = await prisma.tournament.create({
      data: { season: { connect: { id: season.id } }, name: "Liga TPM", format: "LEAGUE_PLAYOFF", category: { connect: { id: category.id } } }
    });
  } else {
    // Update category just in case it was created with a wrong one
    await prisma.tournament.update({
      where: { id: liga.id },
      data: { category: { connect: { id: category.id } } }
    });
  }

  // Clear existing matches for this tournament to avoid duplicates on re-run
  await prisma.matchStat.deleteMany({ where: { match: { tournamentId: liga.id } } });
  await prisma.match.deleteMany({ where: { tournamentId: liga.id } });
  await prisma.tournamentPlayer.deleteMany({ where: { tournamentTeam: { tournamentId: liga.id } } });
  await prisma.tournamentTeam.deleteMany({ where: { tournamentId: liga.id } });

  // Add Teams to Tournament and Players to Teams
  for (const [tName, players] of Object.entries(teamsData)) {
    const tId = await getTeamId(tName);
    const tt = await prisma.tournamentTeam.create({ data: { tournament: { connect: { id: liga.id } }, team: { connect: { id: tId } } } });
    for (const p of players) {
      let player = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!player) player = await prisma.player.create({ data: { nick: p.nick } });
      await prisma.tournamentPlayer.create({ data: { tournamentTeam: { connect: { id: tt.id } }, player: { connect: { id: player.id } } } });
    }
  }

  const dbMatches = [];
  const playerMatchesPlayed = {};
  const matchStatsToInsert = [];

  
  // 3. Create Real Matches
  for (const m of matches) {
    const hId = await getTeamId(m.home);
    const aId = await getTeamId(m.away);
    const dbm = await prisma.match.create({
      data: {
        tournament: { connect: { id: liga.id } },
        homeTeam: { connect: { id: hId } },
        awayTeam: { connect: { id: aId } },
        homeScore: m.hs,
        awayScore: m.as,
        status: "PLAYED",
        matchDate: new Date(),
        round: m.round
      }
    });
    dbMatches.push({ ...dbm, teamA: m.home, teamB: m.away });
    
    // Add 0 min stats for everyone in the roster
    const hPlayers = teamsData[m.home === "Catadores de latenha" ? "Latenha" : m.home] || [];
    const aPlayers = teamsData[m.away === "Catadores de latenha" ? "Latenha" : m.away] || [];
    
    for (const hp of hPlayers) {
      const pEnt = await prisma.player.findUnique({ where: { nick: hp.nick } });
      let mt = 0;
      if (!playerMatchesPlayed[hp.nick]) playerMatchesPlayed[hp.nick] = 0;
      if (playerMatchesPlayed[hp.nick] < hp.pj) {
        mt = 90;
        playerMatchesPlayed[hp.nick]++;
      }
      matchStatsToInsert.push({ matchId: dbm.id, playerId: pEnt.id, goals: 0, assists: 0, matchTime: mt });
    }
    for (const ap of aPlayers) {
      const pEnt = await prisma.player.findUnique({ where: { nick: ap.nick } });
      let mt = 0;
      if (!playerMatchesPlayed[ap.nick]) playerMatchesPlayed[ap.nick] = 0;
      if (playerMatchesPlayed[ap.nick] < ap.pj) {
        mt = 90;
        playerMatchesPlayed[ap.nick]++;
      }
      matchStatsToInsert.push({ matchId: dbm.id, playerId: pEnt.id, goals: 0, assists: 0, matchTime: mt });
    }
  }

  // 4. Create ONE Historical Match per team for Stats (Goals and Assists)
  for (const [tName, players] of Object.entries(teamsData)) {
    if (!players || players.length === 0) continue;
    
    const tId = await getTeamId(tName);
    const dbm = await prisma.match.create({
      data: {
        tournament: { connect: { id: liga.id } },
        homeTeam: { connect: { id: tId } },
        awayTeam: { connect: { id: tId } },
        homeScore: 0,
        awayScore: 0,
        status: "PLAYED",
        matchDate: new Date(),
        round: "Histórico"
      }
    });
    
    for (const p of players) {
      const pEnt = await prisma.player.findUnique({ where: { nick: p.nick } });
      matchStatsToInsert.push({ matchId: dbm.id, playerId: pEnt.id, goals: p.g, assists: p.a, matchTime: 0 });
    }
  }

  // Insert all stats at once
  if (matchStatsToInsert.length > 0) {
    await prisma.matchStat.createMany({ data: matchStatsToInsert });
  }

  console.log("Temporada 10 (Real) seeded successfully!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
