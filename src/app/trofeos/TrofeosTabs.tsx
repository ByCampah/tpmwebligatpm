"use client";

import { useState } from "react";
import TrofeosView from "./TrofeosView";
import TrofeosJugadoresView from "./TrofeosJugadoresView";

export default function TrofeosTabs({ teams, players, dictionary }: { teams: any[], players: any[], dictionary: any }) {
  const [activeTab, setActiveTab] = useState<"equipos" | "jugadores">("equipos");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("equipos")}
          className={`font-bold pb-2 text-lg px-2 transition-colors ${activeTab === "equipos" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}
        >
          Equipos
        </button>
        <button
          onClick={() => setActiveTab("jugadores")}
          className={`font-bold pb-2 text-lg px-2 transition-colors ${activeTab === "jugadores" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}
        >
          Jugadores
        </button>
      </div>

      {activeTab === "equipos" ? (
        <TrofeosView teams={teams} dictionary={dictionary} />
      ) : (
        <TrofeosJugadoresView players={players} dictionary={dictionary} />
      )}
    </div>
  );
}
