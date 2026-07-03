import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Use nodejs so we can safely use Prisma without Edge issues.

export async function GET(req: NextRequest) {
  try {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const { searchParams } = new URL(req.url);
    const nick = searchParams.get('nick');
    const id = searchParams.get('id');

    if (!nick && !id) {
      return new Response('Jugador no encontrado', { status: 400 });
    }

    // Buscar jugador
    const player = await prisma.player.findFirst({
      where: id ? { id } : { nick: { equals: nick as string, mode: 'insensitive' } },
      include: {
        tournamentTeams: {
          include: {
            tournamentTeam: {
              include: { team: true }
            }
          }
        }
      }
    });

    if (!player) {
      return new Response('Jugador no encontrado', { status: 404 });
    }

    // Obtener equipo actual (último)
    let teamName = "Agente Libre";
    let teamLogo = null;
    if (player.tournamentTeams && player.tournamentTeams.length > 0) {
      // Find the most recent enrollment or just take the last one
      const currentEnrollment = player.tournamentTeams[player.tournamentTeams.length - 1];
      if (currentEnrollment && currentEnrollment.tournamentTeam && currentEnrollment.tournamentTeam.team) {
        teamName = currentEnrollment.tournamentTeam.team.name;
        teamLogo = currentEnrollment.tournamentTeam.team.logoUrl;
        if (teamLogo && teamLogo.startsWith('/')) {
          teamLogo = `${baseUrl}${teamLogo}`;
        }
      }
    }

    // Traer stats
    const matchStats = await prisma.matchStat.findMany({
      where: { playerId: player.id },
    });

    // Agregar stats
    let totalMatches = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let passesMade = 0;
    let passesTotal = 0;
    let slidingMade = 0;
    let slidingTotal = 0;
    let gkTime = 0;
    let savesMade = 0;
    let savesTotal = 0;
    let matchTime = 0;

    for (const stat of matchStats) {
      if ((stat.matchTime && stat.matchTime > 0) || (stat.gkTime && stat.gkTime > 0)) {
        totalMatches++;
      }
      totalGoals += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
      totalAssists += (stat.assists || 0);
      passesMade += (stat.passesMade || 0);
      passesTotal += (stat.passesTotal || 0);
      slidingMade += (stat.slidingMade || 0);
      slidingTotal += (stat.slidingTotal || 0);
      gkTime += (stat.gkTime || 0);
      savesMade += (stat.savesMade || 0);
      savesTotal += (stat.savesTotal || 0);
      matchTime += (stat.matchTime || 0);
    }

    const passAcc = passesTotal > 0 ? Math.round((passesMade / passesTotal) * 100) : 0;
    const slidingAcc = slidingTotal > 0 ? Math.round((slidingMade / slidingTotal) * 100) : 0;
    const saveAcc = savesTotal > 0 ? Math.round((savesMade / savesTotal) * 100) : 0;

    const isGK = gkTime > matchTime; // If played more as GK than field, show GK stats

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #111, #0a2a1a)', // Black with green tint
            fontFamily: 'sans-serif',
          }}
        >
          {/* Card Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 500,
              height: 700,
              backgroundImage: 'linear-gradient(to bottom, #1e1e1e, #111)',
              border: '2px solid #D4AF37', // Gold border
              borderRadius: 30,
              padding: '40px',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)',
              position: 'relative',
            }}
          >
            {/* Top Section */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
                <img src={`${baseUrl}/img/logos/LogoTPM.png`} alt="TPM" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                {teamLogo && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={teamLogo} alt="Team" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#D4AF37', marginTop: 10, textAlign: 'center', width: 120 }}>{teamName}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 250, height: 250 }}>
                {/* Foto de perfil del jugador */}
                <div style={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  backgroundColor: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  fontWeight: 900,
                  color: '#111',
                  border: '6px solid #fff'
                }}>
                  {player.nick.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Name */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%', 
              borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
              paddingBottom: 20,
              marginTop: 20
            }}>
              <h1 style={{ fontSize: 50, fontWeight: 900, color: '#D4AF37', margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>
                {player.nick}
              </h1>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 30, padding: '0 20px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', width: 60, textAlign: 'right' }}>{totalMatches}</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>PJ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', width: 60, textAlign: 'right' }}>{totalGoals}</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>GOL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', width: 60, textAlign: 'right' }}>{totalAssists}</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>ASI</span>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', width: 60, textAlign: 'right' }}>{passAcc}%</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>PASES</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', width: 60, textAlign: 'right' }}>{saveAcc}%</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>SAVES</span>
                </div>
              </div>
            </div>

            {/* Footer Logo */}
            <div style={{
              position: 'absolute',
              bottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: 900 }}>LIGA TPM SUDAMERICA</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 800,
      }
    );
  } catch (e: any) {
    return new Response('Error generando imagen', { status: 500 });
  }
}
