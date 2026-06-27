const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf-8');

// The injected text was:
// \n  const session = await auth();\n  if (session?.user?.role !== "ADMIN") return { success: false, error: "No autorizado" };\n
const authCheck = '  const session = await auth();\n  if (session?.user?.role !== "ADMIN") return { success: false, error: "No autorizado" };\n';

// Replace instances where the original code already had 'const session = await auth();' right after the injected text
// For example:
// export async function deleteSeason(seasonId: string) {
//   const session = await auth();
//   if (session?.user?.role !== "ADMIN") return { success: false, error: "No autorizado" };
// 
//   const session = await auth();
//   if (session?.user?.role !== "ADMIN") return { success: false, error: "No autorizado" };
//
// OR where it was just const session = await auth();

// To be safe, let's just find the functions that had it and remove the second one.
const regex1 = new RegExp(authCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*const session = await auth\\(\\);\\s*if \\(session\\?\\.user\\?\\.role !== "ADMIN"\\) return \\{ success: false, error: "No autorizado" \\};', 'g');
content = content.replace(regex1, authCheck);

// Also check if there's an injected check followed by `const session = await auth();` (like in createTournament maybe?)
const regex2 = new RegExp(authCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*const session = await auth\\(\\);', 'g');
content = content.replace(regex2, authCheck);

fs.writeFileSync('src/app/actions.ts', content);
console.log('Fixed duplicates');
