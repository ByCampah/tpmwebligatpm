import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const { searchParams } = new URL(req.url);
    const local = searchParams.get('local');
    const visitante = searchParams.get('visitante');
    const torneo = searchParams.get('torneo');
    const fecha = searchParams.get('fecha');

    if (!local || !visitante) {
      return new Response('Missing team parameters', { status: 400 });
    }

    // Buscar equipos
    const teamLocal = await prisma.team.findFirst({
      where: { name: { contains: local, mode: 'insensitive' } }
    });

    const teamVisitante = await prisma.team.findFirst({
      where: { name: { contains: visitante, mode: 'insensitive' } }
    });

    let localLogo = teamLocal?.logoUrl;
    if (localLogo && localLogo.startsWith('/')) localLogo = `${baseUrl}${localLogo}`;

    let visitanteLogo = teamVisitante?.logoUrl;
    if (visitanteLogo && visitanteLogo.startsWith('/')) visitanteLogo = `${baseUrl}${visitanteLogo}`;

    // Renderizar
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
            padding: '40px',
            color: 'white',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60, paddingBottom: 20 }}>
            <img src={`${baseUrl}/img/logos/LogoTPM.png`} alt="TPM" style={{ width: 80, height: 80, objectFit: 'contain', marginRight: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#D4AF37', margin: 0, textTransform: 'uppercase' }}>{torneo}</h1>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginTop: 10 }}>{fecha}</h2>
            </div>
            <img src={`${baseUrl}/img/logos/LogoTPM.png`} alt="TPM" style={{ width: 80, height: 80, objectFit: 'contain', marginLeft: 20, opacity: 0 }} />
          </div>

          {/* Match Content */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            
            {/* Local */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 400 }}>
              {localLogo ? (
                <img src={localLogo} style={{ width: 250, height: 250, objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 250, height: 250, borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 900, color: '#111' }}>
                  {local.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h3 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginTop: 30, textAlign: 'center', textTransform: 'uppercase' }}>
                {teamLocal?.name || local}
              </h3>
            </div>

            {/* VS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 80, fontWeight: 900, color: '#D4AF37', fontStyle: 'italic' }}>VS</span>
            </div>

            {/* Visitante */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 400 }}>
              {visitanteLogo ? (
                <img src={visitanteLogo} style={{ width: 250, height: 250, objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 250, height: 250, borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 900, color: '#111' }}>
                  {visitante.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h3 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginTop: 30, textAlign: 'center', textTransform: 'uppercase' }}>
                {teamVisitante?.name || visitante}
              </h3>
            </div>

          </div>

          {/* Footer */}
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
