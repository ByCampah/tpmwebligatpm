const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.team.findMany().then(t => console.log("TEAMS:", t.length));
prisma.player.findMany().then(p => console.log("PLAYERS:", p.length));
