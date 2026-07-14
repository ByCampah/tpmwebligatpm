"use client";
import { useState } from "react";

export default function FirmaLobbyTable({ lobby, matches, isAdmin }: { lobby: any, matches: any[], isAdmin: boolean }) {
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
              {isAdmin && (
                <>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Huella de PC</th>
                </>
              )}
              <th className="px-4 py-3 text-right">Alerta DU</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignatures.map((sig: any) => {
              const isDupe = matches.find(m => m.signatureId === sig.id);
              const isDuIp = isDupe?.byIp;
              const isDuFp = isDupe?.byFingerprint;
              return (
                <tr key={sig.id} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isDupe ? 'bg-red-500/10' : ''}`}>
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/tpm_logo.png"} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{sig.user?.nickName || "Sin Nick Web"}</span>
                      <span className="text-xs text-tpm-primary">Discord: {sig.user?.name || "Desconocido"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(sig.createdAt).toLocaleString()}
                  </td>
                  {isAdmin && (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-300">{sig.country || "Desconocido"}</span>
                          <span className="text-xs text-gray-500">{sig.city || "-"}</span>
                          <span className="text-[10px] text-gray-600 mt-1" title="ISP">{sig.isp}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {sig.ip}
                          {isDuIp && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="IP Duplicada"></span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-[10px] text-gray-500 max-w-[120px] truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{sig.fingerprint}</span>
                          {isDuFp && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Huella Duplicada"></span>}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={async () => {
                            if(confirm(sig.isActive ? "¿Desactivar firma? (Dejará de contar para DU)" : "¿Activar firma?")) {
                              const { toggleSignatureActive } = await import("../actions");
                              await toggleSignatureActive(sig.id, location.pathname);
                            }
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold border transition-colors ${sig.isActive ? "text-gray-400 border-gray-600/50 hover:bg-gray-600/20" : "text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/20 bg-yellow-500/10"}`}
                        >
                          {sig.isActive ? "Desactivar" : "Inactiva"}
                        </button>

                        {isDupe && sig.isActive ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">Posible DU</span>
                          </div>
                        ) : sig.isActive ? (
                          <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">OK</span>
                        ) : (
                          <span className="bg-gray-500/20 text-gray-500 text-xs font-bold px-2 py-1 rounded">IGNORADA</span>
                        )}
                      </div>

                      {isDupe && sig.isActive && (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-red-300 max-w-[150px] text-right">Usada por: {isDupe.dupeNames.join(", ")}</span>
                          <span className="text-[9px] text-red-400 mt-0.5 font-bold uppercase text-right leading-tight">
                            Coincide por: {isDupe.byIp && "IP"} {isDupe.byIp && isDupe.byFingerprint && "y"} {isDupe.byFingerprint && "Huella (PC)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSignatures.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 3} className="px-4 py-8 text-center text-gray-500 italic">
                  No hay firmas que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
