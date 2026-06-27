const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf-8');
const funcs = [
  'createSeason', 'setActiveSeason', 'deleteSeason',
  'createTeam', 'editTeam', 'deleteTeam',
  'createPlayer', 'editPlayer', 'deletePlayer',
  'createCategory', 'editCategory', 'deleteCategory',
  'createTournament', 'updateTournament', 'deleteTournament',
  'enrollTeamToTournament', 'removeTeamFromTournament',
  'createManualMatch', 'generateRoundRobin',
  'addPlayerToRoster', 'removePlayerFromRoster',
  'assignTournamentPodium', 'updateUserRole'
];
funcs.forEach(func => {
  const regex = new RegExp(`(export async function ${func}\\([^)]*\\)\\s*\\{)`, 'g');
  content = content.replace(regex, `$1\n  const session = await auth();\n  if (session?.user?.role !== "ADMIN") return { success: false, error: "No autorizado" };\n`);
});
fs.writeFileSync('src/app/actions.ts', content);
console.log('Done!');
