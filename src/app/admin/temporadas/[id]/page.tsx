import { prisma } from "@/lib/prisma";
import TournamentClient from "./TournamentClient";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import React from "react";

export const dynamic = 'force-dynamic';

export default async function AdminTournamentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const userRole = session?.user?.role || "USER";
  
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      season: true,
      teams: {
        include: { 
          team: true,
          players: {
            include: { player: { include: { user: true } } }
          }
        }
      },
      matches: {
        orderBy: { createdAt: "asc" },
        include: { homeTeam: true, awayTeam: true, stats: { include: { player: { include: { tournamentTeams: { include: { tournamentTeam: { include: { team: true } } } } } } } } }
      },
      trophies: {
        include: {
          player: true,
          team: true,
          excludedPlayers: true
        }
      }
    }
  });

  if (!tournament) return notFound();
  
  if (userRole === "MODERATOR" && tournament.isOfficial && !tournament.season?.isActive) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-destructive/10 border border-destructive rounded-xl text-center">
        <h1 className="text-2xl font-black text-destructive mb-4">ACCESO DENEGADO</h1>
        <p className="text-muted-foreground mb-6">Los moderadores solo pueden editar torneos de la temporada activa.</p>
      </div>
    );
  }

  const allTeams = await prisma.team.findMany({
    orderBy: { name: "asc" }
  });

  const allPlayers = await prisma.player.findMany({
    orderBy: { nick: "asc" }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  // Calculate Prode Top 3
  const prodePoints = await prisma.prodePrediction.groupBy({
    by: ['userId'],
    where: { match: { tournamentId: tournament.id }, pointsEarned: { not: null } },
    _sum: { pointsEarned: true },
    orderBy: { _sum: { pointsEarned: 'desc' } },
    take: 3
  });
  
  const prodeUsers = await prisma.user.findMany({
    where: { id: { in: prodePoints.map(p => p.userId) } }
  });

  const prodeLeaderboard = prodePoints.map(p => ({
    user: prodeUsers.find(u => u.id === p.userId),
    points: p._sum.pointsEarned
  }));

  return (
    <React.Suspense fallback={<div>Cargando Torneo...</div>}>
      <TournamentClient tournament={tournament} allTeams={allTeams} allPlayers={allPlayers} categories={categories} userRole={userRole} prodeLeaderboard={prodeLeaderboard} />
    </React.Suspense>
  );
}
