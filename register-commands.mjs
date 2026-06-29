import 'dotenv/config';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  console.error("Faltan las variables DISCORD_BOT_TOKEN o DISCORD_CLIENT_ID en el archivo .env");
  process.exit(1);
}

const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

const commands = [
  {
    name: "perfil",
    description: "Muestra el perfil de la Liga TPM de un jugador",
    type: 1, // CHAT_INPUT
    options: [
      {
        name: "jugador",
        description: "El nick del jugador que querés buscar (si lo dejas vacío, muestra el tuyo)",
        type: 3, // STRING
        required: false
      },
      {
        name: "temporada",
        description: "Nombre de la temporada (ej: Temporada 1). Por defecto muestra la actual.",
        type: 3, // STRING
        required: false
      }
    ]
  },
  {
    name: "equipo",
    description: "Muestra la información y estadísticas de un equipo",
    type: 1,
    options: [
      {
        name: "nombre",
        description: "Nombre del equipo (ej: Boca Juniors)",
        type: 3,
        required: true
      },
      {
        name: "temporada",
        description: "Nombre de la temporada (ej: Temporada 1). Por defecto muestra la actual.",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "seleccion",
    description: "Muestra la información y estadísticas de una selección nacional",
    type: 1,
    options: [
      {
        name: "nombre",
        description: "Nombre de la selección (ej: Argentina)",
        type: 3,
        required: true
      },
      {
        name: "temporada",
        description: "Nombre de la temporada",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "clasificacion",
    description: "Muestra la tabla de posiciones de la liga",
    type: 1,
    options: [
      {
        name: "temporada",
        description: "Nombre de la temporada",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "goleadores",
    description: "Muestra el Top 10 de goleadores de la liga",
    type: 1,
    options: [
      {
        name: "temporada",
        description: "Nombre de la temporada",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "asistidores",
    description: "Muestra el Top 10 de asistidores de la liga",
    type: 1,
    options: [
      {
        name: "temporada",
        description: "Nombre de la temporada",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "mercado_jugadores",
    description: "Muestra los jugadores que están buscando equipo (Agentes Libres)",
    type: 1
  },
  {
    name: "mercado_equipos",
    description: "Muestra los equipos que están buscando jugadores",
    type: 1
  }
];

async function registerCommands() {
  try {
    console.log("Comenzando el registro de comandos (/) de Discord...");

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
      },
      body: JSON.stringify(commands)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`¡Éxito! Se registraron ${data.length} comandos.`);
  } catch (error) {
    console.error("Hubo un error registrando los comandos:", error);
  }
}

registerCommands();
