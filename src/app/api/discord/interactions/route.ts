import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { prisma } from '@/lib/prisma';

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

        // Calcular estadísticas de la temporada actual
        let pj = 0;
        let g = 0;
        let a = 0;
        
        if (player.matchStats) {
          const statsActuales = player.matchStats.filter(stat => stat.match?.tournament?.season?.isActive);
          pj = statsActuales.length;
          g = statsActuales.reduce((sum, stat) => sum + (stat.goals || 0), 0);
          a = statsActuales.reduce((sum, stat) => sum + (stat.assists || 0), 0);
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
              name: '📊 Temp. Actual (Clubes)',
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
          data: {
            embeds: [embed],
          },
        });
      }
    }

    return new NextResponse('Unknown command', { status: 400 });

  } catch (error: any) {
    console.error('Error handling Discord interaction:', error);
    return new NextResponse(`Internal Server Error: ${error.message || error}`, { status: 500 });
  }
}
