import { NextResponse } from 'next/server';

const commands = [
  {
    name: 'perfil',
    description: 'Mira las estadísticas en formato texto de un jugador de la liga',
    options: [{ name: 'jugador', description: 'Nick del jugador', type: 3, required: false }]
  },
  {
    name: 'perfilcard',
    description: 'Genera la carta gráfica (estilo FIFA) de un jugador',
    options: [{ name: 'jugador', description: 'Nick del jugador', type: 3, required: false }]
  },
  {
    name: 'estadisticas_card',
    description: 'Genera una gráfica con el Top 5 de Goleadores y Asistidores del torneo actual'
  },
  {
    name: 'partidocard',
    description: 'Genera una gráfica personalizada de un partido',
    options: [
      { name: 'local', description: 'Nombre o ID del equipo local', type: 3, required: true },
      { name: 'visitante', description: 'Nombre o ID del equipo visitante', type: 3, required: true },
      { name: 'torneo', description: 'Nombre del torneo (ej: Primera División)', type: 3, required: true },
      { name: 'fecha', description: 'Fecha o Jornada (ej: Fecha 5)', type: 3, required: true }
    ]
  },
  {
    name: 'equipo',
    description: 'Ver estadísticas de un equipo en la temporada actual',
    options: [{ name: 'nombre', description: 'Nombre del equipo', type: 3, required: true }]
  },
  {
    name: 'seleccion',
    description: 'Ver estadísticas de una selección nacional',
    options: [{ name: 'nombre', description: 'Nombre de la selección', type: 3, required: true }]
  },
  {
    name: 'clasificacion',
    description: 'Muestra el Top 10 de la liga actual',
  },
  {
    name: 'goleadores',
    description: 'Muestra el Top 10 de goleadores actuales',
  },
  {
    name: 'asistidores',
    description: 'Muestra el Top 10 de asistidores actuales',
  },
  {
    name: 'mercado_jugadores',
    description: 'Ver últimos 15 jugadores buscando equipo',
  },
  {
    name: 'mercado_equipos',
    description: 'Ver últimos 15 equipos buscando jugadores',
  },
  {
    name: 'fichar',
    description: 'Invita a un jugador a unirse a tu equipo (Solo para Capitanes)',
    options: [{ name: 'usuario', description: 'El usuario de Discord que quieres fichar', type: 6, required: true }]
  },
  {
    name: 'despedir',
    description: 'Despide a un jugador de tu equipo y le quita el rol (Solo Capitanes)',
    options: [{ name: 'usuario', description: 'El jugador al que le quieres quitar el rol', type: 6, required: true }]
  }
];

export async function GET(req: Request) {
  const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID;

  if (!token || !clientId) {
    return NextResponse.json({ 
      error: 'Faltan variables en Vercel', 
      necesitas: ['DISCORD_TOKEN (o DISCORD_BOT_TOKEN)', 'DISCORD_CLIENT_ID (o DISCORD_APPLICATION_ID)'] 
    }, { status: 500 });
  }

  const url = `https://discord.com/api/v10/applications/${clientId}/commands`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
      },
      body: JSON.stringify(commands),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ success: true, message: 'Comandos actualizados con exito!', comandosRegistrados: data.length });
    } else {
      const text = await response.text();
      return NextResponse.json({ error: 'Discord rechazo la peticion', detalles: text }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Excepcion interna', detalles: error.message }, { status: 500 });
  }
}
