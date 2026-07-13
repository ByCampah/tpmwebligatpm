"use client";

import { useState, useEffect } from "react";

export default function AdminFirmaClientCopier({ lobbyId }: { lobbyId: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/firma/${lobbyId}`);
  }, [lobbyId]);

  const copy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="bg-black/50 px-3 py-2 rounded-lg text-tpm-primary text-sm font-mono select-all">
        {url || "Cargando link..."}
      </code>
      <button 
        onClick={copy}
        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
