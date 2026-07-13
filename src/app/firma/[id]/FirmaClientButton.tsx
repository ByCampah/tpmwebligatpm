"use client";

import { useState } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";

export default function FirmaClientButton({ lobbyId }: { lobbyId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSign = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Get Fingerprint
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      // 2. Call API
      const res = await fetch("/api/firma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobbyId, fingerprint: visitorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al firmar");
      }

      // 3. Reload to show Success UI from Server Component
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleSign}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Firmando..." : "FIRMAR ASISTENCIA"}
      </button>
      {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
    </div>
  );
}
