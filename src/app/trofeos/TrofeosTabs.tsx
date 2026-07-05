"use client";

import { useState } from "react";
import TrofeosView from "./TrofeosView";
import TrofeosJugadoresView from "./TrofeosJugadoresView";

export default function TrofeosTabs({ teams, players, dictionary }: { teams: any[], players: any[], dictionary: any }) {
  const [typeTab, setTypeTab] = useState<"oficiales" | "extras">("oficiales");
  const [entityTab, setEntityTab] = useState<"equipos" | "jugadores">("equipos");

  return (
    <div className="flex flex-col gap-8">
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
