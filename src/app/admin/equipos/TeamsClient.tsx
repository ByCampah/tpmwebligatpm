"use client";

import { useState } from "react";
import { createTeam, deleteTeam, editTeam } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function TeamsClient({ teams, users }: { teams: any[], users: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<any>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar el equipo "${name}"? Esta acción no se puede deshacer.`)) {
      setLoading(true);
      setError("");
      const res = await deleteTeam(id);
      if (!res.success) {
        setError(res.error || "Error al eliminar");
        alert(res.error || "Error al eliminar");
      }
      setLoading(false);
      router.refresh();
    }
  };

  const startEdit = (team: any) => {
    setEditMode(team);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(null);
    (document.getElementById('createTeamForm') as HTMLFormElement)?.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* FORM TO CREATE/EDIT TEAM */}
      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-primary mb-4">
          {editMode ? `Editar Equipo: ${editMode.name}` : 'Añadir Nuevo Equipo'}
        </h2>
        <form action={async (formData) => {
          setLoading(true);
          setError("");
          
          let res;
          if (editMode) {
            formData.append("id", editMode.id);
            res = await editTeam(formData);
          } else {
            res = await createTeam(formData);
          }

          if (!res.success) {
            setError(res.error || "Error");
            setLoading(false);
            return;
          }

          setLoading(false);
          setEditMode(null);
          router.refresh();
          (document.getElementById('createTeamForm') as HTMLFormElement)?.reset();
        }} id="createTeamForm" className="flex flex-col gap-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre del Equipo</label>
              <input name="name" type="text" defaultValue={editMode?.name || ""} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Ej: Boca Juniors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">URL del Logo (Opcional)</label>
              <input name="logoUrl" type="url" defaultValue={editMode?.logoUrl || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Cuenta Capitán (Opcional)</label>
            <select name="captainId" defaultValue={editMode?.captainId || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
              <option value="">-- Sin capitán asignado --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.nickName || u.name}</option>)}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Asigna a un usuario registrado para que sea el manager del equipo.</p>
          </div>

          <div className="flex gap-2 mt-2">
            <button disabled={loading} type="submit" className="flex-1 bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors">
              {editMode ? 'GUARDAR CAMBIOS' : 'CREAR EQUIPO'}
            </button>
            {editMode && (
              <button disabled={loading} type="button" onClick={cancelEdit} className="bg-secondary text-secondary-foreground font-black px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors">
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TEAM LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Equipos Registrados ({teams.length})</h2>
        {error && <div className="bg-destructive/20 text-destructive border border-destructive p-3 rounded mb-4 text-sm font-bold">{error}</div>}
        
        <div className="overflow-x-auto bg-card border border-border rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary text-secondary-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">Logo</th>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Capitán (User)</th>
                <th className="px-4 py-3 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map(team => (
                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain bg-secondary rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center font-bold text-muted-foreground">{team.name.charAt(0)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold">{team.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{team.captain?.nickName || team.captain?.name || "Sin asignar"}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => startEdit(team)}
                      disabled={loading}
                      className="text-xs bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded font-bold transition-colors mr-2"
                    >
                      EDITAR
                    </button>
                    <button 
                      onClick={() => handleDelete(team.id, team.name)}
                      disabled={loading}
                      className="text-xs bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground px-3 py-1 rounded font-bold transition-colors"
                    >
                      ELIMINAR
                    </button>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Aún no hay equipos registrados.
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
