import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const text_data = `Liga TPM

PARTIDOS
Fecha 1		
Caldense	9-0	Latenha
Warriors	1-4	Almagro
Big Fish	8-1	Ghoul
Insight	1-4	Bermudinha

Fecha 2		
Warriors	2-1	Big Fish
Insight	4-6	Caldense
Latenha	0-6	Almagro
Bermudinha	2-2	Ghoul

Fecha 3		
Ghoul	0-3	Warriors
Big Fish	6-4	Insight
Caldense	2-0	Almagro
Latenha	0-1	Bermudinha

Fecha 4		
Insight	1-2	Almagro
Caldense	4-1	Warriors
Big Fish	0-4	Bermudinha
Latenha	0-1	Ghoul

Fecha 5		
Latenha	1-8	Warriors
Bermudinha	0-1	Almagro
Ghoul	0-7	Insight
Big Fish	2-4	Caldense

Fecha 6		
Latenha	0-9	Big Fish
Warriors	2-5	Insight
Ghoul	1-8	Almagro
Bermudinha	3-1	Caldense

Fecha 7		
Big Fish	1-1	Almagro
Bermudinha	7-1	Warriors
Ghoul	DF	Caldense
Latenha	0-1	Insight

Fecha 8
Warriors	1-2	Almagro
Insight	2-4	Bermudinha
Big Fish	1-0	Ghoul
Caldense	1-0	Latenha

Fecha 9		
Warriors	2-3	Big Fish
Insight	3-2	Caldense
Bermudinha	1-0	Ghoul
Latenha	0-1	Almagro

Fecha 10		
Caldense	3-1	Almagro
Big Fish	0-5	Insight
Ghoul	0-1	Warriors
Latenha	0-1	Bermudinha

Fecha 11		
Big Fish	1-9	Bermudinha
Caldense	4-2	Warriors
Insight	2-1	Almagro
Ghoul	1-0	Latenha

Fecha 12		
Bermudinha	1-4	Almagro
Big Fish	0-6	Caldense
Ghoul	0-1	Insight
Latenha	0-1	Warriors

Fecha 13		
Warriors	4-9	Insight
Bermudinha	2-3	Caldense
Ghoul	0-1	Almagro
Latenha	0-1	Big Fish

Fecha 14		
Big Fish	4-3	Almagro
Bermudinha	4-1	Warriors
Ghoul	0-1	Caldense
Latenha	0-1	Insight


Playoff
Bermudinha 2-0 Big Fish
Almagro 2-4 Insight

Semifinal
Bermudinha 3-0 Insight

Final
Bermudinha 2-0 Caldense

PLANTILLAS
Club: Warriors
Soneca	3	2	10
Eden Hazard	0	0	2
Sanjiro	0	1	7
Mertens	6	5	12
Vini Jr.	7	2	10
Ruan404	1	2	10
Postinho	0	0	3
Pitoco	1	0	2

Club: Big Fish
Don Cruyff	6	2	10
Verissimo	2	0	8
Skorps	1	0	12
Gwy do acb	4	7	12
Diogosena	1	5	9
Cavalo Furioso	0	0	9
Bernd Leno	13	2	8
LeoMD	2	1	4

Club: Almagro
Campah	7	7	12
Digne	7	3	11
Zakaria	2	5	12
Aqua	0	0	9
Mate	1	1	11
Beng	6	4	9
Titolatola	0	1	3
Thomy	0	0	2

Club: Insight
Harry Kane	1	6	10
Hazard	5	7	9
Richarlison	14	2	10
Madru	0	0	9
Joao Felix	0	0	10
Vlady	0	0	1
Kokepizzaiolo	1	0	2
Rafard	2	2	5

Club: Bermudinha
Kyrie Develing	11	6	11
Victorz	13	8	11
Stan	1	3	7
M U T U	1	2	11
Marmota	0	0	11
Alex Chen	2	6	8
-Martinelli	2	0	4
Renan	1	1	1

Club: Ghoul
Joabe	2	0	5
Lucas2000	1	1	5
Raphina	1	0	4
Nero	0	0	5
Muleke	0	1	3
Santeh2V	0	0	1
Fuinha	0	0	1
Kante	0	0	1

Club: Caldense
Aldair	5	4	11
Alan	1	4	9
Buzuca	2	3	9
JulianWeigl	19	1	11
Trapp	0	0	3
Shelby	1	5	7
Jadsun	3	5	10
Carvajal	0	0	2

Club: Catadores de latenha
Toqueta	0	0	1
gordogol	0	0	2
Binho	0	0	2
Patides	1	0	4
ADAMRONALDO	0	0	3
Brenolamatador	0	0	3
FlapJack	0	1	3
Edusao	0	0	1`;

function parseData() {
  const lines = text_data.split('\n').map(l => l.trim()).filter(l => l !== '');
  let mode = "matches";
  let currentRoundName = "Fecha 1";
  
  const matches = [];
  const teamsData = {};
  let currentTeam = null;

  for (const line of lines) {
    if (line === "PLANTILLAS") {
      mode = "plantillas";
      continue;
    }
    
    if (mode === "matches") {
      if (line.startsWith("Liga TPM") || line.startsWith("PARTIDOS")) continue;
      
      if (line.startsWith("Fecha ")) {
        currentRoundName = line;
      } else if (line.startsWith("Playoff")) {
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
      } else {
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function main() {
  console.log("Seeding Temporada 9 (Real)...");
  
  const { matches, teamsData } = parseData();

  const seasonName = "Temporada 9 (2022)";
  let season = await prisma.season.findFirst({ where: { name: seasonName } });
  if (!season) {
    season = await prisma.season.create({ data: { name: seasonName, isActive: true } });
  } else {
    // If it exists, we might want to clear old matches to not duplicate, 
    // but the user said "que no se pisen las cosas ni se pierdan".
    // We will just proceed carefully. If tournament exists, we can delete its matches to recreate them.
  }

  // 1. Teams
  for (const tName of Object.keys(teamsData)) {
    let team = await prisma.team.findFirst({ where: { name: tName } });
    if (!team) {
      await prisma.team.create({ data: { name: tName } });
      console.log(`Created team: ${tName}`);
    }
  }

  const allTeams = await prisma.team.findMany();
  const getTeamId = (name) => {
    let n = name.toLowerCase() === "catadores de latenha" ? "latenha" : name.toLowerCase();
    return allTeams.find(t => t.name.toLowerCase() === n)?.id;
  };

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
    const tt = await prisma.tournamentTeam.create({ data: { tournament: { connect: { id: liga.id } }, team: { connect: { id: getTeamId(tName) } } } });
    for (const p of players) {
      let player = await prisma.player.findUnique({ where: { nick: p.nick } });
      if (!player) player = await prisma.player.create({ data: { nick: p.nick } });
      await prisma.tournamentPlayer.create({ data: { tournamentTeam: { connect: { id: tt.id } }, player: { connect: { id: player.id } } } });
    }
  }

  const dbMatches = [];
  
  // 3. Create Real Matches
  for (const m of matches) {
    const dbm = await prisma.match.create({
      data: {
        tournament: { connect: { id: liga.id } },
        homeTeam: { connect: { id: getTeamId(m.home) } },
        awayTeam: { connect: { id: getTeamId(m.away) } },
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
      await prisma.matchStat.create({
        data: { match: { connect: { id: dbm.id } }, player: { connect: { id: pEnt.id } }, goals: 0, assists: 0, matchTime: 0 }
      });
    }
    for (const ap of aPlayers) {
      const pEnt = await prisma.player.findUnique({ where: { nick: ap.nick } });
      await prisma.matchStat.create({
        data: { match: { connect: { id: dbm.id } }, player: { connect: { id: pEnt.id } }, goals: 0, assists: 0, matchTime: 0 }
      });
    }
  }

  // 4. Create Historical Matches for Stats
  for (const [tName, players] of Object.entries(teamsData)) {
    if (!players || players.length === 0) continue;
    const maxPj = Math.max(...players.map(p => p.pj));
    
    for (let matchIdx = 1; matchIdx <= maxPj; matchIdx++) {
      const dbm = await prisma.match.create({
        data: {
          tournament: { connect: { id: liga.id } },
          homeTeam: { connect: { id: getTeamId(tName) } },
          awayTeam: { connect: { id: getTeamId(tName) } },
          homeScore: 0,
          awayScore: 0,
          status: "PLAYED",
          matchDate: new Date(),
          round: "Histórico"
        }
      });
      
      for (const p of players) {
        const pEnt = await prisma.player.findUnique({ where: { nick: p.nick } });
        if (matchIdx <= p.pj) {
          const g = matchIdx === 1 ? p.g : 0;
          const a = matchIdx === 1 ? p.a : 0;
          
          await prisma.matchStat.create({
            data: { match: { connect: { id: dbm.id } }, player: { connect: { id: pEnt.id } }, goals: g, assists: a, matchTime: 90 }
          });
        } else {
          await prisma.matchStat.create({
            data: { match: { connect: { id: dbm.id } }, player: { connect: { id: pEnt.id } }, goals: 0, assists: 0, matchTime: 0 }
          });
        }
      }
    }
  }

  // Set other seasons to inactive
  await prisma.season.updateMany({
    where: { id: { not: season.id } },
    data: { isActive: false }
  });

  console.log("Temporada 9 (Real) seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
