import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentIdParam = searchParams.get('tournamentId');

    // 1. Obtener temporada activa y torneos
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
      include: {
        tournaments: true
      }
    });

    if (!activeSeason) {
      return new Response('No hay temporada activa', { status: 404 });
    }

    let tournamentIds = activeSeason.tournaments.map(t => t.id);
    let tournamentName = activeSeason.name;

    if (tournamentIdParam) {
      const specificTournament = activeSeason.tournaments.find(t => t.id === tournamentIdParam);
      if (specificTournament) {
        tournamentIds = [specificTournament.id];
        tournamentName = specificTournament.name;
      }
    }

    // 2. Obtener todas las stats de esta temporada
    const stats = await prisma.matchStat.findMany({
      where: {
        match: {
          tournamentId: { in: tournamentIds }
        }
      },
      include: {
        player: {
          include: {
            tournamentTeams: {
              where: {
                tournamentTeam: {
                  tournamentId: { in: tournamentIds }
                }
              },
              include: {
                tournamentTeam: {
                  include: { team: true }
                }
              }
            }
          }
        }
      }
    });

    // 3. Agregar stats
    const playerStats = new Map<string, any>();

    for (const stat of stats) {
      if (!stat.player) continue;

      const pId = stat.player.id;
      if (!playerStats.has(pId)) {
        let teamLogo = null;
        if (stat.player.tournamentTeams.length > 0) {
          teamLogo = stat.player.tournamentTeams[0].tournamentTeam.team.logoUrl;
          if (teamLogo && teamLogo.startsWith('/')) {
            teamLogo = `${req.nextUrl.origin}${teamLogo}`;
          }
        }

        playerStats.set(pId, {
          nick: stat.player.nick,
          teamLogo,
          goals: 0,
          assists: 0
        });
      }

      const pData = playerStats.get(pId);
      pData.goals += (stat.goals || 0) + (stat.freeKickGoals || 0) + (stat.penaltyGoals || 0);
      pData.assists += (stat.assists || 0);
    }

    const allPlayers = Array.from(playerStats.values());
    const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
    const topAssists = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 5);

    // 4. Renderizar
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #111, #0a2a1a)',
            fontFamily: 'sans-serif',
            padding: '40px 60px',
            color: 'white',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, borderBottom: '2px solid #D4AF37', paddingBottom: 20 }}>
            <img src={`${req.nextUrl.origin}/img/logos/LogoTPM.png`} alt="TPM" style={{ width: 100, height: 100, objectFit: 'contain', marginRight: 30 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: 50, fontWeight: 900, color: '#D4AF37', margin: 0, textTransform: 'uppercase' }}>ESTADÍSTICAS</h1>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: '#fff', margin: 0 }}>{tournamentName}</h2>
            </div>
          </div>

          {/* Grid de Tablas */}
          <div style={{ display: 'flex', width: '100%', gap: '60px', flex: 1 }}>
            
            {/* Goleadores */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 30, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <h3 style={{ fontSize: 36, fontWeight: 900, color: '#D4AF37', margin: '0 0 20px 0', textAlign: 'center' }}>MÁXIMOS GOLEADORES</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {topScorers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '15px 20px', borderRadius: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#D4AF37', width: 40 }}>{i + 1}</span>
                    {p.teamLogo ? (
                      <img src={p.teamLogo} style={{ width: 50, height: 50, objectFit: 'contain', marginRight: 15 }} />
                    ) : (
                      <div style={{ width: 50, height: 50, marginRight: 15 }} />
                    )}
                    <span style={{ fontSize: 26, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nick}</span>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginLeft: 10 }}>{p.goals}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asistidores */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 30, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <h3 style={{ fontSize: 36, fontWeight: 900, color: '#D4AF37', margin: '0 0 20px 0', textAlign: 'center' }}>MÁXIMOS ASISTIDORES</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {topAssists.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '15px 20px', borderRadius: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#D4AF37', width: 40 }}>{i + 1}</span>
                    {p.teamLogo ? (
                      <img src={p.teamLogo} style={{ width: 50, height: 50, objectFit: 'contain', marginRight: 15 }} />
                    ) : (
                      <div style={{ width: 50, height: 50, marginRight: 15 }} />
                    )}
                    <span style={{ fontSize: 26, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nick}</span>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginLeft: 10 }}>{p.assists}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response('Error generando imagen', { status: 500 });
  }
}
