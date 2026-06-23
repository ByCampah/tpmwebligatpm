"use client";

import { useState } from "react";
import { createPlayer, deletePlayer, editPlayer } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function PlayersClient({ players, users }: { players: any[], users: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<any>(null);

  const handleDelete = async (id: string, nick: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar al jugador "${nick}"?`)) {
      setLoading(true);
      setError("");
      const res = await deletePlayer(id);
      if (!res.success) {
        setError(res.error || "Error al eliminar");
        alert(res.error || "Error al eliminar");
      }
      setLoading(false);
      router.refresh();
    }
  };

  const startEdit = (player: any) => {
    setEditMode(player);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(null);
    (document.getElementById('createPlayerForm') as HTMLFormElement)?.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* FORM TO CREATE/EDIT PLAYER */}
      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-primary mb-4">
          {editMode ? `Editar Jugador: ${editMode.nick}` : 'Añadir Nuevo Jugador'}
        </h2>
        <form action={async (formData) => {
          setLoading(true);
          setError("");

          let res;
          if (editMode) {
            formData.append("id", editMode.id);
            res = await editPlayer(formData);
          } else {
            res = await createPlayer(formData);
          }

          if (!res.success) {
            setError(res.error || "Error");
            setLoading(false);
            return;
          }

          setLoading(false);
          setEditMode(null);
          router.refresh();
          (document.getElementById('createPlayerForm') as HTMLFormElement)?.reset();
        }} id="createPlayerForm" className="flex flex-col gap-4">
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nick en el Juego</label>
              <input name="nick" type="text" defaultValue={editMode?.nick || ""} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Campah" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nacionalidad</label>
              <select name="nationality" defaultValue={editMode?.nationality || "Desconocida"} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="Desconocida">-- Seleccionar --</option>
                <optgroup label="Sudamérica">
                  <option value="Argentina">🇦🇷 Argentina</option>
                  <option value="Brasil">🇧🇷 Brasil</option>
                  <option value="Uruguay">🇺🇾 Uruguay</option>
                  <option value="Chile">🇨🇱 Chile</option>
                  <option value="Colombia">🇨🇴 Colombia</option>
                  <option value="Venezuela">🇻🇪 Venezuela</option>
                  <option value="Paraguay">🇵🇾 Paraguay</option>
                  <option value="Peru">🇵🇪 Perú</option>
                  <option value="Ecuador">🇪🇨 Ecuador</option>
                  <option value="Bolivia">🇧🇴 Bolivia</option>
                </optgroup>
                <optgroup label="Resto del Mundo">
                  <option value="Europa">🇪🇺 Europa</option>
                  <option value="Norte/Centroamérica">🌎 Norte/Centroamérica</option>
                  <option value="Resto del Mundo">🌍 Resto del Mundo</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Vincular a Cuenta (Opcional)</label>
              <select name="userId" defaultValue={editMode?.user?.id || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                <option value="">-- Sin cuenta vinculada --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button disabled={loading} type="submit" className="flex-1 bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors">
              {editMode ? 'GUARDAR CAMBIOS' : 'CREAR JUGADOR'}
            </button>
            {editMode && (
              <button disabled={loading} type="button" onClick={cancelEdit} className="bg-secondary text-secondary-foreground font-black px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors">
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>

      {/* PLAYER LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Jugadores Registrados ({players.length})</h2>
        {error && <div className="bg-destructive/20 text-destructive border border-destructive p-3 rounded mb-4 text-sm font-bold">{error}</div>}
        
        <div className="overflow-x-auto bg-card border border-border rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary text-secondary-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">Nick</th>
                <th className="px-4 py-3 font-bold">Nacionalidad</th>
                <th className="px-4 py-3 font-bold">Cuenta Vinculada</th>
                <th className="px-4 py-3 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players.map(player => {
                const natFlags: any = {
                  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Colombia": "🇨🇴",
                  "Venezuela": "🇻🇪", "Paraguay": "🇵🇾", "Peru": "🇵🇪", "Ecuador": "🇪🇨", "Bolivia": "🇧🇴",
                  "Europa": "🇪🇺", "Norte/Centroamérica": "🌎", "Resto del Mundo": "🌍"
                };
                const flag = natFlags[player.nationality] || "🏳️";

                return (
                <tr key={player.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold">{player.nick}</td>
                  <td className="px-4 py-3 text-muted-foreground">{flag} {player.nationality}</td>
                  <td className="px-4 py-3 text-muted-foreground">{player.user?.username || "Sin vincular"}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => startEdit(player)}
                      disabled={loading}
                      className="text-xs bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded font-bold transition-colors mr-2"
                    >
                      EDITAR
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id, player.nick)}
                      disabled={loading}
                      className="text-xs bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground px-3 py-1 rounded font-bold transition-colors"
                    >
                      ELIMINAR
                    </button>
                  </td>
                </tr>
                );
              })}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Aún no hay jugadores registrados.
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
