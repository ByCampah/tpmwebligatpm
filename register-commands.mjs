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
      }
    ]
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
