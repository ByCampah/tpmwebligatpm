import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ProdeClient from "./ProdeClient";

export default async function ProdeSection({ activeOnly = true }: { activeOnly?: boolean } = {}) {
  const session = await auth();

  const whereClause: any = { showInProde: true };
  if (activeOnly) {
    whereClause.status = 'SCHEDULED';
  }

  const prodeMatches = await prisma.match.findMany({
    where: whereClause,
    include: {
      homeTeam: true,
      awayTeam: true,
      tournament: true
    },
    orderBy: { createdAt: "asc" }
  });

  const tournamentsMap = new Map();
  for (const m of prodeMatches) {
    if (!tournamentsMap.has(m.tournamentId)) {
      tournamentsMap.set(m.tournamentId, {
        tournament: m.tournament,
        matches: []
      });
    }
    tournamentsMap.get(m.tournamentId).matches.push(m);
  }

  const tournaments = Array.from(tournamentsMap.values());

  let userPredictions: any[] = [];
  if (session?.user) {
    userPredictions = await prisma.prodePrediction.findMany({
      where: {
        userId: session.user.id,
        matchId: { in: prodeMatches.map(m => m.id) }
      }
    });
  }

  const leaderboards: Record<string, any[]> = {};
  for (const t of tournaments) {
    const pointsRaw = await prisma.prodePrediction.groupBy({
      by: ['userId'],
      where: {
        match: { tournamentId: t.tournament.id },
        pointsEarned: { not: null }
      },
      _sum: { pointsEarned: true },
      orderBy: { _sum: { pointsEarned: 'desc' } },
      take: 10
    });

    const userIds = pointsRaw.map(p => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, nickName: true, customAvatarUrl: true, image: true }
    });

    leaderboards[t.tournament.id] = pointsRaw.map(p => ({
      user: users.find(u => u.id === p.userId),
      points: p._sum.pointsEarned || 0
    }));
  }

  return (
    <ProdeClient 
      tournaments={tournaments} 
      userPredictions={userPredictions} 
      leaderboards={leaderboards}
      userId={session?.user?.id}
    />
  );
}
