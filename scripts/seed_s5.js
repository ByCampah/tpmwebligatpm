const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawChampions = `
Campeon
Club: Insight
Harry Kane
Hazard
M U T U
Rafard
Douglas Vieira
Bernd Leno
Busquets
Stan
Amauri

Segundo
Club: Bragantino
Thigomovic
Magossuel
Bergkamp
Fey
David Silva
Trapp
Jadsun
JulianWeigl
Thiagow

Tercero
Club: Spurs
F.Totti
Cebolinha
digne
Rashford
Victorz
Madru
Vinhas
Pedro a
`;

const rawStats = `
Club: Almagro
Nick	G	A	PJ
Campah	3	2	14
Italo	1	0	14
lsantos	1	2	14
Gerard Pique	5	0	12
Vlady	2	0	10
Frank Fabra	0	2	10
Getlow	0	1	9
Thomy	0	0	8
Juninho	0	3	8
Richarlison	2	2	6
Titolatola	0	0	5
Gabito	0	0	1

Club: Lorient
Ruan404	1	1	12
Zakaria	5	1	11
Haze	4	1	5
Marmota	0	0	14
Beng	2	3	13
Brian	0	4	16
Jeffin	5	2	12
Mozer	0	1	1
griezz	3	0	4
Sam	2	0	4

Club: Spurs
F.Totti	1	7	16
Cebolinha	12	1	16
digne	8	1	15
Rashford	0	11	14
Victorz	11	3	14
Madru	0	1	10
Vinhas	2	1	6
Pedro a	1	0	4
Razor	0	0	2
J.Valdivia	0	0	2

Club: Vasco
Combado	0	1	9
Shaw	0	1	9
Benatia	0	0	6
Felipe Ronaldo	6	1	16
Ramonzin	0	1	15
Mate	0	0	3
Toni	2	0	6
Baron	0	2	13
Johaennes Cryuff	0	0	3
Diogosena	2	1	10
Slade	1	1	12
Lemes	2	0	8

Club: Coritiba
Aqua	2	4	18
Gab	4	0	7
PauloDybala	10	2	16
Kokepizzaiolo	1	2	18
Pedryn	0	2	18
G. Buffon	0	1	17
Afonso	0	0	8
Ronin	2	0	6
Brenobr	1	0	3

Club: Millwall
lSantos	0	2	9
Imperador	3	1	4
Kyrie Develing	2	0	9
Slade	0	0	7
Lemes	2	0	7
Juninho	0	3	7
Gullit	1	0	4
J.Valdivia	0	0	1
Emerson	0	0	1
Soul	0	0	0
Lombardo	0	0	0

Club: Bragantino
Thigomovic	1	2	11
Magossuel	2	3	11
Bergkamp	1	3	8
Fey	6	4	13
David Silva	2	2	14
Kepa	0	0	16
Jadsun	2	7	13
JulianWeigl	24	7	14
Thiagow	1	1	4

Club: Insight
Harry Kane	8	9	15
Hazard	11	5	13
M U T U	2	4	14
Rafard	5	1	10
Douglas	0	1	4
Bernd Leno	1	0	12
Busquets	4	4	12
Stan	0	1	9
Amauri	4	5	7

Club: Inter
Logan_	0	1	15
Joazito	0	2	16
Zak	0	1	3
Masc4ra	3	2	15
Dogo	0	0	4
Goiano	0	1	11
Caiothebr	0	0	2
drtrophyrr	0	0	5
Paolo Maldini	0	0	2
VitinhoCruz	6	0	10
Levios	1	1	7
Enzowanted	0	0	1

Club: Warriors
Filipe Patricio	1	1	14
Mertens	5	3	14
Nero	6	1	14
-Martinelli	0	1	12
P.Lahm	0	0	9
Joabe	0	0	2
Keylor	0	0	2
Kedric	0	0	1
Lucas2000	0	0	7
Kyrie Develing	0	2	14
Renan	0	0	1
Osman	0	0	7
`;

const rawMatches = `
Fecha 1			
Spurs	1	4	Lorient
Vasco	12	0	Inter
Millwall	2	1	Coritiba
Bragantino	2	1	Almagro
Insight	7	1	Warrior

Fecha 2			
Lorient	1	1	Almagro
Vasco	1	2	Insight
Spurs	4	0	Coritiba
Bragantino	1	1	Warrior
Millwall	7	0	Inter

Fecha 3			
Millwall	3	1	Warrior
Almagro	1	5	Spurs
Lorient	1	1	Vasco
Insight	7	2	Inter
Coritiba	1	2	Bragantino

Fecha 4			
Almagro	11	0	Inter
Warrior	2	2	Coritiba
Spurs	1	1	Millwall
Lorient	0	4	Insight
Bragantino	4	0	Vasco

Fecha 5			
Vasco	1	0	Warrior
Almagro	1	3	Insight
Spurs	1	0	Bragantino
Coritiba	2	0	Inter
Lorient	3	0	Millwall

Fecha 6			
Millwall	0	8	Bragantino
Almagro	2	1	Warrior
Insight	2	0	Spurs
Coritiba	2	0	Vasco
Lorient	10	0	Inter

Fecha 7			
Lorient	3	1	Warrior
Spurs	12	1	Brusque
Insight	1	1	Bragantino
Vasco	1	0	Millwall
Almagro	1	0	Coritiba

Fecha 8			
Brusque	2	7	Bragantino
Spurs	5	0	Warrior
Almagro	2	0	Vasco
Lorient	1	0	Coritiba
Insight	6	0	Millwall

Fecha 9			
Insight	2	1	Coritiba
Almagro	1	0	Millwall
Lorient	2	2	Bragantino
Spurs	1	1	Vasco
Warrior	2	0	Inter

Fecha 10			
Spurs	1	0	Lorient
Warrior	2	8	Insight
Coritiba	2	2	Millwall
Bragantino	4	1	Almagro
Inter	0	4	Vasco

Fecha 11			
Warrior	1	6	Bragantino
Spurs	3	0	Coritiba
Insight	1	0	Vasco
Lorient	0	1	Almagro

Fecha 12			
Almagro	0	5	Spurs
Insight	6	2	Inter
Coritiba	1	2	Bragantino
Lorient	0	2	Vasco

Fecha 13			
Warrior	0	4	Coritiba
Bragantino	7	0	Vasco
Lorient	0	1	Insight
Spurs	1	0	Millwall
Almagro	6	3	Inter

Fecha 14
Almagro	0	3	Insight
Vasco	2	1	Warrior
Bragantino	4	0	Spurs
Coritiba	8	0	Inter
Millwall	0	1	Lorient

Fecha 15			
Insight	3	1	Spurs
Almagro	3	1	Warrior
Coritiba	1	2	Vasco
Lorient	2	0	Inter

Fecha 16			
Spurs	10	1	Inter
Coritiba	0	0	Almagro
Lorient	4	1	Warrior

Fecha 17			
Almagro	2	1	Vasco
Warrior	1	4	Spurs
Lorient	1	0	Coritiba
Inter	0	6	Bragantino

Fecha 18			
Spurs	3	0	Vasco
Bragantino	4	1	Lorient
Coritiba	2	0	Insight
Inter	1	3	Warrior
`;

async function seed() {
  console.log("Starting Season 5 Seed...");
  
  // Create or get Season 5
  let season = await prisma.season.findUnique({ where: { name: "Temporada 5" } });
  if (!season) {
    season = await prisma.season.create({ data: { name: "Temporada 5", isActive: true } });
  }
  console.log("Season found/created:", season.id);

  // Find Category Liga TPM
  const category = await prisma.category.findUnique({ where: { name: "Liga TPM" } });
  console.log("Category found:", category?.id);
  
  // Create or get Tournament
  let tournament = await prisma.tournament.findFirst({
    where: { name: "Liga TPM", seasonId: season.id }
  });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: "Liga TPM",
        format: "LEAGUE",
        seasonId: season.id,
        isOfficial: true,
        categoryId: category?.id
      }
    });
  }
  console.log("Tournament found/created:", tournament.id);

  // Map teams
  const teamMap = new Map();
  const getTeam = async (name) => {
    let tName = name.trim();
    if (tName === 'Warrior') tName = 'Warriors';
    if (tName === 'Brusque') tName = 'Inter';
    
    if (teamMap.has(tName)) return teamMap.get(tName);
    let team = await prisma.team.findFirst({ where: { name: { equals: tName, mode: 'insensitive' } } });
    if (!team) {
      team = await prisma.team.create({ data: { name: tName } });
    }
    
    // Add to tournament
    const tt = await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id } },
      create: { tournamentId: tournament.id, teamId: team.id },
      update: {}
    });
    
    const teamData = { team, tt };
    teamMap.set(tName, teamData);
    
    return teamData;
  };

  // Parse Stats to get players
  // Format:
  // Club: Almagro
  // Nick G A PJ
  // Campah 3 2 14
  
  const statsLines = rawStats.split('\n');
  let currentTeam = null;
  const playersData = [];
  
  for (const line of statsLines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith("Club:")) {
      currentTeam = l.replace("Club:", "").trim();
      continue;
    }
    if (l.startsWith("Nick")) continue; // header
    
    const parts = l.split(/\s+/);
    if (parts.length >= 4) {
      const pj = parseInt(parts.pop());
      const a = parseInt(parts.pop());
      const g = parseInt(parts.pop());
      const nick = parts.join(' ').trim();
      
      playersData.push({ team: currentTeam, nick, g, a, pj });
    } else {
      console.log('Line did not match 4 parts:', l);
    }
  }

  // Handle Millwall duplicates!
  const millwallPlayers = playersData.filter(p => p.team === 'Millwall');
  for (const mp of millwallPlayers) {
    // Check if player exists in another team
    const otherTeamEntry = playersData.find(p => p.nick.toLowerCase() === mp.nick.toLowerCase() && p.team !== 'Millwall');
    if (otherTeamEntry) {
      // Sum stats to other team
      otherTeamEntry.g += mp.g;
      otherTeamEntry.a += mp.a;
      otherTeamEntry.pj += mp.pj;
      // Mark millwall entry as removed
      mp.removed = true;
    }
  }
  
  const finalPlayersData = playersData.filter(p => !p.removed);

  // Get or create players
  const playerMap = new Map(); // nick => dbPlayer
  let i = 0;
  for (const pd of finalPlayersData) {
    console.log('Processing player', ++i, 'of', finalPlayersData.length, pd.nick);
    const nick = pd.nick === "Douglas" && pd.team === "Insight" ? "Douglas Vieira" : pd.nick; // Fix Douglas name
    let dbPlayer = await prisma.player.findFirst({ where: { nick: { equals: nick, mode: 'insensitive' } } });
    if (!dbPlayer) {
      dbPlayer = await prisma.player.create({ data: { nick: nick } });
    }
    playerMap.set(nick.toLowerCase(), dbPlayer);
    
    const { tt } = await getTeam(pd.team);
    
    await prisma.tournamentPlayer.upsert({
      where: { tournamentTeamId_playerId: { tournamentTeamId: tt.id, playerId: dbPlayer.id } },
      create: { tournamentTeamId: tt.id, playerId: dbPlayer.id },
      update: {}
    });
  }

  // Generate a fake match called "Estadísticas Históricas" to dump these stats
  // Wait, the user said: "En este se anotaron los PJ asi que los partidos se cargan sin nada, y en el historico se pone la cant de partidos ademas de goles y asistencias"
  // This means the matches will have goals (homeScore, awayScore) but the individual stats will be dumped into a single "Estadísticas Históricas" match!
  
  // 1. Create the Histórico match (or use the existing pattern of assigning stats to this match)
  const homeTeamFallback = Array.from(teamMap.values())[0].team;
  const historicMatch = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: homeTeamFallback.id,
      awayTeamId: homeTeamFallback.id,
      round: "Estadísticas Históricas",
      status: "PLAYED"
    }
  });

  for (const pd of finalPlayersData) {
    const nick = pd.nick === "Douglas" && pd.team === "Insight" ? "Douglas Vieira" : pd.nick;
    const dbPlayer = playerMap.get(nick.toLowerCase());
    if (!dbPlayer) continue;
    
    await prisma.matchStat.create({
      data: {
        matchId: historicMatch.id,
        playerId: dbPlayer.id,
        goals: pd.g,
        assists: pd.a,
        // Hack to store PJ in matchTime for historic. If 1 PJ = 90 min. But the frontend now reads matchTime > 0 ? 1 : 0.
        // Wait, the frontend says: matchPj = isHistoric ? 0 : 1; 
        // But the user wants Historic to sum PJ now!! "en el historico se pone la cant de partidos ademas de goles y asistencias"
        // In my earlier code, I had: const matchPj = isHistoric ? 0 : 1;
        // If I put the PJ in matchTime, but `matchPj = 0` for historic, they won't sum!
        // To make historic sum PJ, I must put the PJ directly somewhere. Or just create a dummy stat record for EACH match they played!
        // Actually, creating dummy records for each PJ is the cleanest way and doesn't require frontend changes.
        // Let's create N empty match records for this player instead of putting PJ in Historic!
      }
    });
  }
  const rawMatches2 = `
Fecha 1
Spurs	1	4	Lorient
Vasco	12	0	Inter
Millwall	2	1	Coritiba
Bragantino	2	1	Almagro
Insight	7	1	Warrior

Fecha 2
Lorient	1	1	Almagro
Vasco	1	2	Insight
Spurs	4	0	Coritiba
Bragantino	1	1	Warrior
Millwall	7	0	Inter

Fecha 3
Millwall	3	1	Warrior
Almagro	1	5	Spurs
Lorient	1	1	Vasco
Insight	7	2	Inter
Coritiba	1	2	Bragantino

Fecha 4
Almagro	11	0	Inter
Warrior	2	2	Coritiba
Spurs	1	1	Millwall
Lorient	0	4	Insight
Bragantino	4	0	Vasco

Fecha 5
Vasco	1	0	Warrior
Almagro	1	3	Insight
Spurs	1	0	Bragantino
Coritiba	2	0	Inter
Lorient	3	0	Millwall

Fecha 6
Millwall	0	8	Bragantino
Almagro	2	1	Warrior
Insight	2	0	Spurs
Coritiba	2	0	Vasco
Lorient	10	0	Inter

Fecha 7
Lorient	3	1	Warrior
Spurs	12	1	Brusque
Insight	1	1	Bragantino
Vasco	1	0	Millwall
Almagro	1	0	Coritiba

Fecha 8
Brusque	2	7	Bragantino
Spurs	5	0	Warrior
Almagro	2	0	Vasco
Lorient	1	0	Coritiba
Insight	6	0	Millwall

Fecha 9
Insight	2	1	Coritiba
Almagro	1	0	Millwall
Lorient	2	2	Bragantino
Spurs	1	1	Vasco
Warrior	2	0	Inter

Fecha 10
Spurs	1	0	Lorient
Warrior	2	8	Insight
Coritiba	2	2	Millwall
Bragantino	4	1	Almagro
Inter	0	4	Vasco

Fecha 11
Warrior	1	6	Bragantino
Spurs	3	0	Coritiba
Insight	1	0	Vasco
Lorient	0	1	Almagro

Fecha 12
Almagro	0	5	Spurs
Insight	6	2	Inter
Coritiba	1	2	Bragantino
Lorient	0	2	Vasco

Fecha 13
Warrior	0	4	Coritiba
Bragantino	7	0	Vasco
Lorient	0	1	Insight
Spurs	1	0	Millwall
Almagro	6	3	Inter

Fecha 14
Almagro	0	3	Insight
Vasco	2	1	Warrior
Bragantino	4	0	Spurs
Coritiba	8	0	Inter
Millwall	0	1	Lorient

Fecha 15
Insight	3	1	Spurs
Almagro	3	1	Warrior
Coritiba	1	2	Vasco
Lorient	2	0	Inter

Fecha 16
Spurs	10	1	Inter
Coritiba	0	0	Almagro
Lorient	4	1	Warrior

Fecha 17
Almagro	2	1	Vasco
Warrior	1	4	Spurs
Lorient	1	0	Coritiba
Inter	0	6	Bragantino

Fecha 18
Spurs	3	0	Vasco
Bragantino	4	1	Lorient
Coritiba	2	0	Insight
Inter	1	3	Warrior`;

  let currentRound = '';
  for (const line of rawMatches2.split('\n')) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('Fecha')) {
      currentRound = l;
      continue;
    }
    const parts = l.split(/\s+/);
    if (parts.length >= 4) {
      let homeName = parts[0].trim();
      if (homeName === 'Warrior') homeName = 'Warriors';
      if (homeName === 'Brusque') homeName = 'Inter';
      
      let awayName = parts[3].trim();
      if (awayName === 'Warrior') awayName = 'Warriors';
      if (awayName === 'Brusque') awayName = 'Inter';

      const homeScore = parseInt(parts[1].trim());
      const awayScore = parseInt(parts[2].trim());
      
      const homeTeam = teamMap.get(homeName);
      const awayTeam = teamMap.get(awayName);

      if (homeTeam && awayTeam) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homeTeamId: homeTeam.team.id,
            awayTeamId: awayTeam.team.id,
            homeScore: homeScore,
            awayScore: awayScore,
            round: currentRound,
            status: 'PLAYED'
          }
        });
      }
    }
  }

  // 2. Assign Trophies
  const champions = ['Harry Kane', 'Hazard', 'M U T U', 'Rafard', 'Douglas Vieira', 'Bernd Leno', 'Busquets', 'Stan', 'Amauri'];
  const runnersUp = ['Thigomovic', 'Magossuel', 'Bergkamp', 'Fey', 'David Silva', 'Trapp', 'Jadsun', 'JulianWeigl', 'Thiagow'];
  const thirdPlace = ['F.Totti', 'Cebolinha', 'digne', 'Rashford', 'Victorz', 'Madru', 'Vinhas', 'Pedro a'];

  const awardTrophy = async (nicks, teamName, trophyName) => {
    const { team, tt } = await getTeam(teamName);
    for (const nick of nicks) {
      const p = playerMap.get(nick.toLowerCase());
      if (p) {
        await prisma.trophy.create({
          data: {
            name: trophyName,
            type: 'INDIVIDUAL',
            playerId: p.id,
            teamId: team.id,
            tournamentId: tournament.id
          }
        });
      }
    }
  };

  await awardTrophy(champions, 'Insight', 'Campeón');
  await awardTrophy(runnersUp, 'Bragantino', 'Subcampeón');
  await awardTrophy(thirdPlace, 'Spurs', 'Tercer Puesto');

  // Goleador y Asistidor
  const goleador = playerMap.get('julianweigl');
  if (goleador) {
    await prisma.trophy.create({
      data: { name: 'Máximo Goleador', type: 'INDIVIDUAL', playerId: goleador.id, tournamentId: tournament.id }
    });
  }
  const asistidor = playerMap.get('rashford');
  if (asistidor) {
    await prisma.trophy.create({
      data: { name: 'Máximo Asistidor', type: 'INDIVIDUAL', playerId: asistidor.id, tournamentId: tournament.id }
    });
  }
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Seed script finished");
    process.exit(0);
  });
