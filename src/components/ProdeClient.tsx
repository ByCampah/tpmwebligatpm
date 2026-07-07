"use client";

import { useState } from "react";
import { submitProdePrediction } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProdeClient({ tournaments, userPredictions, leaderboards, userId }: any) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent, matchId: string) => {
    e.preventDefault();
    if (!userId) {
      alert("Debes iniciar sesión para participar en el PRODE");
      return;
    }

    const form = e.target as HTMLFormElement;
    const homeScore = parseInt((form.elements.namedItem("homeScore") as HTMLInputElement).value);
    const awayScore = parseInt((form.elements.namedItem("awayScore") as HTMLInputElement).value);

    if (isNaN(homeScore) || isNaN(awayScore)) return;

    setLoadingId(matchId);
    const res = await submitProdePrediction(matchId, homeScore, awayScore);
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <section className="bg-card border border-border rounded-xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-3xl font-black flex items-center gap-2">
          <span className="w-2 h-8 bg-purple-500 rounded-full inline-block shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
          PRODE Liga TPM
        </h2>
        {!userId && (
          <Link href="/auth/signin" className="text-sm bg-primary text-primary-foreground font-bold px-4 py-2 rounded-full hover:bg-primary/80 transition">
            Iniciar Sesión para Jugar
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-12 relative z-10">
        {/* LEFT COL: MATCHES */}
        <div className="md:col-span-2 flex flex-col gap-12">
          {tournaments.map((t: any) => (
            <div key={t.tournament.id}>
              <h3 className="text-xl font-bold mb-4 text-purple-400 border-b border-white/10 pb-2">{t.tournament.name}</h3>
              <div className="flex flex-col gap-4">
                {t.matches.map((m: any) => {
                  const prediction = userPredictions.find((p: any) => p.matchId === m.id);
                  const isLocked = m.prodeLocked;
                  const isLoading = loadingId === m.id;

                  return (
                    <div key={m.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition hover:border-purple-500/30">
                      
                      <div className="flex-1 flex justify-end items-center gap-3">
                        <span className="font-bold text-sm sm:text-base">{m.homeTeam.name}</span>
                        {m.homeTeam.logoUrl && <img src={m.homeTeam.logoUrl} className="h-6 object-contain" alt="" />}
                      </div>

                      <div className="flex flex-col items-center">
                        <form onSubmit={(e) => handlePredict(e, m.id)} className="flex items-center gap-2">
                          <input 
                            type="number" 
                            name="homeScore" 
                            min="0" 
                            defaultValue={prediction?.homeScore ?? ""}
                            disabled={isLocked || isLoading || !userId}
                            className="w-12 h-12 text-center text-xl font-black bg-black border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50" 
                          />
                          <span className="text-muted-foreground font-bold">-</span>
                          <input 
                            type="number" 
                            name="awayScore" 
                            min="0" 
                            defaultValue={prediction?.awayScore ?? ""}
                            disabled={isLocked || isLoading || !userId}
                            className="w-12 h-12 text-center text-xl font-black bg-black border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50" 
                          />
                          {!isLocked && userId && (
                            <button 
                              type="submit" 
                              disabled={isLoading}
                              className="ml-2 bg-purple-600 hover:bg-purple-500 text-white font-bold p-2 rounded-lg transition disabled:opacity-50 text-xs"
                            >
                              {isLoading ? "..." : "✓"}
                            </button>
                          )}
                        </form>
                        {isLocked && <span className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-wider">Cerrado</span>}
                        {prediction && !isLocked && <span className="text-[10px] text-green-400 font-bold mt-1 uppercase tracking-wider">Guardado</span>}
                        {prediction?.pointsEarned !== null && prediction?.pointsEarned !== undefined && (
                           <span className="text-xs text-yellow-500 font-bold mt-1">+{prediction.pointsEarned} pts</span>
                        )}
                      </div>

                      <div className="flex-1 flex justify-start items-center gap-3">
                        {m.awayTeam.logoUrl && <img src={m.awayTeam.logoUrl} className="h-6 object-contain" alt="" />}
                        <span className="font-bold text-sm sm:text-base">{m.awayTeam.name}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COL: LEADERBOARD */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-6 h-fit">
          <h3 className="font-black text-xl mb-6 flex items-center gap-2">
            🏆 Ranking Prode
          </h3>
          
          <div className="flex flex-col gap-8">
            {tournaments.map((t: any) => {
              const leaders = leaderboards[t.tournament.id] || [];
              if (leaders.length === 0) return null;

              return (
                <div key={`lb-${t.tournament.id}`}>
                  <h4 className="text-sm font-bold text-purple-400 mb-3">{t.tournament.name}</h4>
                  <div className="flex flex-col gap-2">
                    {leaders.map((l: any, idx: number) => (
                      <div key={l.user?.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-muted-foreground w-4">{idx + 1}</span>
                          <img src={l.user?.customAvatarUrl || l.user?.image || "https://api.dicebear.com/9.x/notionists/svg?seed=" + l.user?.id} className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
                          <span className="font-bold text-sm">{l.user?.nickName || l.user?.name}</span>
                        </div>
                        <span className="font-black text-yellow-500">{l.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {Object.keys(leaderboards).every(k => leaderboards[k].length === 0) && (
              <p className="text-sm text-muted-foreground text-center italic py-4">
                Aún no hay puntos repartidos.
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
