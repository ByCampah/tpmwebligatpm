"use client";

import { useState } from "react";
import { createNews, editNews, deleteNews } from "@/app/actions/news";
import { useRouter } from "next/navigation";

export default function NewsAdminClient({ initialNews }: { initialNews: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<any>(null);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Eliminar la noticia "${title}"?`)) {
      setLoading(true);
      const res = await deleteNews(id);
      if (!res.success) alert(res.error);
      setLoading(false);
      router.refresh();
    }
  };

  const startEdit = (newsItem: any) => {
    setEditMode(newsItem);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(null);
    (document.getElementById('newsForm') as HTMLFormElement)?.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* FORM TO CREATE/EDIT NEWS */}
      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-primary mb-4">
          {editMode ? `Editar Noticia: ${editMode.title}` : 'Crear Nueva Noticia'}
        </h2>
        {error && <div className="text-red-500 mb-4 font-bold text-sm">{error}</div>}
        <form action={async (formData) => {
          setLoading(true);
          setError("");

          let res;
          if (editMode) {
            formData.append("id", editMode.id);
            res = await editNews(formData);
          } else {
            res = await createNews(formData);
          }

          if (!res.success) {
            setError(res.error || "Error");
            setLoading(false);
            return;
          }

          setLoading(false);
          setEditMode(null);
          router.refresh();
          (document.getElementById('newsForm') as HTMLFormElement)?.reset();
        }} id="newsForm" className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Título</label>
            <input name="title" type="text" defaultValue={editMode?.title || ""} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none text-white" placeholder="Ej: Nueva Temporada Anunciada" />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">URL de Portada (Opcional)</label>
            <input name="imageUrl" type="url" defaultValue={editMode?.imageUrl || ""} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none text-white" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Contenido (Admite saltos de línea)</label>
            <textarea name="content" defaultValue={editMode?.content || ""} required rows={8} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none text-white font-sans" placeholder="Escribe el desarrollo de la noticia aquí..." />
          </div>

          <div className="flex items-center gap-2 mt-2 bg-black p-3 rounded border border-border">
            <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={editMode?.isFeatured || false} className="w-5 h-5 accent-primary" />
            <label htmlFor="isFeatured" className="text-sm font-bold text-white cursor-pointer select-none">
              Marcar como Destacada (Aparecerá fijada en la portada del sitio web)
            </label>
          </div>

          <div className="flex gap-2 mt-4">
            <button disabled={loading} type="submit" className="flex-1 bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 transition-colors">
              {editMode ? 'GUARDAR CAMBIOS' : 'PUBLICAR NOTICIA'}
            </button>
            {editMode && (
              <button disabled={loading} type="button" onClick={cancelEdit} className="bg-secondary text-secondary-foreground font-black px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors">
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>

      {/* NEWS LIST */}
      <div>
        <h2 className="font-bold text-lg text-white mb-4">Noticias Publicadas ({initialNews.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {initialNews.map(news => (
            <div key={news.id} className={`bg-card border ${news.isFeatured ? 'border-primary' : 'border-border'} rounded-xl overflow-hidden shadow-lg flex flex-col`}>
              {news.imageUrl && (
                <div className="h-40 w-full relative">
                  <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                  {news.isFeatured && (
                    <div className="absolute top-2 right-2 bg-primary text-black font-black text-xs px-2 py-1 rounded">
                      DESTACADA
                    </div>
                  )}
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                {!news.imageUrl && news.isFeatured && (
                  <span className="text-primary text-xs font-black mb-1">DESTACADA</span>
                )}
                <h3 className="font-bold text-lg text-white mb-2">{news.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {news.content}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xs text-muted-foreground">
                    Por {news.author?.nickName || news.author?.name || 'Admin'} • {new Date(news.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(news)} disabled={loading} className="text-xs font-bold text-primary hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(news.id, news.title)} disabled={loading} className="text-xs font-bold text-destructive hover:underline">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {initialNews.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              No has publicado ninguna noticia todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
