"use client";

import { useState } from "react";
import Link from "next/link";

export default function EquiposClient({ equipos }: { equipos: any[] }) {
  const [search, setSearch] = useState("");

  const filteredEquipos = equipos.filter(equipo => 
    equipo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Buscar equipo..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-secondary/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipos.map(equipo => (
          <Link href={`/equipos/${equipo.id}`} key={equipo.id} className="group">
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:-translate-y-1">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                {equipo.logoUrl ? (
                  <img src={equipo.logoUrl} alt={equipo.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-black text-muted-foreground">{equipo.name.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-xl font-bold group-hover:text-primary transition-colors text-center truncate w-full">
                {equipo.name}
              </h2>
            </div>
          </Link>
        ))}

        {filteredEquipos.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            {equipos.length === 0 ? "Aún no hay equipos registrados." : "No se encontraron equipos con esa búsqueda."}
          </div>
        )}
      </div>
    </>
  );
}
