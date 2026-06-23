"use client";

import { useState } from "react";
import { updateUserRole, linkUserToPlayerAndTeam } from "@/app/actions/user";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export default function UsersClient({ users, players, teams }: { users: any[], players: any[], teams: any[] }) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  const unlinkedPlayers = players.filter(p => !p.user);
  const playersOptions = unlinkedPlayers.map(p => ({ value: p.id, label: p.nick }));
  
  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));

  const filteredUsers = users.filter(user => {
    // Role / Link Filter
    if (filter === "UNLINKED" && user.player) return false;
    if (filter === "LINKED" && !user.player) return false;
    
    // Text Search Filter
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      if (!user.name?.toLowerCase().includes(search) && !user.player?.nick?.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-muted-foreground">Filtro:</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black border border-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="ALL">Todas las cuentas</option>
            <option value="UNLINKED">Sin jugador vinculado</option>
            <option value="LINKED">Con jugador vinculado</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-64">
          <input 
            type="text" 
            placeholder="Buscar por nombre o nick..." 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-black border border-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary text-secondary-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">Cuenta de Discord</th>
                <th className="px-4 py-3 font-bold w-1/3">Vincular Jugador / Equipo</th>
                <th className="px-4 py-3 font-bold">Rol Actual</th>
                <th className="px-4 py-3 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                      {user.image && <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <form action={async (formData) => {
                      setLoading(true);
                      await linkUserToPlayerAndTeam(formData);
                      setLoading(false);
                    }} className="flex flex-col gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      
                      <div className="flex items-center gap-2">
                        <div className="w-48">
                          <SearchableSelect 
                            name="playerId" 
                            options={playersOptions} 
                            defaultValue={user.player?.id || ""} 
                            placeholder={user.player ? user.player.nick : "Elegir Jugador..."} 
                          />
                        </div>
                        
                        <div className="w-48">
                          {/* We might just show an empty select for team, or if they are captain of one, show it. But they can be captain of multiple. 
                              For simplicity, we let them add a team captaincy. We don't default it to avoid unlinking mistakenly. */}
                          <SearchableSelect 
                            name="teamId" 
                            options={teamOptions} 
                            defaultValue=""
                            placeholder="Añadir a Equipo (Capitán)..." 
                          />
                        </div>

                        <button disabled={loading} type="submit" className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 rounded font-bold text-xs" title="Guardar vínculos">
                          Guardar Vínculos
                        </button>
                      </div>
                      
                      {user.captainOfTeams && user.captainOfTeams.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                          Capitán de: {user.captainOfTeams.map((t: any) => <span key={t.id} className="bg-secondary px-1 rounded">{t.name}</span>)}
                        </div>
                      )}
                    </form>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-primary/20 text-primary' :
                      user.role === 'MODERATOR' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <form action={async (formData) => {
                      setLoading(true);
                      await updateUserRole(formData);
                      setLoading(false);
                    }} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select name="role" defaultValue={user.role} disabled={loading} className="bg-black border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary">
                        <option value="USER">USER (Estándar)</option>
                        <option value="MODERATOR">MODERATOR (Carga Partidos)</option>
                        <option value="ADMIN">ADMIN (Acceso Total)</option>
                      </select>
                      <button disabled={loading} type="submit" className="bg-white/10 text-white hover:bg-white/20 transition-colors px-3 py-1 rounded font-bold text-xs">
                        Cambiar Rol
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron usuarios con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
