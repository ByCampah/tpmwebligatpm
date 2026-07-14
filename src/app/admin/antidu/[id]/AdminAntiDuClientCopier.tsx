"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminAntiDuClientCopier({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false);
  const [host] = useState(() => typeof window !== "undefined" ? window.location.origin : "");
  const url = `${host}/antidu/${sessionId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-black/50 p-1 pl-3 rounded-lg border border-white/10 w-full max-w-lg">
        <span className="text-gray-300 font-mono text-sm truncate flex-1 select-all">{url}</span>
        <button 
          onClick={copyToClipboard}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center justify-center min-w-[40px]"
          title="Copiar Link"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <Link 
        href={`/antidu/${sessionId}`} 
        target="_blank" 
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 w-fit mt-1"
      >
        <ExternalLink className="w-3 h-3" /> Abrir formulario en nueva pestaña
      </Link>
    </div>
  );
}
