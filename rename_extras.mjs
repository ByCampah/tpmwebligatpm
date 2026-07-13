import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Torneos Extras') || content.includes('Torneos Extra')) {
                content = content.replace(/Torneos Extras/g, 'Pretemporada');
                content = content.replace(/Torneos Extra/g, 'Pretemporada');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir('src');
console.log('Done');
