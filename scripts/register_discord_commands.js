require('dotenv').config();

const { DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN } = process.env;

if (!DISCORD_CLIENT_ID || !DISCORD_BOT_TOKEN) {
  console.error("Faltan variables de entorno DISCORD_CLIENT_ID o DISCORD_BOT_TOKEN en el archivo .env");
  process.exit(1);
}

const commands = [
  {
    name: 'perfil',
    description: 'Mira las estadísticas en formato texto de un jugador de la liga',
    options: [
      {
        name: 'jugador',
        description: 'Nick del jugador',
        type: 3, // STRING
        required: true,
      }
    ]
  },
  {
    name: 'perfilcard',
    description: 'Genera la carta gráfica (estilo FIFA) de un jugador',
    options: [
      {
        name: 'jugador',
        description: 'Nick del jugador',
        type: 3, // STRING
        required: true,
      }
    ]
  },
  {
    name: 'estadisticas_card',
    description: 'Genera una gráfica con el Top 5 de Goleadores y Asistidores del torneo actual'
  },
  {
    name: 'partidocard',
    description: 'Genera una gráfica personalizada de un partido',
    options: [
      {
        name: 'local',
        description: 'Nombre o ID del equipo local',
        type: 3,
        required: true,
      },
      {
        name: 'visitante',
        description: 'Nombre o ID del equipo visitante',
        type: 3,
        required: true,
      },
      {
        name: 'torneo',
        description: 'Nombre del torneo (ej: Primera División)',
        type: 3,
        required: true,
      },
      {
        name: 'fecha',
        description: 'Fecha o Jornada (ej: Fecha 5)',
        type: 3,
        required: true,
      }
    ]
  },
  {
    name: 'equipo',
    description: 'Ver estadísticas de un equipo en la temporada actual',
    options: [
      {
        name: 'nombre',
        description: 'Nombre del equipo',
        type: 3,
        required: true,
      }
    ]
  },
  {
    name: 'seleccion',
    description: 'Ver estadísticas de una selección nacional',
    options: [
      {
        name: 'nombre',
        description: 'Nombre de la selección',
        type: 3,
        required: true,
      }
    ]
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
    options: [
      {
        name: 'usuario',
        description: 'El usuario de Discord que quieres fichar',
        type: 6, // USER type
        required: true,
      }
    ]
  },
  {
    name: 'despedir',
    description: 'Despide a un jugador de tu equipo y le quita el rol (Solo Capitanes)',
    options: [
      {
        name: 'usuario',
        description: 'El jugador al que le quieres quitar el rol',
        type: 6, // USER type
        required: true,
      }
    ]
  }
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

  try {
    console.log("Registrando comandos en Discord...");
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify(commands),
    });

    if (response.ok) {
      console.log('✅ Comandos registrados exitosamente.');
      const data = await response.json();
      console.log(data);
    } else {
      console.error('❌ Error registrando comandos:');
      const text = await response.text();
      console.error(text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

registerCommands();
