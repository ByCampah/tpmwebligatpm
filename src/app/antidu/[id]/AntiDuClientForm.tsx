"use client";

import { useState } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function AntiDuClientForm({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [nick, setNick] = useState("");
  const [discord, setDiscord] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      setError("El Nick en el juego es obligatorio.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // 1. Get Fingerprint
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      // 2. Call API
      const res = await fetch("/api/antidu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          nick,
          discord,
          fingerprint: visitorId 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar datos");
      }

      setSuccess(true);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
        <h3 className="text-xl font-bold text-white">¡Verificación Exitosa!</h3>
        <p className="text-sm text-gray-400">Tus datos han sido registrados correctamente para este partido.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-500 p-3 rounded-lg text-sm border border-red-500/50">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="text-left">{error}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-gray-400 uppercase">Nick en el juego *</label>
        <input 
          type="text" 
          value={nick}
          onChange={e => setNick(e.target.value)}
          placeholder="Ej: xXLionelXx"
          required
          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-gray-400 uppercase">Discord ID (Opcional)</label>
        <input 
          type="text" 
          value={discord}
          onChange={e => setDiscord(e.target.value)}
          placeholder="Ej: lionel#1234"
          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full px-6 py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wider"
      >
        {loading ? "Verificando..." : "Registrar"}
      </button>
    </form>
  );
}
