"use client";

import { useState, useEffect } from "react";

interface ImageSelectorProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageSelector({ onSelect, onClose }: ImageSelectorProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images/clubes");
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  const filteredImages = images.filter(img => img.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-black/40">
          <div>
            <h2 className="text-xl font-black text-primary">Galería de Escudos</h2>
            <p className="text-sm text-muted-foreground">Selecciona una imagen de la galería</p>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-white p-2 bg-secondary rounded-lg transition-colors"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <input 
            type="text" 
            placeholder="🔍 Buscar escudo por nombre (ej: almagro)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse font-bold">Cargando galería...</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-bold">No se encontraron imágenes.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((img, idx) => {
                const filename = img.split('/').pop() || img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelect(img)}
                    className="group flex flex-col items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-transparent hover:border-primary hover:bg-primary/10 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="w-20 h-20 relative flex items-center justify-center">
                      <img src={img} alt={filename} className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center group-hover:text-primary transition-colors">
                      {filename}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
