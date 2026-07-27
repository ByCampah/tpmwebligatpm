import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { prisma } from '@/lib/prisma';

const normalizeRoleName = (name: string) => name.toLowerCase().replace(/[\s\-–_]/g, '');

import { getSeasonFromOptions, getStandings, getPlayerStats } from './utils';

import { getGuildRoles, addRoleToMember, removeRoleFromMember, sendDirectMessage, sendDirectMessageWithComponents } from './discordApi';

// Constantes de tipos de interacciones
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  UPDATE_MESSAGE: 7,
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

      } else if (name === 'mercado_jugadores') {
        const freeAgents = await prisma.player.findMany({
          where: { isFreeAgent: true },
          take: 15,
          orderBy: { createdAt: 'desc' }
        });

        let description = '';
        if (freeAgents.length === 0) {
          description = '*Actualmente no hay jugadores libres buscando equipo.*';
        } else {
          freeAgents.forEach(player => {
            const pos = [player.primaryPosition, player.secondaryPosition]
              .filter(p => p && p !== 'Ninguna')
              .join('/');
            
            description += `**${player.nick}** (${pos || 'Sin posición'})\n`;
            if (player.marketDescription) {
              description += `🗣️ *"${player.marketDescription}"*\n`;
            }
            description += '\n';
          });
        }

        const embed = {
          title: '🔄 Mercado de Jugadores (Agentes Libres)',
          url: 'https://tpmsudamerica.vercel.app/mercado',
          color: 0x10b981,
          description: description,
          footer: { text: 'Liga TPM Sudamérica - Últimos 15 jugadores' }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });

      } else if (name === 'mercado_equipos') {
        const searchingTeams = await prisma.team.findMany({
          where: { isLookingForPlayers: true },
          include: { captain: true },
          take: 15,
          orderBy: { createdAt: 'desc' }
        });

        let description = '';
        if (searchingTeams.length === 0) {
          description = '*Actualmente no hay equipos buscando jugadores.*';
        } else {
          searchingTeams.forEach(team => {
            description += `**${team.name}**\n`;
            if (team.captain) {
              description += `👑 Contacto: ${team.captain.name}\n`;
            }
            if (team.marketDescription) {
              description += `📝 *"${team.marketDescription}"*\n`;
            }
            description += '\n';
          });
        }

        const embed = {
          title: '🔄 Mercado de Equipos',
          url: 'https://tpmsudamerica.vercel.app/mercado',
          color: 0x3b82f6,
          description: description,
          footer: { text: 'Liga TPM Sudamérica - Últimos 15 equipos' }
        };

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { embeds: [embed] },
        });
      } else if (name === 'fichar') {
        const targetUserId = options?.find((opt: any) => opt.name === 'usuario')?.value;

        if (!targetUserId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes seleccionar a un usuario.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        let teamName = null;
        const memberRoleIds = interaction.member?.roles || [];
        
        for (const roleId of memberRoleIds) {
          const role = roles.find((r: any) => r.id === roleId);
          if (role) {
            const roleName = role.name.toLowerCase();
            if (roleName.startsWith('capitán ')) {
              teamName = role.name.substring(8).trim();
              break;
            } else if (roleName.startsWith('capitan ')) {
              teamName = role.name.substring(8).trim();
              break;
            }
          }
        }

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No tenés ningún rol de "Capitán <Equipo>". Asegurate de tener el rol correcto.', flags: 64 },
          });
        }

        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName));
        
        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Sos capitán de **${teamName}**, pero no existe el rol del equipo "${teamName}" en el servidor.`, flags: 64 },
          });
        }

        const customIdAccept = `fichar_accept_${interaction.guild_id}_${teamRole.id}_${targetUserId}`;
        const customIdReject = `fichar_reject_${interaction.guild_id}_${targetUserId}`;

        try {
          await sendDirectMessageWithComponents(targetUserId, `📣 ¡Hola! El capitán <@${interaction.member.user.id}> te invitó a unirte a **${teamName}** en Liga TPM Sudamérica. ¿Aceptas el fichaje?`, [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: '✅ Aceptar Fichaje',
                  style: 3,
                  custom_id: customIdAccept
                },
                {
                  type: 2,
                  label: '❌ Rechazar',
                  style: 4,
                  custom_id: customIdReject
                }
              ]
            }
          ]);

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ Le he enviado un mensaje privado a <@${targetUserId}> con la oferta de fichaje.`, flags: 64 },
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Error al enviar MD a <@${targetUserId}>. Es posible que el usuario tenga los mensajes privados desactivados para este servidor.`, flags: 64 },
          });
        }

      } else if (name === 'despedir') {
        const targetUserId = options?.find((opt: any) => opt.name === 'usuario')?.value;

        if (!targetUserId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes seleccionar a un usuario.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        let teamName = null;
        const memberRoleIds = interaction.member?.roles || [];
        
        for (const roleId of memberRoleIds) {
          const role = roles.find((r: any) => r.id === roleId);
          if (role) {
            const roleName = role.name.toLowerCase();
            if (roleName.startsWith('capitán ')) {
              teamName = role.name.substring(8).trim();
              break;
            } else if (roleName.startsWith('capitan ')) {
              teamName = role.name.substring(8).trim();
              break;
            }
          }
        }

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No tenés ningún rol de "Capitán <Equipo>".', flags: 64 },
          });
        }

        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName));
        
        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No se encontró el rol del equipo **${teamName}** en el servidor.`, flags: 64 },
          });
        }

        try {
          await removeRoleFromMember(interaction.guild_id, targetUserId, teamRole.id);
          
          try {
            await sendDirectMessage(targetUserId, `ℹ️ Has sido despedido de **${teamName}** por el capitán <@${interaction.member.user.id}> y ya no formas parte del plantel.`);
          } catch (dmErr) {
            console.error("No se pudo enviar MD de despido:", dmErr);
          }

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ <@${targetUserId}> ha sido despedido de **${teamName}** y se le notificó por mensaje privado.`, flags: 64 }
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al intentar sacarle el rol: ${e.message}`, flags: 64 }
          });
        }
      } else if (name === 'dejar_club') {
        const teamName = options?.find((opt: any) => opt.name === 'equipo')?.value;

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes especificar el nombre del equipo.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName));

        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No se encontró el rol del equipo **${teamName}** en el servidor.`, flags: 64 },
          });
        }

        const memberRoleIds = interaction.member?.roles || [];
        if (!memberRoleIds.includes(teamRole.id)) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No tenés el rol del equipo **${teamName}**, por lo que no puedes dejarlo.`, flags: 64 },
          });
        }

        try {
          await removeRoleFromMember(interaction.guild_id, interaction.member.user.id, teamRole.id);
          
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ Has abandonado **${teamName}** exitosamente y se te ha quitado el rol.` } // Public message? Let's make it ephemeral? Usually leaving a club could be public or ephemeral. The user didn't specify. I'll leave flags: 0 so it's public. Wait, let's keep it ephemeral maybe? "flags: 64"
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al intentar quitarte el rol: ${e.message}`, flags: 64 }
          });
        }
      } else if (name === 'convocar') {
        const targetUserId = options?.find((opt: any) => opt.name === 'usuario')?.value;

        if (!targetUserId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes seleccionar a un usuario.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        let teamName = null;
        const memberRoleIds = interaction.member?.roles || [];
        
        for (const roleId of memberRoleIds) {
          const role = roles.find((r: any) => r.id === roleId);
          if (role) {
            const roleName = role.name.toLowerCase();
            if (roleName.startsWith('capsel ')) {
              teamName = role.name.substring(7).trim();
              break;
            }
          }
        }

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No tenés ningún rol de "CapSel <Seleccion>". Asegurate de tener el rol correcto.', flags: 64 },
          });
        }

        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName!));
        
        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Sos capitán de **${teamName}**, pero no existe el rol de la selección "${teamName}" en el servidor.`, flags: 64 },
          });
        }

        const customIdAccept = `convocar_accept_${interaction.guild_id}_${teamRole.id}_${targetUserId}`;
        const customIdReject = `convocar_reject_${interaction.guild_id}_${targetUserId}`;

        try {
          await sendDirectMessageWithComponents(targetUserId, `📣 ¡Hola! El DT <@${interaction.member.user.id}> te convocó para unirte a la selección de **${teamName}** en Liga TPM Sudamérica. ¿Aceptas la convocatoria?`, [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: '✅ Aceptar Convocatoria',
                  style: 3,
                  custom_id: customIdAccept
                },
                {
                  type: 2,
                  label: '❌ Rechazar',
                  style: 4,
                  custom_id: customIdReject
                }
              ]
            }
          ]);

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ Le he enviado un mensaje privado a <@${targetUserId}> con la convocatoria.`, flags: 64 },
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Error al enviar MD a <@${targetUserId}>. Es posible que el usuario tenga los mensajes privados desactivados para este servidor.`, flags: 64 },
          });
        }
      } else if (name === 'desconvocar') {
        const targetUserId = options?.find((opt: any) => opt.name === 'usuario')?.value;

        if (!targetUserId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes seleccionar a un usuario.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        let teamName = null;
        const memberRoleIds = interaction.member?.roles || [];
        
        for (const roleId of memberRoleIds) {
          const role = roles.find((r: any) => r.id === roleId);
          if (role) {
            const roleName = role.name.toLowerCase();
            if (roleName.startsWith('capsel ')) {
              teamName = role.name.substring(7).trim();
              break;
            }
          }
        }

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ No tenés ningún rol de "CapSel <Seleccion>".', flags: 64 },
          });
        }

        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName!));
        
        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No se encontró el rol de la selección **${teamName}** en el servidor.`, flags: 64 },
          });
        }

        try {
          await removeRoleFromMember(interaction.guild_id, targetUserId, teamRole.id);
          
          try {
            await sendDirectMessage(targetUserId, `ℹ️ Has sido desconvocado de **${teamName}** por el DT <@${interaction.member.user.id}> y ya no formas parte del plantel.`);
          } catch (dmErr) {
            console.error("No se pudo enviar MD de despido:", dmErr);
          }

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ <@${targetUserId}> ha sido desconvocado de **${teamName}** y se le notificó por mensaje privado.`, flags: 64 }
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al intentar sacarle el rol: ${e.message}`, flags: 64 }
          });
        }
      } else if (name === 'renunciar_seleccion') {
        const teamName = options?.find((opt: any) => opt.name === 'seleccion')?.value;

        if (!teamName) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Debes especificar el nombre de la selección.', flags: 64 },
          });
        }

        const roles = await getGuildRoles(interaction.guild_id);
        const teamRole = roles.find((r: any) => normalizeRoleName(r.name) === normalizeRoleName(teamName));

        if (!teamRole) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No se encontró el rol de la selección **${teamName}** en el servidor.`, flags: 64 },
          });
        }

        const memberRoleIds = interaction.member?.roles || [];
        if (!memberRoleIds.includes(teamRole.id)) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ No tenés el rol de la selección **${teamName}**, por lo que no puedes renunciar.`, flags: 64 },
          });
        }

        try {
          await removeRoleFromMember(interaction.guild_id, interaction.member.user.id, teamRole.id);
          
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `✅ Has renunciado a la selección de **${teamName}** exitosamente y se te ha quitado el rol.` }
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al intentar quitarte el rol: ${e.message}`, flags: 64 }
          });
        }
      }
    }

    // 3. Manejar interacciones de componentes (Botones)
    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      const customId = interaction.data.custom_id;
      const clickerId = interaction.member?.user?.id || interaction.user?.id;

      if (customId.startsWith('fichar_accept_')) {
        const parts = customId.split('_');
        const guildId = parts[2];
        const roleId = parts[3];
        const targetId = parts[4];

        if (clickerId !== targetId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Solo el jugador invitado puede aceptar el fichaje.', flags: 64 }
          });
        }

        try {
          await addRoleToMember(guildId, targetId, roleId);
          return NextResponse.json({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
              content: `✅ ¡Fichaje confirmado! <@${targetId}> ha aceptado la oferta y ya tiene el rol del equipo.`,
              components: [] // Quita los botones
            }
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al asignar el rol (¿El rol del bot está por encima del rol del equipo?): ${e.message}`, flags: 64 }
          });
        }
      }

      if (customId.startsWith('fichar_reject_')) {
        const parts = customId.split('_');
        const guildId = parts[2];
        const targetId = parts[3];

        if (clickerId !== targetId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Solo el jugador invitado puede rechazar el fichaje.', flags: 64 }
          });
        }

        return NextResponse.json({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: `❌ <@${targetId}> ha rechazado la oferta de fichaje.`,
            components: []
          }
        });
      }

      if (customId.startsWith('convocar_accept_')) {
        const parts = customId.split('_');
        const guildId = parts[2];
        const roleId = parts[3];
        const targetId = parts[4];

        if (clickerId !== targetId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Solo el jugador convocado puede aceptar.', flags: 64 }
          });
        }

        try {
          await addRoleToMember(guildId, targetId, roleId);
          return NextResponse.json({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
              content: `✅ ¡Convocatoria confirmada! <@${targetId}> ha aceptado la convocatoria y ya tiene el rol de la selección.`,
              components: [] 
            }
          });
        } catch (e: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Hubo un error al asignar el rol (¿El rol del bot está por encima del rol de la selección?): ${e.message}`, flags: 64 }
          });
        }
      }

      if (customId.startsWith('convocar_reject_')) {
        const parts = customId.split('_');
        const guildId = parts[2];
        const targetId = parts[3];

        if (clickerId !== targetId) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Solo el jugador convocado puede rechazar.', flags: 64 }
          });
        }

        return NextResponse.json({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: `❌ <@${targetId}> ha rechazado la convocatoria.`,
            components: []
          }
        });
      }
    }

    return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling Discord interaction:', error);
    return new NextResponse(`Internal Server Error: ${error.message || error}`, { status: 500 });
  }
}
