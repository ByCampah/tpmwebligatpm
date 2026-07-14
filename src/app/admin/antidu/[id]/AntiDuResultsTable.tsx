"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function AntiDuResultsTable({ results, isAdmin }: { results: any[], isAdmin: boolean }) {
  const [search, setSearch] = useState("");

  const filtered = results.filter(r => {
    const s = search.toLowerCase();
    const nick = (r.nick || "").toLowerCase();
    const discord = (r.discord || "").toLowerCase();
    const ip = (r.ip || "").toLowerCase();
    const fp = (r.fingerprint || "").toLowerCase();
    return nick.includes(s) || discord.includes(s) || ip.includes(s) || fp.includes(s);
  });

  return (
    <div className="bg-secondary/20 p-6 rounded-xl border border-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="font-bold text-xl text-white">Resultados de Pruebas</h2>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, discord..." 
            className="pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-red-500 w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-sm text-gray-400">
              <th className="px-4 py-3 font-medium">Jugador</th>
              {isAdmin && <th className="px-4 py-3 font-medium">Datos Técnicos</th>}
              <th className="px-4 py-3 font-medium text-right">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-white text-base">{r.nick}</div>
                  {r.discord && <div className="text-xs text-blue-400">Discord: {r.discord}</div>}
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                </td>
                
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-400">IP: {r.ip}</div>
                    <div className="font-mono text-xs text-gray-400">Huella: {r.fingerprint}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{r.city ? `${r.city}, ${r.country}` : "Ubicación oculta"}</div>
                  </td>
                )}
                
                <td className="px-4 py-3 text-right">
                  {r.status === "OK" ? (
                    <span className="bg-green-500/20 text-green-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-500/20">
                      OK
                    </span>
                  ) : (
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-500/20 animate-pulse">
                      POSIBLE DU
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 3 : 2} className="px-4 py-8 text-center text-gray-500 italic">
                  No hay resultados que mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
