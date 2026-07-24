import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getThemeColors } from '@/lib/themeColors';

export const runtime = 'nodejs'; // Use nodejs so we can safely use Prisma without Edge issues.

export async function GET(req: NextRequest) {
  try {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('team');
    const tournamentId = searchParams.get('tournamentId');
    const showDiscord = searchParams.get('discord') === 'true';
    const color = searchParams.get('color') || 'emerald';

    if (!teamName || !tournamentId) {
      return new Response('Equipo o torneo no especificado', { status: 400 });
    }

    // Buscar el equipo
    const team = await prisma.team.findFirst({
      where: { name: { equals: teamName, mode: 'insensitive' } }
    });

    if (!team) {
      return new Response('Equipo no encontrado', { status: 404 });
    }

    // Traer los jugadores del equipo en el torneo específico
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: {
        teamId: team.id,
        tournamentId: tournamentId
      },
      include: {
        players: {
          include: { 
            player: {
              include: { user: true }
            } 
          }
        }
      }
    });

    // Unificar jugadores (por si está en más de un torneo con el mismo equipo)
    const playerMap = new Map();
    for (const tt of tournamentTeams) {
      for (const tp of tt.players) {
        if (!playerMap.has(tp.player.id)) {
          playerMap.set(tp.player.id, tp.player);
        }
      }
    }
    const players = Array.from(playerMap.values()).sort((a, b) => a.nick.localeCompare(b.nick));

    let teamLogo = team.logoUrl;
    if (teamLogo && teamLogo.startsWith('/')) {
      teamLogo = `${baseUrl}${teamLogo}`;
    }

    const tpmLogo = `${baseUrl}/img/logos/LogoTPM.png`;
    const byCampahLogo = `${baseUrl}/img/logos/ByCampah3.png`;
    const theme = getThemeColors(color);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fondo gradiente sutil */}
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', backgroundColor: theme.orb1, filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', backgroundColor: theme.orb2, filter: 'blur(100px)' }} />

          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 60px', zIndex: 10 }}>
            <img src={tpmLogo} width="100" height="100" style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '30px', fontWeight: 'bold', color: theme.primary, textTransform: 'uppercase', letterSpacing: '2px' }}>Plantel Oficial</span>
              <span style={{ fontSize: '40px', fontWeight: '900', color: 'white' }}>{team.name}</span>
            </div>
            {teamLogo ? (
              <img src={teamLogo} width="120" height="120" style={{ objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 120, height: 120 }} />
            )}
          </div>

          {/* Grid de Jugadores */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '0 40px', gap: '30px', zIndex: 10, marginTop: '20px' }}>
            {players.map((p: any) => {
              let avatar = p.user?.customAvatarUrl || p.user?.image || `${baseUrl}/img/default-avatar.png`;
              if (avatar.startsWith('/')) avatar = `${baseUrl}${avatar}`;

              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: `2px solid ${theme.primary}15`, borderRadius: '16px', padding: '20px', width: '220px' }}>
                  <img src={avatar} width="100" height="100" style={{ borderRadius: '50%', objectFit: 'cover', border: `3px solid ${theme.primary}`, marginBottom: '15px' }} />
                  <span style={{ fontSize: '22px', fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: '5px' }}>{p.nick}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.secondary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.primaryPosition || "Libre"}</span>
                  {showDiscord && p.user?.name && (
                    <span style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                      {/* Pseudo discord icon */}
                      <span style={{ color: '#5865F2', marginRight: '5px', fontWeight: 'bold' }}>D:</span> {p.user.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: '0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 }}>
             <img src={byCampahLogo} width="160" style={{ opacity: 0.8 }} />
          </div>

        </div>
      ),
      {
        width: 1200,
        height: 1200, // Fijamos en 1200, si son muchos se acomodan o desbordan. Si desbordan habría que hacer el height dinámico pero ImageResponse es fijo.
      }
    );
  } catch (error) {
    console.error('Error generating plantel image:', error);
    return new Response('Error interno', { status: 500 });
  }
}
