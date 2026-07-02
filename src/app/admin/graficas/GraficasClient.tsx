"use client";

import { useState } from "react";

export default function GraficasClient({ teams, players, tournaments }: { teams: any[], players: any[], tournaments: any[] }) {
  const [activeTab, setActiveTab] = useState<"JUGADOR" | "ESTADISTICAS" | "PARTIDO">("PARTIDO");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const [partidoLocalName, setPartidoLocalName] = useState("");
  const [partidoVisitanteName, setPartidoVisitanteName] = useState("");
  const [partidoTorneo, setPartidoTorneo] = useState("");
  const [partidoFecha, setPartidoFecha] = useState("");

  const [estadisticasTorneoId, setEstadisticasTorneoId] = useState("");

  const [jugadorNick, setJugadorNick] = useState("");

  const handleGeneratePartido = (e: any) => {
    e.preventDefault();
    const local = partidoLocalName;
    const visitante = partidoVisitanteName;
    
    if (!local || !visitante || !partidoTorneo || !partidoFecha) {
      alert("Completá todos los campos.");
      return;
    }

    const url = `/api/og/partido?local=${encodeURIComponent(local)}&visitante=${encodeURIComponent(visitante)}&torneo=${encodeURIComponent(partidoTorneo)}&fecha=${encodeURIComponent(partidoFecha)}`;
    setGeneratedUrl(url);
  };

  const handleGenerateEstadisticas = (e: any) => {
    e.preventDefault();
    const url = estadisticasTorneoId ? `/api/og/estadisticas?tournamentId=${estadisticasTorneoId}` : `/api/og/estadisticas`;
    setGeneratedUrl(url);
  };

  const handleGenerateJugador = (e: any) => {
    e.preventDefault();
    if (!jugadorNick) {
      alert("Seleccioná un jugador.");
      return;
    }
    setGeneratedUrl(`/api/og/jugador?nick=${encodeURIComponent(jugadorNick)}`);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* TABS MENU */}
      <div className="flex flex-wrap border-b border-border mb-4">
        <button 
          onClick={() => { setActiveTab("PARTIDO"); setGeneratedUrl(null); }}
          className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "PARTIDO" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Match Card (Partido)
        </button>
        <button 
          onClick={() => { setActiveTab("ESTADISTICAS"); setGeneratedUrl(null); }}
          className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "ESTADISTICAS" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Top Estadísticas
        </button>
        <button 
          onClick={() => { setActiveTab("JUGADOR"); setGeneratedUrl(null); }}
          className={`flex-1 py-4 text-center font-black uppercase tracking-wider transition-colors border-b-4 ${activeTab === "JUGADOR" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Carta de Jugador
        </button>
      </div>

      {/* DATALISTS PARA BÚSQUEDA RÁPIDA */}
      <datalist id="teams-list">
        {teams.map(t => <option key={t.id} value={t.name} />)}
      </datalist>
      <datalist id="players-list">
        {players.map(p => <option key={p.id} value={p.nick} />)}
      </datalist>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* CONTROLES */}
        <div className="bg-secondary/30 p-6 rounded-xl border border-border flex flex-col gap-6">
          <h2 className="text-2xl font-black text-primary">Controles</h2>

          {activeTab === "PARTIDO" && (
            <form onSubmit={handleGeneratePartido} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Equipo Local (Buscar)</label>
                <input list="teams-list" value={partidoLocalName} onChange={e => setPartidoLocalName(e.target.value)} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Buscar local..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Equipo Visitante (Buscar)</label>
                <input list="teams-list" value={partidoVisitanteName} onChange={e => setPartidoVisitanteName(e.target.value)} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Buscar visitante..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Nombre del Torneo / Copa</label>
                <input value={partidoTorneo} onChange={e => setPartidoTorneo(e.target.value)} type="text" required placeholder="Ej: TPM Liga - Fecha 1" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Fecha / Hora del Encuentro</label>
                <input value={partidoFecha} onChange={e => setPartidoFecha(e.target.value)} type="text" required placeholder="Ej: JUEVES 23:30HS" className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_5px_20px_rgba(var(--primary),0.2)] mt-2">
                GENERAR MATCH CARD
              </button>
            </form>
          )}

          {activeTab === "ESTADISTICAS" && (
            <form onSubmit={handleGenerateEstadisticas} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Filtrar por Torneo de Temporada Activa</label>
                <select value={estadisticasTorneoId} onChange={e => setEstadisticasTorneoId(e.target.value)} className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none">
                  <option value="">-- Todos los torneos (Temporada Completa) --</option>
                  {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <p className="text-muted-foreground text-sm">
                Esta gráfica generará una imagen combinada con el Top 5 de Goleadores y el Top 5 de Asistidores del torneo elegido (o temporada completa).
              </p>
              <button type="submit" className="bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_5px_20px_rgba(var(--primary),0.2)] mt-2">
                GENERAR GRÁFICA DE ESTADÍSTICAS
              </button>
            </form>
          )}

          {activeTab === "JUGADOR" && (
            <form onSubmit={handleGenerateJugador} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Buscar Jugador</label>
                <input list="players-list" value={jugadorNick} onChange={e => setJugadorNick(e.target.value)} required className="w-full bg-black border border-border rounded p-3 focus:border-primary focus:outline-none" placeholder="Buscar por nick..." />
              </div>
              <p className="text-muted-foreground text-xs">
                Se calcularán las estadísticas de este jugador para la Temporada Activa.
              </p>
              <button type="submit" className="bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-transform hover:scale-105 shadow-[0_5px_20px_rgba(var(--primary),0.2)] mt-2">
                GENERAR CARTA DE JUGADOR
              </button>
            </form>
          )}
        </div>

        {/* VISTA PREVIA */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-black text-white w-full text-left mb-6">Vista Previa</h2>
          
          {generatedUrl ? (
            <div className="flex flex-col items-center w-full gap-6">
              <div className="w-full max-w-full overflow-hidden border border-border rounded-xl shadow-lg bg-black/50 p-2 flex justify-center">
                <img src={generatedUrl} alt="Gráfica Generada" className="max-w-full h-auto max-h-[600px] object-contain" />
              </div>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    navigator.clipboard.writeText(`${baseUrl}${generatedUrl}`);
                    alert("Enlace copiado al portapapeles.");
                  }}
                  className="flex-1 bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  COPIAR ENLACE
                </button>
                <a 
                  href={generatedUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  ABRIR EN NUEVA PESTAÑA / DESCARGAR
                </a>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-4">
              <span className="text-6xl opacity-20">🖼️</span>
              <p>Completá los datos y dale a Generar para ver la imagen aquí.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
