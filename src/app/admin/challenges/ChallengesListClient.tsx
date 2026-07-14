"use client";

import { useState } from "react";
import Link from "next/link";
import { createChallengeTournament, deleteChallengeTournament, setActiveChallenge } from "@/app/actions/challenge-actions";

export default function ChallengesListClient({ initialChallenges }: { initialChallenges: any[] }) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("SHOOTING");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await createChallengeTournament({ name, type });
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este challenge?")) return;
    setLoading(true);
    const res = await deleteChallengeTournament(id);
    setLoading(false);
    if (res.success) {
      setChallenges(challenges.filter(c => c.id !== id));
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleSetActive = async (id: string) => {
    setLoading(true);
    const res = await setActiveChallenge(id);
    setLoading(false);
    if (res.success) {
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-primary mb-4">Crear Nuevo Challenge</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Ej: Shooting T1" 
            className="flex-1 bg-black border border-border p-3 rounded focus:outline-none focus:border-primary"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <select 
            className="bg-black border border-border p-3 rounded focus:outline-none focus:border-primary"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="SHOOTING">Shooting</option>
            <option value="FREE_KICK">Free Kick</option>
            <option value="PENALTYS">Penaltys</option>
            <option value="VOLLEY">Volley</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded hover:bg-primary/90 transition-colors"
          >
            Crear Challenge
          </button>
        </form>
      </div>

      <div className="bg-secondary/30 p-6 rounded-xl border border-border">
        <h2 className="font-bold text-lg text-white mb-4">Lista de Challenges</h2>
        {challenges.length === 0 ? (
          <p className="text-muted-foreground italic">No hay challenges creados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((t) => (
              <div key={t.id} className="bg-card border border-border p-5 rounded-xl shadow flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl">🏆</span>
                </div>
                
                <div className="z-10">
                  <h3 className="font-black text-xl flex items-center gap-2">
                    <span className={t.isActiveChallenge ? "text-primary" : "text-white"}>{t.name}</span>
                    {t.isActiveChallenge && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        ACTIVO
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Tipo: <span className="font-bold text-white">{t.type}</span></p>
                  <p className="text-sm text-muted-foreground">Estado: {t.status}</p>
                  <p className="text-xs text-muted-foreground mt-2">{t._count.participants} Participantes</p>
                </div>

                <div className="mt-auto flex flex-col gap-2 z-10 pt-4 border-t border-white/5">
                  {!t.isActiveChallenge && (
                    <button 
                      onClick={() => handleSetActive(t.id)}
                      disabled={loading}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-center py-2 rounded text-sm font-bold transition-colors"
                    >
                      Marcar como Activo
                    </button>
                  )}
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/challenges/${t.id}`}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-center py-2 rounded text-sm font-bold text-white transition-colors"
                    >
                      Gestionar
                    </Link>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="bg-destructive/20 hover:bg-destructive/40 text-destructive px-3 rounded text-sm font-bold transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
