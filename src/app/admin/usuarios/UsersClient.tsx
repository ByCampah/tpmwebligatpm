"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/actions/user";

export default function UsersClient({ users }: { users: any[] }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary text-secondary-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-bold">Cuenta de Discord</th>
              <th className="px-4 py-3 font-bold">Jugador Vinculado</th>
              <th className="px-4 py-3 font-bold">Rol Actual</th>
              <th className="px-4 py-3 font-bold">Acciones de Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                    {user.image && <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.player ? (
                    <span className="text-primary font-bold">{user.player.nick}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Sin vincular</span>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] whitespace-normal">
                    (Se vincula desde Gestión de Jugadores editando al jugador)
                  </p>
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
                    <button disabled={loading} type="submit" className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1 rounded font-bold text-sm">
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
