import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { prisma } from '@/lib/prisma';
import { getSeasonFromOptions, getStandings, getPlayerStats } from './utils';

// Constantes de tipos de interacciones
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
};

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');

    if (!signature || !timestamp) {
      return new NextResponse('Missing signature', { status: 401 });
    }

    const bodyText = await req.text();
    const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY?.trim();

    if (!PUBLIC_KEY) {
      console.error('Missing DISCORD_PUBLIC_KEY in environment variables');
      return new NextResponse('Server Error: Missing DISCORD_PUBLIC_KEY', { status: 500 });
    }

    const isValidRequest = await verifyKey(bodyText, signature, timestamp, PUBLIC_KEY);

    if (!isValidRequest) {
      return new NextResponse('Bad request signature', { status: 401 });
    }

    const interaction = JSON.parse(bodyText);

    // 1. Manejar el PING de verificación de Discord
    if (interaction.type === InteractionType.PING) {
      return NextResponse.json({ type: InteractionResponseType.PONG });
    }

    // 2. Manejar comandos (Slash Commands)
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = interaction.data;

      if (name === 'perfil') {
        const playerNameArg = options?.find((opt: any) => opt.name === 'jugador')?.value;

        let player;

        if (playerNameArg) {
          // Buscar por nombre (ignorando mayúsculas/minúsculas)
          player = await prisma.player.findFirst({
            where: {
              nick: {
                equals: playerNameArg,
                mode: 'insensitive'
              }
            },
            include: {
              user: true,
              tournamentTeams: {
                include: { 
                  tournamentTeam: {
                    include: { team: true }
                  }
                }
              },
              matchStats: {
                include: {
                  match: {
                    include: {
                      tournament: {
                        include: { season: true }
                      }
                    }
                  }
                }
              }
            }
          });
        } else {
          // Buscar por el usuario de Discord que ejecutó el comando
          const discordUserId = interaction.member?.user?.id || interaction.user?.id;
          if (discordUserId) {
            player = await prisma.player.findFirst({
              where: {
                user: {
                  discordId: discordUserId
                }
              },
              include: {
                user: true,
                tournamentTeams: {
                  include: { 
                    tournamentTeam: {
                      include: { team: true }
                    }
                  }
                },
                matchStats: {
                  include: {
                    match: {
                      include: {
                        tournament: {
                          include: { season: true }
                        }
                      }
                    }
                  }
                }
              }
            });
          }
        }

        if (!player) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: playerNameArg 
                ? `❌ No se encontró ningún jugador con el nick **${playerNameArg}**.`
                : `❌ No tenés ninguna cuenta vinculada o no se encontró tu jugador. ¡Asegurate de vincular tu cuenta en la web!`,
            },
          });
        }

        // Obtener equipo actual (último asignado)
        let equipoActual = 'Agente Libre';
        if (player.tournamentTeams && player.tournamentTeams.length > 0) {
          equipoActual = player.tournamentTeams[0].tournamentTeam.team.name;
        }

        // Calcular estadísticas
        const season = await getSeasonFromOptions(options || []);
        let pj = 0;
        let g = 0;
        let a = 0;
        let seasonName = 'Actual';
        
        if (player.matchStats && season) {
          const statsActuales = player.matchStats.filter(stat => stat.match?.tournament?.seasonId === season.id);
          pj = statsActuales.length;
          g = statsActuales.reduce((sum, stat) => sum + (stat.goals || 0), 0);
          a = statsActuales.reduce((sum, stat) => sum + (stat.assists || 0), 0);
          seasonName = season.name;
        }

        // Armar el Embed
        const embed = {
          title: `Perfil de ${player.nick}`,
          url: `https://tpmsudamerica.vercel.app/jugadores/${player.id}`,
          color: 0x10b981, // Verde (Primary color)
          thumbnail: {
            url: player.user?.image || player.user?.customAvatarUrl || 'https://tpmsudamerica.vercel.app/img/default-avatar.png'
          },
          fields: [
            {
              name: '🌍 Nacionalidad',
              value: player.nationality || 'Desconocida',
              inline: true
            },
            {
              name: '🛡️ Equipo',
              value: equipoActual,
              inline: true
            },
            {
              name: '🎯 Posiciones',
              value: `${player.primaryPosition || 'Ninguna'} ${player.secondaryPosition && player.secondaryPosition !== 'Ninguna' ? `/ ${player.secondaryPosition}` : ''}`,
              inline: false
            },
            {
              name: `📊 Stats (${seasonName})`,
              value: `**PJ:** ${pj} | **G:** ${g} | **A:** ${a}`,
              inline: false
            }
          ],
          footer: {
            text: 'Liga TPM Sudamérica'
          }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });

      } else if (name === 'equipo' || name === 'seleccion') {
        const teamNameArg = options?.find((opt: any) => opt.name === 'nombre')?.value;
        const isNational = name === 'seleccion';

        if (!teamNameArg) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes proporcionar el nombre.' },
          });
        }

        const team = await prisma.team.findFirst({
          where: {
            name: { equals: teamNameArg, mode: 'insensitive' },
            isNationalTeam: isNational
          },
          include: { captain: true }
        });

        if (!team) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No se encontró ${isNational ? 'la selección' : 'el equipo'} **${teamNameArg}**.` },
          });
        }

        const season = await getSeasonFromOptions(options || []);
        let statsStr = 'Sin datos en esta temporada.';
        
        if (season) {
          const standings = await getStandings(season.id);
          const teamStats = standings.find(s => s.team.id === team.id);
          const pos = standings.findIndex(s => s.team.id === team.id) + 1;
          
          if (teamStats) {
            statsStr = `**Posición:** ${pos}º\n**Puntos:** ${teamStats.pts}\n**PJ:** ${teamStats.pj} | **G:** ${teamStats.pg} | **E:** ${teamStats.pe} | **P:** ${teamStats.pp}\n**GF:** ${teamStats.gf} | **GC:** ${teamStats.gc} | **DIF:** ${teamStats.df}`;
          }
        }

        const embed = {
          title: `${isNational ? 'Selección' : 'Equipo'}: ${team.name}`,
          url: `https://tpmsudamerica.vercel.app/equipos/${team.id}`,
          color: 0x3b82f6, // Azul
          thumbnail: {
            url: team.logoUrl || 'https://tpmsudamerica.vercel.app/img/default-team.png'
          },
          fields: [
            {
              name: '👑 Presidente/Capitán',
              value: team.captain?.name || 'No asignado',
              inline: false
            },
            {
              name: `📊 Estadísticas (${season ? season.name : 'Desconocida'})`,
              value: statsStr,
              inline: false
            }
          ],
          footer: { text: 'Liga TPM Sudamérica' }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });

      } else if (name === 'clasificacion') {
        const season = await getSeasonFromOptions(options || []);
        
        if (!season) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No se encontró una temporada activa.' },
          });
        }

        const standings = await getStandings(season.id);
        const top10 = standings.slice(0, 10);
        
        let board = '```pos\nPos | Equipo                | Pts | PJ\n';
        board += '------------------------------------\n';
        top10.forEach((s, i) => {
          const pos = String(i + 1).padStart(3, ' ');
          const tName = s.team.name.padEnd(21, ' ').substring(0, 21);
          const pts = String(s.pts).padStart(3, ' ');
          const pj = String(s.pj).padStart(2, ' ');
          board += `${pos} | ${tName} | ${pts} | ${pj}\n`;
        });
        board += '```';

        const embed = {
          title: `🏆 Clasificación - ${season.name} (Top 10)`,
          url: `https://tpmsudamerica.vercel.app/historial/${season.id}`,
          color: 0xf59e0b, // Amarillo/Oro
          description: board,
          footer: { text: 'Liga TPM Sudamérica' }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });

      } else if (name === 'goleadores' || name === 'asistidores') {
        const season = await getSeasonFromOptions(options || []);
        
        if (!season) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No se encontró una temporada activa.' },
          });
        }

        const stats = await getPlayerStats(season.id);
        
        const isGoleadores = name === 'goleadores';
        stats.sort((a, b) => isGoleadores ? b.g - a.g : b.a - a.a);
        
        const top10 = stats.filter(s => (isGoleadores ? s.g > 0 : s.a > 0)).slice(0, 10);
        
        let board = `\`\`\`pos\nPos | Jugador              | ${isGoleadores ? 'G ' : 'A '}| Eq\n`;
        board += '------------------------------------\n';
        top10.forEach((s, i) => {
          const pos = String(i + 1).padStart(3, ' ');
          const pName = s.player.nick.padEnd(20, ' ').substring(0, 20);
          const val = String(isGoleadores ? s.g : s.a).padStart(2, ' ');
          const tName = s.teamName.substring(0, 3).toUpperCase();
          board += `${pos} | ${pName} | ${val} | ${tName}\n`;
        });
        board += '```';
        
        if (top10.length === 0) {
          board = '*Aún no hay estadísticas registradas para esta temporada.*';
        }

        const embed = {
          title: `${isGoleadores ? '⚽ Goleadores' : '👟 Asistidores'} - ${season.name} (Top 10)`,
          color: isGoleadores ? 0xef4444 : 0x8b5cf6, // Rojo o Morado
          description: board,
          footer: { text: 'Liga TPM Sudamérica' }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });
      }
    }

    return new NextResponse('Unknown command', { status: 400 });

  } catch (error: any) {
    console.error('Error handling Discord interaction:', error);
    return new NextResponse(`Internal Server Error: ${error.message || error}`, { status: 500 });
  }
}
