import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import ChallengeDetailClient from "./ChallengeDetailClient";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const challenge = await prisma.challengeTournament.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: {
          player: true
        }
      },
      trophies: {
        include: {
          player: true
        }
      }
    }
  });

  if (!challenge) return notFound();

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pt-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6 relative">
          <div className="z-10">
            <Link href="/challenges" className="text-muted-foreground hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-4">
              <span>←</span> Volver a Challenges
            </Link>
            <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
              {challenge.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded">
                {challenge.type}
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {challenge.participants.length} Participantes
              </span>
            </div>
          </div>
          
          {/* Trophies Podium if available */}
          <div className="flex gap-4 z-10 bg-black/40 p-4 rounded-xl border border-white/5">
            {challenge.trophies.filter(t => t.name.includes("2do")).map(t => (
              <div key={t.id} className="flex flex-col items-center gap-2 text-center" title="Segundo Puesto">
                <span className="text-3xl drop-shadow-md">🥈</span>
                <Link href={`/jugadores/${t.player?.id}`} className="text-xs font-bold text-white hover:text-emerald-400">{t.player?.nick}</Link>
              </div>
            ))}
            {challenge.trophies.filter(t => t.name.includes("Campeón")).map(t => (
              <div key={t.id} className="flex flex-col items-center gap-2 text-center -mt-4" title="Campeón">
                <span className="text-5xl drop-shadow-lg">🥇</span>
                <Link href={`/jugadores/${t.player?.id}`} className="text-sm font-black text-yellow-400 hover:text-yellow-300">{t.player?.nick}</Link>
              </div>
            ))}
            {challenge.trophies.filter(t => t.name.includes("3er")).map(t => (
              <div key={t.id} className="flex flex-col items-center gap-2 text-center mt-2" title="Tercer Puesto">
                <span className="text-2xl drop-shadow-sm">🥉</span>
                <Link href={`/jugadores/${t.player?.id}`} className="text-xs font-bold text-white hover:text-emerald-400">{t.player?.nick}</Link>
              </div>
            ))}
          </div>
        </div>

        <ChallengeDetailClient challenge={challenge} />

      </div>
    </MainLayout>
  );
}
