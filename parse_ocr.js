const fs = require('fs');

const teamsStr = "Almagro Formandos Juventus RBH Almagro Insight Galaxy Insight RBH Galaxy Leipzig Spurs Insight Bragantino Spurs Coritiba Spurs Warriors Coritiba Spurs Goat Bermudinha Insight Leipzig Bermudinha Caldense Insight Bermudinha Big Fish Coritiba Big Fish Insight Bermudinha Red Bul Hax Lyon Vasco";
const teams = teamsStr.split(' ');

const rows = [
"Campah J.Valdivia Bergwijin Rodri Tobias Chamito300ml Rashford David Silva Digne JulianWeigl Brian Bergwijin Harry Kane Thigomovic Bergwijin JulianWeigl Victorz Mertens Harry Kane E. Cebolinha Kyrie Develing Kyrie Develing Harry Kane Bernd Leno Kyrie Develing Aldair Harry Kane Kyrie Develing Skorps KokePizzaiolo Diogosena F.Totti -Martinelli Digne Jadsun Ramonzin",
"Brian Terry Imperador Bergkamp JulianWeigl Harry Kane Brian Harry Kane Rodri Pedro A Jadsun Not Found Hazard Magossuel E. Cebolinha Diogosena Bergwijin M U T U Vlahovic Slade -Martinelli M U T U Vlahovic Neydibre Victorz Alan Hazard Mutu Jadsun Harry Kane ElderAC Harry Kane Kyrie Develing Zakaria Slade De Ligt",
"3 JulianWeigl Mats Hummels CoutoAis Amauri Brian Hazard Zakaria Hazard Amauri Neymar Harry Kane Boop M U T U Bergkamp digne Harry Kane E. Cebolinha Kyrie Develing Paulo Dybala Bernd Leno Victorz Victorz Zakaria Jadsun Stan Buzuca Richarlison Stan Richarlison JulianWeigl Gabriel JR Hazard M U T U Ruan404 Busquets Erling Haaland",
"4 Zakaria Ze Elias Slade Reinaldo Campah GrafinhoSOHTAPA Imperador Daniel Bolivar Rashford Slade Diogosena Rafard Fey Rashford Pedryn Zakaria Italo KokePizzaiolo Combado J.Valdivia Stan Hazard -Messi M U T U JulianWeigl Madru Luciano. Ruan404 Totti Gwy Leonardo MD Mateushholz KokePizzaiolo Kepa Mansi",
"5 Lixtinhos Magossuel Bit M U T U Sam GuisinhoCEARA Neymar Rafard Bernd Leno Zakaria Daniel Digne Douglas Vieira David Silva Victorz Rafard Bernd Leno Felipe Ronaldo Zakaria Bergwijin Mertens -Martinelli Mansi Rashford Marmota Jadsun Joao Felix Calleri Diogosena Maginan Lucas.2000 Madru Stan Harry Kane JulianWeigl lSantos",
"6 Harry Kane Juninho Andrigo Mats Hummels Zakaria Fuinha Victorz Leo Silva Bergkamp Trapp Victorz Bergkamp Bernd Leno Trapp Madru Hazard Fey Postinho Italo Aqua Razor KokePizzaiolo Neymar Wosz Alex Chen Shelby Rafard Marmota E. Cebolinha Digne Ruan404 Marmota Victorz Campah Madru Mate",
"7 Tobias Victorz Tur-Sama Bergkamp Gerard Pique Sant Gerard Pique Lsantos Bernd Leno E. Cebolinha Busquets Jadsun Vinhas -Messi Sam Stan Pedro a Rashford Luciano. Vinhas Leo Silva Diogosena -Martinelli Trapp -Martinelli Pedro a Hazard Skorps Mudryk Alex Chen Griezz Victorz Cervi",
"8 Titolatola Amauri M U T U Digne JulianWeigl GrafinhoSOHTAPA Griezz Stan JulianWeigl Pedro a Griezz Muleke -martinelli Madru Campah Marmota Madru Maldini Mateuhholz Gwy do ACB Kokepizza Bernd Leno -Messi Frank Fabra",
"9 Zeus Cristovao Thiagow Mozer Amauri Thiagow Soneca Pedryn Alex Chen Alex Chen Baron Rafard Brian SSJBald"
];

let result = [];
for (let i = 0; i < 12; i++) { // 12 tournaments
    let seasonData = [];
    for (let j = 0; j < 3; j++) { // 3 teams per tournament
        let colIndex = i * 3 + j;
        let teamName = teams[colIndex].replace('Bul', 'Bull');
        let players = [];
        for (let r = 0; r < rows.length; r++) {
            let rowTokens = rows[r].split(' ').filter(x => x && !x.match(/^[0-9]+$/));
            // Wait, M U T U is multiple tokens.
            // This naive split will fail because of names with spaces.
        }
    }
}
