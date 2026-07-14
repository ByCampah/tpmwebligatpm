"use client";
import { useState } from "react";

export default function FirmaLobbyTable({ lobby, matches }: { lobby: any, matches: any[] }) {
  const [search, setSearch] = useState("");

  const filteredSignatures = lobby.signatures.filter((sig: any) => {
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
        <h3 className="font-bold text-lg text-white">Jugadores Firmados ({filteredSignatures.length}/{lobby.signatures.length})</h3>
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
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Huella de PC</th>
              <th className="px-4 py-3 text-right">Alerta DU</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignatures.map((sig: any) => {
              const isDupe = matches.find(m => m.signatureId === sig.id);
              return (
                <tr key={sig.id} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isDupe ? 'bg-red-500/10' : ''}`}>
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/tpm_logo.png"} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{sig.user?.nickName || "Sin Nick Web"}</span>
                      <span className="text-xs text-tpm-primary">Discord: {sig.user?.name || "Desconocido"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{new Date(sig.createdAt).toLocaleTimeString("es-AR")}</td>
                  <td className="px-4 py-4">
                    {sig.city !== "Desconocido" ? `${sig.city}, ${sig.country}` : "Desconocido"}
                    {sig.zip && <span className="ml-1 text-gray-400">({sig.zip})</span>}
                    <div className="text-xs text-gray-500">{sig.isp}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(sig.lat !== null && sig.lon !== null && sig.lat !== undefined && sig.lon !== undefined) && (
                        <div className="text-[10px] text-gray-600 bg-black/30 px-1.5 py-0.5 rounded">
                          📍 {sig.lat}, {sig.lon}
                        </div>
                      )}
                      {(sig.isProxy || sig.isHosting) && (
                        <div className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          🛡️ VPN / PROXY
                        </div>
                      )}
                      {sig.isMobile && (
                        <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          📱 DATOS MÓVILES
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{sig.ip}</td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{sig.fingerprint}</td>
                  <td className="px-4 py-4 text-right">
                    {isDupe ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">Posible DU</span>
                        <span className="text-[10px] text-red-300 mt-1 max-w-[150px] text-right">Usada por: {isDupe.dupeNames.join(", ")}</span>
                        <span className="text-[9px] text-red-400 mt-0.5 font-bold uppercase text-right leading-tight">
                          Coincide por: {isDupe.byIp && "IP"} {isDupe.byIp && isDupe.byFingerprint && "y"} {isDupe.byFingerprint && "Huella (PC)"}
                        </span>
                      </div>
                    ) : (
                      <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">OK</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredSignatures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {lobby.signatures.length === 0 ? "Todavía nadie ha firmado en esta sala." : "No hay resultados para la búsqueda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
