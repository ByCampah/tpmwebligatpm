"use client";

import { useState, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";

export default function NationalTeamGraphicModal({ isOpen, onClose, team, players, allClubs }: { isOpen: boolean, onClose: () => void, team: any, players: any[], allClubs: any[] }) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showDiscord, setShowDiscord] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual players state
  const [manualPlayers, setManualPlayers] = useState<any[]>([]);
  const [newManualNick, setNewManualNick] = useState("");

  // Appearance state
  const [layoutMode, setLayoutMode] = useState<"grupos" | "lista">("grupos");
  const [bgMode, setBgMode] = useState<"logo" | "color" | "image">("logo");
  const [bgColor, setBgColor] = useState("#082226");
  const [bgUrl, setBgUrl] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(1920);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [titleSize, setTitleSize] = useState(100);
  const [playerSize, setPlayerSize] = useState(100);
  const [clubLogoSize, setClubLogoSize] = useState(100);
  const [logoSize, setLogoSize] = useState(100);

  const graphicRef = useRef<HTMLDivElement>(null);

  const LOCAL_STORAGE_KEY = `tpm_nt_graphic_${team?.id || "default"}`;
  
  // New States
  const [order, setOrder] = useState<string[]>([]);
  const [listPrefixType, setListPrefixType] = useState<"numbers" | "dash" | "none" | "custom">("numbers");
  const [customPrefix, setCustomPrefix] = useState("-");
  const [clubSearch, setClubSearch] = useState<Record<string, string>>({}); // Search text per player

  useEffect(() => {
    // Load from local storage on mount
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.manualPlayers) setManualPlayers(parsed.manualPlayers);
        if (parsed.order) setOrder(parsed.order);
        if (parsed.listPrefixType) setListPrefixType(parsed.listPrefixType);
        if (parsed.customPrefix) setCustomPrefix(parsed.customPrefix);
        
        // Merge new players that aren't in config
        const newConf = { ...parsed.config };
        const newOrder = [...parsed.order];
        let changed = false;
        players.forEach(p => {
          if (!newConf[p.id]) {
            newConf[p.id] = {
              group: "ALAS",
              customText: p.primaryPosition && p.primaryPosition !== "Ninguna" ? p.primaryPosition : "",
              clubId: "",
              posColor: "cyan"
            };
            changed = true;
          }
          if (!newOrder.includes(p.id)) {
            newOrder.push(p.id);
            changed = true;
          }
        });
        if (changed) {
          setConfig(newConf);
          setOrder(newOrder);
        }
        return;
      }
    } catch (e) { console.error("Error loading graphic config", e); }

    // Fallback: Initialize default config if no local storage
    const initialConfig: Record<string, any> = {};
    const initialOrder: string[] = [];
    players.forEach(p => {
      initialConfig[p.id] = {
        group: "ALAS", // Default group
        customText: p.primaryPosition && p.primaryPosition !== "Ninguna" ? p.primaryPosition : "",
        clubId: "",
        posColor: "cyan"
      };
      initialOrder.push(p.id);
    });
    setConfig(initialConfig);
    setOrder(initialOrder);
  }, [players, team]);

  // Save to local storage whenever relevant state changes
  useEffect(() => {
    if (Object.keys(config).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        config,
        manualPlayers,
        order,
        listPrefixType,
        customPrefix
      }));
    }
  }, [config, manualPlayers, order, listPrefixType, customPrefix, LOCAL_STORAGE_KEY]);

  if (!isOpen) return null;

  const updatePlayer = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };
  
  const addManualPlayer = () => {
    if (!newManualNick.trim()) return;
    const newId = `manual-${Date.now()}`;
    setManualPlayers(prev => [...prev, { id: newId, nick: newManualNick.trim() }]);
    setConfig(prev => ({
      ...prev,
      [newId]: {
        group: "ALAS",
        customText: "",
        clubId: "",
        posColor: "cyan"
      }
    }));
    setOrder(prev => [...prev, newId]);
    setNewManualNick("");
  };
  
  const removeManualPlayer = (id: string) => {
    setManualPlayers(prev => prev.filter(p => p.id !== id));
    setConfig(prev => {
      const newConf = { ...prev };
      delete newConf[id];
      return newConf;
    });
    setOrder(prev => prev.filter(pid => pid !== id));
  };
  
  const movePlayer = (id: string, dir: -1 | 1) => {
    setOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      if (dir === -1 && idx === 0) return prev;
      if (dir === 1 && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const temp = newArr[idx];
      newArr[idx] = newArr[idx + dir];
      newArr[idx + dir] = temp;
      return newArr;
    });
  };

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setIsGenerating(true);
    
    try {
      const dataUrl = await htmlToImage.toPng(graphicRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: bgMode === "color" || bgMode === "logo" ? bgColor : "#000000",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left"
        }
      });
      
      const link = document.createElement("a");
      link.download = `convocatoria_${team.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image", err);
      alert("Hubo un error al generar la imagen. Asegúrate de que las URLs de imágenes (si usas una propia) permitan CORS.");
    } finally {
      setIsGenerating(false);
    }
  };

  const allRenderPlayers = [...players, ...manualPlayers].sort((a, b) => {
    const idxA = order.indexOf(a.id);
    const idxB = order.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Group players
  const gk = allRenderPlayers.filter(p => config[p.id]?.group === "GK");
  const def = allRenderPlayers.filter(p => config[p.id]?.group === "DEF");
  const mid = allRenderPlayers.filter(p => config[p.id]?.group === "ALAS");
  const atk = allRenderPlayers.filter(p => config[p.id]?.group === "ATK");

  const PlayerRow = ({ p, index }: { p: any, index: number }) => {
    const pConf = config[p.id] || {};
    const club = allClubs.find(c => c.id === pConf.clubId);
    
    let prefixText = "";
    if (listPrefixType === "numbers") prefixText = `${index + 1} -`;
    else if (listPrefixType === "dash") prefixText = "-";
    else if (listPrefixType === "custom") prefixText = customPrefix;
    
    // Fallback if positions is missing but customText exists
    const posArray: string[] = pConf.positions || (pConf.customText ? [pConf.customText] : []);
    
    const getPosColor = (pos: string) => {
      if (pos === "GK") return "#eab308";
      if (pos === "DEF") return "#3b82f6";
      if (pos === "ALA") return "#22c55e";
      if (pos === "ATK") return "#ef4444";
      return "#00d0e6";
    };
    
    return (
      <div className="flex items-center gap-2 mb-2">
        {prefixText && <span className="font-bold w-12" style={{ color: "#00d0e6", fontSize: `${36 * (playerSize / 100)}px`, lineHeight: 1 }}>{prefixText}</span>}
        {club && club.logoUrl && <img src={club.logoUrl} className="object-contain" style={{ width: `${48 * (clubLogoSize / 100)}px`, height: `${48 * (clubLogoSize / 100)}px` }} alt="club" />}
        <span className="text-white font-bold uppercase tracking-wide" style={{ fontSize: `${36 * (playerSize / 100)}px`, lineHeight: 1 }}>
          {p.nick} {showDiscord && p.user?.name && <span className="text-white/50 lowercase font-normal ml-1" style={{ fontSize: `${24 * (playerSize / 100)}px` }}>(@{p.user.name})</span>}
        </span>
        {posArray.length > 0 && (
          <span className="ml-4 font-bold" style={{ fontSize: `${24 * (playerSize / 100)}px` }}>
            <span style={{ color: "#00d0e6" }}>[</span>
            {posArray.map((pos, i) => (
              <span key={i}>
                <span style={{ color: getPosColor(pos) }}>{pos}</span>
                {i < posArray.length - 1 && <span style={{ color: "#00d0e6" }}> - </span>}
              </span>
            ))}
            <span style={{ color: "#00d0e6" }}>]</span>
          </span>
        )}
      </div>
    );
  };
  
  const renderEditorCard = (p: any, isManual: boolean) => {
    const filteredClubs = allClubs.filter(c => !clubSearch[p.id] || c.name.toLowerCase().includes(clubSearch[p.id].toLowerCase()));
    const currentIndex = order.indexOf(p.id);
    
    return (
      <div key={p.id} className="bg-black/40 border border-border p-3 rounded-lg flex flex-col gap-3 relative">
        <div className="flex justify-between items-center pr-8">
          <div className="font-bold text-white text-lg">
            {p.nick} {isManual && <span className="text-xs bg-primary/20 text-primary px-1 rounded ml-2 uppercase">Manual</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => movePlayer(p.id, -1)} disabled={currentIndex <= 0} className="text-muted-foreground hover:text-white disabled:opacity-20 px-1 bg-white/5 rounded">↑</button>
            <button onClick={() => movePlayer(p.id, 1)} disabled={currentIndex >= allRenderPlayers.length - 1} className="text-muted-foreground hover:text-white disabled:opacity-20 px-1 bg-white/5 rounded">↓</button>
          </div>
        </div>
        {isManual && (
          <button onClick={() => removeManualPlayer(p.id)} className="absolute top-3 right-3 text-destructive hover:text-red-400 font-bold text-xl">✕</button>
        )}
        
        {layoutMode === "grupos" && (
          <div>
            <label className="text-xs text-muted-foreground font-bold mb-1 block">Grupo</label>
            <select 
              value={config[p.id]?.group || "ALAS"} 
              onChange={e => updatePlayer(p.id, "group", e.target.value)}
              className="w-full bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none"
            >
              <option value="GK">Arqueros</option>
              <option value="DEF">Defensores</option>
              <option value="ALAS">Mediocampistas</option>
              <option value="ATK">Delanteros</option>
            </select>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs text-muted-foreground font-bold mb-1 block">Posiciones (Multicolor)</label>
              <div className="grid grid-cols-2 gap-1 text-xs font-bold bg-black/30 p-2 rounded border border-border">
                {["GK", "DEF", "ALA", "ATK"].map(pos => {
                  const currentPositions: string[] = config[p.id]?.positions || (config[p.id]?.customText ? [config[p.id].customText] : []);
                  const isChecked = currentPositions.includes(pos);
                  return (
                    <label key={pos} className={`flex items-center gap-2 p-1 rounded cursor-pointer ${isChecked ? "bg-primary/20 text-white" : "text-muted-foreground hover:bg-secondary"}`}>
                      <input 
                        type="checkbox" 
                        className="rounded bg-secondary border-border"
                        checked={isChecked}
                        onChange={(e) => {
                          const newPositions = e.target.checked 
                            ? [...currentPositions, pos] 
                            : currentPositions.filter(p => p !== pos);
                          updatePlayer(p.id, "positions", newPositions);
                          updatePlayer(p.id, "customText", ""); // Clear legacy field
                        }}
                      />
                      {pos}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs text-muted-foreground font-bold mb-1 block">Buscar Club</label>
              <input 
                type="text" 
                placeholder="Ej: Boca" 
                value={clubSearch[p.id] || ""}
                onChange={e => setClubSearch(prev => ({ ...prev, [p.id]: e.target.value }))}
                className="w-full bg-secondary border border-border rounded p-1 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-bold mb-1 block">Club (Escudo)</label>
              <select 
                  value={config[p.id]?.clubId || ""} 
                  onChange={e => updatePlayer(p.id, "clubId", e.target.value)}
                  className="w-full bg-secondary border border-border rounded p-1 text-sm text-white focus:outline-none"
                >
                  <option value="">-- Sin club --</option>
                  {filteredClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Divide players into 3 columns for "lista" layout
  const cols = [[], [], []] as any[][];
  allRenderPlayers.forEach((p, i) => {
    cols[i % 3].push(p);
  });

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex flex-col md:flex-row overflow-hidden">
      {/* Editor Sidebar */}
      <div className="w-full md:w-[400px] bg-card border-r border-border h-full flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="font-bold text-lg text-white">Configurar Gráfica</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white text-xl">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-primary uppercase">Apariencia</h3>
            
            <div className="bg-secondary/20 p-4 rounded-lg border border-border flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-bold mb-1 block">Modo de Layout</label>
                <div className="flex gap-2">
                  <button onClick={() => setLayoutMode("grupos")} className={`flex-1 p-2 rounded text-sm font-bold border transition-colors ${layoutMode === "grupos" ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-white hover:bg-secondary/80"}`}>
                    Por Grupos
                  </button>
                  <button onClick={() => setLayoutMode("lista")} className={`flex-1 p-2 rounded text-sm font-bold border transition-colors ${layoutMode === "lista" ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-white hover:bg-secondary/80"}`}>
                    Por Lista
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground font-bold mb-1 block">Prefijo de Lista</label>
                <select 
                  value={listPrefixType} 
                  onChange={e => setListPrefixType(e.target.value as any)}
                  className="w-full bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none mb-2"
                >
                  <option value="numbers">Números (1 - 2 -)</option>
                  <option value="dash">Guiones (-)</option>
                  <option value="none">Sin Prefijo</option>
                  <option value="custom">Personalizado...</option>
                </select>
                {listPrefixType === "custom" && (
                  <input 
                    type="text" 
                    value={customPrefix}
                    onChange={e => setCustomPrefix(e.target.value)}
                    placeholder="Ej: #"
                    className="w-full bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground font-bold mb-1 block">Fondo</label>
                <select 
                  value={bgMode} 
                  onChange={e => setBgMode(e.target.value as any)}
                  className="w-full bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none mb-2"
                >
                  <option value="logo">Escudo del Equipo</option>
                  <option value="color">Color Sólido</option>
                  <option value="image">Imagen Personalizada (URL)</option>
                </select>
                
                {(bgMode === "logo" || bgMode === "color") && (
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <span className="text-xs text-muted-foreground">Color Base</span>
                  </div>
                )}
                
                {bgMode === "image" && (
                  <input 
                    type="text" 
                    placeholder="https://ejemplo.com/fondo.jpg" 
                    value={bgUrl}
                    onChange={e => setBgUrl(e.target.value)}
                    className="w-full bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Ancho Canvas (px)</label>
                  <input type="number" value={canvasWidth} onChange={e => setCanvasWidth(Number(e.target.value))} className="w-full bg-secondary border border-border rounded p-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Alto Canvas (px)</label>
                  <input type="number" value={canvasHeight} onChange={e => setCanvasHeight(Number(e.target.value))} className="w-full bg-secondary border border-border rounded p-2 text-sm text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Tamaño Títulos ({titleSize}%)</label>
                  <input type="range" min="50" max="250" value={titleSize} onChange={e => setTitleSize(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Tamaño Jugadores ({playerSize}%)</label>
                  <input type="range" min="50" max="250" value={playerSize} onChange={e => setPlayerSize(Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Logos Clubes ({clubLogoSize}%)</label>
                  <input type="range" min="50" max="250" value={clubLogoSize} onChange={e => setClubLogoSize(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold mb-1 block">Logos Inferiores ({logoSize}%)</label>
                  <input type="range" min="50" max="250" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-border/50">
                <input type="checkbox" checked={showDiscord} onChange={e => setShowDiscord(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="font-bold text-sm">Mostrar Tag de Discord</span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-primary uppercase">Agregar Jugador Manual</h3>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Nickname del jugador..."
                value={newManualNick}
                onChange={e => setNewManualNick(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter') addManualPlayer(); }}
                className="flex-1 bg-secondary border border-border rounded p-2 text-sm text-white focus:outline-none"
              />
              <button 
                onClick={addManualPlayer}
                className="bg-primary text-primary-foreground font-bold px-4 rounded text-sm hover:bg-primary/80"
              >
                Añadir
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-primary uppercase">Jugadores ({allRenderPlayers.length})</h3>
            {allRenderPlayers.map(p => renderEditorCard(p, manualPlayers.some(mp => mp.id === p.id)))}
          </div>
        </div>
        
        <div className="p-4 border-t border-border bg-card">
          <button 
            disabled={isGenerating}
            onClick={handleDownload}
            className="w-full bg-primary text-primary-foreground font-black py-3 rounded-lg hover:bg-primary/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {isGenerating ? "GENERANDO..." : "DESCARGAR IMAGEN"}
          </button>
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="flex-1 bg-black/95 p-4 flex items-center justify-center overflow-auto">
        {/* The Graphic - Fixed size for consistent rendering */}
        <div 
          className="relative overflow-hidden shrink-0 shadow-2xl" 
          style={{ 
            width: `${canvasWidth}px`, 
            height: `${canvasHeight}px`, 
            transform: `scale(${Math.min(1000 / canvasWidth, 700 / canvasHeight, 0.45)})`, 
            transformOrigin: "center center", 
            backgroundColor: bgMode === "color" || bgMode === "logo" ? bgColor : "#000000" 
          }}
          ref={graphicRef}
        >
          {/* Background Elements */}
          {bgMode === "logo" && team.logoUrl && (
            <img 
              src={team.logoUrl} 
              alt="Background" 
              className="absolute inset-0 m-auto w-[1600px] h-[1600px] object-contain opacity-10" 
              style={{ filter: "blur(2px)", transform: "scale(1.2)" }}
            />
          )}
          
          {bgMode === "image" && bgUrl && (
            <img 
              src={bgUrl} 
              crossOrigin="anonymous"
              alt="Background Image" 
              className="absolute inset-0 w-full h-full object-cover opacity-60" 
            />
          )}
          
          {/* Content Wrapper */}
          <div className="relative z-10 w-full h-full flex flex-col p-[100px] pt-[80px]">
            
            {/* Headers */}
            <div className="flex flex-col items-center mb-16">
              <div className="bg-black/30 border border-[#00d0e6]/30 px-12 py-4 mb-4" style={{ transform: "skewX(-10deg)" }}>
                <h1 className="font-black text-[#00d0e6] uppercase tracking-tighter" style={{ fontSize: `${90 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>
                  SELECCION {team.name} TPM
                </h1>
              </div>
              <div className="bg-[#00d0e6] px-10 py-3" style={{ transform: "skewX(-10deg)" }}>
                <h2 className="font-black text-black uppercase tracking-tight" style={{ fontSize: `${60 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>
                  CONVOCADOS PARA {team.name}
                </h2>
              </div>
            </div>
            
            {/* Columns */}
            {layoutMode === "grupos" ? (
              <div className="flex-1 grid grid-cols-3 gap-16 px-16">
                
                {/* Column 1: GK + ZAG */}
                <div className="flex flex-col gap-12">
                  <div>
                    <div className="bg-[#00d0e6] px-6 py-2 mb-6 w-fit" style={{ transform: "skewX(-10deg)" }}>
                      <h3 className="font-black text-black tracking-tight" style={{ fontSize: `${48 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>GK/ARQUEROS</h3>
                    </div>
                    <div className="flex flex-col gap-6 ml-4">
                      {gk.map((p, i) => <PlayerRow key={p.id} p={p} index={i} />)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-[#00d0e6] px-6 py-2 mb-6 w-fit" style={{ transform: "skewX(-10deg)" }}>
                      <h3 className="font-black text-black tracking-tight" style={{ fontSize: `${48 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>ZAGUEROS/DEFENSORES</h3>
                    </div>
                    <div className="flex flex-col gap-6 ml-4">
                      {def.map((p, i) => <PlayerRow key={p.id} p={p} index={gk.length + i} />)}
                    </div>
                  </div>
                </div>
                
                {/* Column 2: ALAS */}
                <div className="flex flex-col">
                  <div className="bg-[#00d0e6] px-6 py-2 mb-6 w-fit" style={{ transform: "skewX(-10deg)" }}>
                    <h3 className="font-black text-black tracking-tight" style={{ fontSize: `${48 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>ALAS/MEDIOCAMPISTAS</h3>
                  </div>
                  <div className="flex flex-col gap-6 ml-4">
                    {mid.map((p, i) => <PlayerRow key={p.id} p={p} index={gk.length + def.length + i} />)}
                  </div>
                </div>
                
                {/* Column 3: ATK */}
                <div className="flex flex-col">
                  <div className="bg-[#00d0e6] px-6 py-2 mb-6 w-fit" style={{ transform: "skewX(-10deg)" }}>
                    <h3 className="font-black text-black tracking-tight" style={{ fontSize: `${48 * (titleSize / 100)}px`, transform: "skewX(10deg)" }}>ATK/DELANTEROS</h3>
                  </div>
                  <div className="flex flex-col gap-6 ml-4">
                    {atk.map((p, i) => <PlayerRow key={p.id} p={p} index={gk.length + def.length + mid.length + i} />)}
                  </div>
                </div>
                
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-3 gap-16 px-16">
                <div className="flex flex-col gap-6">
                  {cols[0].map((p, i) => <PlayerRow key={p.id} p={p} index={i} />)}
                </div>
                <div className="flex flex-col gap-6">
                  {cols[1].map((p, i) => <PlayerRow key={p.id} p={p} index={cols[0].length + i} />)}
                </div>
                <div className="flex flex-col gap-6">
                  {cols[2].map((p, i) => <PlayerRow key={p.id} p={p} index={cols[0].length + cols[1].length + i} />)}
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="absolute bottom-[40px] left-[60px] flex items-center">
              <span 
                className="font-black text-4xl tracking-[0.2em] uppercase"
                style={{ 
                  color: "#00d0e6",
                  textShadow: "0 0 10px rgba(0,208,230,0.8), 0 0 20px rgba(0,208,230,0.4)"
                }}
              >
                LIGA TPM SUDAMERICA
              </span>
            </div>
            
            <div className="absolute bottom-[40px] right-[60px] flex items-center gap-6">
              <img src="/img/logos/LogoTPM.png" className="object-contain" style={{ height: `${128 * (logoSize / 100)}px` }} alt="TPM" />
              <img src="/img/logos/ByCampah3.png" className="object-contain opacity-80" style={{ height: `${96 * (logoSize / 100)}px` }} alt="ByCampah" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
