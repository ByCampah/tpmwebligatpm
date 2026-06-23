import { prisma } from "@/lib/prisma";
import TournamentClient from "./TournamentClient";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

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
    <TournamentClient tournament={tournament} allTeams={allTeams} allPlayers={allPlayers} categories={categories} userRole={userRole} />
  );
}
