"use client";

import { useState } from "react";
import { createTeam, deleteTeam, editTeam } from "@/app/actions";
import { toggleNationalTeamCallUp } from "@/app/actions";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import ImageSelector from "@/components/ImageSelector";

export default function NationalTeamsAdminClient({ teams, users, players }: { teams: any[], users: any[], players: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<any>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [logoInput, setLogoInput] = useState("");
  const [manageCallUps, setManageCallUps] = useState<any>(null);
  const [callUpFilter, setCallUpFilter] = useState("");
  
  const normalizeText = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

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
    setLogoInput(team.logoUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(null);
    setLogoInput("");
    (document.getElementById('createTeamForm') as HTMLFormElement)?.reset();
  };

  const handleToggleCallUp = async (playerId: string, currentStatus: boolean) => {
    setLoading(true);
    const res = await toggleNationalTeamCallUp(playerId, !currentStatus);
    if (!res.success) {
      alert(res.error || "Error al cambiar estado");
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* FORM TO CREATE/EDIT TEAM */}
      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-primary mb-4">
          {editMode ? `Editar Selección: ${editMode.name}` : 'Añadir Nueva Selección'}
        </h2>
        <form action={async (formData) => {
          setLoading(true);
          setError("");
          
          formData.append("isNationalTeam", "true");

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
              <div className="flex gap-2">
                <input 
                  name="logoUrl" 
                  type="text" 
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" 
                  placeholder="/img/... o https://..." 
                />
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="bg-secondary text-secondary-foreground font-bold px-4 rounded hover:bg-secondary/80 transition-colors whitespace-nowrap"
                >
                  🖼️ Galería
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Cuenta Capitán (Opcional)</label>
            <SearchableSelect
              name="captainId"
              options={users.map(u => ({ value: u.id, label: u.nickName || u.name || "Usuario Desconocido" }))}
              defaultValue={editMode?.captainId || ""}
              placeholder="-- Sin capitán asignado --"
            />
            <p className="text-xs text-muted-foreground mt-1">Asigna a un usuario registrado para que sea el manager del equipo.</p>
          </div>

          <div className="flex gap-2 mt-2">
            <button disabled={loading} type="submit" className="flex-1 bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors">
              {editMode ? 'GUARDAR CAMBIOS' : 'CREAR SELECCIÓN'}
            </button>
            {editMode && (
              <button disabled={loading} type="button" onClick={cancelEdit} className="bg-secondary text-secondary-foreground font-black px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors">
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>

      {showGallery && (
        <ImageSelector 
          onSelect={(url) => {
            setLogoInput(url);
            setShowGallery(false);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* TEAM LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Selecciones Registradas ({teams.length})</h2>
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
                      onClick={() => setManageCallUps(team)}
                      disabled={loading}
                      className="text-xs bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded font-bold transition-colors mr-2"
                    >
                      CONVOCATORIAS
                    </button>
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
                    Aún no hay selecciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* MANAGE CALL UPS MODAL */}
      {manageCallUps && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30 rounded-t-xl">
              <div className="flex items-center gap-3">
                {manageCallUps.logoUrl && <img src={manageCallUps.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />}
                <h2 className="text-xl font-black text-white">Convocatorias: {manageCallUps.name}</h2>
              </div>
              <button 
                onClick={() => setManageCallUps(null)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-muted-foreground text-sm mb-4">
                Selecciona a los jugadores que están convocados para esta selección. Los jugadores que actives aquí aparecerán primeros en la pestaña de Selecciones.
              </p>

              <input 
                type="text" 
                placeholder="Filtrar por nombre..." 
                value={callUpFilter}
                onChange={(e) => setCallUpFilter(e.target.value)}
                className="w-full bg-black/50 border border-border rounded p-3 text-white mb-6 focus:border-primary outline-none transition-colors"
              />
              
              <div className="flex flex-col gap-2">
                {players.filter(p => normalizeText(p.nationality) === normalizeText(manageCallUps.name) && p.nick.toLowerCase().includes(callUpFilter.toLowerCase())).length === 0 ? (
                  <div className="text-center p-8 bg-secondary/20 rounded-lg text-muted-foreground italic">
                    No se encontraron jugadores que coincidan con la búsqueda.
                  </div>
                ) : (
                  players.filter(p => normalizeText(p.nationality) === normalizeText(manageCallUps.name) && p.nick.toLowerCase().includes(callUpFilter.toLowerCase())).map(player => (
                    <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${player.isNationalTeamCalledUp ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border hover:bg-secondary/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center font-bold text-muted-foreground">
                          {player.nick.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{player.nick}</span>
                          <span className="text-xs text-muted-foreground">
                            {player.primaryPosition || "Sin Posición"}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleCallUp(player.id, player.isNationalTeamCalledUp)}
                        disabled={loading}
                        className={`px-4 py-2 rounded font-bold text-sm transition-all ${
                          player.isNationalTeamCalledUp 
                            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'bg-secondary text-muted-foreground hover:bg-border'
                        }`}
                      >
                        {loading ? "..." : (player.isNationalTeamCalledUp ? "CONVOCADO" : "CONVOCAR")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
