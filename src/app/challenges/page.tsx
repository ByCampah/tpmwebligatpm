import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Challenges | TPM",
};

export default async function ChallengesPage() {
  const challenges = await prisma.challengeTournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { participants: true }
      },
      participants: {
        include: {
          player: true
        }
      }
    }
  });

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pt-8 pb-20">
        
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <div>
            <h1 className="text-4xl font-black text-emerald-400 uppercase tracking-wider mb-2">
              TPM Challenges
            </h1>
            <p className="text-muted-foreground">
              Torneos individuales de destreza: Free Kick, Penaltys, Shooting y Volley.
            </p>
          </div>
        </div>

        {challenges.length === 0 ? (
          <div className="bg-secondary/20 p-8 rounded-2xl text-center border border-white/5">
            <span className="text-5xl mb-4 block">🎮</span>
            <p className="text-lg font-bold text-muted-foreground">Aún no hay challenges disputados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(t => (
              <Link 
                href={`/challenges/${t.id}`} 
                key={t.id}
                className="bg-secondary/20 hover:bg-secondary/40 border border-white/5 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                  <span className="text-8xl">🎯</span>
                </div>
                <div className="z-10 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      {t.name}
                    </h3>
                    <span className="text-xs font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      {t.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <span className="font-bold">{t._count.participants}</span> Jugadores inscritos
                  </div>
                </div>
                <div className="z-10 flex gap-2 overflow-x-hidden mt-4">
                  {t.participants.slice(0, 5).map(p => (
                    <div key={p.id} className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow" title={p.player.nick}>
                      {p.player.nick.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {t.participants.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      +{t.participants.length - 5}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
