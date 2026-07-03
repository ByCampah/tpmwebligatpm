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
            include: { player: true }
          }
        }
      },
      matches: {
        orderBy: { createdAt: "asc" },
        include: { homeTeam: true, awayTeam: true, stats: true }
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

  return (
    <React.Suspense fallback={<div>Cargando Torneo...</div>}>
      <TournamentClient tournament={tournament} allTeams={allTeams} allPlayers={allPlayers} categories={categories} userRole={userRole} />
    </React.Suspense>
  );
}
