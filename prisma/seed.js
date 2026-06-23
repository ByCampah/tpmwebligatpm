const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({})

async function main() {
  console.log('Empezando el seeding de prueba...')

  // 1. Crear Equipos
  const almagro = await prisma.team.create({
    data: {
      name: 'Almagro',
      logoUrl: '/logos/almagro.png',
    },
  })
  
  const juventus = await prisma.team.create({
    data: {
      name: 'Juventus',
      logoUrl: '/logos/juve.png',
    },
  })

  // 2. Crear Jugadores
  const campah = await prisma.player.create({
    data: { nick: 'Campah' },
  })
  
  const titolatola = await prisma.player.create({
    data: { nick: 'Titolatola' },
  })

  // 3. Crear Temporada y Torneos
  const season1 = await prisma.season.create({
    data: {
      name: 'Temporada 1',
      isActive: true,
      tournaments: {
        create: [
          { name: 'Primera Division', format: 'LEAGUE' },
          { name: 'Copa TPM', format: 'CUP' }
        ]
      }
    },
    include: { tournaments: true }
  })
  
  const primeraDivision = season1.tournaments.find(t => t.name === 'Primera Division')

  // 4. Inscribir Equipos al Torneo
  const almagroInTournament = await prisma.tournamentTeam.create({
    data: {
      tournamentId: primeraDivision.id,
      teamId: almagro.id,
      captainId: campah.id,
    }
  })
  
  const juveInTournament = await prisma.tournamentTeam.create({
    data: {
      tournamentId: primeraDivision.id,
      teamId: juventus.id,
    }
  })

  // 5. Agregar Jugadores al Roster del Torneo
  await prisma.tournamentPlayer.create({
    data: {
      tournamentTeamId: almagroInTournament.id,
      playerId: campah.id,
    }
  })
  
  await prisma.tournamentPlayer.create({
    data: {
      tournamentTeamId: almagroInTournament.id,
      playerId: titolatola.id,
    }
  })

  // 6. Crear un Partido
  const match = await prisma.match.create({
    data: {
      tournamentId: primeraDivision.id,
      homeTeamId: almagro.id,
      awayTeamId: juventus.id,
      homeScore: 2,
      awayScore: 0,
      status: 'PLAYED',
      matchDate: new Date(),
    }
  })

  // 7. Cargar Estadísticas del Partido
  await prisma.matchStat.create({
    data: {
      matchId: match.id,
      playerId: campah.id,
      matchTime: 90,
      goals: 2,
      assists: 0,
      passesMade: 10,
      passesTotal: 12,
      shotsMade: 3,
      shotsTotal: 3,
      gkTime: 0,
    }
  })
  
  await prisma.matchStat.create({
    data: {
      matchId: match.id,
      playerId: titolatola.id,
      matchTime: 90,
      goals: 0,
      assists: 1,
      passesMade: 15,
      passesTotal: 20,
      gkTime: 90,
      savesMade: 5,
      savesTotal: 5, // Valla Invicta!
    }
  })

  console.log('Seeding completado con exito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
