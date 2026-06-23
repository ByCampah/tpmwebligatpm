"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category";

export default function CategoriesClient({ categories, userRole }: { categories: any[], userRole: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createCategory(formData);
    
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Error al crear la categoría");
    } else {
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("categoryId", editingId!);
    const res = await updateCategory(formData);
    
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Error al editar");
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría? No se puede deshacer y puede afectar torneos vinculados.")) {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      const res = await deleteCategory(formData);
      setLoading(false);
      if (!res.success) setError(res.error || "Error");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase">Categorías Históricas</h1>
          <p className="text-muted-foreground mt-2">Crea categorías para agrupar torneos en el Historial (Ej: Primera División).</p>
        </div>
      </div>

      {error && <div className="bg-destructive/20 text-destructive border border-destructive p-4 rounded-xl font-bold">{error}</div>}

      <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
        {/* CREATE FORM */}
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col gap-4 sticky top-6">
          <h2 className="text-xl font-bold text-primary">Nueva Categoría</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-muted-foreground font-bold mb-1 block">Nombre</label>
              <input 
                name="name" 
                type="text" 
                required 
                placeholder="Ej: Copa TPM"
                className="w-full bg-black border border-border p-3 rounded focus:outline-none focus:border-primary"
              />
            </div>
            <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-black py-3 rounded hover:bg-primary/90 transition-colors">
              CREAR
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Listado ({categories.length})</h2>
          
          <div className="grid gap-4">
            {categories.map(c => {
              const isEditing = editingId === c.id;
              
              return (
                <div key={c.id} className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-primary/50">
                  {isEditing ? (
                    <form onSubmit={handleUpdate} className="flex flex-1 gap-2">
                      <input 
                        name="name" 
                        type="text" 
                        required 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-black border border-border p-2 rounded focus:outline-none focus:border-primary"
                      />
                      <button disabled={loading} type="submit" className="bg-primary text-primary-foreground font-bold px-4 rounded text-sm hover:bg-primary/90">
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="bg-secondary text-secondary-foreground font-bold px-4 rounded text-sm">
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="font-black text-lg">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.tournaments?.length || 0} Torneos vinculados</span>
                      </div>
                      
                      {userRole === "ADMIN" && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingId(c.id); setEditName(c.name); }} 
                            className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-sm font-bold hover:bg-secondary/80"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)} 
                            disabled={loading || c.tournaments?.length > 0}
                            title={c.tournaments?.length > 0 ? "No podés borrar una categoría que tiene torneos" : ""}
                            className="bg-destructive/10 text-destructive px-3 py-1.5 rounded text-sm font-bold hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            
            {categories.length === 0 && (
              <div className="bg-black/50 border border-border border-dashed p-8 rounded-xl text-center text-muted-foreground">
                No hay categorías creadas todavía. Usa el panel de la izquierda para crear la primera.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
