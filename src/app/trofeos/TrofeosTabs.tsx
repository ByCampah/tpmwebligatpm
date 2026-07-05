"use client";

import { useState } from "react";
import TrofeosView from "./TrofeosView";
import TrofeosJugadoresView from "./TrofeosJugadoresView";

export default function TrofeosTabs({ teams, players, dictionary }: { teams: any[], players: any[], dictionary: any }) {
  const [typeTab, setTypeTab] = useState<"oficiales" | "extras">("oficiales");
  const [entityTab, setEntityTab] = useState<"equipos" | "jugadores">("equipos");

  const officialTrophies = [
    { name: "Liga TPM", url: "/img/trofeos/LigaTPMNew.png" },
    { name: "Liga B TPM", url: "/img/trofeos/LigaBTPMNew.png" },
    { name: "Copa TPM", url: "/img/trofeos/CopaTPMNew.png" },
    { name: "Supercopa TPM", url: "/img/trofeos/SupercopaTPMNew.png" }
  ];

  const extraTrophies = [
    { name: "Copa de Promesas", url: "/img/trofeos/CopaDePromesasNew.png" }
  ];

  const currentTrophies = typeTab === "oficiales" ? officialTrophies : extraTrophies;

  return (
    <div className="flex flex-col gap-8">
      {/* Trophies Display */}
      <div className="bg-card border border-border shadow-md rounded-2xl p-6 flex flex-col items-center gap-6">
        <h3 className="text-xl font-black text-muted-foreground uppercase tracking-wider">
          {typeTab === "oficiales" ? "Trofeos Oficiales" : "Trofeos Extra"}
        </h3>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {currentTrophies.map(trophy => (
            <div key={trophy.name} className="flex flex-col items-center gap-3 group">
              <img 
                src={trophy.url} 
                alt={trophy.name} 
                className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.7)] group-hover:scale-110 transition-all duration-300"
              />
              <span className="font-bold text-sm md:text-base text-center">{trophy.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/30 p-2 rounded-xl">
        {/* Level 1: Oficiales / Extras */}
        <div className="flex gap-2 p-1 bg-background/50 rounded-lg">
          <button
            onClick={() => setTypeTab("oficiales")}
            className={`px-6 py-2 rounded-md font-bold transition-all ${typeTab === "oficiales" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
          >
            Torneos Oficiales
          </button>
          <button
            onClick={() => setTypeTab("extras")}
            className={`px-6 py-2 rounded-md font-bold transition-all ${typeTab === "extras" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
          >
            Torneos Extras
          </button>
        </div>

        {/* Level 2: Equipos / Jugadores */}
        <div className="flex gap-6 px-4">
          <button
            onClick={() => setEntityTab("equipos")}
            className={`font-bold pb-1 border-b-2 text-lg transition-colors ${entityTab === "equipos" ? "text-white border-primary" : "text-muted-foreground border-transparent hover:text-white"}`}
          >
            Equipos
          </button>
          <button
            onClick={() => setEntityTab("jugadores")}
            className={`font-bold pb-1 border-b-2 text-lg transition-colors ${entityTab === "jugadores" ? "text-white border-primary" : "text-muted-foreground border-transparent hover:text-white"}`}
          >
            Jugadores
          </button>
        </div>
      </div>

      {entityTab === "equipos" ? (
        <TrofeosView teams={teams} isOfficial={typeTab === "oficiales"} dictionary={dictionary} />
      ) : (
        <TrofeosJugadoresView players={players} isOfficial={typeTab === "oficiales"} dictionary={dictionary} />
      )}
    </div>
  );
}
