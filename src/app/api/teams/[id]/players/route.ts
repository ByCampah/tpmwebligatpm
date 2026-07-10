import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const teamId = params.id;
    
    // Find active season
    const activeSeason = await prisma.season.findFirst({ where: { isActive: true } });
    
    if (!activeSeason) {
      return NextResponse.json([]);
    }

    // Get tournament teams for this team in the active season
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { 
        teamId: teamId,
        tournament: { seasonId: activeSeason.id }
      },
      include: {
        players: {
          include: { player: true }
        }
      }
    });
    
    // Flatten players and remove duplicates (a player might be in multiple tournaments for the same team)
    const playerMap = new Map();
    for (const tt of tournamentTeams) {
      for (const tp of tt.players) {
        if (!playerMap.has(tp.player.id)) {
          playerMap.set(tp.player.id, tp.player);
        }
      }
    }
    
    const players = Array.from(playerMap.values()).sort((a, b) => a.nick.localeCompare(b.nick));
    
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching team players:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
