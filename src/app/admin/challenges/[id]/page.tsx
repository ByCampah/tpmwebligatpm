import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChallengeClient from "./ChallengeClient";

export const dynamic = "force-dynamic";

export default async function ChallengeAdminPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const challenge = await prisma.challengeTournament.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: {
          player: true
        }
      }
    }
  });

  if (!challenge) return notFound();

  // Get all players to add to the challenge
  const allPlayers = await prisma.player.findMany({
    orderBy: { nick: "asc" }
  });

  return (
    <ChallengeClient 
      challenge={challenge} 
      allPlayers={allPlayers} 
    />
  );
}
