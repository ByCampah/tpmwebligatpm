"use client";
import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

export default function FirmaLobbyGraficador({ lobby, matches }: { lobby: any, matches: any[] }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [showDiscord, setShowDiscord] = useState(false);

  // Filter out inactive signatures so they don't appear in the image
  const activeSignatures = lobby.signatures.filter((s: any) => s.isActive);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(printRef.current, {
        quality: 1,
        backgroundColor: '#0a0a0a', // match app background
      });
      const link = document.createElement("a");
      link.download = `Firmas_${lobby.title.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen", err);
      alert("Hubo un error al generar la imagen");
    }
  };

  if (activeSignatures.length === 0) return null;

  return (
    <div className="bg-secondary/20 p-6 rounded-xl border border-white/5 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-white">Exportar Firmas (Gráfico)</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded bg-black/50 border-white/10 text-tpm-primary focus:ring-tpm-primary"
              checked={showDiscord}
              onChange={e => setShowDiscord(e.target.checked)}
            />
            Incluir Discord
          </label>
          <button 
            onClick={handleDownload}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Descargar Imagen
          </button>
        </div>
      </div>
      
      {/* Container to export */}
      <div className="overflow-hidden rounded-xl border border-white/10 w-fit">
        <div ref={printRef} className="bg-[#0a0a0a] p-8 w-[500px] flex flex-col gap-6 relative">
          {/* Watermark / Logo background */}
          <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
            <img src="/img/logos/LogoTPM.png" className="w-32 h-32" alt="" crossOrigin="anonymous" />
          </div>

          <div className="z-10 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black text-white">{lobby.title}</h2>
            <p className="text-tpm-primary font-bold text-sm">REPORTE DE ASISTENCIA Y ANTI-DU</p>
          </div>

          <div className="z-10 flex flex-col gap-3">
            {activeSignatures.map((sig: any) => {
              const isDupe = matches.find((m: any) => m.signatureId === sig.id);
              return (
                <div key={sig.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={sig.user?.customAvatarUrl || sig.user?.image || "/img/logos/LogoTPM.png"} 
                      className="w-8 h-8 rounded-full border border-white/20 object-cover" 
                      crossOrigin="anonymous"
                      alt="" 
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{sig.user?.nickName || sig.user?.name || "Sin Nombre"}</span>
                      {showDiscord && <span className="text-[10px] text-gray-400">@{sig.user?.name}</span>}
                    </div>
                  </div>
                  <div>
                    {isDupe ? (
                      <span className="bg-red-500/20 text-red-500 font-black text-xs px-2 py-1 rounded">POSIBLE DU</span>
                    ) : (
                      <span className="bg-green-500/20 text-green-500 font-bold text-xs px-2 py-1 rounded">OK</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="z-10 pt-4 mt-2 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
            <span>Generado automáticamente</span>
            <span>ligatpm.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
