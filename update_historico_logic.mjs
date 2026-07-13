import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(path.join(dir, f));
      }
    }
  });
}

const regex = /([a-zA-Z0-9_?.]+)\s*(===|!==)\s*['"]Estadísticas Históricas['"]/g;

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const newContent = content.replace(regex, (match, varName, op) => {
    changed = true;
    if (op === '===') {
      return `(["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(${varName}))`;
    } else {
      return `(!["Estadísticas Históricas", "Partidos historicos estadisticas", "Partidos historicos PJ"].includes(${varName}))`;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
