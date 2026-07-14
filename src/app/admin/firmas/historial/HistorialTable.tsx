"use client";
import { useState } from "react";

export default function HistorialTable({ signatures }: { signatures: any[] }) {
  const [search, setSearch] = useState("");

  const filteredSignatures = signatures.filter((sig: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const nick = (sig.user?.nickName || "").toLowerCase();
    const discord = (sig.user?.name || "").toLowerCase();
    const ip = (sig.ip || "").toLowerCase();
    const fp = (sig.fingerprint || "").toLowerCase();
    return nick.includes(s) || discord.includes(s) || ip.includes(s) || fp.includes(s);
  });

  return (
    <div className="bg-secondary/20 rounded-xl border border-white/5 overflow-hidden">
      <div className="p-4 bg-black/40 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-lg text-white">Historial de Firmas ({filteredSignatures.length}/{signatures.length})</h3>
        <input 
          type="text" 
          placeholder="Buscar por nombre, IP, huella..." 
          className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-tpm-primary w-full md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/20 text-gray-400 uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3">Jugador / Discord</th>
              <th className="px-4 py-3">Sala (Partido)</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Ubicación (Idioma local)</th>
              <th className="px-4 py-3">IP Pública</th>
              <th className="px-4 py-3">Huella Única (PC)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignatures.map((sig: any) => (
              <tr key={sig.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 flex items-center gap-3">
                  <img src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/tpm_logo.png"} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{sig.user?.nickName || "Sin Nick Web"}</span>
                    <span className="text-xs text-tpm-primary">Discord: {sig.user?.name || "Desconocido"}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-white">{sig.lobby?.title}</td>
                <td className="px-4 py-4 whitespace-nowrap">{new Date(sig.createdAt).toLocaleString("es-AR")}</td>
                <td className="px-4 py-4">
                  {sig.city !== "Desconocido" ? `${sig.city}, ${sig.country}` : "Desconocido"}
                  <div className="text-xs text-gray-500 mt-1">Proveedor: {sig.isp}</div>
                  {(sig.lat !== null && sig.lon !== null && sig.lat !== undefined && sig.lon !== undefined) && (
                    <div className="text-[10px] text-gray-600 mt-1">
                      📍 Lat: {sig.lat}, Lon: {sig.lon}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-blue-300">{sig.ip}</td>
                <td className="px-4 py-4 font-mono text-xs text-emerald-300">{sig.fingerprint}</td>
              </tr>
            ))}
            {filteredSignatures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {signatures.length === 0 ? "Todavía no hay registros en la base de datos." : "No hay resultados para la búsqueda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
