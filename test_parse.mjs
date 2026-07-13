import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const code = fs.readFileSync('seed_season9_real.mjs', 'utf8');
// extract text_data and parseData and run it
const parseDataStr = code.match(/function parseData\(\) \{[\s\S]*?return \{ matches, teamsData \};\n\}/)[0];
const textDataStr = code.match(/const text_data = `[\s\S]*?`;/)[0];

eval(textDataStr);
eval(parseDataStr);

const { matches, teamsData } = parseData();
console.log('Matches length:', matches.length);
console.log('Teams data keys:', Object.keys(teamsData));
console.log('Matches array:', matches.slice(0, 3));
