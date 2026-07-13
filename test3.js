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
const { matches, teamsData } = parseData();
console.log("Matches:", matches.length);
console.log("Teams:", Object.keys(teamsData).length);
console.log(matches.slice(0, 3));
