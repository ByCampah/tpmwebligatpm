const DISCORD_API_URL = 'https://discord.com/api/v10';

export async function getGuildRoles(guildId: string) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('DISCORD_TOKEN is missing');

  const res = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/roles`, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch roles: ${res.statusText}`);
  }

  return res.json();
}

export async function addRoleToMember(guildId: string, userId: string, roleId: string) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('DISCORD_TOKEN is missing');

  const res = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to add role: ${res.statusText} - ${await res.text()}`);
  }
}

export async function removeRoleFromMember(guildId: string, userId: string, roleId: string) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('DISCORD_TOKEN is missing');

  const res = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to remove role: ${res.statusText} - ${await res.text()}`);
  }
}

export async function updateInteractionMessage(interactionToken: string, content: string) {
  const appId = process.env.DISCORD_APPLICATION_ID;
  if (!appId) throw new Error('DISCORD_APPLICATION_ID is missing');

  const res = await fetch(`${DISCORD_API_URL}/webhooks/${appId}/${interactionToken}/messages/@original`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content,
      components: [] // Elimina los botones
    })
  });
  
  if (!res.ok) {
    console.error("Failed to update interaction message", await res.text());
  }
}
