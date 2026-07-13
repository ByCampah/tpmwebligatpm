const fs = require('fs');
const code = fs.readFileSync('seed_season9_real.mjs', 'utf8');
const textDataStr = code.match(/const text_data = `[\s\S]*?`;/)[0];
const parseDataStr = code.match(/function parseData\(\) \{[\s\S]*?return \{ matches, teamsData \};\n\}/)[0];
const testCode = textDataStr + '\n' + parseDataStr + '\nconst { matches, teamsData } = parseData();\nconsole.log("Matches:", matches.length);\nconsole.log("Teams:", Object.keys(teamsData).length);\nconsole.log(matches.slice(0, 3));\n';
fs.writeFileSync('test3.js', testCode);
