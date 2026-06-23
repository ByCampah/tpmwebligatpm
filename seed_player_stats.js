const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = `
Temporada 1
Plantillas
Almagro
Nick	G	A
Campah	4	4
Baresi	2	8
JulianWeigl	21	3
De Gea	0	0
Lixtinhos	2	2
Harry Kane	8	3
Haze	5	5
Titolatola	0	0
Zeus	0	0
Juventus
Nick	G	A
Dybala	9	5
Imperador	13	10
CoutoAis	0	1
Slade	0	1
Bit	0	2
Andrigo	0	0
Tur-Sama	0	0
Mutu	1	0
Hazard	2	5
Formandos
Nick	G	A
Valdivia	0	0
Terry	0	1
Hummels	0	0
Ze Elias	3	2
Magossuel	2	3
Juninho	3	2
Reus	7	1
Amauri	8	6
RBH
Nick	G	A
Rodri	14	3
Digne	8	1
Santucho	0	3
Marmota	0	0
Bergkamp	1	3
Beng	5	8
Thiagow	0	0
Bolivar	0	1
Milan
Nick	G	A
Rafard	2	2
Diogo	0	1
Fuinha	2	0
Suave	2	0
Baron	1	0
Boop	0	2
Trapp	2	2
Jadsun	0	0
Platense
Nick	G	A
GetLow	1	0
Madru	3	5
Sam	1	0
Gonzaff	0	0
Coutinho	6	0
Thomy	1	1
Vargas	1	1
Stuani	0	1
Gunter	2	0

Temporada 2
Plantillas
Almagro
Nick	G	A
Czerro	7	0
Julian	6	4
Baresi	0	4
Campah	0	0
Sam	0	0
De Gea	0	0
Benatia	0	0
Juventus
Nick	G	A
Dybala	1	3
Imperador	4	2
Kante	0	0
Coutinho	1	0
Lixtinhos	0	0
Magossuel	1	2
Van dijk	0	0
RBH
Nick	G	A
Rodri	3	2
Bergkamp	0	0
Amauri	5	0
Reinaldo	0	0
Mutu	0	0
Hummels	0	0
Roberto Carlos	0	3
Bergkamp	0	0
Digne	3	0
Platense
Nick	G	A
Vargas	1	0
GetLow	0	1
Thomy	0	0
Nicosd	0	0
Santucho	0	0
JuninhoPlay	0	0
Trapp	0	0
Fiorentina
Madru	0	3
Insight
Nick	G	A
Chamito	0	0
Harry Kane	7	4
Hazard	0	2
Grafinho	5	2
Guisinho	0	0
Fuinha	0	0
Pique	0	0

Temporada 3
Plantillas
Almagro
Nick	G	A
Campah	1	1
Thomy	1	0
Titolatola	1	1
Santucho	1	2
Vlady	0	1
Tobias	3	0
Totti	6	2
Mutu	0	0
Kante	0	2
Insight
Nick	G	A
David Silva	0	0
Harry Kane	3	6
Hazard	4	1
Daniel	2	0
Rafard	1	0
Leo Silva	2	1
Pique	1	1
Graf	3	1
Thiagow	0	1
Dreamers
Nick	G	A
Osman	2	0
Madru	0	1
Cebolinha	0	0
Lemes	3	0
Ramonzin	0	3
Ruan	1	0
Valdivia	1	0
Brandon	0	0
RBH
Nick	G	A
Digne	10	3
Rodri	7	3
Fekirr	2	3
Bolivar	1	4
Bernd Leno	0	0
Bergkamp	1	4
Lsantos	0	0
Griezman	1	0
Mozer	0	1
Fiorentina
Nick	G	A
Trapp	3	3
Diogosena	4	2
Baron	1	0
Richalison	11	0
Pedro A	4	4
Xerdan	0	0
Jadsun	0	2
Anderson	0	0
Marmota	0	0
Galaxy
Nick	G	A
Rashford	0	2
Brian	1	2
De Gea	1	0
Imperador	7	2
Beng	4	4
Reus	8	4
Sant	1	2
JulianWeigl	5	3

Temporada 4
Plantillas
Almagro
Nick	G	A
Amauri	1	3
-Messi	4	0
MUTU	1	1
Thomy	0	2
Jeffguitar	0	0
Rafard	0	0
Leo Silva	0	0
Galaxy
Nick	G	A
JulianWeigl	10	5
Pedro A	3	2
Neymar	6	6
Rashford	1	3
Zakaria	1	2
Trapp	0	0
Leipzig
Nick	G	A
Brian	0	4
Jadsun	2	2
Harry Kane	5	1
Slade	0	0
Daniel	2	2
Reus	2	1
Bernd Leno	0	0
Borussia Dortmund
Nick	G	A
Rodrigo	1	0
Piszczek	3	2
Witsel	1	0
Hummels	0	1
Sancho	1	3
Spurs
Nick	G	A
Tanganga	0	2
Not Found	2	1
Boop	0	0
Diogosena	1	0
Digne	3	0
Bergkamp	0	1
Cebolinha	0	0

Temporada 5
Plantillas
Almagro
Nick	G	A	PJ
Campah	3	2	14
Oliver Kahn	1	0	14
lsantos	1	2	14
Pache	5	0	12
Vlady	2	0	10
Frank Fabra	0	2	10
Getlow	0	1	9
Thomy	0	0	8
Juninho	0	3	8
Richarlison	2	2	6
Titolatola	0	0	5
Gabito	0	0	1
Lorient
Nick	G	A	PJ
Ruan404	1	1	12
Zakaria	5	1	11
Tobias	4	1	5
Marmota	0	0	14
Neymar	2	3	13
Brian	0	4	16
Jeffin	5	2	12
Mozer	0	1	1
griezz	3	0	4
Sam	2	0	4
Spurs
Nick	G	A	PJ
Bergwijin	1	7	16
E. Cebolinha	12	1	16
digne	8	1	15
Rashford	0	11	14
Reusinho	11	3	14
Madru	0	1	10
Mimetico	2	1	6
Pedro a	1	0	4
Razor	0	0	2
J.Valdivia	0	0	2
Vasco
Nick	G	A	PJ
Combado	0	1	9
Shaw	0	1	9
Benatia	0	0	6
Felipe Ronaldo	6	1	16
Ramonzin	0	1	15
Mateo	0	0	3
Toni	2	0	6
Baron	0	2	13
Johaennes Cryuff	0	0	3
Diogosena	2	1	10
Slade	1	1	12
Lemes	2	0	8
Coritiba
Nick	G	A	PJ
Aqua	2	4	18
Gab	4	0	7
PauloDybala	10	2	16
Kokepizzaiolo	1	2	18
Pedryn	0	2	18
G. Buffon	0	1	17
Afonso	0	0	8
Ronin	2	0	6
Brenobr	1	0	3
Millwall
Nick	G	A	PJ
lSantos	0	2	9
Imperador	3	1	4
Kirye Deveiling	2	0	9
Slade	0	0	7
Lemes	2	0	7
Juninho	0	3	7
Gullit	1	0	4
J.Valdivia	0	0	1
Emerson	0	0	1
Soul	0	0	0
Lombardo	0	0	0
Bragantino
Nick	G	A	PJ
Thigomovic	1	2	11
Magossuel	2	3	11
Bergkamp	1	3	8
Fey	6	4	13
David Silva	2	2	14
Kepa	0	0	16
Jadsun	2	7	13
JulianWeigl	24	7	14
Thiagow	1	1	4
Insight
Nick	G	A	PJ
Harry Kane	8	9	15
Hazard	11	5	13
Mutu	2	4	14
Rafard	5	1	10
Douglas	0	1	4
Bernd Leno	1	0	12
Busquets	4	4	12
Stan	0	1	9
Amauri	4	5	7
Inter
Nick	G	A	PJ
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
Warriors
Nick	G	A	PJ
Filipe Patricio	1	1	14
Mertens	5	3	14
Nero	6	1	14
-Martinelli	0	1	12
P.Lahm	0	0	9
Joabe	0	0	2
Keylor	0	0	2
Kedric	0	0	1
Lucas 2000	0	0	7
Kyrie Develing	0	2	14
Renan	0	0	1
Osman	0	0	7

Temporada 6
Plantillas
Almagro
Nick	G	A	PJ
Marmota	0	0	9
Aqua	1	2	9
Jadsun	1	1	7
Ruan404	1	1	7
Thomy	1	2	7
Pedro a	1	0	5
Campah	3	2	5
Mansi	1	1	4
Digne	4	3	4
David Silva	2	0	2
Spurs
Nick	G	A	PJ
Victorz	8	3	10
Bergwijin	1	4	10
Cebolinha	3	3	9
Zakaria	1	1	8
Bernd Leno	1	0	7
Fey	0	1	5
Sam	2	1	4
Muleke	2	0	3
Bergkamp	0	1	2
Joabe	1	2	1
Warriors
Nick	G	A	PJ
Mertens	6	1	10
Mutu	1	1	10
Kyrie	4	1	8
Monkey	0	0	7
Felipe Ronaldo	1	1	6
Filipe	5	2	7
Stan	0	1	6
-martinelli	0	0	4
Soneca	0	1	3
Aduriz	0	1	2
Coritiba
Nick	G	A	PJ
JulianWeigl	17	3	9
Diogosena	0	1	9
Harry Kane	3	7	8
Pedryn	1	0	7
KokePizza	2	4	6
Hazard	2	4	6
-Messi	4	1	4
Griezz	2	1	3
Rafard	1	1	3
PauloDyb	2	0	1
Vasco
Nick	G	A	PJ
Madru	2	3	9
Rashford	0	1	8
Toni	2	0	7
Ramonzin	4	1	7
Slade	0	0	7
Ceni	0	1	5
Rothen	2	0	4
Jeffguitar	0	0	1
Combado	0	0	1
Chino	0	0	
Juventude
Nick	G	A	PJ
GWY	1	1	10
Lucas2000	0	1	8
Osman	2	1	6
Mascara	1	2	5
Enzowanted	0	0	5
DABI	2	0	4
Renan	0	0	3
PedroX	0	0	1
LeoMD	0	0	1
KyleDeJong	1	0	1

Temporada 7
Plantillas
Coritiba
Kane	10	7	8
Inzaghi	9	3	8
Dybala	1	2	3
Koke	3	2	8
Zakaria	0	3	8
Monkey	0	0	3
Pedro a	2	3	6
Madru	0	1	5
Pedryn	0	0	3
RBH
Nick	G	A	PJ
Digne	3	1	8
Felipe Ronaldo	2	3	4
Jadsun	2	1	6
Viñas	1	2	2
Rodri	4	2	6
Ruan404	0	0	2
Fey	1	2	5
Kepa	0	0	8
Stan	0	0	7
Juventude
Nick	G	A	PJ
Doudougou	0	0	4
Lucas 2k	0	0	9
Stoichkkov	0	0	7
LeoMD	1	1	3
Gab	0	1	4
NeyMascara	0	0	3
Griez	1	0	2
PedroX	0	0	1
Mateo	1	0	3
Goat
Nick	G	A	PJ
Kyrie	5	2	8
Martinelli	0	0	4
Reus	5	2	7
Valdivia	1	0	7
Mertens	2	5	8
Razor	0	0	7
Soneca	0	0	2
Luciano	0	1	3
Patrinho	2	0	2
Mutu	0	0	1
Flamengo
Nick	G	A	PJ
Thomy	2	0	3
Diogosena	0	3	6
Emerson	0	2	5
Santos	2	0	4
Fuinha	4	2	6
Chino	0	1	4
Marmota	0	0	3
Hulk	0	0	0
Tobias	0	0	1
Spurs
Nick	G	A	PJ
Cebolinha	3	2	8
Slade	0	0	8
Bergkamp	1	1	2
Bernd Leno	0	2	8
Combado	1	2	6
Bergwijin	2	4	9
Aqua	1	1	5
Rashford	0	2	5
Campah	0	0	4

Temporada 8
Plantillas
Warriors
Nick	G	A	PJ
Mertens	11	3	13
Soneca	3	2	11
Fuinha	1	3	11
Razor	0	1	8
Eden Hazard	1	1	7
Patrinho	0	0	5
Pedro a	1	2	4
Nerinho	0	0	3
Thiago Almada	1	0	2
Digne	0	2	2
Griezz	0	0	1
Brugge
Nick	G	A	PJ
Gwy do acb 2	7	4	11
Gab	3	4	7
Doudougou	0	0	6
Deco	0	1	6
L.Modric	2	0	5
Sanjiro	1	2	5
Florian Wirtz	0	0	4
Leonardo MD	2	1	4
Joabe	1	0	4
-Garrincha	1	0	2
Muleke	1	0	2
Almagro
Nick	G	A	PJ
Campah	6	3	8
Mate	0	0	8
Lucas.2000	1	1	7
Erling Haaland	3	2	7
Aqua	0	1	6
Thomy	2	2	6
Titolatola	2	1	5
Neymascara	0	0	2
Pedryn	0	0	3
Fabra	0	0	1
Watt	0	0	0
Insight
Nick	G	A	PJ
Harry Kane	7	5	9
Richarlison	9	3	9
Zakaria	1	1	9
Hazard	6	4	8
Mansi	0	1	4
Neymar	0	1	5
Leo Silva	0	0	3
Madru	0	2	3
Rodri	2	0	1
Bermudinha
Nick	G	A	PJ
Kyrie Develing	17	3	13
M U T U	0	5	12
Victorz	6	2	9
Stan	3	3	8
-Martinelli	1	6	7
Koke	2	4	7
Vinhas	0	0	6
Marmota	0	1	5
Alex Chen	1	3	4
Valdivia	1	0	2
Renan	1	0	1
Luciano.	0	0	1
Spurs
Nick	G	A	PJ
Bergwijin	2	4	10
Slade	0	0	10
Cebolinha	7	1	9
Combado	3	2	8
Rafard	2	1	8
PedroX	0	1	5
Trapp	0	1	3
Moriba	0	0	2
Leipzig
Nick	G	A	PJ
Shelby jr	10	4	9
Neydibre	2	1	8
Jadsun	1	3	7
-Messi	9	6	7
Rashford	1	0	5
Wosz	3	4	5
Diogosena	0	0	4
Maldini	0	1	3
Baron	0	0	2
Goulart	2	1	2
Italo	1	0	3

Temporada 9
Plantillas
Warriors
Nick	G	A	PJ
Soneca	3	2	10
Eden Hazard	0	0	2
Sanjiro	0	1	7
Mertens	6	5	12
Vini Jr.	7	2	10
Ruan404	1	2	10
Patrinho	0	0	3
Pitoco	1	0	2
Big Fish
Nick	G	A	PJ
Don Cruyff	6	2	10
Verissimo	2	0	8
Skorps	1	0	12
Gwy do acb	4	7	12
Diogosena	1	5	9
Cavalo Furioso	0	0	9
Calleri	13	2	8
Leonardo MD	2	1	4
Almagro
Nick	G	A	PJ
Campah	7	7	12
Digne	7	3	11
Zakaria	2	5	12
Aqua	0	0	9
Mate	1	1	11
pescadito	6	4	9
Titolatola	0	1	3
Thomy	0	0	2
Insight
Nick	G	A	PJ
Harry Kane	1	6	10
Hazard	5	7	9
Richarlison	14	2	10
Madru	0	0	9
Joao Felix	0	0	10
-Messi	0	0	1
Kokepizzaiolo	1	0	2
Rafard	2	2	5
Bermudinha
Nick	G	A	PJ
Kyrie Develing	11	6	11
Victorz	13	8	11
Stan	1	3	7
M U T U	1	2	11
Marmota	0	0	11
Alex Chen	2	6	8
-Martinelli	2	0	4
Renan	1	1	1
Ghoul
Nick	G	A	PJ
Joabe.exe	2	0	5
Lucas.2000	1	1	5
Raphina	1	0	4
Nero	0	0	5
Muleke	0	1	3
Santeh2V	0	0	1
Fuinha	0	0	1
Kante	0	0	1
Caldense
Nick	G	A	PJ	Min
Aldair	5	4	11	990
Alan	1	4	9	810
Buzuca	2	3	9	810
JulianWeigl	19	1	11	990
Trapp	0	0	3	270
Shelby	1	5	7	630
Jadsun	3	5	10	900
Carvajal	0	0	2	180
Latenha
Nick	G	A	PJ
Toqueta	0	0	1
gordogol	0	0	2
Binho	0	0	2
Patides	1	0	4
ADAMRONALDO	0	0	3
Brenolamatador	0	0	3
FlapJack	0	1	3
Edusao	0	0	1

Temporada 10
Plantillas
Warriors
Nick	G	A	PJ
Mertens	3	0	9
Sanjiro	1	2	9
Slade	0	0	9
Gabriel JR.	2	1	9
Rafard	3	1	5
Nerinho	0	1	5
Eden Hazard	2	0	2
Joabe	0	0	1
Rony	0	0	1
Big Fish
Nick	G	A	PJ
Skorps	0	0	10
Jadsun	1	2	9
Richarlison	11	1	8
Ruan404	1	0	7
Diogosena	0	2	6
E. Cebolinha	2	4	5
Pedro a	2	2	5
Gwy do ACB	2	2	5
Baron	0	1	4
Almagro
Nick	G	A	PJ
Aqua	0	0	10
Campah	9	2	10
Mate	0	0	9
Beng	3	3	9
Italo	1	3	8
Thomy	1	2	6
Thiago Almada	1	1	4
LeoMD	0	0	4
Titolatola	0	0	0
Dortmund
Nick	G	A	PJ
M.Reus	2	1	8
Keylor Navas	0	0	8
Mudryk	1	0	7
Zakaria	1	2	6
Alan	0	1	5
Razor	0	0	4
Lucas2000	0	0	4
Pitoco	1	0	4
Insigne	0	0	1
Bermudinha
Nick	G	A	PJ
Kyrie Develing	7	1	10
Mutu	4	3	9
Stan	0	0	8
Luciano.	0	4	6
Calleri	7	3	6
Marmota	1	0	5
-Martinelli	1	3	5
Mateuhholz	0	0	5
Alex Chen	1	2	3
Coritiba
Nick	G	A	PJ
KokePizzaiolo	2	0	8
Harry Kane	6	5	8
JulianWeigl	3	3	8
Totti	1	1	8
Maginan	0	0	6
Digne	5	1	6
Hazard	1	4	3
Pedryn	0	0	2
Toni	0	0	1

Temporada 11
Plantillas
Warriors
Nick	G	A	PJ
Joabe	1	0	4
JulianWeigl	1	0	3
Mertens'	0	1	5
Nerinho	0	0	3
Pitoco	0	0	0
Razor	0	0	1
Slade	0	0	5
Soneca	0	0	4
foda	0	0	0
Cebolinha	1	0	1
Big Fish
Nick	G	A	PJ
Diogosena	2	1	7
ElderAC	0	0	6
Gabriel JR	3	2	8
Gwy	2	0	6
Lucas.2000	0	0	3
Ruan404	0	0	4
Skorps	0	0	8
Leleg	0	0	1
Amielkpo	0	0	1
Kokepizza	1	1	3
Almagro
Nick	G	A	PJ
Aqua	0	0	3
Campah	5	0	4
De Gea	0	2	3
Digne	1	0	2
Panda	0	0	0
Pedro a	1	2	2
Sanjiro	1	1	3
Thomy	0	0	4
Titolatola	0	0	0
Tobias	0	0	1
Richarlison	1	0	1
Frank Fabra	0	0	0
Fiorentina
Nick	G	A	PJ
Alan	1	1	3
Baron	1	1	4
Calleri	4	3	5
Jadsun	1	1	4
Mate	0	0	3
Natanzinho	3	2	4
Shelby	1	0	4
Toni	1	1	2
Bermudinha
Nick	G	A	PJ
-Martinelli	2	0	3
Alex Chen	0	1	2
Felipe Ronaldo	0	0	1
Kyrie Develing	3	1	5
Luciano	0	0	0
M U T U	0	1	5
Mateushholz	0	0	3
Stan	0	2	4
Victorz	3	1	5
Douglas Vieira	0	0	1
Insight
Nick	G	A	PJ
F.Totti	1	4	6
Harry Kane	4	2	7
Hazard	3	0	6
Leonardo MD	0	0	3
Madru	0	0	2
Marmota	0	1	7
Mudryk	4	1	6
Veiga	0	0	1
Moutinho	0	0	1
Oliveira	0	0	1
Inter Bujao
Nick	G	A	PJ
Diego Hernandez	0	0	0
Eddithecavas	0	0	0
Joaozito	0	1	4
Levios	1	0	2
Mexes	0	1	2
Neymasc4ra	0	0	4
remboletiti	0	0	2
Segovinha	1	0	3
Trophy_skywalker	0	1	2
Urubu_	0	0	2
VitinhoCruz	1	0	1
Socrattes	0	0	1

Temporada 1 x8
Plantillas
Red Bull Haxball
Nick	G	A	PJ
Digne	7	1	9
Zakaria	1	2	9
Ruan	1	1	9
Koke	2	1	9
Kane	5	4	9
Campah	4	6	9
Gries	7	1	8
Leno	0	0	4
Rafard	0	0	3
Ross	2	0	3
Hazard	2	1	2
Lyon
Nick	G	A	PJ
Jadsun	2	3	7
Slade	0	0	7
Busquets	0	0	6
Kepa	2	0	6
JulianWeigl	14	3	6
Madru	2	0	5
Victorz	0	2	5
-Messi	2	4	5
Brian	1	0	4
Rashford	0	1	3
Halsey	0	2	1
Warriors
Nick	G	A	PJ
Osman	0	0	4
Martinelli	0	0	4
Mertens	2	0	5
Felipe Ronaldo	1	0	3
Aduriz	0	0	4
Vogue	0	0	5
Kirye Develing	1	0	3
Stan	0	0	2
Soneca	0	0	3
Filipe Patricio	0	0	3
Toni	0	0	1
Aqua	0	0	1
Fiorentina
Nick	G	A	PJ
Diogosena	0	2	7
Richarlison	9	1	7
Insigne	3	1	7
Pedro a	1	2	6
Baroniesta	0	1	6
KepArrizabalaga	0	0	4
Daring	1	1	4
Dybala	0	1	2
Magic Jonsen	0	0	2
Paulinho	1	1	2
Jeffguitar	0	0	2
Mertersacker	0	0	1
Vasco
Nick	G	A	PJ
Ramonzin	0	0	6
DeLigt	0	0	5
VitinhoCruz	0	1	4
Mansilla	1	0	4
lSantos	0	0	2
Mateo	0	0	2
Cervi	2	0	2
Fabra	2	2	2
SSJBald	0	0	2
GabZa	0	0	1
F.Torres	0	0	1
Gabo Moreti	0	0	1
Juventude 
Nick	G	A	PJ
Lucas_2000	0	1	8
GWY	1	0	8
Masc4ra	3	2	7
IsaacBatata	0	1	7
Renan	2	0	7
Kjaer	0	1	3
Damascenos	0	0	3
Joazito	0	0	3
PedroX	0	0	2
Manoel	0	0	1
Logan_	0	0	1
`;

// Helper: Normalize names
const getTeamByName = (allTeams, name) => {
  if (!name) return null;
  const searchName = name.trim().toLowerCase();
  
  let found = allTeams.find(t => t.name.toLowerCase() === searchName);
  if (!found) found = allTeams.find(t => t.name.toLowerCase().includes(searchName) || searchName.includes(t.name.toLowerCase()));
  
  if (!found && searchName === "inter bujao") found = allTeams.find(t => t.name.toLowerCase() === "inter de bujao");
  if (!found && searchName === "warrios") found = allTeams.find(t => t.name.toLowerCase() === "warriors");
  if (!found && searchName === "rbh") found = allTeams.find(t => t.name.toLowerCase() === "red bull haxball");

  return found;
};

async function main() {
  const allTeams = await prisma.team.findMany();
  
  let currentSeasonStr = null;
  let currentTeamName = null;
  let currentTeamId = null;

  const lines = rawData.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    if (line.startsWith("Temporada ")) {
      currentSeasonStr = line;
      // Also advance if the next line is Plantillas
      if (lines[i+1] === "Plantillas") {
         i++;
      }
      i++;
      continue;
    }

    if (line === "Plantillas") {
      i++; continue;
    }

    // If it doesn't have tabs and isn't "Nick G A", it's a team name
    if (!line.includes("\t") && !line.includes("Nick")) {
      const maybeTeam = getTeamByName(allTeams, line);
      if (maybeTeam) {
        currentTeamName = maybeTeam.name;
        currentTeamId = maybeTeam.id;
        i++;
        continue;
      }
    }

    // It's a player line
    if (line.startsWith("Nick") || line.includes("Nick\t")) {
      i++;
      continue; // Skip headers
    }

    // It is a data row
    const parts = line.split("\t");
    if (parts.length >= 3 && currentSeasonStr && currentTeamId) {
      const nick = parts[0].trim();
      const g = parseInt(parts[1]) || 0;
      const a = parseInt(parts[2]) || 0;
      let pj = 0;
      if (parts.length >= 4) {
         pj = parseInt(parts[3]) || 0;
      }

      // 1. Process
      console.log("[" + currentSeasonStr + "] [" + currentTeamName + "] " + nick + " G:" + g + " A:" + a + " PJ:" + pj);
      
      let seasonName = currentSeasonStr === "Temporada 1 x8" ? "Temporada 1" : currentSeasonStr;
      let tourneyName = currentSeasonStr === "Temporada 1 x8" ? "Liga TPM x8" : "Primera Division";

      const season = await prisma.season.findUnique({ where: { name: seasonName } });
      if (!season) { i++; continue; }

      const tournament = await prisma.tournament.findFirst({
        where: { seasonId: season.id, name: tourneyName }
      });
      if (!tournament) { i++; continue; }

      // Find player
      let player = await prisma.player.findFirst({
        where: { nick: { equals: nick } }
      });
      if (!player) {
         player = await prisma.player.findFirst({
           where: { nick: { contains: nick } }
         });
      }
      if (!player) {
         player = await prisma.player.create({ data: { nick: nick } });
      }

      // Find or create TournamentTeam
      let tTeam = await prisma.tournamentTeam.findFirst({
        where: { tournamentId: tournament.id, teamId: currentTeamId }
      });
      if (!tTeam) {
         tTeam = await prisma.tournamentTeam.create({ data: { tournamentId: tournament.id, teamId: currentTeamId } });
      }

      // Find or create TournamentPlayer
      let tPlayer = await prisma.tournamentPlayer.findFirst({
        where: { tournamentTeamId: tTeam.id, playerId: player.id }
      });
      if (!tPlayer) {
         tPlayer = await prisma.tournamentPlayer.create({ data: { tournamentTeamId: tTeam.id, playerId: player.id } });
      }

      // Find or create Historic Match
      let hMatch = await prisma.match.findFirst({
        where: { tournamentId: tournament.id, homeTeamId: currentTeamId, awayTeamId: currentTeamId, round: "Estadísticas Históricas" }
      });
      if (!hMatch) {
         hMatch = await prisma.match.create({
           data: {
             tournamentId: tournament.id,
             homeTeamId: currentTeamId,
             awayTeamId: currentTeamId,
             round: "Estadísticas Históricas",
             status: "PLAYED",
             homeScore: 0,
             awayScore: 0,
             matchDate: new Date("2020-01-01")
           }
         });
      }

      // Create MatchStat
      let mStat = await prisma.matchStat.findUnique({
        where: { matchId_playerId: { matchId: hMatch.id, playerId: player.id } }
      });
      
      if (mStat) {
        await prisma.matchStat.update({
          where: { id: mStat.id },
          data: { goals: g, assists: a, matchTime: pj }
        });
      } else {
        await prisma.matchStat.create({
          data: {
            matchId: hMatch.id,
            playerId: player.id,
            goals: g,
            assists: a,
            matchTime: pj
          }
        });
      }
    }
    
    i++;
  }

  // Handle GK stats from Temporada 10 & 11
  const gkData = [
    { s: "Temporada 10", t: "Dortmund", n: "Keylor Navas", sv: 40 },
    { s: "Temporada 10", t: "Almagro", n: "Mate", sv: 33 },
    { s: "Temporada 10", t: "Big Fish", n: "Skorps", sv: 27 },
    { s: "Temporada 10", t: "Bermudinha", n: "Marmota", sv: 18 },
    { s: "Temporada 11", t: "Big Fish", n: "Skorps", sv: 17 },
    { s: "Temporada 11", t: "Inter Bujao", n: "Joaozito", sv: 15 },
    { s: "Temporada 11", t: "Warriors", n: "Nerinho", sv: 11 },
    { s: "Temporada 11", t: "Fiorentina", n: "Mate", sv: 7 },
  ];

  for (let gk of gkData) {
     const season = await prisma.season.findUnique({ where: { name: gk.s } });
     const tournament = await prisma.tournament.findFirst({ where: { seasonId: season.id, name: "Primera Division" } });
     const team = getTeamByName(allTeams, gk.t);
     if (!team || !season || !tournament) continue;
     
     const player = await prisma.player.findFirst({ where: { nick: { contains: gk.n } } });
     if (!player) continue;

     let hMatch = await prisma.match.findFirst({
        where: { tournamentId: tournament.id, homeTeamId: team.id, awayTeamId: team.id, round: "Estadísticas Históricas" }
     });
     if (hMatch) {
       let mStat = await prisma.matchStat.findUnique({
         where: { matchId_playerId: { matchId: hMatch.id, playerId: player.id } }
       });
       if (mStat) {
          await prisma.matchStat.update({
             where: { id: mStat.id },
             data: { savesMade: gk.sv, savesTotal: gk.sv }
          });
       }
     }
  }

  console.log("Finished seeding player stats.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
