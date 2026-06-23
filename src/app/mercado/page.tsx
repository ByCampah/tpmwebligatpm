import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mercado de Pases | Liga TPM",
  description: "Jugadores libres buscando equipo y equipos buscando jugadores.",
};

export const dynamic = 'force-dynamic';

export default async function MercadoPage() {
  const freeAgents = await prisma.player.findMany({
    where: { isFreeAgent: true },
    include: {
      user: true // to get discordId if available
    },
    orderBy: { nick: "asc" }
  });

  const teamsLooking = await prisma.team.findMany({
    where: { isLookingForPlayers: true },
    include: {
      captain: true // to show who to contact
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Mercado de Pases</h1>
      <p className="text-muted-foreground mb-8">
        ¿Buscás equipo o necesitás reforzar tu plantel? Acá podés encontrar a los agentes libres y a los clubes que están reclutando. 
        Para aparecer en esta lista, modificá tu estado desde <Link href="/perfil" className="text-primary hover:underline">Mi Perfil</Link>.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Free Agents Column */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-primary/20 border-b border-primary/50 p-4 flex items-center justify-between">
            <h2 className="font-black text-xl text-primary">Agentes Libres</h2>
            <span className="bg-primary text-black font-black text-xs px-2 py-1 rounded-full">{freeAgents.length}</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {freeAgents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">
                No hay jugadores buscando equipo actualmente.
              </div>
            ) : (
              freeAgents.map(player => {
                const natFlags: any = {
                  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Colombia": "🇨🇴",
                  "Venezuela": "🇻🇪", "Paraguay": "🇵🇾", "Peru": "🇵🇪", "Ecuador": "🇪🇨", "Bolivia": "🇧🇴",
                  "Europa": "🇪🇺", "Norte/Centroamérica": "🌎", "Resto del Mundo": "🌍"
                };
                const flag = natFlags[player.nationality] || "🏳️";

                return (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-black border border-border rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {player.user?.customAvatarUrl || player.user?.image ? (
                        <img src={player.user.customAvatarUrl || player.user.image || ""} alt={player.nick} className="w-10 h-10 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground border border-border">
                          {player.nick.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Link href={`/jugadores/${player.id}`} className="font-bold text-white hover:text-primary transition-colors text-lg">
                          {player.nick}
                        </Link>
                        <div className="text-xs text-muted-foreground">{flag} {player.nationality}</div>
                      </div>
                    </div>
                    {player.user?.discordId ? (
                      <a 
                        href={`https://discordapp.com/users/${player.user.discordId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        title="Contactar por Discord"
                      >
                        Contactar
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin Discord</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Teams Looking For Players Column */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-secondary/50 border-b border-border p-4 flex items-center justify-between">
            <h2 className="font-black text-xl text-white">Equipos Buscando Jugadores</h2>
            <span className="bg-secondary text-white font-black text-xs px-2 py-1 rounded-full">{teamsLooking.length}</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {teamsLooking.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">
                No hay equipos buscando jugadores actualmente.
              </div>
            ) : (
              teamsLooking.map(team => (
                <div key={team.id} className="flex items-center justify-between p-4 bg-black border border-border rounded-xl hover:border-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground border border-border">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <Link href={`/equipos/${team.id}`} className="font-bold text-white hover:text-primary transition-colors text-lg">
                        {team.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        Capitán: {team.captain?.nickName || team.captain?.name || "Sin capitán"}
                      </div>
                    </div>
                  </div>
                  {team.captain?.discordId ? (
                    <a 
                      href={`https://discordapp.com/users/${team.captain.discordId}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      title="Contactar al Capitán por Discord"
                    >
                      Contactar
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sin Discord</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
