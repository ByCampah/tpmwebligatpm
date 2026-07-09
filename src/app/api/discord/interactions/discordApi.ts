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
  const appId = process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID;
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

export async function sendDirectMessage(userId: string, content: string) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('DISCORD_TOKEN is missing');

  // 1. Create DM channel
  const dmRes = await fetch(`${DISCORD_API_URL}/users/@me/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  if (!dmRes.ok) {
    throw new Error(`Failed to create DM channel: ${await dmRes.text()}`);
  }

  const dmChannel = await dmRes.json();

  // 2. Send message
  const msgRes = await fetch(`${DISCORD_API_URL}/channels/${dmChannel.id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!msgRes.ok) {
    throw new Error(`Failed to send DM: ${await msgRes.text()}`);
  }
}

export async function sendDirectMessageWithComponents(userId: string, content: string, components: any[]) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error('DISCORD_TOKEN is missing');

  // 1. Create DM channel
  const dmRes = await fetch(`${DISCORD_API_URL}/users/@me/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  if (!dmRes.ok) {
    throw new Error(`Failed to create DM channel: ${await dmRes.text()}`);
  }

  const dmChannel = await dmRes.json();

  // 2. Send message
  const msgRes = await fetch(`${DISCORD_API_URL}/channels/${dmChannel.id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, components }),
  });

  if (!msgRes.ok) {
    throw new Error(`Failed to send DM: ${await msgRes.text()}`);
  }
}
